// Auto-generated shared helper for Ashby extension models.
// Do not edit manually. Re-generate with: deno task generate

/**
 * Shared HTTP helper for the @keeb/ashby extension models.
 *
 * Ashby's API is RPC-shaped: every endpoint is
 * `POST https://api.ashbyhq.com/<resource>.<action>` with a JSON body,
 * authenticated with HTTP Basic (API key as the username, empty password).
 *
 * A logical failure is not an HTTP failure: a bad id or a missing permission
 * comes back as `200 { success: false, errorInfo: { code, message } }`. Every
 * helper here turns that into a thrown error, except where a caller asked to
 * tell "absent" from "failed" (`tryRead`, `remove`).
 *
 * @module
 */

const API_BASE = "https://api.ashbyhq.com";

/** Ashby caps list page size at 100. */
const MAX_PAGE_SIZE = 100;

/** Retries for 429 and 5xx. Ashby does not process a rate-limited request. */
const MAX_RETRIES = 4;

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/** Connection options every helper takes, sourced from a model's global args. */
export interface AshbyOptions {
  /** API key; falls back to the ASHBY_API_KEY environment variable. */
  apiKey?: string;
  /** Pins an API version via the Ashby-Version header. */
  apiVersion?: string;
  /** Ashby user id sent as X-On-Behalf-Of. */
  onBehalfOf?: string;
}

/** Ashby's response envelope. Paginated endpoints add the cursor fields. */
interface Envelope {
  success?: boolean;
  results?: unknown;
  moreDataAvailable?: boolean;
  nextCursor?: string;
  syncToken?: string;
  warnings?: string[];
  errorInfo?: { code?: string; message?: string; requestId?: string };
  errors?: string[];
  [extra: string]: unknown;
}

