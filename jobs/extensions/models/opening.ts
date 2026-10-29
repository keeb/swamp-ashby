// Auto-generated extension model for @keeb/ashby/jobs/opening
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby opening.
 *
 * Wraps Ashby's `opening.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import {
  action,
  create,
  listAll,
  read,
  tryRead,
  update,
} from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  identifier: z.string().nullable().describe(
    "The human-readable identifier of the opening",
  ).optional(),
  description: z.string().nullable().describe("The description of the opening")
    .optional(),
  teamId: z.string().nullable().describe(
    "The id of the department or team associated with the opening",
  ).optional(),
  locationIds: z.array(z.string()).nullable().describe(
    "The ids of the locations associated with the opening",
  ).optional(),
  jobIds: z.array(z.string()).nullable().describe(
    "The ids of the jobs associated with the opening",
  ).optional(),
  targetHireDate: z.string().nullable().describe(
    "The date (in YYYY-MM-DD format) by which you intend to hire against this opening",
  ).optional(),
  targetStartDate: z.string().nullable().describe(
    "The date (in YYYY-MM-DD format) by which you intend someone hired against this opening will start employment",
  ).optional(),
  isBackfill: z.boolean().nullable().describe(
    "Whether this opening is intended to backfill a previous employee",
  ).optional(),
  employmentType: z.enum([
    "FullTime",
    "PartTime",
    "Intern",
    "Contract",
    "Temporary",
  ]).nullable().describe("The employment type for this opening").optional(),
  openingState: z.enum(["Draft", "Approved", "Open", "Closed"]).nullable()
    .describe(
      "The state the opening should be created in. Defaults to `Draft`. If not Draft, additional validation will be performed.",
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
  openedAt: z.string().nullish(),
  closedAt: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  closeReasonId: z.string().nullish(),
  archivedAt: z.string().nullish(),
  openingState: z.string().nullish(),
  latestVersion: z.record(z.string(), z.unknown()).nullish(),
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
  identifier: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  teamId: z.string().nullable().optional(),
  locationIds: z.array(z.string()).nullable().optional(),
  jobIds: z.array(z.string()).nullable().optional(),
  targetHireDate: z.string().nullable().optional(),
  targetStartDate: z.string().nullable().optional(),
  isBackfill: z.boolean().nullable().optional(),
  employmentType: z.enum([
    "FullTime",
    "PartTime",
    "Intern",
    "Contract",
    "Temporary",
  ]).nullable().optional(),
  openingState: z.enum(["Draft", "Approved", "Open", "Closed"]).nullable()
    .optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby opening. Registered at `@keeb/ashby/jobs/opening`. */
export const model = {
  type: "@keeb/ashby/jobs/opening",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby opening state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    opening_lookup: {
      description:
        "Ashby opening lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    opening_action: {
      description: "Ashby opening action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a opening from the model's global arguments (opening.create). Creates an opening. Requires the `jobsWrite` permission.",
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
          operation: "opening.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["identifier"] !== undefined) body["identifier"] = g["identifier"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["teamId"] !== undefined) body["teamId"] = g["teamId"];
        if (g["locationIds"] !== undefined) {
          body["locationIds"] = g["locationIds"];
        }
        if (g["jobIds"] !== undefined) body["jobIds"] = g["jobIds"];
        if (g["targetHireDate"] !== undefined) {
          body["targetHireDate"] = g["targetHireDate"];
        }
        if (g["targetStartDate"] !== undefined) {
          body["targetStartDate"] = g["targetStartDate"];
        }
        if (g["isBackfill"] !== undefined) body["isBackfill"] = g["isBackfill"];
        if (g["employmentType"] !== undefined) {
          body["employmentType"] = g["employmentType"];
        }
        if (g["openingState"] !== undefined) {
          body["openingState"] = g["openingState"];
        }
        const result = await create("opening.create", body, opts);
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
        "Get a opening and record it as this model's state (opening.info). Retrieves an opening by its UUID. Requires the `jobsRead` permission.",
      kind: "read",
      arguments: z.object({
        openingId: z.string().describe("The id of the opening"),
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
          operation: "opening.info",
        });
        const result = await read("opening.info", args, opts);
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
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
        "List opening records and record each as a data artifact (opening.list; capped at 500 by default; writes a opening_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        createdAfter: z.number().int().nullable().describe(
          "The API will return data after this date, which is the time since the unix epoch in milliseconds",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only openings updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the opening_lookup record reports truncated: true.",
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
          operation: "opening.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("opening.list", filters, {
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
          await context.writeResource("opening_lookup", "lookup", {
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
    update: {
      description:
        "Apply the model's global arguments to the stored opening (opening.update). Run create or get first.",
      arguments: z.object({}),
      execute: async (_args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "update",
          operation: "opening.update",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const body: Record<string, unknown> = { "openingId": existing.id };
        if (g["identifier"] !== undefined) body["identifier"] = g["identifier"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["teamId"] !== undefined) body["teamId"] = g["teamId"];
        if (g["targetHireDate"] !== undefined) {
          body["targetHireDate"] = g["targetHireDate"];
        }
        if (g["targetStartDate"] !== undefined) {
          body["targetStartDate"] = g["targetStartDate"];
        }
        if (g["isBackfill"] !== undefined) body["isBackfill"] = g["isBackfill"];
        if (g["employmentType"] !== undefined) {
          body["employmentType"] = g["employmentType"];
        }
        const result = await update("opening.update", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    sync: {
      description:
        "Sync the stored opening from Ashby (opening.info); records status not_found when it is gone.",
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
          operation: "opening.info",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const result = await tryRead("opening.info", {
          "openingId": existing.id,
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
    add_job: {
      description:
        "opening.addJob: Adds a job to an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe("The id of the opening"),
        jobId: z.string().describe("The id of the job to add to the opening"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "add_job",
          operation: "opening.addJob",
        });
        const result = await action("opening.addJob", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "add_job",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    add_location: {
      description:
        "opening.addLocation: Adds a location to an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe("The id of the opening"),
        locationId: z.string().describe(
          "The id of the location to add to the opening",
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
          method: "add_location",
          operation: "opening.addLocation",
        });
        const result = await action("opening.addLocation", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "add_location",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_job: {
      description:
        "opening.removeJob: Removes a job from an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe("The id of the opening"),
        jobId: z.string().describe(
          "The id of the job to remove from the opening",
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
          method: "remove_job",
          operation: "opening.removeJob",
        });
        const result = await action("opening.removeJob", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "remove_job",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_location: {
      description:
        "opening.removeLocation: Removes a location from an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe("The id of the opening"),
        locationId: z.string().describe(
          "The id of the location to remove from the opening",
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
          method: "remove_location",
          operation: "opening.removeLocation",
        });
        const result = await action("opening.removeLocation", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "remove_location",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    search: {
      description:
        "opening.search: Searches for openings by identifier. Requires the `jobsRead` permission.",
      kind: "list",
      arguments: z.object({
        identifier: z.string().describe(
          "The identifier of the opening you want to search for",
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
          method: "search",
          operation: "opening.search",
        });
        const result = await action("opening.search", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "search",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_archived: {
      description:
        "opening.setArchived: Sets the archived state of an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe(
          "The id of the opening you want to archive or unarchive",
        ),
        archive: z.boolean().describe(
          "The new archived state you want to update the opening to",
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
          method: "set_archived",
          operation: "opening.setArchived",
        });
        const result = await action("opening.setArchived", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "set_archived",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_opening_state: {
      description:
        "opening.setOpeningState: Sets the state of an opening. Requires the `jobsWrite` permission.",
      arguments: z.object({
        openingId: z.string().describe(
          "The id of the opening you want to update",
        ),
        openingState: z.enum(["Draft", "Approved", "Open", "Closed"]).describe(
          "The new state you want to update the opening to",
        ),
        closeReasonId: z.string().nullable().describe(
          "The id of the close reason if you are setting the state to closed",
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
          method: "set_opening_state",
          operation: "opening.setOpeningState",
        });
        const result = await action("opening.setOpeningState", args, opts);
        const handle = await context.writeResource(
          "opening_action",
          "set_opening_state",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
