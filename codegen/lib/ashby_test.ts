import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import {
  action,
  AshbyApiError,
  call,
  generateReport,
  guessContentType,
  listAll,
  remove,
  tryRead,
  uploadFile,
} from "./ashby.ts";

interface Seen {
  url: string;
  headers: Record<string, string>;
  body: BodyInit | null | undefined;
}

/** Replaces fetch with a queue of canned responses for the length of `fn`. */
async function withFetch(
  responses: Array<
    { status?: number; body: unknown; headers?: Record<string, string> }
  >,
  fn: (seen: Seen[]) => Promise<void>,
) {
  const seen: Seen[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = ((url: string, init: RequestInit) => {
    seen.push({
      url,
      headers: init.headers as Record<string, string>,
      body: init.body,
    });
    const r = responses.shift();
    if (!r) throw new Error(`unexpected call to ${url}`);
    const text = typeof r.body === "string" ? r.body : JSON.stringify(r.body);
    return Promise.resolve(
      new Response(r.status === 204 ? null : text, {
        status: r.status ?? 200,
        headers: r.headers,
      }),
    );
  }) as typeof fetch;
  try {
    await fn(seen);
  } finally {
    globalThis.fetch = original;
  }
}

const json = (s: Seen) => JSON.parse(s.body as string);
const opts = { apiKey: "k" };

Deno.test("sends basic auth, version and on-behalf-of headers", async () => {
  await withFetch([{ body: { success: true, results: {} } }], async (seen) => {
    await call("apiKey.info", {}, {
      apiKey: "k",
      apiVersion: "2026-01-01",
      onBehalfOf: "u1",
    });
    assertEquals(seen[0].url, "https://api.ashbyhq.com/apiKey.info");
    assertEquals(seen[0].headers["Authorization"], `Basic ${btoa("k:")}`);
    assertEquals(seen[0].headers["Ashby-Version"], "2026-01-01");
    assertEquals(seen[0].headers["X-On-Behalf-Of"], "u1");
  });
});

Deno.test("falls back to ASHBY_API_KEY, and says so when neither is set", async () => {
  const prev = Deno.env.get("ASHBY_API_KEY");
  Deno.env.delete("ASHBY_API_KEY");
  try {
    await assertRejects(
      () => call("apiKey.info", {}, {}),
      Error,
      "ASHBY_API_KEY",
    );
    Deno.env.set("ASHBY_API_KEY", "env-key");
    await withFetch(
      [{ body: { success: true, results: {} } }],
      async (seen) => {
        await call("apiKey.info", {}, {});
        assertEquals(
          seen[0].headers["Authorization"],
          `Basic ${btoa("env-key:")}`,
        );
      },
    );
  } finally {
    if (prev === undefined) Deno.env.delete("ASHBY_API_KEY");
    else Deno.env.set("ASHBY_API_KEY", prev);
  }
});

Deno.test("a 200 with success:false throws with code and request id", async () => {
  await withFetch([{
    body: {
      success: false,
      errorInfo: {
        code: "application_not_found",
        message: "Application not found",
        requestId: "R1",
      },
    },
  }], async () => {
    const err = await assertRejects(
      () => call("application.info", {}, opts),
      AshbyApiError,
    );
    assertEquals(
      err.message,
      "Ashby application.info failed: Application not found code=application_not_found requestId=R1",
    );
    assertEquals(err.code, "application_not_found");
  });
});

Deno.test("an HTTP failure names its status; legacy errors arrays are folded in", async () => {
  await withFetch([
    {
      status: 401,
      body: {
        success: false,
        errorInfo: { code: "unauthenticated", message: "Missing API key" },
      },
    },
    { body: { success: false, errors: ["invalid_input", "bad id"] } },
  ], async () => {
    const a = await assertRejects(
      () => call("apiKey.info", {}, opts),
      AshbyApiError,
    );
    assertEquals(
      a.message,
      "Ashby apiKey.info failed: Missing API key status=401 code=unauthenticated",
    );
    const b = await assertRejects(
      () => call("job.info", {}, opts),
      AshbyApiError,
    );
    assertEquals(b.message, "Ashby job.info failed: invalid_input; bad id");
  });
});

Deno.test("429 and 5xx are retried honouring Retry-After; 403 is not", async () => {
  await withFetch([
    { status: 429, body: "slow down", headers: { "Retry-After": "0.01" } },
    { status: 503, body: "", headers: { "Retry-After": "0.01" } },
    { body: { success: true, results: [] } },
    {
      status: 403,
      body: {
        success: false,
        errorInfo: { code: "missing_endpoint_permission", message: "nope" },
      },
    },
  ], async (seen) => {
    await call("user.list", {}, opts);
    assertEquals(seen.length, 3);
    const err = await assertRejects(
      () => call("user.list", {}, opts),
      AshbyApiError,
    );
    assertEquals(err.code, "missing_endpoint_permission");
    assertEquals(seen.length, 4);
  });
});

Deno.test("tryRead returns null for not_found and rethrows anything else", async () => {
  await withFetch([
    {
      body: {
        success: false,
        errorInfo: { code: "candidate_not_found", message: "gone" },
      },
    },
    {
      body: {
        success: false,
        errorInfo: { code: "invalid_input", message: "bad" },
      },
    },
  ], async () => {
    assertEquals(await tryRead("candidate.info", { id: "x" }, opts), null);
    await assertRejects(
      () => tryRead("candidate.info", { id: "x" }, opts),
      AshbyApiError,
    );
  });
});

Deno.test("remove reports an already-absent target as existed:false", async () => {
  await withFetch([
    { body: { success: true, results: {} } },
    {
      body: {
        success: false,
        errorInfo: { code: "webhook_not_found", message: "gone" },
      },
    },
  ], async () => {
    assertEquals(await remove("webhook.delete", { webhookId: "w" }, opts), {
      existed: true,
    });
    assertEquals(await remove("webhook.delete", { webhookId: "w" }, opts), {
      existed: false,
    });
  });
});

Deno.test("action wraps array and scalar results so they can be written", async () => {
  await withFetch([
    { body: { success: true, results: [{ id: "a" }] } },
    { body: { success: true, results: true } },
  ], async () => {
    assertEquals(await action("candidate.search", {}, opts), {
      count: 1,
      items: [{ id: "a" }],
    });
    assertEquals(await action("x.y", {}, opts), { value: true });
  });
});

Deno.test("listAll follows nextCursor with max page size and returns the final syncToken", async () => {
  await withFetch([
    {
      body: {
        success: true,
        results: [{ id: 1 }, { id: 2 }],
        moreDataAvailable: true,
        nextCursor: "c1",
      },
    },
    {
      body: {
        success: true,
        results: [{ id: 3 }],
        moreDataAvailable: false,
        syncToken: "s9",
      },
    },
  ], async (seen) => {
    const out = await listAll("candidate.list", { syncToken: "s0" }, {
      ...opts,
      maxItems: 500,
      paginated: true,
    });
    assertEquals(out.items.map((i) => i.id), [1, 2, 3]);
    assertEquals(out.truncated, false);
    assertEquals(out.syncToken, "s9");
    assertEquals(out.pages, 2);
    assertEquals(seen.map(json), [
      { syncToken: "s0", limit: 100 },
      { syncToken: "s0", limit: 100, cursor: "c1" },
    ]);
  });
});

Deno.test("listAll stops at maxItems after whole pages and reports truncation", async () => {
  await withFetch([
    {
      body: {
        success: true,
        results: [{ id: 1 }, { id: 2 }],
        moreDataAvailable: true,
        nextCursor: "c1",
      },
    },
  ], async (seen) => {
    const out = await listAll("job.list", {}, {
      ...opts,
      maxItems: 2,
      paginated: true,
    });
    assertEquals(out.items.length, 2);
    assertEquals(out.truncated, true);
    assertEquals(out.truncatedBy, "max_items");
    assertEquals(out.nextCursor, "c1");
    assertEquals(seen.length, 1);
  });
});

Deno.test("listAll calls an unpaginated endpoint once without paging fields", async () => {
  await withFetch(
    [{ body: { success: true, results: [{ id: 1 }] } }],
    async (seen) => {
      const out = await listAll("brand.list", {}, {
        ...opts,
        maxItems: 500,
        paginated: false,
      });
      assertEquals(out.items.length, 1);
      assertEquals(json(seen[0]), {});
    },
  );
});

Deno.test("listAll ends on a cursor that does not advance", async () => {
  await withFetch([
    {
      body: {
        success: true,
        results: [{ id: 1 }],
        moreDataAvailable: true,
        nextCursor: "same",
      },
    },
    {
      body: {
        success: true,
        results: [{ id: 2 }],
        moreDataAvailable: true,
        nextCursor: "same",
      },
    },
  ], async (seen) => {
    const out = await listAll("job.list", {}, {
      ...opts,
      maxItems: 500,
      paginated: true,
    });
    assertEquals(out.items.length, 2);
    assertEquals(seen.length, 2);
  });
});

Deno.test("generateReport polls with requestId and the same resultStyle until complete", async () => {
  await withFetch([
    {
      body: {
        success: true,
        results: { requestId: "q1", status: "requested" },
      },
    },
    {
      body: {
        success: true,
        results: { requestId: "q1", status: "in_progress" },
      },
    },
    {
      body: {
        success: true,
        results: {
          requestId: "q1",
          status: "complete",
          reportData: { data: [[1]] },
        },
      },
    },
  ], async (seen) => {
    const out = await generateReport("report.generate", {
      reportId: "r",
      resultStyle: "url",
    }, {
      ...opts,
      waitForCompletion: true,
      pollIntervalMs: 1,
      timeoutMs: 5000,
    });
    assertEquals(out.status, "complete");
    assertEquals(json(seen[1]), {
      reportId: "r",
      resultStyle: "url",
      requestId: "q1",
    });
  });
});

Deno.test("generateReport without waiting returns the first status", async () => {
  await withFetch([{
    body: { success: true, results: { requestId: "q1", status: "requested" } },
  }], async (seen) => {
    const out = await generateReport("report.generate", { reportId: "r" }, {
      ...opts,
      waitForCompletion: false,
      pollIntervalMs: 1,
      timeoutMs: 1,
    });
    assertEquals(out.status, "requested");
    assertEquals(seen.length, 1);
  });
});

Deno.test("uploadFile requests a handle, then posts the presigned fields before the file", async () => {
  const dir = await Deno.makeTempDir();
  await Deno.writeTextFile(`${dir}/cv.pdf`, "%PDF-1.4 hello");
  try {
    await withFetch([
      {
        body: {
          success: true,
          results: {
            handle: "H",
            url: "https://storage.example/upload",
            fields: { key: "k1", policy: "p" },
          },
        },
      },
      { status: 204, body: "" },
    ], async (seen) => {
      const out = await uploadFile({
        path: `${dir}/cv.pdf`,
        fileUploadContext: "CandidateResume",
      }, opts);
      assertEquals(out.handle, "H");
      assertEquals(out.contentType, "application/pdf");
      assertEquals(json(seen[0]), {
        fileUploadContext: "CandidateResume",
        filename: "cv.pdf",
        contentType: "application/pdf",
        contentLength: 14,
      });
      assertEquals([...(seen[1].body as FormData).keys()], [
        "key",
        "policy",
        "file",
      ]);
    });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("uploadFile surfaces a storage rejection", async () => {
  const dir = await Deno.makeTempDir();
  await Deno.writeTextFile(`${dir}/a.txt`, "x");
  try {
    await withFetch([
      {
        body: {
          success: true,
          results: {
            handle: "H",
            url: "https://storage.example/u",
            fields: {},
          },
        },
      },
      { status: 400, body: "<Error>EntityTooLarge</Error>" },
    ], async () => {
      const err = await assertRejects(
        () =>
          uploadFile({
            path: `${dir}/a.txt`,
            fileUploadContext: "CandidateFiles",
          }, opts),
        AshbyApiError,
      );
      assertEquals(err.status, 400);
    });
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("guessContentType falls back to octet-stream", () => {
  assertEquals(
    guessContentType("Resume.DOCX"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  assertEquals(guessContentType("blob"), "application/octet-stream");
});
