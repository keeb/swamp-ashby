/**
 * Structural checks over every generated model: each Ashby endpoint in the
 * spec is wrapped exactly once, each method has a resource to write to, and
 * each method's arguments schema accepts an empty or minimal call shape.
 */
import { assert, assertEquals } from "jsr:@std/assert@1.0.13";
import { z } from "npm:zod@4";

const root = new URL("..", import.meta.url).pathname;
const spec = JSON.parse(await Deno.readTextFile(`${root}spec/ashby-openapi.json`));
const manifest = await Deno.readTextFile(`${root}manifest.yaml`);
const files = [...manifest.matchAll(/^ {2}- (\S+\.ts)$/gm)].map((m) => m[1]);

// deno-lint-ignore no-explicit-any
type AnyModel = { type: string; resources: Record<string, any>; methods: Record<string, any> };
const models: AnyModel[] = [];
for (const f of files) {
  const mod = await import(`${root}extensions/models/${f}`);
  models.push(mod.model);
}

const NOT_WRAPPED = new Set([
  "assessment.start",
  "assessment.list",
  "assessment.cancel",
  "customFields.fetch",
  "application.change_stage",
  "application.change_source",
]);

Deno.test("every client-callable endpoint in the spec is wrapped exactly once", () => {
  const expected = Object.keys(spec.paths)
    .map((p) => p.slice(1))
    .filter((op) => !NOT_WRAPPED.has(op))
    .sort();
  const wrapped: string[] = [];
  for (const m of models) {
    for (const [name, method] of Object.entries(m.methods)) {
      if (name === "upload") continue;
      const src = String(method.execute);
      const op = src.match(/operation: "([^"]+)"/)?.[1];
      assert(op, `${m.type}.${name} names no operation`);
      wrapped.push(op);
    }
  }
  assertEquals(wrapped.sort(), expected);
});

Deno.test("every method writes to a declared resource and has an object schema", () => {
  for (const m of models) {
    assert(m.type.startsWith("@keeb/ashby/"), m.type);
    for (const [name, method] of Object.entries(m.methods)) {
      assert(m.resources[name], `${m.type}.${name} has no resource spec`);
      assert(method.arguments instanceof z.ZodObject, `${m.type}.${name} arguments are not an object`);
      assert(typeof method.description === "string" && method.description.length > 10);
    }
    for (const key of Object.keys(m.resources)) {
      assert(!key.includes("-"), `${m.type} resource ${key} contains a hyphen`);
    }
  }
});

Deno.test("argument schemas parse a realistic call", () => {
  const byType = Object.fromEntries(models.map((m) => [m.type, m]));
  const cases: Array<[string, string, Record<string, unknown>]> = [
    ["@keeb/ashby/candidate", "create", { name: "Ada Lovelace", email: "ada@example.com" }],
    ["@keeb/ashby/candidate", "list", { limit: 100, syncToken: "s", maxResults: 500 }],
    ["@keeb/ashby/application", "info", { applicationId: "e9ed20fd-d45f-4aad-8a00-a19bfba0083e" }],
    ["@keeb/ashby/application", "changeStage", {
      applicationId: "e9ed20fd-d45f-4aad-8a00-a19bfba0083e",
      interviewStageId: "e9ed20fd-d45f-4aad-8a00-a19bfba0083e",
    }],
    ["@keeb/ashby/report", "generate", { reportId: "r", waitForCompletion: false }],
    ["@keeb/ashby/webhook", "create", { webhookType: "applicationSubmit", requestUrl: "https://x", secretToken: "t" }],
    ["@keeb/ashby/file", "upload", { path: "/tmp/cv.pdf", fileUploadContext: "CandidateResume" }],
  ];
  for (const [type, method, args] of cases) {
    const schema = byType[type]?.methods[method]?.arguments;
    assert(schema, `${type}.${method} missing`);
    const r = schema.safeParse(args);
    assert(r.success, `${type}.${method}: ${JSON.stringify(r.error?.issues)}`);
  }
});

Deno.test("required arguments are enforced", () => {
  const candidate = models.find((m) => m.type === "@keeb/ashby/candidate")!;
  assertEquals(candidate.methods.create.arguments.safeParse({}).success, false);
});
