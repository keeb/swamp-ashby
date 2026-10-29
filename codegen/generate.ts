/**
 * Generate the @keeb/ashby extension packages from Ashby's OpenAPI spec.
 *
 *   deno task generate
 *
 * Reads spec/ashby-openapi.json (refresh with `deno task fetch-spec`) and
 * writes one extension package per domain to `<domain>/`: `@keeb/ashby/jobs`,
 * `@keeb/ashby/candidates`, and so on. Each Ashby resource (the prefix of
 * `candidate.create`) becomes one model, `@keeb/ashby/<domain>/<resource>`,
 * with the standard method set — create, get, lookup, update, delete, sync —
 * for the endpoints that fit it, and a snake_case action for every other
 * endpoint (`candidate.addTag` → `add_tag`).
 *
 * Everything the registry lists (type, global arguments, methods and their
 * arguments, resources) is written out literally in each model file, because
 * the listing is read from source text, not by running it. The registry's
 * limits are asserted here so a package that would publish without a listing
 * fails to generate instead.
 *
 * @module
 */

// deno-lint-ignore-file no-explicit-any
type Schema = Record<string, any>;

const root = new URL("..", import.meta.url).pathname;
const spec = JSON.parse(
  await Deno.readTextFile(`${root}spec/ashby-openapi.json`),
);
const schemas: Record<string, Schema> = spec.components.schemas;
const libSource = await Deno.readTextFile(`${root}codegen/lib/ashby.ts`);
const licenseText = await Deno.readTextFile(`${root}LICENSE.txt`);

const EXTENSION_PREFIX = "@keeb/ashby";
const REPOSITORY = "https://github.com/keeb/swamp-ashby";

