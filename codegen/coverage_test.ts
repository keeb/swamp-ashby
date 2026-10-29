/**
 * Coverage and listing checks across every generated package: each
 * client-callable endpoint in the spec is wrapped exactly once, every
 * package's lib is the current template, and every model stays inside the
 * registry's listing limits.
 */
import { assert, assertEquals } from "jsr:@std/assert@1.0.13";

const root = new URL("..", import.meta.url).pathname;
const spec = JSON.parse(
  await Deno.readTextFile(`${root}spec/ashby-openapi.json`),
);
const coverage = JSON.parse(
  await Deno.readTextFile(`${root}codegen/endpoints.json`),
);
const lib = await Deno.readTextFile(`${root}codegen/lib/ashby.ts`);
const DOMAINS = [
  "candidates",
  "jobs",
  "interviews",
  "offers",
  "sourcing",
  "surveys",
  "organization",
];

// deno-lint-ignore no-explicit-any
const models: Array<{ domain: string; model: any; source: string }> = [];
for (const domain of DOMAINS) {
  const manifest = await Deno.readTextFile(`${root}${domain}/manifest.yaml`);
  assert(manifest.includes(`name: "@keeb/ashby/${domain}"`));
  for (const [, file] of manifest.matchAll(/^ {2}- (\S+\.ts)$/gm)) {
    const path = `${root}${domain}/extensions/models/${file}`;
    models.push({
      domain,
      model: (await import(path)).model,
      source: await Deno.readTextFile(path),
    });
  }
}

Deno.test("every client-callable endpoint is wrapped exactly once", () => {
  const expected = Object.keys(spec.paths).map((p) => p.slice(1)).filter((op) =>
    !coverage.notWrapped[op]
  ).sort();
  assertEquals(Object.keys(coverage.endpoints).sort(), expected);
  for (const [op, where] of Object.entries<string>(coverage.endpoints)) {
    const [type, method] = where.split(" ");
    const m = models.find((x) => x.model.type === type);
    assert(m, `${op}: ${type} missing`);
    assert(m.model.methods[method], `${op}: ${type}.${method} missing`);
    assert(m.source.includes(`"${op}"`), `${op} not called from ${type}`);
  }
});

Deno.test("every package ships the current lib", async () => {
  for (const domain of DOMAINS) {
    const shipped = await Deno.readTextFile(
      `${root}${domain}/extensions/models/_lib/ashby.ts`,
    );
    // deno fmt may rewrap the copy; compare ignoring whitespace.
    assertEquals(shipped.replace(/\s+/g, ""), lib.replace(/\s+/g, ""), domain);
  }
});

Deno.test("models stay inside the registry's listing limits", () => {
  for (const domain of DOMAINS) {
    assert(models.filter((m) => m.domain === domain).length <= 50, domain);
  }
  for (const { model } of models) {
    assert(model.type.startsWith("@keeb/ashby/"), model.type);
    const methods = Object.entries<
      { description: string; arguments: { shape: object } }
    >(model.methods);
    assert(methods.length <= 50, model.type);
    assert(Object.keys(model.globalArguments.shape).length <= 30, model.type);
    for (const [name, m] of methods) {
      assert(
        Object.keys(m.arguments.shape).length <= 30,
        `${model.type}.${name}`,
      );
      assert(m.description.length <= 500, `${model.type}.${name} description`);
    }
    for (const key of Object.keys(model.resources)) {
      assert(!key.includes("-"), `${model.type} ${key}`);
    }
  }
});

Deno.test("credentials are optional and sensitive on every model", () => {
  for (const { model, source } of models) {
    const shape = model.globalArguments.shape;
    for (const k of ["apiKey", "apiVersion", "onBehalfOf"]) {
      assert(k in shape, `${model.type} ${k}`);
    }
    assertEquals(shape.apiKey.safeParse(undefined).success, true);
    assert(
      source.includes(`apiKey: z.string().meta({ sensitive: true })`),
      model.type,
    );
  }
});
