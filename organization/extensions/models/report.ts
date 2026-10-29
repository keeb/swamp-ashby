// Auto-generated extension model for @keeb/ashby/organization/report
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby report.
 *
 * Wraps Ashby's `report.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, generateReport } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).describe(
    "Ashby API key, sent as the HTTP Basic username. Overrides the ASHBY_API_KEY environment variable. Wire with a vault.get(...) expression to source it from a vault.",
  ).optional(),
  apiVersion: z.string().describe(
    "Pin an Ashby API version (e.g. 2026-01-01) via the Ashby-Version header. Defaults to the version the API key was created on.",
  ).optional(),
  onBehalfOf: z.string().describe(
    "Ashby user id to act as, sent in the X-On-Behalf-Of header. Only some endpoints honor it.",
  ).optional(),
});

const ResourceSchema = z.object({
  id: z.string().nullish(),
}).passthrough();

const ActionResultSchema = z.object({
  id: z.string().nullish(),
  status: z.string().nullish(),
  count: z.number().int().nullish(),
  items: z.array(z.record(z.string(), z.unknown())).nullish(),
  truncated: z.boolean().nullish(),
  pages: z.number().int().nullish(),
  next_cursor: z.string().nullish(),
  sync_token: z.string().nullish(),
  listedAt: z.string().nullish(),
  value: z.unknown().nullish(),
}).passthrough();

const InputsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby report. Registered at `@keeb/ashby/organization/report`. */
export const model = {
  type: "@keeb/ashby/organization/report",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby report state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    report_action: {
      description: "Ashby report action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    generate: {
      description:
        "report.generate: Generates a new report or polls the status of an existing report generation. Requires the `reportsRead` permission.",
      arguments: z.object({
        reportId: z.string().describe("The ID of the report"),
        includeHeadersInData: z.boolean().nullable().describe(
          "When true (default), column headers are included as the first row in the data array. When false, headers are only in the columnNames property.",
        ).optional(),
        resultStyle: z.enum(["inline", "url"]).nullable().describe(
          'How completed report data is returned. "inline" (default) embeds the data in the response; "url" returns a short-lived presigned S3 download URL instead. Requires includeHeadersInData to be true (or omitted) when "url".',
        ).optional(),
        requestId: z.string().nullable().describe(
          "Request ID for polling existing report generation status.",
        ).optional(),
        waitForCompletion: z.boolean().describe(
          "Poll until the report is complete or failed (default true). Set false to record the first status.",
        ).optional(),
        pollIntervalSeconds: z.number().positive().describe(
          "Seconds between polls (default 1, as Ashby recommends).",
        ).optional(),
        timeoutSeconds: z.number().positive().describe(
          "Give up polling after this many seconds (default 300).",
        ).optional(),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "generate",
          operation: "report.generate",
        });
        const {
          waitForCompletion,
          pollIntervalSeconds,
          timeoutSeconds,
          ...body
        } = args;
        const result = await generateReport("report.generate", body, {
          ...opts,
          waitForCompletion: waitForCompletion ?? true,
          pollIntervalMs: (pollIntervalSeconds ?? 1) * 1000,
          timeoutMs: (timeoutSeconds ?? 300) * 1000,
        });
        const handle = await context.writeResource(
          "report_action",
          "generate",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    synchronous: {
      description:
        "report.synchronous: Retrieves report data synchronously. Requires the `reportsRead` permission.",
      kind: "read",
      arguments: z.object({
        reportId: z.string().describe("The ID of the report"),
        includeHeadersInData: z.boolean().nullable().describe(
          "When true (default), column headers are included as the first row in the data array. When false, headers are only in the columnNames property.",
        ).optional(),
        resultStyle: z.enum(["inline", "url"]).nullable().describe(
          'How completed report data is returned. "inline" (default) embeds the data in the response; "url" returns a short-lived presigned S3 download URL instead. Requires includeHeadersInData to be true (or omitted) when "url".',
        ).optional(),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "synchronous",
          operation: "report.synchronous",
        });
        const result = await action("report.synchronous", args, opts);
        const handle = await context.writeResource(
          "report_action",
          "synchronous",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