/** A failed Ashby call: an HTTP error, or a 200 carrying `success: false`. */
export class AshbyApiError extends Error {
  /** HTTP status; 200 when Ashby reported the failure in the body. */
  status: number;
  /** Ashby's machine-readable code, e.g. `application_not_found`. */
  code?: string;
  /** Ashby's request id, which is what their support asks for. */
  requestId?: string;
  constructor(
    message: string,
    status: number,
    code?: string,
    requestId?: string,
  ) {
    super(message);
    this.name = "AshbyApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/** True for an error that means the target does not exist. */
export function isNotFound(err: unknown): boolean {
  return err instanceof AshbyApiError &&
    (err.status === 404 || /not_found$/.test(err.code ?? ""));
}

function resolveApiKey(explicit?: string): string {
  const key = explicit ?? Deno.env.get("ASHBY_API_KEY");
  if (!key) {
    throw new Error(
      "No Ashby API key found. Provide one via the model's 'apiKey' global " +
        "argument (wired with a vault.get(...) expression) or set the " +
        "ASHBY_API_KEY environment variable.",
    );
  }
  return key;
}

/** Renders a failed response as one line naming the code and request id. */
export function describeError(
  operation: string,
  status: number,
  body: unknown,
): { message: string; code?: string; requestId?: string } {
  const env =
    (typeof body === "object" && body !== null ? body : {}) as Envelope;
  const info = env.errorInfo ?? {};
  // Older endpoints report failures as a bare `errors: string[]`.
  const detail = typeof info.message === "string"
    ? info.message
    : Array.isArray(env.errors) && env.errors.length > 0
    ? env.errors.join("; ")
    : typeof body === "string" && body.length > 0
    ? body.slice(0, 500)
    : `HTTP ${status}`;
  const parts = [`Ashby ${operation} failed: ${detail}`];
  if (status !== 200 && !detail.startsWith("HTTP ")) {
    parts.push(`status=${status}`);
  }
  if (info.code) parts.push(`code=${info.code}`);
  if (info.requestId) parts.push(`requestId=${info.requestId}`);
  return {
    message: parts.join(" "),
    code: info.code,
    requestId: info.requestId,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls one endpoint and returns the whole envelope. Retries 429/5xx,
 * honouring `Retry-After` and otherwise backing off exponentially from 1s.
 */
export async function call(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Envelope> {
  const headers: Record<string, string> = {
    "Authorization": `Basic ${btoa(`${resolveApiKey(opts.apiKey)}:`)}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  if (opts.apiVersion) headers["Ashby-Version"] = opts.apiVersion;
  if (opts.onBehalfOf) headers["X-On-Behalf-Of"] = opts.onBehalfOf;

  for (let attempt = 0;; attempt++) {
    const resp = await fetch(`${API_BASE}/${operation}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const text = await resp.text();
    let parsed: unknown = text;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      // Not JSON; keep the raw text for the error message.
    }
    const env = typeof parsed === "object" && parsed !== null
      ? parsed as Envelope
      : undefined;
    if (resp.ok && env && env.success !== false) return env;

    if (RETRYABLE.has(resp.status) && attempt < MAX_RETRIES) {
      const retryAfter = Number(resp.headers.get("Retry-After"));
      await sleep(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1000 * Math.pow(2, attempt),
      );
      continue;
    }
    const { message, code, requestId } = describeError(
      operation,
      resp.status,
      parsed,
    );
    throw new AshbyApiError(message, resp.status, code, requestId);
  }
}

/** Ashby's `results`, shaped as an object for writing to a resource. */
function asRecord(results: unknown): Record<string, unknown> {
  if (results && typeof results === "object" && !Array.isArray(results)) {
    return results as Record<string, unknown>;
  }
  if (Array.isArray(results)) return { count: results.length, items: results };
  return { value: results ?? null };
}

/** Creates a resource and returns it. */
export async function create(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Record<string, unknown>> {
  return asRecord((await call(operation, body, opts)).results);
}

/** Reads a resource; throws when it does not exist. */
export async function read(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Record<string, unknown>> {
  return asRecord((await call(operation, body, opts)).results);
}

/** Reads a resource, returning null rather than throwing when it is gone. */
export async function tryRead(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Record<string, unknown> | null> {
  try {
    return await read(operation, body, opts);
  } catch (err) {
    if (isNotFound(err)) return null;
    throw err;
  }
}

/** Updates a resource and returns its new state. */
export async function update(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Record<string, unknown>> {
  return asRecord((await call(operation, body, opts)).results);
}

/** Deletes a resource. An already-absent target reports `existed: false`. */
export async function remove(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<{ existed: boolean }> {
  try {
    await call(operation, body, opts);
    return { existed: true };
  } catch (err) {
    if (isNotFound(err)) return { existed: false };
    throw err;
  }
}

/** Posts to an action endpoint and returns its result as a record. */
export async function action(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions,
): Promise<Record<string, unknown>> {
  return asRecord((await call(operation, body, opts)).results);
}

/** Result of walking a list endpoint. */
export interface ListResult {
  items: Record<string, unknown>[];
  /** True when the walk stopped with rows still on offer. */
  truncated: boolean;
  truncatedBy: "max_items" | null;
  pages: number;
  /** Cursor that resumes after the last row returned. */
  nextCursor: string | null;
  /** Pass back as syncToken to fetch only what changed since this walk. */
  syncToken: string | null;
}

/**
 * Walks a list endpoint. Cursor-paginated endpoints are followed until
 * `moreDataAvailable` is false or `maxItems` rows are in hand; whole pages
 * are kept so `nextCursor` resumes exactly after the last row. Endpoints
 * without pagination are called once.
 */
export async function listAll(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions & { maxItems: number; paginated: boolean },
): Promise<ListResult> {
  const items: Record<string, unknown>[] = [];
  let cursor: string | undefined;
  let pages = 0;
  let last: Envelope = {};
  while (true) {
    const page = { ...body };
    if (opts.paginated) {
      page.limit = MAX_PAGE_SIZE;
      if (cursor) page.cursor = cursor;
    }
    last = await call(operation, page, opts);
    pages++;
    if (Array.isArray(last.results)) {
      items.push(...last.results as Record<string, unknown>[]);
    }
    if (!opts.paginated || !last.moreDataAvailable || !last.nextCursor) break;
    // A cursor that does not advance would loop forever; treat it as the end.
    if (last.nextCursor === cursor) break;
    cursor = last.nextCursor;
    if (items.length >= opts.maxItems) break;
  }
  const more = Boolean(last.moreDataAvailable);
  return {
    items,
    truncated: more,
    truncatedBy: more && items.length >= opts.maxItems ? "max_items" : null,
    pages,
    nextCursor: last.nextCursor ?? null,
    syncToken: last.syncToken ?? null,
  };
}

/**
 * Starts (or resumes) a report build and polls until it settles.
 * `resultStyle` is not stored server-side, so every poll repeats it.
 */
export async function generateReport(
  operation: string,
  body: Record<string, unknown>,
  opts: AshbyOptions & {
    waitForCompletion: boolean;
    pollIntervalMs: number;
    timeoutMs: number;
  },
): Promise<Record<string, unknown>> {
  let result = asRecord((await call(operation, body, opts)).results);
  const deadline = Date.now() + opts.timeoutMs;
  const pending = () =>
    result.status === "requested" || result.status === "in_progress";
  while (opts.waitForCompletion && pending()) {
    if (Date.now() >= deadline) {
      throw new Error(
        `${operation}: report ${body.reportId} still ${result.status} after ` +
          `${opts.timeoutMs / 1000}s (requestId=${result.requestId}); ` +
          `re-run with requestId to keep polling`,
      );
    }
    await sleep(opts.pollIntervalMs);
    result = asRecord(
      (await call(operation, { ...body, requestId: result.requestId }, opts))
        .results,
    );
  }
  return result;
}

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  txt: "text/plain",
  md: "text/markdown",
  html: "text/html",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  odt: "application/vnd.oasis.opendocument.text",
  zip: "application/zip",
};

/** Best-effort MIME type from a filename's extension. */
export function guessContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

/**
 * Uploads a local file through Ashby's presigned flow and returns its handle.
 *
 * Ashby's JSON API never accepts file bytes: `file.createFileUploadHandle`
 * returns a presigned multipart POST target, the bytes go there, and the
 * handle is what `candidate.uploadResume` / `uploadFile` and
 * `applicationForm.submit` accept. The presigned fields must precede the
 * file part or storage rejects the POST.
 */
export async function uploadFile(
  input: {
    path: string;
    fileUploadContext: string;
    filename?: string;
    contentType?: string;
  },
  opts: AshbyOptions,
): Promise<Record<string, unknown>> {
  const bytes = await Deno.readFile(input.path);
  const filename = input.filename ?? input.path.split(/[\\/]/).pop() ??
    "upload";
  const contentType = input.contentType ?? guessContentType(filename);
  const target = (await call("file.createFileUploadHandle", {
    fileUploadContext: input.fileUploadContext,
    filename,
    contentType,
    contentLength: bytes.byteLength,
  }, opts)).results as
    | { handle?: string; url?: string; fields?: Record<string, string> }
    | undefined;
  if (!target?.handle || !target.url) {
    throw new Error("file.createFileUploadHandle returned no handle or url");
  }
  const form = new FormData();
  for (const [k, v] of Object.entries(target.fields ?? {})) form.append(k, v);
  form.append("file", new Blob([bytes], { type: contentType }), filename);
  const resp = await fetch(target.url, { method: "POST", body: form });
  if (!resp.ok) {
    const text = await resp.text();
    throw new AshbyApiError(
      `Uploading ${filename} to the presigned URL failed: HTTP ${resp.status} ${
        text.slice(0, 300)
      }`,
      resp.status,
    );
  }
  await resp.body?.cancel();
  return {
    handle: target.handle,
    filename,
    contentType,
    contentLength: bytes.byteLength,
    fileUploadContext: input.fileUploadContext,
    uploadedAt: new Date().toISOString(),
  };
}