const version = Deno.args[0] ??
  (() => {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${
      String(d.getDate()).padStart(2, "0")
    }.1`;
  })();

/** Registry limits on a package's listing (swamp-club extension-content.ts). */
const LIMITS = {
  models: 50,
  methodsPerModel: 50,
  globalArgsPerModel: 30,
  argsPerMethod: 30,
  description: 500,
};

/** Endpoint prefixes per package. Every client-callable prefix must appear once. */
const DOMAINS: Record<
  string,
  { description: string; labels: string[]; prefixes: string[] }
> = {
  candidates: {
    description:
      "Ashby candidates and applications: candidates, tags, applications and their history, feedback, application forms, referrals, assessments and file uploads",
    labels: ["candidates", "applications", "referrals"],
    prefixes: [
      "candidate",
      "candidateTag",
      "application",
      "applicationFeedback",
      "applicationFeedbackRequest",
      "applicationForm",
      "applicationHiringTeamRole",
      "referral",
      "referralForm",
      "assessment",
      "file",
    ],
  },
  jobs: {
    description:
      "Ashby jobs and requisitions: jobs, job postings, openings, locations, departments, hiring teams, approvals, job boards and templates",
    labels: ["jobs", "postings", "openings", "requisitions"],
    prefixes: [
      "job",
      "jobPosting",
      "jobTemplate",
      "jobBoard",
      "opening",
      "location",
      "department",
      "hiringTeam",
      "hiringTeamRole",
      "approval",
      "approvalDefinition",
      "closeReason",
    ],
  },
  interviews: {
    description:
      "Ashby interviewing: interviews, interview plans and stages, schedules and events, briefings, interviewer pools, feedback forms, take-home assignments and notetaker transcripts",
    labels: ["interviews", "scheduling", "feedback"],
    prefixes: [
      "interview",
      "interviewPlan",
      "interviewStage",
      "interviewStageGroup",
      "interviewSchedule",
      "interviewEvent",
      "interviewBriefing",
      "interviewerPool",
      "jobInterviewPlan",
      "feedbackFormDefinition",
      "takeHomeAssignment",
      "notetakerTranscript",
    ],
  },
  offers: {
    description:
      "Ashby offers: offer processes, offer versions, approvals and decisions",
    labels: ["offers", "approvals"],
    prefixes: ["offer", "offerProcess"],
  },
  sourcing: {
    description:
      "Ashby sourcing: projects, outreach sequences and templates, sources and tracking links, email senders, the email sync blocklist, communication templates and archive reasons",
    labels: ["sourcing", "outreach", "sequences", "projects"],
    prefixes: [
      "project",
      "sequence",
      "sequenceTemplate",
      "source",
      "sourceTrackingLink",
      "emailSender",
      "emailSyncBlockedAddress",
      "communicationTemplate",
      "archiveReason",
    ],
  },
  surveys: {
    description:
      "Ashby surveys: survey form definitions, survey requests and survey submissions",
    labels: ["surveys", "candidate-experience"],
    prefixes: ["surveyFormDefinition", "surveyRequest", "surveySubmission"],
  },
  organization: {
    description:
      "Ashby organization: users and interviewer settings, brands, custom fields, webhooks, reports, the audit log, API key info and API versions",
    labels: ["users", "custom-fields", "webhooks", "reports", "admin"],
    prefixes: [
      "user",
      "brand",
      "customField",
      "webhook",
      "report",
      "auditLog",
      "apiKey",
      "version",
    ],
  },
};

/**
 * Endpoints Ashby calls on an assessment partner, not endpoints a client
 * calls, and deprecated aliases of endpoints that are generated.
 */
const NOT_WRAPPED: Record<string, string> = {
  "assessment.start": "implemented by assessment partners, called by Ashby",
  "assessment.list": "implemented by assessment partners, called by Ashby",
  "assessment.cancel": "implemented by assessment partners, called by Ashby",
  "customFields.fetch": "implemented by assessment partners, called by Ashby",
  "application.change_stage": "deprecated alias of application.changeStage",
  "application.change_source": "deprecated alias of application.changeSource",
};

const RESERVED_METHOD_NAMES = new Set([
  "create",
  "get",
  "lookup",
  "update",
  "delete",
  "sync",
]);

/** Connection global arguments every model carries. */
const CREDENTIAL_ARGS = ["apiKey", "apiVersion", "onBehalfOf"];

/** Default ceiling on a lookup walk; every row becomes its own artifact. */
const DEFAULT_MAX_ITEMS = 500;
const MAX_ITEMS_CEILING = 100000;

/** Lib-managed pagination fields, never exposed as arguments. */
const PAGING_FIELDS = new Set(["cursor", "limit"]);

/** Models whose results carry secrets (webhook settings echo secretToken). */
const SENSITIVE_OUTPUT = new Set(["webhook"]);

const SENSITIVE_FIELD = /secret|password/i;

// ---------------------------------------------------------------------------
// Naming

const kebab = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const snake = (s: string) => kebab(s).replace(/-/g, "_");
const words = (s: string) => kebab(s).replace(/-/g, " ");

function quoteKey(name: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name);
}

/** Codegen helper: the instance-name sanitizer, inlined as in the official generators. */
function wrapWithSanitize(expr: string): string {
  return `(${expr}).replace(/[\\/\\\\]/g, "_").replace(/\\.\\./g, "_").replace(/\\0/g, "")`;
}

// ---------------------------------------------------------------------------
// Schema helpers

function deref(s: Schema | undefined): Schema {
  if (s && typeof s.$ref === "string") {
    return schemas[s.$ref.split("/").pop()!] ?? {};
  }
  return s ?? {};
}

function refName(s: Schema | undefined): string | undefined {
  return s && typeof s.$ref === "string" ? s.$ref.split("/").pop() : undefined;
}

/** Strips markdown links and collapses whitespace. */
function clean(text: string | undefined): string {
  return (text ?? "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Caps a description below the registry's 500-character limit, cutting at a
 * sentence or word boundary. A description is always one string literal: the
 * listing reads only the first literal of a concatenation.
 */
function cap(text: string, max = 450): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.5) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const isNull = (s: Schema) => deref(s).type === "null";

function mergeObjects(parts: Schema[]): Schema {
  const out: Schema = { type: "object", properties: {}, required: [] };
  for (const p of parts) {
    const s = deref(p);
    if (s.allOf) {
      const inner = mergeObjects(s.allOf);
      Object.assign(out.properties, inner.properties);
      out.required.push(...inner.required);
    }
    Object.assign(out.properties, s.properties ?? {});
    out.required.push(...(s.required ?? []));
  }
  return out;
}

/** Full-fidelity Zod for a request field; recursive refs collapse to z.unknown(). */
function zod(input: Schema, stack: string[] = [], depth = 0): string {
  const name = refName(input);
  if (name) {
    if (stack.includes(name) || depth > 10) return "z.unknown()";
    stack = [...stack, name];
  }
  const s = deref(input);
  if ("const" in s) return `z.literal(${JSON.stringify(s.const)})`;
  if (Array.isArray(s.enum)) {
    const vals = s.enum.filter((v: unknown) => v !== null);
    const base = vals.length > 0 && vals.every((v: unknown) =>
        typeof v === "string"
      )
      ? `z.enum(${JSON.stringify(vals)})`
      : vals.length === 1
      ? `z.literal(${JSON.stringify(vals[0])})`
      : `z.union([${
        vals.map((v: unknown) => `z.literal(${JSON.stringify(v)})`).join(", ")
      }])`;
    return s.enum.includes(null) ? `${base}.nullable()` : base;
  }
  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key]) && !s.properties) {
      const members = s[key] as Schema[];
      const nullable = members.some(isNull);
      const rest = members.filter((m) => !isNull(m));
      let inner: string;
      if (rest.length === 0) inner = "z.null()";
      else if (rest.length === 1) inner = zod(rest[0], stack, depth + 1);
      else {
        const parts = [...new Set(rest.map((m) => zod(m, stack, depth + 1)))];
        inner = parts.length === 1
          ? parts[0]
          : `z.union([${parts.join(", ")}])`;
      }
      return nullable && inner !== "z.null()" ? `${inner}.nullable()` : inner;
    }
  }
  if (Array.isArray(s.allOf)) {
    const merged = mergeObjects(s.allOf);
    if (s.properties) {
      Object.assign(merged.properties, s.properties);
      merged.required.push(...(s.required ?? []));
    }
    return objectZod(merged, stack, depth);
  }
  let type = s.type;
  let nullable = false;
  if (Array.isArray(type)) {
    nullable = type.includes("null");
    const rest = type.filter((t: string) => t !== "null");
    type = rest.length === 1 ? rest[0] : undefined;
  }
  let out: string;
  switch (type) {
    case "string":
      out = "z.string()";
      break;
    case "integer":
      out = "z.number().int()";
      break;
    case "number":
      out = "z.number()";
      break;
    case "boolean":
      out = "z.boolean()";
      break;
    case "array":
      out = `z.array(${
        s.items ? zod(s.items, stack, depth + 1) : "z.unknown()"
      })`;
      break;
    case "object":
      out = objectZod(s, stack, depth);
      break;
    default:
      out = s.properties ? objectZod(s, stack, depth) : "z.unknown()";
  }
  return nullable ? `${out}.nullable()` : out;
}

function objectZod(s: Schema, stack: string[], depth: number): string {
  const props: Record<string, Schema> = s.properties ?? {};
  if (Object.keys(props).length === 0) {
    const ap = s.additionalProperties;
    const value = ap && typeof ap === "object" && Object.keys(ap).length > 0
      ? zod(ap, stack, depth + 1)
      : "z.unknown()";
    return `z.record(z.string(), ${value})`;
  }
  const required = new Set<string>(s.required ?? []);
  const fields = Object.entries(props).map(([k, v]) =>
    `${quoteKey(k)}: ${zod(v, stack, depth + 1)}${
      required.has(k) ? "" : ".optional()"
    }`
  );
  return `z.object({ ${fields.join(", ")} })`;
}

/** One argument line: type, sensitivity, optionality, description. */
function argLine(name: string, s: Schema, required: boolean): string {
  let out = `${quoteKey(name)}: ${zod(s)}`;
  if (SENSITIVE_FIELD.test(name)) out += ".meta({ sensitive: true })";
  const desc = cap(clean(s.description ?? deref(s).description));
  if (desc) out += `.describe(${JSON.stringify(desc)})`;
  if (!required) out += ".optional()";
  return out;
}

/** Simplified Zod for a stored state field: top-level shape only, all nullish. */
function stateZod(input: Schema): string {
  const s = deref(input);
  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const rest = (s[key] as Schema[]).filter((m) => !isNull(m));
      return rest.length === 1 ? stateZod(rest[0]) : "z.unknown()";
    }
  }
  if (Array.isArray(s.enum)) return "z.string()";
  let type = s.type;
  if (Array.isArray(type)) type = type.find((t: string) => t !== "null");
  switch (type) {
    case "string":
      return "z.string()";
    case "integer":
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "array":
      return "z.array(z.unknown())";
    case "object":
      return "z.record(z.string(), z.unknown())";
    default:
      return s.properties || s.allOf
        ? "z.record(z.string(), z.unknown())"
        : "z.unknown()";
  }
}

/**
 * A request body flattened into top-level fields. A body that is "one of
 * these shapes" becomes the union of their fields, required only where every
 * shape requires it; Ashby enforces the rest.
 */
function requestFields(
  def: Schema,
): { props: Record<string, Schema>; required: Set<string> } {
  const body = deref(def.requestBody?.content?.["application/json"]?.schema);
  const flat = body.allOf ? mergeObjects(body.allOf) : body;
  const props: Record<string, Schema> = { ...(flat.properties ?? {}) };
  let required = new Set<string>(flat.required ?? []);
  for (const key of ["oneOf", "anyOf"] as const) {
    const variants = (body[key] ?? []).map((v: Schema) => deref(v));
    if (variants.length === 0) continue;
    for (const v of variants) Object.assign(props, v.properties ?? {});
    const common = variants
      .map((v: Schema) => new Set<string>(v.required ?? []))
      .reduce((a: Set<string>, b: Set<string>) =>
        new Set([...a].filter((x) => b.has(x)))
      );
    required = new Set([...required, ...common]);
  }
  return { props, required };
}

/** The `results` schema of an endpoint's success response; list items for arrays. */
function resultsSchema(def: Schema): Schema | undefined {
  const s = def.responses?.["200"]?.content?.["application/json"]?.schema;
  if (!s) return undefined;
  const variants = (s.oneOf ?? s.anyOf ?? [s]).map((v: Schema) => deref(v));
  for (const v of variants) {
    const flat = v.allOf ? mergeObjects(v.allOf) : v;
    const results = flat.properties?.results;
    if (!results) continue;
    let r = deref(results);
    if (r.allOf) r = mergeObjects(r.allOf);
    if (r.type === "array") {
      r = deref(r.items);
      if (r.allOf) r = mergeObjects(r.allOf);
    }
    if (r.properties) return r;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Resources

interface Endpoint {
  operation: string;
  action: string;
  def: Schema;
  props: Record<string, Schema>;
  required: Set<string>;
  paginated: boolean;
}

interface Resource {
  prefix: string;
  domain: string;
  slug: string;
  slugId: string;
  display: string;
  create?: Endpoint;
  read?: Endpoint;
  list?: Endpoint;
  update?: Endpoint;
  del?: Endpoint;
  actions: Endpoint[];
  /** Field on update/sync/delete requests that carries the stored id. */
  updateIdField?: string;
  readIdField?: string;
  deleteIdField?: string;
  namingField?: string;
  globals: Array<[string, Schema]>;
  stateSchema?: Schema;
}

function idField(
  prefix: string,
  ep: Endpoint,
  requireIt: boolean,
): string | undefined {
  for (const name of [`${prefix}Id`, "id"]) {
    if (name in ep.props && (!requireIt || ep.required.has(name))) return name;
  }
  return undefined;
}

const domainOf = new Map<string, string>();
for (const [domain, d] of Object.entries(DOMAINS)) {
  for (const p of d.prefixes) {
    if (domainOf.has(p)) throw new Error(`${p} is in two domains`);
    domainOf.set(p, domain);
  }
}

const endpointsByPrefix = new Map<string, Endpoint[]>();
const skipped: string[] = [];
for (const [path, item] of Object.entries<Schema>(spec.paths)) {
  const operation = path.slice(1);
  if (!item.post) continue;
  if (NOT_WRAPPED[operation]) {
    skipped.push(`\`${operation}\` — ${NOT_WRAPPED[operation]}`);
    continue;
  }
  const [prefix, action] = operation.split(".");
  if (!domainOf.has(prefix)) {
    throw new Error(
      `${operation}: prefix ${prefix} is in no domain; add it to DOMAINS`,
    );
  }
  const { props, required } = requestFields(item.post);
  const ep: Endpoint = {
    operation,
    action,
    def: item.post,
    props,
    required,
    paginated: "cursor" in props,
  };
  if (!endpointsByPrefix.has(prefix)) endpointsByPrefix.set(prefix, []);
  endpointsByPrefix.get(prefix)!.push(ep);
}

