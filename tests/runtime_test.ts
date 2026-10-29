import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { AshbyApiError, AshbyClient } from "../extensions/models/lib/client.ts";
import { executeOperation, requestBody } from "../extensions/models/lib/runtime.ts";
import { guessContentType, uploadFile } from "../extensions/models/lib/upload.ts";

interface Call {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

/** A fetch stub that answers each call from `responses` in order and records it. */
function stub(responses: Array<{ status?: number; body: unknown; headers?: Record<string, string> }>) {
  const calls: Call[] = [];
  const fetchImpl = ((url: string, init: RequestInit) => {
    calls.push({
      url,
      headers: init.headers as Record<string, string>,
      body: typeof init.body === "string" ? JSON.parse(init.body) : {},
    });
    const r = responses.shift();
    if (!r) throw new Error(`unexpected call to ${url}`);
    return Promise.resolve(
      new Response(typeof r.body === "string" ? r.body : JSON.stringify(r.body), {
        status: r.status ?? 200,
        headers: r.headers,
      }),
    );
  }) as typeof fetch;
  return { calls, fetchImpl };
}

const noSleep = () => Promise.resolve();
const log = { info: () => {}, warning: () => {} };

Deno.test("client sends basic auth, version and on-behalf-of headers", async () => {
  const { calls, fetchImpl } = stub([{ body: { success: true, results: { ok: 1 } } }]);
  const client = new AshbyClient({
    apiKey: "k",
    apiVersion: "2026-01-01",
    onBehalfOf: "user-1",
    fetch: fetchImpl,
  });
  await client.call("apiKey.info");
  assertEquals(calls[0].url, "https://api.ashbyhq.com/apiKey.info");
  assertEquals(calls[0].headers["Authorization"], `Basic ${btoa("k:")}`);
  assertEquals(calls[0].headers["Ashby-Version"], "2026-01-01");
  assertEquals(calls[0].headers["X-On-Behalf-Of"], "user-1");
});

Deno.test("a 200 with success:false throws with code and request id", async () => {
  const { fetchImpl } = stub([{
    body: {
      success: false,
      errorInfo: { code: "application_not_found", message: "Application not found", requestId: "R1" },
    },
  }]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const err = await assertRejects(() => client.call("application.info", { applicationId: "x" }), AshbyApiError);
  assertEquals(err.code, "application_not_found");
  assertEquals(err.requestId, "R1");
  assertEquals(err.status, 200);
  assertEquals(err.message, "Ashby application.info failed: Application not found code=application_not_found requestId=R1");
});

Deno.test("an HTTP-level failure names its status", async () => {
  const { fetchImpl } = stub([{
    status: 401,
    body: { success: false, errorInfo: { code: "unauthenticated", message: "Missing API key" } },
  }]);
  const client = new AshbyClient({ apiKey: "", fetch: fetchImpl });
  const err = await assertRejects(() => client.call("apiKey.info"), AshbyApiError);
  assertEquals(err.message, "Ashby apiKey.info failed: Missing API key status=401 code=unauthenticated");
});

Deno.test("logs field names on entry, never values", async () => {
  const lines: Array<Record<string, unknown> | undefined> = [];
  const { fetchImpl } = stub([{ body: { success: true, results: {} } }]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  await executeOperation(
    client,
    { operation: "webhook.create", resource: "create" },
    { requestUrl: "https://x", secretToken: "hunter2" },
    { info: (_m, p) => lines.push(p), warning: () => {} },
  );
  assertEquals(lines[0], { op: "webhook.create", fields: "requestUrl, secretToken" });
  assertEquals(JSON.stringify(lines).includes("hunter2"), false);
});

Deno.test("legacy errors array is folded into the message", async () => {
  const { fetchImpl } = stub([{ body: { success: false, errors: ["invalid_input", "bad id"] } }]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const err = await assertRejects(() => client.call("job.info"), AshbyApiError);
  assertEquals(err.message, "Ashby job.info failed: invalid_input; bad id");
});

Deno.test("429 is retried honoring Retry-After; 403 is not", async () => {
  const waits: number[] = [];
  const { calls, fetchImpl } = stub([
    { status: 429, body: "slow down", headers: { "retry-after": "2" } },
    { status: 503, body: "" },
    { body: { success: true, results: [] } },
    { status: 403, body: { success: false, errorInfo: { code: "missing_endpoint_permission", message: "nope" } } },
  ]);
  const client = new AshbyClient({
    apiKey: "k",
    fetch: fetchImpl,
    sleep: (ms) => {
      waits.push(ms);
      return Promise.resolve();
    },
  });
  await client.call("user.list");
  assertEquals(waits, [2000, 2000]);
  assertEquals(calls.length, 3);
  const err = await assertRejects(() => client.call("user.list"), AshbyApiError);
  assertEquals(err.code, "missing_endpoint_permission");
  assertEquals(calls.length, 4);
});

Deno.test("paginate follows nextCursor and returns the final syncToken", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: [1, 2], moreDataAvailable: true, nextCursor: "c1" } },
    { body: { success: true, results: [3], moreDataAvailable: true, nextCursor: "c2", warnings: ["w"] } },
    { body: { success: true, results: [4], moreDataAvailable: false, syncToken: "s9" } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(
    client,
    { operation: "candidate.list", resource: "list", paginated: true },
    { limit: 2, fetchAll: undefined },
    log,
  );
  assertEquals(out.results, [1, 2, 3, 4]);
  assertEquals(out.count, 4);
  assertEquals(out.pages, 3);
  assertEquals(out.syncToken, "s9");
  assertEquals(out.moreDataAvailable, false);
  assertEquals(out.warnings, ["w"]);
  assertEquals(calls.map((c) => c.body.cursor), [undefined, "c1", "c2"]);
  assertEquals(calls.every((c) => c.body.limit === 2 && !("fetchAll" in c.body)), true);
});

Deno.test("maxResults stops after the page that reaches it and keeps the cursor", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: [1, 2], moreDataAvailable: true, nextCursor: "c1" } },
    { body: { success: true, results: [3, 4], moreDataAvailable: true, nextCursor: "c2" } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(
    client,
    { operation: "job.list", resource: "list", paginated: true },
    { maxResults: 3 },
    log,
  );
  assertEquals(out.results, [1, 2, 3, 4]);
  assertEquals(out.moreDataAvailable, true);
  assertEquals(out.nextCursor, "c2");
  assertEquals(calls.length, 2);
  assertEquals("maxResults" in calls[0].body, false);
});

