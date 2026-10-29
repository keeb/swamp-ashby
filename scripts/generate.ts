/**
 * Generate the @keeb/ashby models from Ashby's OpenAPI spec.
 *
 *   ~/.swamp/deno/deno run --allow-read --allow-write scripts/generate.ts [version]
 *
 * Reads spec/ashby-openapi.json (refresh it with scripts/fetch-spec.ts) and
 * writes one model per endpoint prefix to extensions/models/<prefix>.ts:
 * `candidate.list` becomes method `list` on `@keeb/ashby/candidate`. Request
 * bodies become Zod method arguments; the call itself is lib/runtime.ts.
 * Also rewrites the `models:` list in manifest.yaml and docs/ENDPOINTS.md.
 *
 * Generated files are overwritten wholesale. Change behavior in lib/ or here,
 * never in the output.
 */

// deno-lint-ignore-file no-explicit-any
type Schema = Record<string, any>;

const root = new URL("..", import.meta.url).pathname;
const spec = JSON.parse(
  await Deno.readTextFile(`${root}spec/ashby-openapi.json`),
);
const schemas: Record<string, Schema> = spec.components.schemas;
const version = Deno.args[0] ??
  (() => {
    const d = new Date();
    return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${
      String(d.getUTCDate()).padStart(2, "0")
    }.1`;
  })();

/**
 * Endpoints Ashby calls on a partner, not endpoints a client calls. They are
 * in the reference because assessment partners implement them.
 */
const PARTNER_IMPLEMENTED = new Set([
  "assessment.start",
  "assessment.list",
  "assessment.cancel",
  "customFields.fetch",
]);

/** Control arguments runtime.ts adds; a request field with the same name would be shadowed. */
const RESERVED_ARGS = new Set([
  "fetchAll",
  "maxResults",
  "waitForCompletion",
  "pollIntervalSeconds",
  "timeoutSeconds",
]);

/** Models whose results carry secrets (webhook settings include secretToken). */
const SENSITIVE_OUTPUT = new Set(["webhook"]);

/** Hand-written methods merged into a generated model. */
const EXTRAS: Record<
  string,
  { imports: string; methods: string; resources: string; endpoints: string[] }
> = {
  file: {
    imports: `import { uploadMethod, uploadResource } from "./lib/upload.ts";`,
    methods: `    upload: uploadMethod,\n`,
    resources: `    upload: uploadResource,\n`,
    endpoints: ["upload (local file → file.createFileUploadHandle → presigned POST)"],
  },
};

// ---------------------------------------------------------------------------
// JSON Schema → Zod source

const deref = (s: Schema): [Schema, string | undefined] => {
  if (s && typeof s.$ref === "string") {
    const name = s.$ref.split("/").pop()!;
    return [schemas[name] ?? {}, name];
  }
  return [s, undefined];
};

/** Strip markdown links and collapse whitespace so a description reads well in `--help`. */
function clean(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

const isNull = (s: Schema) => deref(s)[0]?.type === "null";

/**
 * A string literal, split into `+`-joined chunks when long. Ashby's longer
 * descriptions would otherwise land on one line far past what linters and
 * the registry's long-line check accept.
 */
function str(text: string, width = 160): string {
  if (text.length <= width) return JSON.stringify(text);
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > width) {
    let cut = rest.lastIndexOf(" ", width);
    if (cut <= 0) cut = width;
    chunks.push(rest.slice(0, cut + 1));
    rest = rest.slice(cut + 1);
  }
  if (rest) chunks.push(rest);
  return chunks.map((c) => JSON.stringify(c)).join(" +\n");
}

/** Property names whose values are credentials. */
const SENSITIVE_FIELD = /secret|password/i;

function zod(input: Schema, stack: string[], depth: number): string {
  const [s, refName] = deref(input);
  if (refName) {
    // A recursive schema cannot be inlined; past the first cycle the API
    // validates the shape, and the argument just has to carry it there.
    if (stack.includes(refName) || depth > 12) return "z.unknown()";
    stack = [...stack, refName];
  }
  if (!s || typeof s !== "object") return "z.unknown()";

  if ("const" in s) return `z.literal(${JSON.stringify(s.const)})`;

  if (Array.isArray(s.enum)) {
    const vals = s.enum.filter((v: unknown) => v !== null);
    const base = vals.every((v: unknown) => typeof v === "string") && vals.length > 0
      ? `z.enum(${JSON.stringify(vals)})`
      : vals.length === 1
      ? `z.literal(${JSON.stringify(vals[0])})`
      : `z.union([${vals.map((v: unknown) => `z.literal(${JSON.stringify(v)})`).join(", ")}])`;
    return s.enum.includes(null) ? `${base}.nullable()` : base;
  }

  for (const key of ["anyOf", "oneOf"] as const) {
    if (Array.isArray(s[key])) {
      const members = s[key] as Schema[];
      const nullable = members.some(isNull);
      const rest = members.filter((m) => !isNull(m));
      let inner: string;
      if (rest.length === 0) inner = "z.null()";
      else if (rest.length === 1) inner = zod(rest[0], stack, depth + 1);
      else {
        const parts = [...new Set(rest.map((m) => zod(m, stack, depth + 1)))];
        inner = parts.length === 1 ? parts[0] : `z.union([${parts.join(", ")}])`;
      }
      // Some schemas pair anyOf with sibling properties; the properties are
      // the common shape and win.
      if (s.properties) return objectZod(s, stack, depth);
      return nullable && inner !== "z.null()" ? `${inner}.nullable()` : inner;
    }
  }

  if (Array.isArray(s.allOf)) {
    const merged = mergeObjects(s.allOf.map((p: Schema) => deref(p)[0]));
    if (s.properties) {
      merged.properties = { ...merged.properties, ...s.properties };
      merged.required = [...(merged.required ?? []), ...(s.required ?? [])];
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
    case "null":
      out = "z.null()";
      break;
    case "array":
      out = `z.array(${s.items ? zod(s.items, stack, depth + 1) : "z.unknown()"})`;
      break;
    case "object":
      out = objectZod(s, stack, depth);
      break;
    default:
      out = s.properties ? objectZod(s, stack, depth) : "z.unknown()";
  }
  return nullable ? `${out}.nullable()` : out;
}

function mergeObjects(parts: Schema[]): Schema {
  const out: Schema = { type: "object", properties: {}, required: [] };
  for (const p of parts) {
    const [s] = deref(p);
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

function objectZod(s: Schema, stack: string[], depth: number): string {
  const props: Record<string, Schema> = s.properties ?? {};
  const keys = Object.keys(props);
  if (keys.length === 0) {
    const ap = s.additionalProperties;
    const value = ap && typeof ap === "object" && Object.keys(ap).length > 0
      ? zod(ap, stack, depth + 1)
      : "z.unknown()";
    return `z.record(z.string(), ${value})`;
  }
  const required = new Set<string>(s.required ?? []);
  const fields = keys.map((k) => `${JSON.stringify(k)}: ${field(k, props[k], required.has(k), stack, depth + 1)}`);
  return `z.object({ ${fields.join(", ")} })`;
}

function field(
  name: string,
  s: Schema,
  required: boolean,
  stack: string[],
  depth: number,
): string {
  let out = zod(s, stack, depth);
  if (SENSITIVE_FIELD.test(name)) out += ".meta({ sensitive: true })";
  if (!required) out += ".optional()";
  const desc = clean(s.description ?? deref(s)[0]?.description);
  if (desc) out += `.describe(${str(desc)})`;
  return out;
}

/**
 * Flatten a request body into the method's top-level arguments. A body that
 * is "one of these shapes" (e.g. look up by id or by email) becomes the union
 * of their fields, required only where every shape requires it; Ashby
 * enforces the rest.
 */
function requestFields(op: Schema): { props: Record<string, Schema>; required: Set<string> } {
  const content = op.requestBody?.content?.["application/json"]?.schema;
  if (!content) return { props: {}, required: new Set() };
  const [body] = deref(content);
  const flat = body.allOf ? mergeObjects(body.allOf) : body;
  const props: Record<string, Schema> = { ...(flat.properties ?? {}) };
  let required = new Set<string>(flat.required ?? []);
  for (const key of ["oneOf", "anyOf"] as const) {
    const variants = (body[key] ?? []).map((v: Schema) => deref(v)[0]);
    if (variants.length === 0) continue;
    for (const v of variants) Object.assign(props, v.properties ?? {});
    const common = variants
      .map((v: Schema) => new Set<string>(v.required ?? []))
      .reduce((a: Set<string>, b: Set<string>) => new Set([...a].filter((x) => b.has(x))));
    required = new Set([...required, ...common]);
  }
  return { props, required };
}

// ---------------------------------------------------------------------------
// Grouping and emission

interface Op {
  operation: string;
  prefix: string;
  method: string;
  def: Schema;
  paginated: boolean;
  kind?: "read" | "list";
}

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const snake = (s: string) => kebab(s).replace(/-/g, "_");

function kindOf(method: string): "read" | "list" | undefined {
  if (/^(list|search)/.test(method)) return "list";
  if (/^(info|get)/.test(method) || method === "interviewerSettings" || method === "synchronous") {
    return "read";
  }
  return undefined;
}

const groups = new Map<string, Op[]>();
const skipped: string[] = [];
for (const [path, item] of Object.entries<Schema>(spec.paths)) {
  const operation = path.replace(/^\//, "");
  const def = item.post;
  if (!def) continue;
  if (PARTNER_IMPLEMENTED.has(operation)) {
    skipped.push(`${operation} (implemented by assessment partners, called by Ashby)`);
    continue;
  }
  const [prefix, method] = operation.split(".");
  // application.change_stage / change_source are deprecated aliases of the
  // camelCase endpoints, which are generated.
  if (method.includes("_")) {
    skipped.push(`${operation} (deprecated alias)`);
    continue;
  }
  const { props } = requestFields(def);
  for (const k of Object.keys(props)) {
    if (RESERVED_ARGS.has(k)) throw new Error(`${operation}: request field ${k} collides with a control argument`);
  }
  const op: Op = {
    operation,
    prefix,
    method,
    def,
    paginated: "cursor" in props,
    kind: kindOf(method),
  };
  if (!groups.has(prefix)) groups.set(prefix, []);
  groups.get(prefix)!.push(op);
}

function methodDescription(op: Op): string {
  const paras = String(op.def.description ?? op.def.summary ?? op.operation)
    .split(/\n\s*\n/)
    .map((p) => clean(p)!)
    .filter(Boolean);
  const first = paras.find((p) => !p.startsWith(">") && !/^Beta$/i.test(p)) ?? op.operation;
  const perm = paras.find((p) => /^\*\*Requires|^\*\*Also requires/.test(p))?.replace(/\*\*/g, "");
  const beta = op.def["x-beta"] ? " (Beta)" : "";
  return `${op.operation}${beta}: ${first.replace(/\*\*/g, "")}${perm && perm !== first ? ` ${perm}` : ""}`;
}

function emitMethod(op: Op): string {
  const { props, required } = requestFields(op.def);
  const fields = Object.entries(props).map(([k, s]) =>
    `      ${JSON.stringify(k)}: ${field(k, s, required.has(k), [], 0)},`
  );
  if (op.paginated) fields.push("      ...PaginationControlSchema,");
  if (op.operation === "report.generate") fields.push("      ...PollControlSchema,");
  const specLit = [
    `operation: ${JSON.stringify(op.operation)}`,
    `resource: ${JSON.stringify(op.method)}`,
    ...(op.paginated ? ["paginated: true"] : []),
    ...(op.operation === "report.generate" ? [`poll: "report"`] : []),
  ].join(", ");
  return [
    `  ${op.method}: {`,
    `    description: ${str(methodDescription(op))},`,
    ...(op.kind ? [`    kind: ${JSON.stringify(op.kind)},`] : []),
    `    arguments: z.object({`,
    ...fields,
    `    }),`,
    `    execute: (args: Record<string, unknown>, context: MethodContext): Promise<MethodResult> =>`,
    `      runOperation({ ${specLit} }, args, context),`,
    `  },`,
  ].join("\n");
}

function emitModel(prefix: string, ops: Op[]): string {
  ops.sort((a, b) => a.method.localeCompare(b.method));
  const type = `@keeb/ashby/${kebab(prefix)}`;
  const extra = EXTRAS[prefix];
  const tag = ops[0].def.tags?.[0] ?? prefix;
  const usesPaging = ops.some((o) => o.paginated);
  const usesPoll = ops.some((o) => o.operation === "report.generate");
  const runtimeImports = [
    "GlobalArgsSchema",
    "type MethodContext",
    "type MethodResult",
    "OperationResultSchema",
    ...(usesPaging ? ["PaginationControlSchema"] : []),
    ...(usesPoll ? ["PollControlSchema"] : []),
    "runOperation",
  ];
  const resources = ops.map((o) =>
    `    ${o.method}: {\n      description: ${
      JSON.stringify(`Last result of ${o.operation}`)
    },\n      schema: OperationResultSchema,\n      lifetime: "infinite" as const,\n      garbageCollection: 10,${
      SENSITIVE_OUTPUT.has(prefix) ? "\n      sensitiveOutput: true," : ""
    }\n    },`
  );
  const endpointList = [
    ...ops.map((o) => ` *   - ${o.method.padEnd(28)} ${o.operation}${o.paginated ? " (paginated)" : ""}`),
    ...(extra?.endpoints ?? []).map((e) => ` *   - ${e}`),
  ];
  return `/**
 * Swamp extension model ${type} — Ashby ${tag} endpoints.
 *
${endpointList.join("\n")}
 *
 * Each method writes its result to a resource named after the method, so the
 * latest result of \`${ops[0].method}\` is \`data.latest("<definition>", "${ops[0].method}")\`.
 *
 * GENERATED by scripts/generate.ts from Ashby's OpenAPI spec (API version
 * ${spec.info.version}). Do not edit by hand; regenerate instead.
 *
 * @module
 */
import { z } from "npm:zod@4";
import {
${runtimeImports.map((i) => `  ${i},`).join("\n")}
} from "./lib/runtime.ts";
${extra ? `${extra.imports}\n` : ""}
const methods = {
${ops.map(emitMethod).join("\n")}
};

/** Model type \`${type}\`: ${ops.length + (extra ? 1 : 0)} method(s) over Ashby's ${tag} API. */
export const model = {
  type: ${JSON.stringify(type)},
  version: ${JSON.stringify(version)},
  globalArguments: GlobalArgsSchema,
  resources: {
${resources.join("\n")}
${extra?.resources ?? ""}  },
  methods: {
    ...methods,
${extra?.methods ?? ""}  },
};
`;
}

/**
 * A sibling test that runs every generated method against a stubbed fetch:
 * each must POST to its own endpoint and write Ashby's results under its own
 * resource name, and a `success: false` reply must throw before anything is
 * written. Hand-written logic (paging, polling, upload) is tested in tests/.
 */
function emitTest(prefix: string, ops: Op[], file: string): string {
  const type = `@keeb/ashby/${kebab(prefix)}`;
  const cases = ops.map((o) => `  [${JSON.stringify(o.method)}, ${JSON.stringify(o.operation)}],`);
  return `// GENERATED by scripts/generate.ts. Do not edit by hand; regenerate instead.
import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { model } from "./${file}";

const CASES: Array<[string, string]> = [
${cases.join("\n")}
];

function harness(reply: unknown) {
  const calls: string[] = [];
  const written: Array<{ spec: string; name: string; data: Record<string, unknown> }> = [];
  const original = globalThis.fetch;
  globalThis.fetch = ((url: string) => {
    calls.push(url);
    return Promise.resolve(Response.json(reply));
  }) as typeof fetch;
  const context = {
    globalArgs: { apiKey: "test-key" },
    logger: { info: () => {}, warning: () => {} },
    writeResource: (spec: string, name: string, data: Record<string, unknown>) => {
      written.push({ spec, name, data });
      return Promise.resolve({ name });
    },
  };
  return { calls, written, context, restore: () => (globalThis.fetch = original) };
}

for (const [method, operation] of CASES) {
  Deno.test(\`${type} \${method} calls \${operation} and writes its results\`, async () => {
    const h = harness({ success: true, results: [{ id: "x1" }], moreDataAvailable: false });
    try {
      // deno-lint-ignore no-explicit-any
      const m = (model.methods as Record<string, any>)[method];
      const out = await m.execute({ waitForCompletion: false }, h.context);
      assertEquals(h.calls, [\`https://api.ashbyhq.com/\${operation}\`]);
      assertEquals(out.dataHandles.length, 1);
      assertEquals(h.written[0].spec, method);
      assertEquals(h.written[0].name, method);
      assertEquals(h.written[0].data.operation, operation);
      assertEquals(h.written[0].data.results, [{ id: "x1" }]);
    } finally {
      h.restore();
    }
  });
}

Deno.test("${type} surfaces success:false as an error and writes nothing", async () => {
  const h = harness({
    success: false,
    errorInfo: { code: "not_found", message: "Not found", requestId: "R1" },
  });
  try {
    const [method, operation] = CASES[0];
    // deno-lint-ignore no-explicit-any
    const m = (model.methods as Record<string, any>)[method];
    await assertRejects(
      () => m.execute({}, h.context),
      Error,
      \`Ashby \${operation} failed: Not found code=not_found requestId=R1\`,
    );
    assertEquals(h.written.length, 0);
  } finally {
    h.restore();
  }
});
`;
}

if (groups.size === 0) {
  throw new Error("spec has no endpoints; refusing to delete every generated model");
}

const outDir = `${root}extensions/models`;
for (const e of Deno.readDirSync(outDir)) {
  if (e.isFile && e.name.endsWith(".ts")) {
    const text = await Deno.readTextFile(`${outDir}/${e.name}`);
    if (text.includes("GENERATED by scripts/generate.ts")) await Deno.remove(`${outDir}/${e.name}`);
  }
}
const files: string[] = [];
const rows: string[] = [];
const prefixes = [...groups.keys()].sort();
let methodCount = 0;
for (const prefix of prefixes) {
  const ops = groups.get(prefix)!;
  const file = `${snake(prefix)}.ts`;
  await Deno.writeTextFile(`${outDir}/${file}`, emitModel(prefix, ops));
  await Deno.writeTextFile(
    `${outDir}/${file.replace(/\.ts$/, "_test.ts")}`,
    emitTest(prefix, ops, file),
  );
  files.push(file);
  methodCount += ops.length;
  for (const o of ops) {
    rows.push(
      `| \`${o.operation}\` | \`@keeb/ashby/${kebab(prefix)}\` | \`${o.method}\` | ${o.paginated ? "yes" : ""} | ${o.def["x-beta"] ? "beta" : ""} |`,
    );
  }
  for (const e of EXTRAS[prefix]?.endpoints ?? []) {
    rows.push(`| — | \`@keeb/ashby/${kebab(prefix)}\` | \`${e.split(" ")[0]}\` | | swamp helper |`);
  }
}

// manifest.yaml: rewrite the models list, leave everything else alone.
const manifestPath = `${root}manifest.yaml`;
const manifest = await Deno.readTextFile(manifestPath);
const head = manifest.split(/^models:\s*$/m)[0].trimEnd();
await Deno.writeTextFile(
  manifestPath,
  `${head}\nmodels:\n${files.map((f) => `  - ${f}`).join("\n")}\n`,
);

await Deno.mkdir(`${root}docs`, { recursive: true });
await Deno.writeTextFile(
  `${root}docs/ENDPOINTS.md`,
  `# Endpoint coverage

Generated by \`scripts/generate.ts\` from Ashby API version ${spec.info.version}.
${methodCount} endpoints across ${files.length} models.

| Ashby endpoint | Model type | Method | Paginated | Notes |
| --- | --- | --- | --- | --- |
${rows.join("\n")}

## Not wrapped

${skipped.sort().map((s) => `- \`${s.split(" ")[0]}\` ${s.slice(s.indexOf(" ") + 1)}`).join("\n")}
`,
);

console.log(
  `${files.length} models, ${methodCount} endpoints, skipped ${skipped.length}: ${skipped.join("; ")}`,
);