function buildResource(prefix: string, eps: Endpoint[]): Resource {
  eps.sort((a, b) => a.action.localeCompare(b.action));
  const r: Resource = {
    prefix,
    domain: domainOf.get(prefix)!,
    slug: kebab(prefix),
    slugId: snake(prefix),
    display: words(prefix),
    actions: [],
    globals: [],
  };
  for (const ep of eps) {
    if (ep.action === "create") r.create = ep;
    else if (ep.action === "info") {
      r.read = ep;
      r.readIdField = idField(prefix, ep, false);
    } else if (ep.action === "list") r.list = ep;
    else if (ep.action === "update" && idField(prefix, ep, true)) {
      r.update = ep;
      r.updateIdField = idField(prefix, ep, true);
    } else if (ep.action === "delete" && idField(prefix, ep, true)) {
      r.del = ep;
      r.deleteIdField = idField(prefix, ep, true);
    } else r.actions.push(ep);
  }

  // Desired-state attributes: what create and update accept, minus the id.
  const globals = new Map<string, Schema>();
  for (const ep of [r.create, r.update]) {
    if (!ep) continue;
    for (const [k, v] of Object.entries(ep.props)) {
      if (ep === r.update && k === r.updateIdField) continue;
      if (CREDENTIAL_ARGS.includes(k)) {
        throw new Error(
          `${ep.operation}: field ${k} collides with a credential argument`,
        );
      }
      if (!globals.has(k)) globals.set(k, v);
    }
  }
  r.globals = [...globals];
  r.namingField = globals.has("name")
    ? "name"
    : globals.has("title")
    ? "title"
    : undefined;

  for (const ep of [r.read, r.create, r.list, r.update]) {
    if (!ep) continue;
    const s = resultsSchema(ep.def);
    if (s) {
      r.stateSchema = s;
      break;
    }
  }
  return r;
}

// ---------------------------------------------------------------------------
// Emission

function methodDescription(ep: Endpoint): string {
  const paras = String(ep.def.description ?? ep.def.summary ?? ep.operation)
    .split(/\n\s*\n/)
    .map(clean)
    .filter(Boolean);
  const first = paras.find((p) => !p.startsWith(">") && !/^Beta$/i.test(p)) ??
    ep.operation;
  const perm = paras.find((p) => /^Requires|^Also requires/.test(p));
  const beta = ep.def["x-beta"] ? " (Beta)" : "";
  return cap(
    `${ep.operation}${beta}: ${first}${
      perm && perm !== first ? ` ${perm}` : ""
    }`,
  );
}

const OPTS =
  "const opts = { apiKey: g.apiKey, apiVersion: g.apiVersion, onBehalfOf: g.onBehalfOf };";

function instanceNameExpr(r: Resource): string {
  return wrapWithSanitize(
    r.namingField ? `g.${r.namingField}?.toString() ?? "current"` : `"current"`,
  );
}

function emitStoredLookup(lines: string[]): void {
  lines.push(
    `        const content = await context.dataRepository.getContent(`,
  );
  lines.push(`          context.modelType, context.modelId, instanceName,`);
  lines.push(`        );`);
  lines.push(
    `        if (!content) throw new Error("No data found - run create or get first");`,
  );
  lines.push(
    `        const existing = JSON.parse(new TextDecoder().decode(content));`,
  );
}

