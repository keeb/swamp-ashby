/**
 * Shared execution path for every generated @keeb/ashby method.
 *
 * Each generated method is a declaration (endpoint name, whether it pages,
 * whether it polls) plus a Zod schema for its request body. This module does
 * the rest the same way for all of them: build the client from the global
 * arguments, strip the swamp-only control arguments out of the request body,
 * call (or drain, or poll) the endpoint, and write one resource whose instance
 * name is the method name, so `data.latest("<definition>", "<method>")` is
 * always where the last result of `<method>` lives.
 */
import { z } from "npm:zod@4";
import { AshbyClient } from "./client.ts";

/** Global arguments shared by every @keeb/ashby model. */
export const GlobalArgsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).describe(
    "Ashby API key. Sent as the HTTP Basic username. Store it in a vault and reference it with a vault expression.",
  ),
  baseUrl: z.string().optional().describe(
    "Override the API base. Defaults to https://api.ashbyhq.com.",
  ),
  apiVersion: z.string().optional().describe(
    "Pin an API version (e.g. 2026-01-01) via the Ashby-Version header. Defaults to the version the API key was created on.",
  ),
  onBehalfOf: z.string().optional().describe(
    "Ashby user id to act as, sent in the X-On-Behalf-Of header. Only some endpoints honor it.",
  ),
});

/** Global arguments as they arrive in a method's context. */
export type GlobalArgs = z.infer<typeof GlobalArgsSchema>;

/**
 * Every method writes this shape. `results` is Ashby's `results` payload,
 * verbatim; the paging fields are present only for paginated endpoints.
 */
export const OperationResultSchema = z.object({
  operation: z.string().describe(
    "The Ashby endpoint called, e.g. candidate.list",
  ),
  results: z.any().describe("Ashby's `results` payload, unchanged"),
  count: z.number().optional().describe(
    "Number of rows, when `results` is an array",
  ),
  pages: z.number().optional().describe(
    "Pages fetched, for paginated endpoints",
  ),
  moreDataAvailable: z.boolean().optional().describe(
    "True when more rows remain (maxResults reached or fetchAll was false)",
  ),
  nextCursor: z.string().optional().describe(
    "Cursor that resumes after the last row returned",
  ),
  syncToken: z.string().optional().describe(
    "Pass as syncToken on the next run to fetch only records changed since this one",
  ),
  warnings: z.array(z.string()).describe(
    "Non-fatal warnings Ashby attached to the response",
  ),
  fetchedAt: z.string().describe("ISO timestamp of the call"),
}).loose();

/** Attributes written for one method run. */
export type OperationResult = z.infer<typeof OperationResultSchema>;

/** Swamp-only arguments added to paginated methods; never sent to Ashby. */
export const PaginationControlSchema = {
  fetchAll: z.boolean().optional().describe(
    "Follow nextCursor until every page is fetched. Defaults to true; set false to fetch one page.",
  ),
  maxResults: z.number().int().positive().optional().describe(
    "Stop paging once at least this many rows are fetched. Whole pages are kept, so nextCursor resumes cleanly.",
  ),
};

/** Swamp-only arguments added to report.generate; never sent to Ashby. */
export const PollControlSchema = {
  waitForCompletion: z.boolean().optional().describe(
    "Poll until the report is complete or failed. Defaults to true; set false to return the first status.",
  ),
  pollIntervalSeconds: z.number().positive().optional().describe(
    "Seconds between polls. Defaults to 1, as Ashby recommends.",
  ),
  timeoutSeconds: z.number().positive().optional().describe(
    "Give up polling after this many seconds. Defaults to 300.",
  ),
};

const CONTROL_KEYS = new Set([
  ...Object.keys(PaginationControlSchema),
  ...Object.keys(PollControlSchema),
]);

/** How a generated method maps onto its endpoint. */
export interface OperationSpec {
  /** Endpoint name, e.g. `candidate.list`. */
  operation: string;
  /** Resource spec (and instance name) the result is written under. */
  resource: string;
  /** True when the endpoint takes a `cursor` and returns `nextCursor`. */
  paginated?: boolean;
  /** Poll a report build until it settles. Only report.generate. */
  poll?: "report";
}

/** The slice of swamp's method context this runtime uses. */
export interface MethodContext {
  globalArgs: GlobalArgs;
  logger: {
    info: (msg: string, props?: Record<string, unknown>) => void;
    warning: (msg: string, props?: Record<string, unknown>) => void;
  };
  writeResource: (
    spec: string,
    name: string,
    data: Record<string, unknown>,
  ) => Promise<unknown>;
}

/** What every method returns to swamp. */
export interface MethodResult {
  dataHandles: unknown[];
}

