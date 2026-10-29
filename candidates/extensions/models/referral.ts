// Auto-generated extension model for @keeb/ashby/candidates/referral
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby referral.
 *
 * Wraps Ashby's `referral.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, listAll, remove } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  id: z.string().describe(
    "The id of the referral form, from /referralForm.info",
  ).optional(),
  creditedToUserId: z.string().describe(
    "The id of the user submitting the referral",
  ).optional(),
  fieldSubmissions: z.array(z.object({ path: z.string(), value: z.unknown() }))
    .describe("The field submissions for the referral form").optional(),
  createdAt: z.string().nullable().describe(
    "An ISO date string to set the referral's createdAt timestamp to. When this value isn't provided, the createdAt timestamp defaults to the time the referral was created.",
  ).optional(),
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
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  status: z.string().nullish(),
  customFields: z.array(z.unknown()).nullish(),
  candidate: z.record(z.string(), z.unknown()).nullish(),
  currentInterviewStage: z.record(z.string(), z.unknown()).nullish(),
  source: z.record(z.string(), z.unknown()).nullish(),
  archiveReason: z.record(z.string(), z.unknown()).nullish(),
  archivedAt: z.string().nullish(),
  job: z.record(z.string(), z.unknown()).nullish(),
  creditedToUser: z.record(z.string(), z.unknown()).nullish(),
  hiringTeam: z.array(z.unknown()).nullish(),
  appliedViaJobPostingId: z.string().nullish(),
  submitterClientIp: z.string().nullish(),
  submitterUserAgent: z.string().nullish(),
}).passthrough();

const LookupSummarySchema = z.object({
  count: z.number().int(),
  truncated: z.boolean().describe(
    "True when the walk stopped with rows still on offer — the result is a prefix of the collection, not the whole of it",
  ),
  truncated_by: z.enum(["max_items"]).nullable(),
  pages: z.number().int(),
  max_items: z.number().int(),
  next_cursor: z.string().nullable(),
  sync_token: z.string().nullable().describe(
    "Pass as syncToken on the next lookup to fetch only records changed since this one",
  ),
  filters: z.record(z.string(), z.unknown()).optional(),
  completed_at: z.string(),
}).passthrough();

const InputsSchema = z.object({
  id: z.string().optional(),
  creditedToUserId: z.string().optional(),
  fieldSubmissions: z.array(z.object({ path: z.string(), value: z.unknown() }))
    .optional(),
  createdAt: z.string().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby referral. Registered at `@keeb/ashby/candidates/referral`. */
export const model = {
  type: "@keeb/ashby/candidates/referral",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby referral state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    referral_lookup: {
      description:
        "Ashby referral lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description:
        "Create a referral from the model's global arguments (referral.create). Creates a referral Requires the `candidatesWrite` permission.",
      arguments: z.object({}),
      execute: async (_args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "create",
          operation: "referral.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["id"] !== undefined) body["id"] = g["id"];
        if (g["creditedToUserId"] !== undefined) {
          body["creditedToUserId"] = g["creditedToUserId"];
        }
        if (g["fieldSubmissions"] !== undefined) {
          body["fieldSubmissions"] = g["fieldSubmissions"];
        }
        if (g["createdAt"] !== undefined) body["createdAt"] = g["createdAt"];
        const result = await create("referral.create", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    lookup: {
      description:
        "List referral records and record each as a data artifact (referral.list; capped at 500 by default; writes a referral_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        applicationId: z.string().nullable().describe(
          "The id of the application you'd like to fetch referrals for",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only referrals updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "Unix timestamp (milliseconds). When provided, only referrals created at or after this time are returned.",
        ).optional(),
        includeVisibilityConditions: z.boolean().nullable().describe(
          "This feature is in beta and may not be available for all organizations. When true, each form field's visibilityCondition tree is included. Defaults to false on this endpoint to keep responses small.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the referral_lookup record reports truncated: true.",
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
          method: "lookup",
          operation: "referral.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("referral.list", filters, {
          ...opts,
          maxItems,
          paginated: true,
        });
        const dataHandles = [];
        for (let i = 0; i < page.items.length; i++) {
          const item = page.items[i] as Record<string, any>;
          const instanceName = (item.id?.toString() ?? item.name?.toString() ??
            item.title?.toString() ?? `item_${i}`).replace(/[\/\\]/g, "_")
            .replace(/\.\./g, "_").replace(/\0/g, "");
          dataHandles.push(
            await context.writeResource("state", instanceName, item),
          );
        }
        dataHandles.push(
          await context.writeResource("referral_lookup", "lookup", {
            count: page.items.length,
            truncated: page.truncated,
            truncated_by: page.truncatedBy,
            pages: page.pages,
            max_items: maxItems,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            filters,
            completed_at: new Date().toISOString(),
          }),
        );
        return { dataHandles };
      },
    },
    delete: {
      description:
        "Delete the referral (referral.delete). An already-absent referral is recorded as not_found rather than failing.",
      arguments: z.object({
        id: z.string().describe("The id of the referral"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "delete",
          operation: "referral.delete",
        });
        const { existed } = await remove("referral.delete", {
          "referralId": args.id,
        }, opts);
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, {
          id: args.id,
          existed,
          status: existed ? "deleted" : "not_found",
          deletedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
  },
};