Deno.test("fetchAll:false fetches exactly one page", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: [1], moreDataAvailable: true, nextCursor: "c1" } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(
    client,
    { operation: "job.list", resource: "list", paginated: true },
    { fetchAll: false },
    log,
  );
  assertEquals(calls.length, 1);
  assertEquals(out.nextCursor, "c1");
  assertEquals(out.moreDataAvailable, true);
});

Deno.test("a cursor that does not advance ends paging instead of looping", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: [1], moreDataAvailable: true, nextCursor: "same" } },
    { body: { success: true, results: [2], moreDataAvailable: true, nextCursor: "same" } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await client.paginate("job.list", {});
  assertEquals(out.results, [1, 2]);
  assertEquals(calls.length, 2);
});

Deno.test("report.generate polls with requestId and resultStyle until complete", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: { requestId: "q1", status: "requested", reportData: null } } },
    { body: { success: true, results: { requestId: "q1", status: "in_progress", reportData: null } } },
    { body: { success: true, results: { requestId: "q1", status: "complete", reportData: { data: [[1]] } } } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(
    client,
    { operation: "report.generate", resource: "generate", poll: "report" },
    { reportId: "r", resultStyle: "url", pollIntervalSeconds: 0.01 },
    log,
    noSleep,
  );
  assertEquals((out.results as { status: string }).status, "complete");
  assertEquals(calls.length, 3);
  assertEquals(calls[1].body, { reportId: "r", resultStyle: "url", requestId: "q1" });
  assertEquals("pollIntervalSeconds" in calls[0].body, false);
});

