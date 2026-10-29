// Auto-generated extension model for @keeb/ashby/jobs/location
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby location.
 *
 * Wraps Ashby's `location.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, create, listAll, read, tryRead } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  name: z.string().describe("The name of the location.").optional(),
  type: z.enum(["Location", "LocationHierarchy"]).describe(
    "A Location represents an actual location that jobs and employees can be associated with. A Location Hierarchy is a grouping of locations or other location hierarchies.",
  ).optional(),
  address: z.object({
    postalAddress: z.object({
      addressCountry: z.string().optional(),
      addressRegion: z.string().optional(),
      addressLocality: z.string().optional(),
      postalCode: z.string().optional(),
      streetAddress: z.string().optional(),
    }),
  }).nullable().describe("The address of the location.").optional(),
  parentLocationId: z.string().nullable().describe(
    "The id of the location's parent.",
  ).optional(),
  isRemote: z.boolean().nullable().describe(
    "Whether the location should be labeled as remote. LocationHierarchies cannot be labeled as remote.",
  ).optional(),
  workplaceType: z.enum(["OnSite", "Hybrid", "Remote"]).nullable().describe(
    "The type of workplace. LocationHierarchies cannot be labeled with a workplaceType.",
  ).optional(),
  externalName: z.string().nullable().describe(
    "An alternate candidate-facing name for this location used on job boards and in the API.",
  ).optional(),
  extraData: z.record(z.string(), z.string()).nullable().describe(
    "Structured key-value information for your own use and reference. Do not store personally identifiable information in this field.",
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
  name: z.string().nullish(),
  externalName: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  isRemote: z.boolean().nullish(),
  address: z.record(z.string(), z.unknown()).nullish(),
  parentLocationId: z.string().nullish(),
  type: z.string().nullish(),
  workplaceType: z.string().nullish(),
  extraData: z.record(z.string(), z.unknown()).nullish(),
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
  name: z.string().optional(),
  type: z.enum(["Location", "LocationHierarchy"]).optional(),
  address: z.object({
    postalAddress: z.object({
      addressCountry: z.string().optional(),
      addressRegion: z.string().optional(),
      addressLocality: z.string().optional(),
      postalCode: z.string().optional(),
      streetAddress: z.string().optional(),
    }),
  }).nullable().optional(),
  parentLocationId: z.string().nullable().optional(),
  isRemote: z.boolean().nullable().optional(),
  workplaceType: z.enum(["OnSite", "Hybrid", "Remote"]).nullable().optional(),
  externalName: z.string().nullable().optional(),
  extraData: z.record(z.string(), z.string()).nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby location. Registered at `@keeb/ashby/jobs/location`. */
export const model = {
  type: "@keeb/ashby/jobs/location",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby location state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    location_lookup: {
      description:
        "Ashby location lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    location_action: {
      description: "Ashby location action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a location from the model's global arguments (location.create). Creates a location or location hierarchy. Requires the `organizationWrite` permission.",
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
          operation: "location.create",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["type"] !== undefined) body["type"] = g["type"];
        if (g["address"] !== undefined) body["address"] = g["address"];
        if (g["parentLocationId"] !== undefined) {
          body["parentLocationId"] = g["parentLocationId"];
        }
        if (g["isRemote"] !== undefined) body["isRemote"] = g["isRemote"];
        if (g["workplaceType"] !== undefined) {
          body["workplaceType"] = g["workplaceType"];
        }
        if (g["externalName"] !== undefined) {
          body["externalName"] = g["externalName"];
        }
        if (g["extraData"] !== undefined) body["extraData"] = g["extraData"];
        const result = await create("location.create", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    get: {
      description:
        "Get a location and record it as this model's state (location.info). Gets details for a single location by id. Requires the `organizationRead` permission.",
      kind: "read",
      arguments: z.object({
        locationId: z.string().describe("The id of the location to fetch"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "get",
          operation: "location.info",
        });
        const result = await read("location.info", args, opts);
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
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
        "List location records and record each as a data artifact (location.list; capped at 500 by default; writes a location_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only locations updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        includeArchived: z.boolean().nullable().describe(
          "When true, includes archived items. Defaults to false.",
        ).optional(),
        includeLocationHierarchy: z.boolean().nullable().describe(
          "If true, the response will include the location hierarchy (regions). Defaults to false.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the location_lookup record reports truncated: true.",
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
          operation: "location.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("location.list", filters, {
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
          await context.writeResource("location_lookup", "lookup", {
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
    sync: {
      description:
        "Sync the stored location from Ashby (location.info); records status not_found when it is gone.",
      arguments: z.object({}),
      execute: async (_args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "sync",
          operation: "location.info",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const result = await tryRead("location.info", {
          "locationId": existing.id,
        }, opts);
        if (result) {
          const handle = await context.writeResource(
            "state",
            instanceName,
            result,
          );
          return { dataHandles: [handle] };
        }
        const handle = await context.writeResource("state", instanceName, {
          id: existing.id,
          status: "not_found",
          syncedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
    archive: {
      description:
        "location.archive: Archives a location or location hierarchy. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "archive",
          operation: "location.archive",
        });
        const result = await action("location.archive", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "archive",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    move: {
      description:
        "location.move: Moves a location in location hierarchy. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
        parentLocationHierarchyId: z.string().describe(
          "The id of the parent location hierarchy",
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
          method: "move",
          operation: "location.move",
        });
        const result = await action("location.move", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "move",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    restore: {
      description:
        "location.restore: Restores an archived location or location hierarchy. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location to restore"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "restore",
          operation: "location.restore",
        });
        const result = await action("location.restore", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "restore",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_address: {
      description:
        "location.updateAddress: Update an address of a location or location hierarchy. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
        address: z.object({
          postalAddress: z.object({
            addressCountry: z.string().optional(),
            addressRegion: z.string().optional(),
            addressLocality: z.string().optional(),
            postalCode: z.string().optional(),
            streetAddress: z.string().optional(),
          }),
        }).nullable().describe(
          "The address of the location. Pass `null` to clear.",
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
          method: "update_address",
          operation: "location.updateAddress",
        });
        const result = await action("location.updateAddress", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "update_address",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_external_name: {
      description:
        "location.updateExternalName: Update a location's external (candidate-facing) name. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
        externalName: z.string().nullable().describe(
          "An alternate candidate-facing name for this location used on job boards and in the API. Pass `null` to clear.",
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
          method: "update_external_name",
          operation: "location.updateExternalName",
        });
        const result = await action("location.updateExternalName", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "update_external_name",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_name: {
      description:
        "location.updateName: Update location's name. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
        name: z.string().describe("The name of the location"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "update_name",
          operation: "location.updateName",
        });
        const result = await action("location.updateName", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "update_name",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_workplace_type: {
      description:
        "location.updateWorkplaceType: Update location's workplace type. Requires the `organizationWrite` permission.",
      arguments: z.object({
        locationId: z.string().describe("The id of the location"),
        workplaceType: z.enum(["OnSite", "Hybrid", "Remote"]).nullable()
          .describe(
            "The type of workplace. LocationHierarchies cannot be labeled with a workplaceType.",
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
          method: "update_workplace_type",
          operation: "location.updateWorkplaceType",
        });
        const result = await action("location.updateWorkplaceType", args, opts);
        const handle = await context.writeResource(
          "location_action",
          "update_workplace_type",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
