// Auto-generated tests for @keeb/ashby/interviews/interview-stage-group
// Do not edit manually. Re-generate with: deno task generate

import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { model } from "./interview_stage_group.ts";

const CASES: Array<[string, string, string]> = [
  ["lookup", "interviewStageGroup.list", "lookup"],
];

const LISTS = new Set(["lookup", "list_action"]);

const SYNC_FORWARD: string[] = [];

function harness(
  reply: (operation: string) => unknown,
  globalArgs: Record<string, unknown> = {},
) {
  const calls: string[] = [];
  const bodies: Record<string, unknown>[] = [];
  const written: Array<{ spec: string; name: string; data: any }> = [];
  const original = globalThis.fetch;
  globalThis.fetch = ((url: string, init: RequestInit) => {
    calls.push(url);
    bodies.push(JSON.parse(String(init.body ?? "{}")));
    return Promise.resolve(Response.json(reply(url.split("/").pop()!)));
  }) as typeof fetch;
  const context = {
    globalArgs: { apiKey: "test-key", ...globalArgs },
    modelType: "@keeb/ashby/interviews/interview-stage-group",
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
    bodies,
    written,
    context,
    restore: () => (globalThis.fetch = original),
  };
}

// deno-lint-ignore no-explicit-any
const methods = model.methods as Record<string, any>;

for (const [method, operation, kind] of CASES) {
  Deno.test(`@keeb/ashby/interviews/interview-stage-group ${method} calls ${operation} and writes a resource`, async () => {
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

// A read parameter configured on the model must reach sync's read
// (keeb/swamp-ashby#1), and must not be sent when it is not configured.
for (const field of SYNC_FORWARD) {
  Deno.test(`@keeb/ashby/interviews/interview-stage-group sync sends the configured ${field}`, async () => {
    const ok = () => ({ success: true, results: { id: "x1" } });
    const set = harness(ok, { [field]: true });
    try {
      await methods.sync.execute({}, set.context);
      assertEquals(set.bodies[0][field], true);
      // The stored id is still sent first, under the read endpoint's id field.
      assertEquals(Object.values(set.bodies[0])[0], "x1");
    } finally {
      set.restore();
    }
    const unset = harness(ok);
    try {
      await methods.sync.execute({}, unset.context);
      assertEquals(field in unset.bodies[0], false);
    } finally {
      unset.restore();
    }
  });
}

for (const [method, operation, kind] of CASES) {
  if (kind === "delete" || kind === "sync") {
    Deno.test(`@keeb/ashby/interviews/interview-stage-group ${method} records an absent target as not_found`, async () => {
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
  Deno.test(`@keeb/ashby/interviews/interview-stage-group ${method} surfaces success:false and writes nothing`, async () => {
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