/** Build a client from a method's global arguments. */
export function clientFor(
  globalArgs: GlobalArgs,
  overrides: Partial<ConstructorParameters<typeof AshbyClient>[0]> = {},
): AshbyClient {
  return new AshbyClient({
    apiKey: globalArgs.apiKey,
    baseUrl: globalArgs.baseUrl,
    apiVersion: globalArgs.apiVersion,
    onBehalfOf: globalArgs.onBehalfOf,
    ...overrides,
  });
}

/** Drop swamp-only control arguments and undefined values from a request body. */
export function requestBody(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args)) {
    if (v === undefined || CONTROL_KEYS.has(k)) continue;
    body[k] = v;
  }
  return body;
}

const ENVELOPE_KEYS = new Set([
  "success",
  "results",
  "moreDataAvailable",
  "nextCursor",
  "syncToken",
  "warnings",
]);

/**
 * Call one endpoint and produce the attributes to write. Exposed separately
 * from {@link runOperation} so it can be tested without a swamp context.
 */
export async function executeOperation(
  client: AshbyClient,
  spec: OperationSpec,
  args: Record<string, unknown>,
  log: MethodContext["logger"],
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((r) => setTimeout(r, ms)),
): Promise<OperationResult> {
  const body = requestBody(args);
  const fetchedAt = new Date().toISOString();
  // Field names only: values can be secrets (webhook secretToken) or PII.
  log.info("{op}: calling with {fields}", {
    op: spec.operation,
    fields: Object.keys(body).join(", ") || "no fields",
  });

  if (spec.paginated && args.fetchAll !== false) {
    const out = await client.paginate(
      spec.operation,
      body,
      args.maxResults as number | undefined,
    );
    for (const w of out.warnings) {
      log.warning("{op}: {w}", { op: spec.operation, w });
    }
    log.info("{op}: {n} rows over {pages} page(s){more}", {
      op: spec.operation,
      n: out.results.length,
      pages: out.pages,
      more: out.moreDataAvailable ? ", more available" : "",
    });
    return {
      operation: spec.operation,
      results: out.results,
      count: out.results.length,
      pages: out.pages,
      moreDataAvailable: out.moreDataAvailable,
      nextCursor: out.nextCursor,
      syncToken: out.syncToken,
      warnings: out.warnings,
      fetchedAt,
    };
  }

  let envelope = await client.call(spec.operation, body);

  if (spec.poll === "report" && args.waitForCompletion !== false) {
    const intervalMs = ((args.pollIntervalSeconds as number | undefined) ?? 1) *
      1000;
    const deadline = Date.now() +
      ((args.timeoutSeconds as number | undefined) ?? 300) * 1000;
    const status = () => (envelope.results as
      | { status?: string; requestId?: string }
      | undefined);
    while (
      status()?.status === "requested" || status()?.status === "in_progress"
    ) {
      if (Date.now() >= deadline) {
        throw new Error(
          `${spec.operation}: report ${body.reportId} still ${status()?.status} after ${
            args.timeoutSeconds ?? 300
          }s (requestId=${status()?.requestId}); re-run with requestId to keep polling`,
        );
      }
      await sleep(intervalMs);
      // resultStyle is not stored server-side, so every poll must repeat it.
      envelope = await client.call(spec.operation, {
        ...body,
        requestId: status()?.requestId,
      });
    }
    log.info("{op}: report {status}", {
      op: spec.operation,
      status: status()?.status,
    });
  }

  const warnings = Array.isArray(envelope.warnings) ? envelope.warnings : [];
  for (const w of warnings) log.warning("{op}: {w}", { op: spec.operation, w });

  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(envelope)) {
    if (!ENVELOPE_KEYS.has(k)) extra[k] = v;
  }
  const results = envelope.results;
  if (Array.isArray(results)) {
    log.info("{op}: {n} rows", { op: spec.operation, n: results.length });
  } else {
    log.info("{op}: ok", { op: spec.operation });
  }
  return {
    ...extra,
    operation: spec.operation,
    results: results ?? null,
    ...(Array.isArray(results) ? { count: results.length } : {}),
    ...(spec.paginated
      ? {
        pages: 1,
        moreDataAvailable: Boolean(envelope.moreDataAvailable),
        nextCursor: envelope.nextCursor,
        syncToken: envelope.syncToken,
      }
      : {}),
    warnings,
    fetchedAt,
  };
}

/** Run one generated method end to end: call Ashby, write the resource. */
export async function runOperation(
  spec: OperationSpec,
  args: Record<string, unknown>,
  context: MethodContext,
): Promise<MethodResult> {
  const client = clientFor(context.globalArgs);
  const attributes = await executeOperation(client, spec, args, context.logger);
  const handle = await context.writeResource(
    spec.resource,
    spec.resource,
    attributes,
  );
  return { dataHandles: [handle] };
}
