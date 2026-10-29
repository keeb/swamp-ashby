// Auto-generated extension model for @keeb/ashby/sourcing/communication-template
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby communication template.
 *
 * Wraps Ashby's `communicationTemplate.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { listAll } from "./_lib/ashby.ts";

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
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  title: z.string().nullish(),
  intendedTypes: z.array(z.unknown()).nullish(),
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
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby communication template. Registered at `@keeb/ashby/sourcing/communication-template`. */
export const model = {
  type: "@keeb/ashby/sourcing/communication-template",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby communication template state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    communication_template_lookup: {
      description:
        "Ashby communication template lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    lookup: {
      description:
        "List communication template records and record each as a data artifact (communicationTemplate.list; capped at 500 by default; writes a communication_template_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        ownershipFilter: z.enum(["org", "personal", "personalAndOrg"]).describe(
          "Limits results by template ownership: org returns organization templates, personal returns the API user's personal templates, and personalAndOrg returns both. Defaults to personalAndOrg.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the communication_template_lookup record reports truncated: true.",
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
          operation: "communicationTemplate.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("communicationTemplate.list", filters, {
          ...opts,
          maxItems,
          paginated: false,
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
          await context.writeResource(
            "communication_template_lookup",
            "lookup",
            {
              count: page.items.length,
              truncated: page.truncated,
              truncated_by: page.truncatedBy,
              pages: page.pages,
              max_items: maxItems,
              next_cursor: page.nextCursor,
              sync_token: page.syncToken,
              filters,
              completed_at: new Date().toISOString(),
            },
          ),
        );
        return { dataHandles };
      },
    },
  },
};
