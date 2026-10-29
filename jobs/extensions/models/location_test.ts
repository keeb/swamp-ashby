// Auto-generated tests for @keeb/ashby/jobs/location
// Do not edit manually. Re-generate with: deno task generate

import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { model } from "./location.ts";

const CASES: Array<[string, string, string]> = [
  ["create", "location.create", "create"],
  ["get", "location.info", "get"],
  ["lookup", "location.list", "lookup"],
  ["sync", "location.info", "sync"],
  ["archive", "location.archive", "action"],
  ["move", "location.move", "action"],
  ["restore", "location.restore", "action"],
  ["update_address", "location.updateAddress", "action"],
  ["update_external_name", "location.updateExternalName", "action"],
  ["update_name", "location.updateName", "action"],
  ["update_workplace_type", "location.updateWorkplaceType", "action"],
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
    modelType: "@keeb/ashby/jobs/location",
    modelId: "m1",
    dataRepository: {
      getContent: () =>
        Promise.resolve(new TextEncoder().encode(JSON.stringify({ id: "x1" }))),
    },
    writeResource: (spec: string, name: string, data: any) => {
      written.push({ spec, name, data });
      return Promise.resolve({ name });
    },
  };
  return {
    calls,
    written,
    context,
    restore: () => (globalThis.fetch = original),
  };
}

// deno-lint-ignore no-explicit-any
const methods = model.methods as Record<string, any>;

for (const [method, operation, kind] of CASES) {
  Deno.test(`@keeb/ashby/jobs/location ${method} calls ${operation} and writes a resource`, async () => {
    const h = harness(() => ({
      success: true,
      results: LISTS.has(kind)
        ? [{ id: "x1" }]
        : { id: "x1", status: "complete" },
      moreDataAvailable: false,
    }));
    try {
      const out = await methods[method].execute(
        kind === "delete" ? { id: "x1" } : {},
        h.context,
      );
      assertEquals(h.calls[0], `https://api.ashbyhq.com/${operation}`);
      assertEquals(out.dataHandles.length >= 1, true);
      assertEquals(h.written.length, out.dataHandles.length);
    } finally {
      h.restore();
    }
  });
}

for (const [method, operation, kind] of CASES) {
  if (kind === "delete" || kind === "sync") {
    Deno.test(`@keeb/ashby/jobs/location ${method} records an absent target as not_found`, async () => {
      const h = harness(() => ({
        success: false,
        errorInfo: { code: "thing_not_found", message: "Not found" },
      }));
      try {
        await methods[method].execute(
          kind === "delete" ? { id: "x1" } : {},
          h.context,
        );
        assertEquals(h.written[0].data.status, "not_found");
      } finally {
        h.restore();
      }
    });
    continue;
  }
  Deno.test(`@keeb/ashby/jobs/location ${method} surfaces success:false and writes nothing`, async () => {
    const h = harness(() => ({
      success: false,
      errorInfo: {
        code: "invalid_input",
        message: "Bad input",
        requestId: "R1",
      },
    }));
    try {
      await assertRejects(
        () => methods[method].execute({}, h.context),
        Error,
        `Ashby ${operation} failed: Bad input code=invalid_input requestId=R1`,
      );
      assertEquals(h.written.length, 0);
    } finally {
      h.restore();
    }
  });
}