function argFields(ep: Endpoint, drop: Set<string> = new Set()): string[] {
  return Object.entries(ep.props)
    .filter(([k]) => !drop.has(k))
    .map(([k, s]) => argLine(k, s, ep.required.has(k)));
}

const MAX_ITEMS_ARG = (what: string) =>
  `max_items: z.number().int().min(1).max(${MAX_ITEMS_CEILING}).describe(${
    JSON.stringify(
      `Stop after this many results (default ${DEFAULT_MAX_ITEMS}). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, ${what} reports truncated: true.`,
    )
  }).optional()`;

function emitMethod(
  lines: string[],
  name: string,
  description: string,
  args: string[],
  body: string[],
  kind?: "read" | "list",
): string[] {
  lines.push(`    ${name}: {`);
  lines.push(`      description: ${JSON.stringify(cap(description))},`);
  if (kind) lines.push(`      kind: ${JSON.stringify(kind)},`);
  lines.push(
    `      arguments: z.object({${args.length ? "\n" : ""}${
      args.map((a) => `        ${a},`).join("\n")
    }${args.length ? "\n      " : ""}}),`,
  );
  // Methods that take everything from global args or stored state never read
  // their arguments; name them `_args`, as the official generators do.
  const usesArgs = body.some((l) => /\bargs\b/.test(l));
  lines.push(
    `      execute: async (${
      usesArgs ? "args" : "_args"
    }: Record<string, any>, context: any) => {`,
  );
  lines.push(`        const g = context.globalArgs;`);
  lines.push(`        ${OPTS}`);
  // Entry log names the operation only; argument values can be secrets or PII.
  const op = body.join("\n").match(/"([a-zA-Z]+\.[a-zA-Z]+)"/)?.[1] ??
    "file.createFileUploadHandle";
  lines.push(
    `        context.logger?.info("{method}: calling {operation}", { method: ${
      JSON.stringify(name)
    }, operation: ${JSON.stringify(op)} });`,
  );
  lines.push(...body);
  lines.push(`      },`);
  lines.push(`    },`);
  return args;
}

interface EmittedMethod {
  name: string;
  operation: string;
  kind: string;
  args: number;
}

