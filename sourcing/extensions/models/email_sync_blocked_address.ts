// Auto-generated extension model for @keeb/ashby/sourcing/email-sync-blocked-address
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby email sync blocked address.
 *
 * Wraps Ashby's `emailSyncBlockedAddress.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, create, listAll } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  addresses: z.array(z.string()).describe(
    "The email addresses to add to the blocklist. A malformed address rejects the whole batch.",
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
  addedAddresses: z.array(z.unknown()).nullish(),
  id: z.string().nullish(),
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
  addresses: z.array(z.string()).optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby email sync blocked address. Registered at `@keeb/ashby/sourcing/email-sync-blocked-address`. */
export const model = {
  type: "@keeb/ashby/sourcing/email-sync-blocked-address",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby email sync blocked address state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    email_sync_blocked_address_lookup: {
      description:
        "Ashby email sync blocked address lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    email_sync_blocked_address_action: {
      description:
        "Ashby email sync blocked address action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a email sync blocked address from the model's global arguments (emailSyncBlockedAddress.create). Adds email addresses to the candidate email sync blocklist. Requires the `organizationWrite` permission.",
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
          operation: "emailSyncBlockedAddress.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["addresses"] !== undefined) body["addresses"] = g["addresses"];
        const result = await create(
          "emailSyncBlockedAddress.create",
          body,
          opts,
        );
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
        "List email sync blocked address records and record each as a data artifact (emailSyncBlockedAddress.list; capped at 500 by default; writes a email_sync_blocked_address_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the email_sync_blocked_address_lookup record reports truncated: true.",
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
          operation: "emailSyncBlockedAddress.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("emailSyncBlockedAddress.list", filters, {
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
          await context.writeResource(
            "email_sync_blocked_address_lookup",
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
    delete_action: {
      description:
        "emailSyncBlockedAddress.delete: Removes email addresses from the candidate email sync blocklist. Requires the `organizationWrite` permission.",
      arguments: z.object({
        addresses: z.array(z.string()).describe(
          "The email addresses to remove from the blocklist. Matching is exact, and addresses that are not on the list are ignored.",
        ),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "delete_action",
          operation: "emailSyncBlockedAddress.delete",
        });
        const result = await action(
          "emailSyncBlockedAddress.delete",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "email_sync_blocked_address_action",
          "delete_action",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