Deno.test("report.generate with waitForCompletion:false returns the first status", async () => {
  const { calls, fetchImpl } = stub([
    { body: { success: true, results: { requestId: "q1", status: "requested", reportData: null } } },
  ]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(
    client,
    { operation: "report.generate", resource: "generate", poll: "report" },
    { reportId: "r", waitForCompletion: false },
    log,
    noSleep,
  );
  assertEquals((out.results as { status: string }).status, "requested");
  assertEquals(calls.length, 1);
});

Deno.test("non-paginated results keep extra envelope fields", async () => {
  const { fetchImpl } = stub([{ body: { success: true, results: [{ id: "a" }], snapshotTruncated: true } }]);
  const client = new AshbyClient({ apiKey: "k", fetch: fetchImpl });
  const out = await executeOperation(client, { operation: "x.y", resource: "y" }, {}, log);
  assertEquals(out.snapshotTruncated, true);
  assertEquals(out.count, 1);
  assertEquals("success" in out, false);
});

Deno.test("requestBody drops control args and undefined, keeps null", () => {
  assertEquals(
    requestBody({ a: 1, b: undefined, c: null, fetchAll: true, maxResults: 5, timeoutSeconds: 1 }),
    { a: 1, c: null },
  );
});

Deno.test("upload requests a handle, then posts fields before the file", async () => {
  const dir = await Deno.makeTempDir();
  const path = `${dir}/cv.pdf`;
  await Deno.writeTextFile(path, "%PDF-1.4 hello");
  const seen: Array<{ url: string; body: BodyInit | null | undefined }> = [];
  const fetchImpl = ((url: string, init: RequestInit) => {
    seen.push({ url, body: init.body });
    if (url.endsWith("/file.createFileUploadHandle")) {
      return Promise.resolve(Response.json({
        success: true,
        results: { handle: "H", url: "https://s3.example/upload", fields: { key: "k1", policy: "p" } },
      }));
    }
    return Promise.resolve(new Response(null, { status: 204 }));
  }) as typeof fetch;
  const out = await uploadFile(
    { path, fileUploadContext: "CandidateResume" },
    { globalArgs: { apiKey: "k" }, logger: log, writeResource: () => Promise.resolve({}) },
    fetchImpl,
  );
  assertEquals(out.handle, "H");
  assertEquals(out.contentType, "application/pdf");
  assertEquals(out.contentLength, 14);
  assertEquals(JSON.parse(seen[0].body as string), {
    fileUploadContext: "CandidateResume",
    filename: "cv.pdf",
    contentType: "application/pdf",
    contentLength: 14,
  });
  const form = seen[1].body as FormData;
  assertEquals([...form.keys()], ["key", "policy", "file"]);
  await Deno.remove(dir, { recursive: true });
});

Deno.test("upload surfaces a storage rejection", async () => {
  const dir = await Deno.makeTempDir();
  const path = `${dir}/a.txt`;
  await Deno.writeTextFile(path, "x");
  const fetchImpl = ((url: string) =>
    Promise.resolve(
      url.includes("ashbyhq")
        ? Response.json({ success: true, results: { handle: "H", url: "https://s3.example/u", fields: {} } })
        : new Response("<Error>EntityTooLarge</Error>", { status: 400 }),
    )) as typeof fetch;
  const err = await assertRejects(
    () =>
      uploadFile(
        { path, fileUploadContext: "CandidateFiles" },
        { globalArgs: { apiKey: "k" }, logger: log, writeResource: () => Promise.resolve({}) },
        fetchImpl,
      ),
    AshbyApiError,
  );
  assertEquals(err.status, 400);
  await Deno.remove(dir, { recursive: true });
});

Deno.test("guessContentType falls back to octet-stream", () => {
  assertEquals(guessContentType("Resume.DOCX"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assertEquals(guessContentType("blob"), "application/octet-stream");
});