function generateModel(
  r: Resource,
): { source: string; methods: EmittedMethod[] } {
  const type = `${EXTENSION_PREFIX}/${r.domain}/${r.slug}`;
  const lookupName = `${r.slugId}_lookup`;
  const actionName = `${r.slugId}_action`;
  const methods: EmittedMethod[] = [];
  const helpers = new Set<string>();
  const out: string[] = [];

  out.push(`// Auto-generated extension model for ${type}`);
  out.push(`// Do not edit manually. Re-generate with: deno task generate`);
  out.push(``);
  out.push(`// deno-lint-ignore-file no-explicit-any`);
  out.push(``);
  out.push(`/**`);
  out.push(` * Swamp extension model for an Ashby ${r.display}.`);
  out.push(` *`);
  out.push(
    ` * Wraps Ashby's \`${r.prefix}.*\` endpoints as a swamp model so they can be`,
  );
  out.push(` * driven through \`swamp model\`.`);
  out.push(` *`);
  out.push(` * @module`);
  out.push(` */`);
  out.push(``);
  out.push(`import { z } from "npm:zod@4.3.6";`);
  out.push(`__HELPERS__`);
  out.push(``);

  // GlobalArgsSchema: desired-state attributes, then the connection block.
  out.push(`const GlobalArgsSchema = z.object({`);
  for (const [k, s] of r.globals) out.push(`  ${argLine(k, s, false)},`);
  out.push(
    `  apiKey: z.string().meta({ sensitive: true }).describe("Ashby API key, sent as the HTTP Basic username. Overrides the ASHBY_API_KEY environment variable. Wire with a vault.get(...) expression to source it from a vault.").optional(),`,
  );
  out.push(
    `  apiVersion: z.string().describe("Pin an Ashby API version (e.g. 2026-01-01) via the Ashby-Version header. Defaults to the version the API key was created on.").optional(),`,
  );
  out.push(
    `  onBehalfOf: z.string().describe("Ashby user id to act as, sent in the X-On-Behalf-Of header. Only some endpoints honor it.").optional(),`,
  );
  out.push(`});`);
  out.push(``);

  // ResourceSchema: what Ashby returned, every field nullish.
  out.push(`const ResourceSchema = z.object({`);
  const stateProps: Record<string, Schema> = r.stateSchema?.properties ?? {};
  for (const [k, s] of Object.entries(stateProps)) {
    out.push(`  ${quoteKey(k)}: ${stateZod(s)}.nullish(),`);
  }
  if (!("id" in stateProps)) out.push(`  id: z.string().nullish(),`);
  out.push(`}).passthrough();`);
  out.push(``);

  if (r.list) {
    out.push(`const LookupSummarySchema = z.object({`);
    out.push(`  count: z.number().int(),`);
    out.push(
      `  truncated: z.boolean().describe("True when the walk stopped with rows still on offer — the result is a prefix of the collection, not the whole of it"),`,
    );
    out.push(`  truncated_by: z.enum(["max_items"]).nullable(),`);
    out.push(`  pages: z.number().int(),`);
    out.push(`  max_items: z.number().int(),`);
    out.push(`  next_cursor: z.string().nullable(),`);
    out.push(
      `  sync_token: z.string().nullable().describe("Pass as syncToken on the next lookup to fetch only records changed since this one"),`,
    );
    out.push(`  filters: z.record(z.string(), z.unknown()).optional(),`);
    out.push(`  completed_at: z.string(),`);
    out.push(`}).passthrough();`);
    out.push(``);
  }

  const hasActions = r.actions.length > 0 || r.prefix === "file";
  if (hasActions) {
    // An action writes Ashby's result object as-is, a list action writes the
    // walk, and lib/ashby.ts wraps an array or scalar result as {count, items}
    // or {value}. The fields every shape can carry are declared so CEL can
    // validate a reference to them.
    out.push(`const ActionResultSchema = z.object({`);
    out.push(`  id: z.string().nullish(),`);
    out.push(`  status: z.string().nullish(),`);
    out.push(`  count: z.number().int().nullish(),`);
    out.push(`  items: z.array(z.record(z.string(), z.unknown())).nullish(),`);
    out.push(`  truncated: z.boolean().nullish(),`);
    out.push(`  pages: z.number().int().nullish(),`);
    out.push(`  next_cursor: z.string().nullish(),`);
    out.push(`  sync_token: z.string().nullish(),`);
    out.push(`  listedAt: z.string().nullish(),`);
    out.push(`  value: z.unknown().nullish(),`);
    if (r.prefix === "file") {
      out.push(`  handle: z.string().nullish(),`);
      out.push(`  filename: z.string().nullish(),`);
      out.push(`  contentType: z.string().nullish(),`);
      out.push(`  contentLength: z.number().nullish(),`);
      out.push(`  fileUploadContext: z.string().nullish(),`);
      out.push(`  uploadedAt: z.string().nullish(),`);
    }
    out.push(`}).passthrough();`);
    out.push(``);
  }

  out.push(`const InputsSchema = z.object({`);
  for (const [k, s] of r.globals) {
    out.push(
      `  ${quoteKey(k)}: ${zod(s)}${
        SENSITIVE_FIELD.test(k) ? ".meta({ sensitive: true })" : ""
      }.optional(),`,
    );
  }
  out.push(`  apiKey: z.string().meta({ sensitive: true }).optional(),`);
  out.push(`  apiVersion: z.string().optional(),`);
  out.push(`  onBehalfOf: z.string().optional(),`);
  out.push(`});`);
  out.push(``);

  out.push(
    `/** Swamp extension model for an Ashby ${r.display}. Registered at \`${type}\`. */`,
  );
  out.push(`export const model = {`);
  out.push(`  type: "${type}",`);
  out.push(`  version: "${version}",`);
  out.push(`  globalArguments: GlobalArgsSchema,`);
  out.push(`  inputsSchema: InputsSchema,`);
  out.push(`  resources: {`);
  out.push(`    state: {`);
  out.push(`      description: ${JSON.stringify(`Ashby ${r.display} state`)},`);
  out.push(`      schema: ResourceSchema,`);
  out.push(`      lifetime: "infinite",`);
  out.push(`      garbageCollection: 10,`);
  if (SENSITIVE_OUTPUT.has(r.prefix)) out.push(`      sensitiveOutput: true,`);
  out.push(`    },`);
  if (r.list) {
    out.push(`    ${lookupName}: {`);
    out.push(
      `      description: ${
        JSON.stringify(
          `Ashby ${r.display} lookup coverage — whether the walk exhausted the collection, and the sync token for the next one`,
        )
      },`,
    );
    out.push(`      schema: LookupSummarySchema,`);
    out.push(`      lifetime: "infinite",`);
    out.push(`      garbageCollection: 10,`);
    out.push(`    },`);
  }
  if (hasActions) {
    out.push(`    ${actionName}: {`);
    out.push(
      `      description: ${
        JSON.stringify(`Ashby ${r.display} action result, one per action`)
      },`,
    );
    out.push(`      schema: ActionResultSchema,`);
    out.push(`      lifetime: "infinite",`);
    out.push(`      garbageCollection: 5,`);
    if (SENSITIVE_OUTPUT.has(r.prefix)) {
      out.push(`      sensitiveOutput: true,`);
    }
    out.push(`    },`);
  }
  out.push(`  },`);
  out.push(`  methods: {`);

  const instanceName = `        const instanceName = ${instanceNameExpr(r)};`;
  const bodyFrom = (ep: Endpoint, skip?: string) =>
    Object.keys(ep.props)
      .filter((k) => k !== skip)
      .map((k) =>
        `        if (g[${JSON.stringify(k)}] !== undefined) body[${
          JSON.stringify(k)
        }] = g[${JSON.stringify(k)}];`
      );

  if (r.create) {
    helpers.add("create");
    const ep = r.create;
    const a = emitMethod(
      out,
      "create",
      `Create a ${r.display} from the model's global arguments (${ep.operation}). ${
        methodDescription(ep).replace(/^[^:]+: /, "")
      }`,
      [],
      [
        instanceName,
        `        const body: Record<string, unknown> = {};`,
        ...bodyFrom(ep),
        `        const result = await create(${
          JSON.stringify(ep.operation)
        }, body, opts);`,
        `        const handle = await context.writeResource("state", instanceName, result);`,
        `        return { dataHandles: [handle] };`,
      ],
    );
    methods.push({
      name: "create",
      operation: ep.operation,
      kind: "create",
      args: a.length,
    });
  }

  if (r.read) {
    helpers.add("read");
    const ep = r.read;
    const a = emitMethod(
      out,
      "get",
      `Get a ${r.display} and record it as this model's state (${ep.operation}). ${
        methodDescription(ep).replace(/^[^:]+: /, "")
      }`,
      argFields(ep),
      [
        `        const result = await read(${
          JSON.stringify(ep.operation)
        }, args, opts);`,
        instanceName,
        `        const handle = await context.writeResource("state", instanceName, result);`,
        `        return { dataHandles: [handle] };`,
      ],
      "read",
    );
    methods.push({
      name: "get",
      operation: ep.operation,
      kind: "get",
      args: a.length,
    });
  }

  if (r.list) {
    helpers.add("listAll");
    const ep = r.list;
    const args = [
      ...argFields(ep, PAGING_FIELDS),
      MAX_ITEMS_ARG(`the ${lookupName} record`),
    ];
    const a = emitMethod(
      out,
      "lookup",
      `List ${r.display} records and record each as a data artifact (${ep.operation}; capped at ${DEFAULT_MAX_ITEMS} by default; writes a ${lookupName} record with the coverage of the walk and the sync token)`,
      args,
      [
        `        const { max_items, ...filters } = args;`,
        `        const maxItems = max_items ?? ${DEFAULT_MAX_ITEMS};`,
        `        const page = await listAll(${
          JSON.stringify(ep.operation)
        }, filters, { ...opts, maxItems, paginated: ${ep.paginated} });`,
        `        const dataHandles = [];`,
        `        for (let i = 0; i < page.items.length; i++) {`,
        `          const item = page.items[i] as Record<string, any>;`,
        `          const instanceName = ${
          wrapWithSanitize(
            "item.id?.toString() ?? item.name?.toString() ?? item.title?.toString() ?? `item_${i}`",
          )
        };`,
        `          dataHandles.push(await context.writeResource("state", instanceName, item));`,
        `        }`,
        `        dataHandles.push(await context.writeResource("${lookupName}", "lookup", {`,
        `          count: page.items.length,`,
        `          truncated: page.truncated,`,
        `          truncated_by: page.truncatedBy,`,
        `          pages: page.pages,`,
        `          max_items: maxItems,`,
        `          next_cursor: page.nextCursor,`,
        `          sync_token: page.syncToken,`,
        `          filters,`,
        `          completed_at: new Date().toISOString(),`,
        `        }));`,
        `        return { dataHandles };`,
      ],
      "list",
    );
    methods.push({
      name: "lookup",
      operation: ep.operation,
      kind: "lookup",
      args: a.length,
    });
  }

  if (r.update) {
    helpers.add("update");
    const ep = r.update;
    const a = emitMethod(
      out,
      "update",
      `Apply the model's global arguments to the stored ${r.display} (${ep.operation}). Run create or get first.`,
      [],
      [
        instanceName,
        ...(() => {
          const l: string[] = [];
          emitStoredLookup(l);
          return l;
        })(),
        `        const body: Record<string, unknown> = { ${
          JSON.stringify(r.updateIdField)
        }: existing.id };`,
        ...bodyFrom(ep, r.updateIdField),
        `        const result = await update(${
          JSON.stringify(ep.operation)
        }, body, opts);`,
        `        const handle = await context.writeResource("state", instanceName, result);`,
        `        return { dataHandles: [handle] };`,
      ],
    );
    methods.push({
      name: "update",
      operation: ep.operation,
      kind: "update",
      args: a.length,
    });
  }

  if (r.del) {
    helpers.add("remove");
    const ep = r.del;
    const a = emitMethod(
      out,
      "delete",
      `Delete the ${r.display} (${ep.operation}). An already-absent ${r.display} is recorded as not_found rather than failing.`,
      [`id: z.string().describe(${
        JSON.stringify(`The id of the ${r.display}`)
      })`],
      [
        `        const { existed } = await remove(${
          JSON.stringify(ep.operation)
        }, { ${JSON.stringify(r.deleteIdField)}: args.id }, opts);`,
        instanceName,
        `        const handle = await context.writeResource("state", instanceName, {`,
        `          id: args.id,`,
        `          existed,`,
        `          status: existed ? "deleted" : "not_found",`,
        `          deletedAt: new Date().toISOString(),`,
        `        });`,
        `        return { dataHandles: [handle] };`,
      ],
    );
    methods.push({
      name: "delete",
      operation: ep.operation,
      kind: "delete",
      args: a.length,
    });
  }

  if (r.read && r.readIdField) {
    helpers.add("tryRead");
    const ep = r.read;
    const a = emitMethod(
      out,
      "sync",
      `Sync the stored ${r.display} from Ashby (${ep.operation}); records status not_found when it is gone.`,
      [],
      [
        instanceName,
        ...(() => {
          const l: string[] = [];
          emitStoredLookup(l);
          return l;
        })(),
        `        const result = await tryRead(${
          JSON.stringify(ep.operation)
        }, { ${JSON.stringify(r.readIdField)}: existing.id }, opts);`,
        `        if (result) {`,
        `          const handle = await context.writeResource("state", instanceName, result);`,
        `          return { dataHandles: [handle] };`,
        `        }`,
        `        const handle = await context.writeResource("state", instanceName, {`,
        `          id: existing.id,`,
        `          status: "not_found",`,
        `          syncedAt: new Date().toISOString(),`,
        `        });`,
        `        return { dataHandles: [handle] };`,
      ],
    );
    methods.push({
      name: "sync",
      operation: ep.operation,
      kind: "sync",
      args: a.length,
    });
  }

  const used = new Set(RESERVED_METHOD_NAMES);
  for (const ep of r.actions) {
    let name = snake(ep.action);
    if (used.has(name)) name = `${name}_action`;
    if (used.has(name)) {
      throw new Error(`${ep.operation}: method name ${name} collides`);
    }
    used.add(name);
    const kind = /^(list|search|get)/.test(ep.action)
      ? "list"
      : /^(info|interviewerSettings|synchronous)$/.test(ep.action)
      ? "read"
      : undefined;

    if (ep.operation === "report.generate") {
      helpers.add("generateReport");
      const a = emitMethod(out, name, methodDescription(ep), [
        ...argFields(ep),
        `waitForCompletion: z.boolean().describe("Poll until the report is complete or failed (default true). Set false to record the first status.").optional()`,
        `pollIntervalSeconds: z.number().positive().describe("Seconds between polls (default 1, as Ashby recommends).").optional()`,
        `timeoutSeconds: z.number().positive().describe("Give up polling after this many seconds (default 300).").optional()`,
      ], [
        `        const { waitForCompletion, pollIntervalSeconds, timeoutSeconds, ...body } = args;`,
        `        const result = await generateReport(${
          JSON.stringify(ep.operation)
        }, body, {`,
        `          ...opts,`,
        `          waitForCompletion: waitForCompletion ?? true,`,
        `          pollIntervalMs: (pollIntervalSeconds ?? 1) * 1000,`,
        `          timeoutMs: (timeoutSeconds ?? 300) * 1000,`,
        `        });`,
        `        const handle = await context.writeResource("${actionName}", "${name}", result);`,
        `        return { dataHandles: [handle] };`,
      ]);
      methods.push({
        name,
        operation: ep.operation,
        kind: "report",
        args: a.length,
      });
      continue;
    }

    if (ep.paginated) {
      helpers.add("listAll");
      const a = emitMethod(out, name, methodDescription(ep), [
        ...argFields(ep, PAGING_FIELDS),
        MAX_ITEMS_ARG("the result"),
      ], [
        `        const { max_items, ...filters } = args;`,
        `        const page = await listAll(${
          JSON.stringify(ep.operation)
        }, filters, { ...opts, maxItems: max_items ?? ${DEFAULT_MAX_ITEMS}, paginated: true });`,
        `        const handle = await context.writeResource("${actionName}", "${name}", {`,
        `          count: page.items.length,`,
        `          items: page.items,`,
        `          truncated: page.truncated,`,
        `          pages: page.pages,`,
        `          next_cursor: page.nextCursor,`,
        `          sync_token: page.syncToken,`,
        `          listedAt: new Date().toISOString(),`,
        `        });`,
        `        return { dataHandles: [handle] };`,
      ], kind ?? "list");
      methods.push({
        name,
        operation: ep.operation,
        kind: "list_action",
        args: a.length,
      });
      continue;
    }

    helpers.add("action");
    const a = emitMethod(out, name, methodDescription(ep), argFields(ep), [
      `        const result = await action(${
        JSON.stringify(ep.operation)
      }, args, opts);`,
      `        const handle = await context.writeResource("${actionName}", "${name}", result);`,
      `        return { dataHandles: [handle] };`,
    ], kind);
    methods.push({
      name,
      operation: ep.operation,
      kind: "action",
      args: a.length,
    });
  }

  if (r.prefix === "file") {
    helpers.add("uploadFile");
    const a = emitMethod(
      out,
      "upload",
      "Upload a local file to Ashby storage (file.createFileUploadHandle, then the presigned POST) and record its handle. Pass the handle to the candidate model's upload_resume / upload_file or to application_form submit.",
      [
        `path: z.string().describe("Local path of the file to upload.")`,
        `fileUploadContext: z.enum(["CandidateResume", "CandidateFiles", "ApplicationForm"]).describe("CandidateResume for candidate upload_resume, CandidateFiles for candidate upload_file, ApplicationForm for application form file fields.")`,
        `filename: z.string().describe("Name Ashby records for the file. Defaults to the basename of path.").optional()`,
        `contentType: z.string().describe("MIME type. Defaults to a guess from the file extension.").optional()`,
      ],
      [
        `        const result = await uploadFile({`,
        `          path: args.path,`,
        `          fileUploadContext: args.fileUploadContext,`,
        `          filename: args.filename,`,
        `          contentType: args.contentType,`,
        `        }, opts);`,
        `        const handle = await context.writeResource("${actionName}", "upload", result);`,
        `        return { dataHandles: [handle] };`,
      ],
    );
    methods.push({
      name: "upload",
      operation: "file.createFileUploadHandle",
      kind: "upload",
      args: a.length,
    });
  }

  out.push(`  },`);
  out.push(`};`);
  out.push(``);

  // Registry limits: one violation discards the package's whole listing.
  if (methods.length > LIMITS.methodsPerModel) {
    throw new Error(`${type}: ${methods.length} methods`);
  }
  if (r.globals.length + CREDENTIAL_ARGS.length > LIMITS.globalArgsPerModel) {
    throw new Error(
      `${type}: ${r.globals.length + CREDENTIAL_ARGS.length} global arguments`,
    );
  }
  for (const m of methods) {
    if (m.args > LIMITS.argsPerMethod) {
      throw new Error(`${type}.${m.name}: ${m.args} arguments`);
    }
  }

  const source = out.join("\n").replace(
    "__HELPERS__",
    `import { ${[...helpers].sort().join(", ")} } from "./_lib/ashby.ts";`,
  );
  return { source, methods };
}

