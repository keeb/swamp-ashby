// Auto-generated extension model for @keeb/ashby/organization/audit-log
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby audit log.
 *
 * Wraps Ashby's `auditLog.*` endpoints as a swamp model so they can be
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
  timestamp: z.string().nullish(),
  actor: z.record(z.string(), z.unknown()).nullish(),
  target: z.record(z.string(), z.unknown()).nullish(),
  category: z.string().nullish(),
  description: z.string().nullish(),
  request: z.record(z.string(), z.unknown()).nullish(),
  parentAction: z.record(z.string(), z.unknown()).nullish(),
  changedFields: z.record(z.string(), z.unknown()).nullish(),
  channel: z.string().nullish(),
  via: z.record(z.string(), z.unknown()).nullish(),
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

/** Swamp extension model for an Ashby audit log. Registered at `@keeb/ashby/organization/audit-log`. */
export const model = {
  type: "@keeb/ashby/organization/audit-log",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby audit log state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    audit_log_lookup: {
      description:
        "Ashby audit log lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    lookup: {
      description:
        "List audit log records and record each as a data artifact (auditLog.list; capped at 500 by default; writes a audit_log_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        startDate: z.string().describe(
          "ISO 8601 start of the date window (UTC). When omitted, defaults to 24 hours before endDate. When only startDate is supplied, endDate defaults to startDate plus 24 hours (not until now) — use both bounds for a custom span.",
        ).optional(),
        endDate: z.string().describe(
          "ISO 8601 end of the date window (UTC). When omitted with startDate, defaults to startDate plus 24 hours; when both are omitted, defaults to the current time.",
        ).optional(),
        actorIds: z.array(z.string()).describe(
          "Restricts results to entries whose actor id is one of these values. An empty array is ignored, same as omitting this field. Max 100 items.",
        ).optional(),
        targetIds: z.array(z.string()).describe(
          "Restricts results to entries whose target object id is one of these values. Combined with other filters using AND (all conditions must match). An empty array is ignored. Max 100 items.",
        ).optional(),
        targetTypes: z.array(z.string()).describe(
          'Restricts results to entries whose target type is one of these values (e.g. "job", "app_user"). When both targetTypes and categories are supplied, matching uses OR (entries that match either filter). Combined with targetIds and actorIds using AND. An empty array is ignored. Max 100 items.',
        ).optional(),
        categories: z.array(z.string()).describe(
          'Restricts results to entries in one of categories (e.g. "JobStatusChanged"). Max 100 items. See the Audit Log Vocabulary guide.',
        ).optional(),
        channels: z.array(
          z.enum([
            "ashbyApp",
            "publicApi",
            "automation",
            "slack",
            "email",
            "ashbySupport",
            "mcp",
          ]),
        ).describe(
          "Restricts results to entries that came through one of these channels. Entries with no channel recorded never match. Combined with other filters using AND. An empty array is ignored. See the Audit Log Vocabulary guide.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the audit_log_lookup record reports truncated: true.",
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
          operation: "auditLog.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("auditLog.list", filters, {
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
          await context.writeResource("audit_log_lookup", "lookup", {
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
  },
};
