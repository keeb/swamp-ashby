/**
 * Thin HTTP client for the Ashby public API.
 *
 * Every model in @keeb/ashby uses this. Ashby's API is RPC-shaped: every
 * endpoint is `POST https://api.ashbyhq.com/<resource>.<action>` with a JSON
 * body, authenticated with HTTP Basic (API key as the username, empty
 * password).
 *
 * The one thing that makes Ashby different from a typical REST API is that a
 * logical failure is not an HTTP failure: a bad id or a missing permission
 * comes back as `200 { success: false, errorInfo: { code, message } }`. The
 * client turns that into a thrown {@link AshbyApiError} so a caller can never
 * mistake a failed write for a successful one by only checking the status.
 */

export interface AshbyClientOptions {
  apiKey: string;
  /** Override the API base (e.g. a recorded fixture server). Defaults to https://api.ashbyhq.com. */
  baseUrl?: string;
  /** Pin an API version via the `Ashby-Version` header. Defaults to the key's own version. */
  apiVersion?: string;
  /** Act as this Ashby user via the `X-On-Behalf-Of` header. */
  onBehalfOf?: string;
  /** How many times to retry a 429 or 5xx. Defaults to 4. */
  maxRetries?: number;
  /** Injected for tests; defaults to the global fetch. */
  fetch?: typeof fetch;
  /** Injected for tests; defaults to a real timer. */
  sleep?: (ms: number) => Promise<void>;
}

/** Ashby's success envelope. Paginated endpoints add the cursor fields. */
export interface AshbyEnvelope<T = unknown> {
  success: boolean;
  results?: T;
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
  /** HTTP status. 200 when Ashby reported the failure in the body. */
  status: number;
  /** Ashby's machine-readable code, e.g. `application_not_found`, when present. */
  code?: string;
  /** Ashby's request id, which is what their support asks for. */
  requestId?: string;
  body: unknown;
  constructor(
    status: number,
    body: unknown,
    message: string,
    code?: string,
    requestId?: string,
  ) {
    super(message);
    this.name = "AshbyApiError";
    this.status = status;
    this.body = body;
    this.code = code;
    this.requestId = requestId;
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/** Render an error body as a one-line message that names the code and request id. */
export function describeError(
  operation: string,
  status: number,
  body: unknown,
): { message: string; code?: string; requestId?: string } {
  const record = (typeof body === "object" && body !== null)
    ? body as AshbyEnvelope
    : {} as AshbyEnvelope;
  const info = record.errorInfo ?? {};
  const code = typeof info.code === "string" ? info.code : undefined;
  const requestId = typeof info.requestId === "string"
    ? info.requestId
    : undefined;
  // Older endpoints report failures as a bare `errors: string[]` rather than
  // `errorInfo`; fold either into the message so `err.message` alone is
  // actionable in a log line.
  const detail = typeof info.message === "string"
    ? info.message
    : Array.isArray(record.errors) && record.errors.length > 0
    ? record.errors.join("; ")
    : typeof body === "string" && body.length > 0
    ? body.slice(0, 500)
    : `HTTP ${status}`;
  const parts = [`Ashby ${operation} failed: ${detail}`];
  // A 200 means Ashby rejected the request in the body; any other status is
  // an HTTP-level failure (401 missing key, 403 wrong key or permission, 5xx)
  // and the number is what tells those apart.
  if (status !== 200 && !detail.startsWith("HTTP ")) {
    parts.push(`status=${status}`);
  }
  if (code) parts.push(`code=${code}`);
  if (requestId) parts.push(`requestId=${requestId}`);
  return { message: parts.join(" "), code, requestId };
}

/** HTTP client for one Ashby API key. */
export class AshbyClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private maxRetries: number;
  private fetchImpl: typeof fetch;
  private sleep: (ms: number) => Promise<void>;

  constructor(opts: AshbyClientOptions) {
    this.baseUrl = (opts.baseUrl ?? "https://api.ashbyhq.com").replace(
      /\/$/,
      "",
    );
    this.maxRetries = opts.maxRetries ?? 4;
    this.fetchImpl = opts.fetch ?? fetch;
    this.sleep = opts.sleep ??
      ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.headers = {
      "Authorization": `Basic ${btoa(`${opts.apiKey}:`)}`,
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    if (opts.apiVersion) this.headers["Ashby-Version"] = opts.apiVersion;
    if (opts.onBehalfOf) this.headers["X-On-Behalf-Of"] = opts.onBehalfOf;
  }

  /**
   * Call one endpoint, retrying 429/5xx up to `maxRetries`, and return the
   * whole envelope. Throws {@link AshbyApiError} on any failure, including a
   * 200 whose body says `success: false`.
   *
   * `Retry-After` wins when present; otherwise back off exponentially from
   * 1s. Ashby does not process a rate-limited request, so replaying it is safe
   * even for writes.
   */
  async call<T = unknown>(
    operation: string,
    body: Record<string, unknown> = {},
  ): Promise<AshbyEnvelope<T>> {
    const url = `${this.baseUrl}/${operation}`;
    let lastError: AshbyApiError | undefined;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const res = await this.fetchImpl(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let parsed: unknown = undefined;
      if (text.length > 0) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }

      const envelope = (typeof parsed === "object" && parsed !== null)
        ? parsed as AshbyEnvelope<T>
        : undefined;
      if (res.ok && envelope && envelope.success !== false) return envelope;

      const { message, code, requestId } = describeError(
        operation,
        res.status,
        parsed,
      );
      lastError = new AshbyApiError(
        res.status,
        parsed,
        message,
        code,
        requestId,
      );
      if (!RETRYABLE.has(res.status) || attempt === this.maxRetries) {
        throw lastError;
      }
      const retryAfter = Number(res.headers.get("retry-after"));
      await this.sleep(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1000 * Math.pow(2, attempt),
      );
    }
    throw lastError ?? new AshbyApiError(0, undefined, "unreachable");
  }

  /**
   * Drain a cursor-paginated endpoint. Follows `nextCursor` while
   * `moreDataAvailable` is true, stopping after the page that brings the total
   * to at least `maxResults`. Whole pages are kept rather than trimmed, so the
   * returned `nextCursor` resumes exactly where the results end. The
   * `syncToken` Ashby returns on the final page is surfaced so the next run
   * can ask for only what changed.
   */
  async paginate<T = unknown>(
    operation: string,
    body: Record<string, unknown>,
    maxResults?: number,
  ): Promise<{
    results: T[];
    pages: number;
    moreDataAvailable: boolean;
    nextCursor?: string;
    syncToken?: string;
    warnings: string[];
  }> {
    const results: T[] = [];
    const warnings: string[] = [];
    let cursor = body.cursor as string | undefined;
    let pages = 0;
    let last: AshbyEnvelope<T[]> | undefined;
    while (true) {
      const page = await this.call<T[]>(
        operation,
        cursor ? { ...body, cursor } : body,
      );
      pages++;
      last = page;
      if (Array.isArray(page.results)) results.push(...page.results);
      if (Array.isArray(page.warnings)) warnings.push(...page.warnings);
      if (!page.moreDataAvailable || !page.nextCursor) break;
      if (maxResults !== undefined && results.length >= maxResults) break;
      // A cursor that does not advance would loop forever; treat it as the end.
      if (page.nextCursor === cursor) break;
      cursor = page.nextCursor;
    }
    return {
      results,
      pages,
      moreDataAvailable: Boolean(last?.moreDataAvailable),
      nextCursor: last?.nextCursor,
      syncToken: last?.syncToken,
      warnings,
    };
  }
}