/**
 * A sibling test that runs every method against a stubbed fetch: each must
 * POST to its own endpoint and write a resource; a `success: false` reply
 * must throw before anything is written; delete and sync must record an
 * absent target as not_found. Lib behaviour (paging, retries, polling,
 * upload) is tested in codegen/lib/ashby_test.ts.
 */
function generateTest(
  type: string,
  file: string,
  methods: EmittedMethod[],
): string {
  const cases = methods
    .filter((m) => m.kind !== "upload")
    .map((m) =>
      `  [${JSON.stringify(m.name)}, ${JSON.stringify(m.operation)}, ${
        JSON.stringify(m.kind)
      }],`
    );
  return `// Auto-generated tests for ${type}
// Do not edit manually. Re-generate with: deno task generate

import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { model } from "./${file}";

const CASES: Array<[string, string, string]> = [
${cases.join("\n")}
];

const LISTS = new Set(["lookup", "list_action"]);

function harness(reply: (operation: string) => unknown) {
  const calls: string[] = [];
  const written: Array<{ spec: string; name: string; data: any }> = [];
  const original = globalThis.fetch;
  globalThis.fetch = ((url: string) => {
    calls.push(url);
    return Promise.resolve(Response.json(reply(url.split("/").pop()!)));
  }) as typeof fetch;
  const context = {
    globalArgs: { apiKey: "test-key" },
    modelType: ${JSON.stringify(type)},
    modelId: "m1",
    dataRepository: {
      getContent: () => Promise.resolve(new TextEncoder().encode(JSON.stringify({ id: "x1" }))),
    },
    writeResource: (spec: string, name: string, data: any) => {
      written.push({ spec, name, data });
      return Promise.resolve({ name });
    },
  };
  return { calls, written, context, restore: () => (globalThis.fetch = original) };
}

// deno-lint-ignore no-explicit-any
const methods = model.methods as Record<string, any>;

for (const [method, operation, kind] of CASES) {
  Deno.test(\`${type} \${method} calls \${operation} and writes a resource\`, async () => {
    const h = harness(() => ({
      success: true,
      results: LISTS.has(kind) ? [{ id: "x1" }] : { id: "x1", status: "complete" },
      moreDataAvailable: false,
    }));
    try {
      const out = await methods[method].execute(kind === "delete" ? { id: "x1" } : {}, h.context);
      assertEquals(h.calls[0], \`https://api.ashbyhq.com/\${operation}\`);
      assertEquals(out.dataHandles.length >= 1, true);
      assertEquals(h.written.length, out.dataHandles.length);
    } finally {
      h.restore();
    }
  });
}

for (const [method, operation, kind] of CASES) {
  if (kind === "delete" || kind === "sync") {
    Deno.test(\`${type} \${method} records an absent target as not_found\`, async () => {
      const h = harness(() => ({ success: false, errorInfo: { code: "thing_not_found", message: "Not found" } }));
      try {
        await methods[method].execute(kind === "delete" ? { id: "x1" } : {}, h.context);
        assertEquals(h.written[0].data.status, "not_found");
      } finally {
        h.restore();
      }
    });
    continue;
  }
  Deno.test(\`${type} \${method} surfaces success:false and writes nothing\`, async () => {
    const h = harness(() => ({ success: false, errorInfo: { code: "invalid_input", message: "Bad input", requestId: "R1" } }));
    try {
      await assertRejects(
        () => methods[method].execute({}, h.context),
        Error,
        \`Ashby \${operation} failed: Bad input code=invalid_input requestId=R1\`,
      );
      assertEquals(h.written.length, 0);
    } finally {
      h.restore();
    }
  });
}
`;
}

