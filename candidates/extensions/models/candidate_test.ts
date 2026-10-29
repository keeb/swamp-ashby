// Auto-generated tests for @keeb/ashby/candidates/candidate
// Do not edit manually. Re-generate with: deno task generate

import { assertEquals, assertRejects } from "jsr:@std/assert@1.0.13";
import { model } from "./candidate.ts";

const CASES: Array<[string, string, string]> = [
  ["create", "candidate.create", "create"],
  ["get", "candidate.info", "get"],
  ["lookup", "candidate.list", "lookup"],
  ["update", "candidate.update", "update"],
  ["sync", "candidate.info", "sync"],
  ["add_email_message", "candidate.addEmailMessage", "action"],
  ["add_project", "candidate.addProject", "action"],
  ["add_tag", "candidate.addTag", "action"],
  ["anonymize", "candidate.anonymize", "action"],
  ["create_note", "candidate.createNote", "action"],
  [
    "get_recent_email_messages",
    "candidate.getRecentEmailMessages",
    "list_action",
  ],
  ["list_client_info", "candidate.listClientInfo", "list_action"],
  ["list_fraud_checks", "candidate.listFraudChecks", "list_action"],
  ["list_notes", "candidate.listNotes", "list_action"],
  ["list_projects", "candidate.listProjects", "list_action"],
  ["push_to_hris", "candidate.pushToHris", "action"],
  ["remove_project", "candidate.removeProject", "action"],
  ["remove_tag", "candidate.removeTag", "action"],
  ["search", "candidate.search", "action"],
  ["search_suggestions", "candidate.searchSuggestions", "action"],
  ["set_fraud_status", "candidate.setFraudStatus", "action"],
  ["upload_file", "candidate.uploadFile", "action"],
  ["upload_resume", "candidate.uploadResume", "action"],
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
    modelType: "@keeb/ashby/candidates/candidate",
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
  Deno.test(`@keeb/ashby/candidates/candidate ${method} calls ${operation} and writes a resource`, async () => {
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
    Deno.test(`@keeb/ashby/candidates/candidate ${method} records an absent target as not_found`, async () => {
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
  Deno.test(`@keeb/ashby/candidates/candidate ${method} surfaces success:false and writes nothing`, async () => {
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