function generateManifest(
  domain: string,
  files: string[],
  notes: string,
): string {
  const d = DOMAINS[domain];
  const lines = [
    "# Auto-generated manifest. Re-generate with: deno task generate",
    "manifestVersion: 1",
    `name: "${EXTENSION_PREFIX}/${domain}"`,
    `version: "${version}"`,
    `description: "${d.description}"`,
    `repository: "${REPOSITORY}"`,
    "license: MIT",
    "labels:",
    ...["ashby", "ats", "recruiting", ...d.labels].map((l) => `  - ${l}`),
    "releaseNotes: |",
    ...notes.split("\n").map((l) => `  ${l}`),
    "models:",
    ...[...files].sort().map((f) => `  - ${f}`),
    "additionalFiles:",
    "  - LICENSE.txt",
    "  - README.md",
    "platforms: []",
    "",
  ];
  return lines.join("\n");
}

function generateReadme(
  domain: string,
  resources: Resource[],
  methodsByType: Map<string, EmittedMethod[]>,
): string {
  const ext = `${EXTENSION_PREFIX}/${domain}`;
  const sample = resources.find((r) => r.create && r.read) ??
    resources.find((r) => r.list) ?? resources[0];
  const sampleType = `${ext}/${sample.slug}`;
  const rows = resources.map((r) => {
    const type = `${ext}/${r.slug}`;
    const ms = methodsByType.get(type)!.map((m) => `\`${m.name}\``).join(", ");
    return `| \`${type}\` | ${ms} |`;
  });
  return `# ${ext}

Auto-generated [swamp](https://github.com/swamp-club/swamp) extension models
for the [Ashby](https://www.ashbyhq.com) ATS API — ${
    DOMAINS[domain].description.replace(/^Ashby [^:]+: /, "")
  }.

Each model represents one Ashby resource. Models have **domain properties**
that you configure (the desired state, as global arguments) and **resource
properties** that reflect the live state in Ashby. Standard methods, where the
resource supports them:

- **create** — create the resource from the configured properties
- **get** — fetch one record and store it as the model's state
- **lookup** — list the collection and record each result as a data artifact,
  plus a \`<resource>_lookup\` record with coverage and the sync token
- **update** — apply property changes to the stored resource
- **delete** — remove the resource (an absent one is recorded as \`not_found\`)
- **sync** — refresh the stored resource from Ashby

Every other Ashby endpoint is an action named after it in snake_case
(\`candidate.addTag\` → \`add_tag\`), writing to \`<resource>_action\`.

| Model | Methods |
| --- | --- |
${rows.join("\n")}

Use \`swamp model type describe <type>\` for every argument and property.

## Authentication

Ashby uses HTTP Basic with the API key as the username. Set it in the
environment:

\`\`\`bash
export ASHBY_API_KEY=your-api-key
\`\`\`

### Vault-wireable credentials

Each model also accepts an optional, sensitive \`apiKey\` global argument that
takes precedence over the environment variable and can be wired with a
\`vault.get(...)\` expression:

\`\`\`yaml
globalArgs:
  apiKey: \${{ vault.get("default", "ASHBY_API_KEY") }}
\`\`\`

\`apiVersion\` pins the \`Ashby-Version\` header and \`onBehalfOf\` sets
\`X-On-Behalf-Of\` for endpoints that act as a user.

## Quick start

\`\`\`bash
# Install the extension
swamp extension pull ${ext}

# Create a model instance
swamp model create ${sampleType} my-${sample.slug} \\
  --global-arg 'apiKey=\${{ vault.get("default", "ASHBY_API_KEY") }}'

# ${
    sample.list
      ? `Record every ${sample.display} as data`
      : `Fetch one ${sample.display}`
  }
swamp model method run my-${sample.slug} ${sample.list ? "lookup" : "get"}
\`\`\`

## Errors and limits

Ashby reports most failures as \`200 { success: false }\`; those throw, with
Ashby's error code and request id in the message. 429 and 5xx responses are
retried honouring \`Retry-After\`. \`lookup\` stops at \`max_items\` (default
${DEFAULT_MAX_ITEMS}) and says so in its coverage record rather than returning a
silent prefix.

Generated from Ashby's OpenAPI spec (API version ${spec.info.version}) by
[swamp-ashby](${REPOSITORY}).

## License

MIT — see [LICENSE.txt](./LICENSE.txt).
`;
}

const DENO_JSON = JSON.stringify(
  {
    lint: { rules: { exclude: ["no-import-prefix"] } },
    imports: { zod: "npm:zod@4.3.6" },
  },
  null,
  2,
) + "\n";

// ---------------------------------------------------------------------------
// Write

const endpoints: Record<string, string> = {};
const summary: string[] = [];
for (const domain of Object.keys(DOMAINS)) {
  const dir = `${root}${domain}`;
  const modelsDir = `${dir}/extensions/models`;
  await Deno.remove(dir, { recursive: true }).catch(() => {});
  await Deno.mkdir(`${modelsDir}/_lib`, { recursive: true });

  const resources = DOMAINS[domain].prefixes
    .filter((p) => endpointsByPrefix.has(p))
    .map((p) => buildResource(p, endpointsByPrefix.get(p)!));
  for (const p of DOMAINS[domain].prefixes) {
    if (!endpointsByPrefix.has(p)) {
      throw new Error(`${domain}: no endpoints for ${p}`);
    }
  }
  if (resources.length > LIMITS.models) {
    throw new Error(`${domain}: ${resources.length} models`);
  }

  const files: string[] = [];
  const methodsByType = new Map<string, EmittedMethod[]>();
  for (const r of resources) {
    const type = `${EXTENSION_PREFIX}/${domain}/${r.slug}`;
    const file = `${r.slugId}.ts`;
    const { source, methods } = generateModel(r);
    await Deno.writeTextFile(`${modelsDir}/${file}`, source);
    await Deno.writeTextFile(
      `${modelsDir}/${r.slugId}_test.ts`,
      generateTest(type, file, methods),
    );
    files.push(file);
    methodsByType.set(type, methods);
    for (const m of methods) {
      // sync re-reads through get's endpoint; upload is a helper, not an endpoint.
      if (m.kind === "upload" || m.kind === "sync") continue;
      if (endpoints[m.operation]) {
        throw new Error(`${m.operation} wrapped twice`);
      }
      endpoints[m.operation] = `${type} ${m.name}`;
    }
  }

  await Deno.writeTextFile(`${modelsDir}/_lib/ashby.ts`, libSource);
  await Deno.writeTextFile(
    `${dir}/manifest.yaml`,
    generateManifest(
      domain,
      files,
      `- Added: ${files.map((f) => f.replace(/\.ts$/, "")).join(", ")}`,
    ),
  );
  await Deno.writeTextFile(
    `${dir}/README.md`,
    generateReadme(domain, resources, methodsByType),
  );
  await Deno.writeTextFile(`${dir}/LICENSE.txt`, licenseText);
  await Deno.writeTextFile(`${dir}/deno.json`, DENO_JSON);

  const methodCount = [...methodsByType.values()].reduce(
    (n, ms) => n + ms.length,
    0,
  );
  summary.push(
    `${EXTENSION_PREFIX}/${domain}: ${resources.length} models, ${methodCount} methods`,
  );
}

const missing = Object.keys(spec.paths)
  .map((p) => p.slice(1))
  .filter((op) => !NOT_WRAPPED[op] && !endpoints[op]);
if (missing.length > 0) throw new Error(`not wrapped: ${missing.join(", ")}`);

await Deno.writeTextFile(
  `${root}codegen/endpoints.json`,
  JSON.stringify(
    {
      apiVersion: spec.info.version,
      endpoints: Object.fromEntries(Object.entries(endpoints).sort()),
      notWrapped: NOT_WRAPPED,
    },
    null,
    2,
  ) + "\n",
);

console.log(summary.join("\n"));
console.log(
  `${Object.keys(endpoints).length} endpoints wrapped; not wrapped: ${
    skipped.join("; ")
  }`,
);
