// Auto-generated extension model for @keeb/ashby/jobs/department
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby department.
 *
 * Wraps Ashby's `department.*` endpoints as a swamp model so they can be
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
  name: z.string().describe("The name of the department or team").optional(),
  externalName: z.string().nullable().describe(
    "An alternate candidate-facing name for this department that will be used on Ashby job boards",
  ).optional(),
  parentId: z.string().nullable().describe(
    "The id of the department's parent department",
  ).optional(),
  extraData: z.record(z.string(), z.string()).nullable().describe(
    "Key-value pairs for your own use and reference. Keys must be at most 100 characters, values at most 512 characters, and total size less than 1kb.",
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
  parentId: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
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
  externalName: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  extraData: z.record(z.string(), z.string()).nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby department. Registered at `@keeb/ashby/jobs/department`. */
export const model = {
  type: "@keeb/ashby/jobs/department",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby department state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    department_lookup: {
      description:
        "Ashby department lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    department_action: {
      description: "Ashby department action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a department from the model's global arguments (department.create). Creates a department. Requires the `organizationWrite` permission.",
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
          operation: "department.create",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["externalName"] !== undefined) {
          body["externalName"] = g["externalName"];
        }
        if (g["parentId"] !== undefined) body["parentId"] = g["parentId"];
        if (g["extraData"] !== undefined) body["extraData"] = g["extraData"];
        const result = await create("department.create", body, opts);
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
        "Get a department and record it as this model's state (department.info). Fetch department details by id. Requires the `organizationRead` permission.",
      kind: "read",
      arguments: z.object({
        departmentId: z.string().describe(
          "The unique id of the department whose details will be fetched",
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
          method: "get",
          operation: "department.info",
        });
        const result = await read("department.info", args, opts);
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
        "List department records and record each as a data artifact (department.list; capped at 500 by default; writes a department_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        includeArchived: z.boolean().nullable().describe(
          "Whether archived departments should be included in the response",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only departments updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the department_lookup record reports truncated: true.",
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
          operation: "department.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("department.list", filters, {
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
          await context.writeResource("department_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored department (department.update). Run create or get first.",
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
          operation: "department.update",
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
        const body: Record<string, unknown> = { "departmentId": existing.id };
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["externalName"] !== undefined) {
          body["externalName"] = g["externalName"];
        }
        if (g["extraData"] !== undefined) body["extraData"] = g["extraData"];
        const result = await update("department.update", body, opts);
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
        "Sync the stored department from Ashby (department.info); records status not_found when it is gone.",
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
          operation: "department.info",
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
        const result = await tryRead("department.info", {
          "departmentId": existing.id,
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
        "department.archive: Archives a department. Requires the `organizationWrite` permission.",
      arguments: z.object({
        departmentId: z.string().describe("The department's ID"),
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
          operation: "department.archive",
        });
        const result = await action("department.archive", args, opts);
        const handle = await context.writeResource(
          "department_action",
          "archive",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    move: {
      description:
        "department.move: Moves a department to another parent. Requires the `organizationWrite` permission.",
      arguments: z.object({
        departmentId: z.string().describe("The department's ID"),
        parentId: z.string().nullable().describe(
          "The department parent's ID. Pass null (or omit) to move to the top level.",
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
          method: "move",
          operation: "department.move",
        });
        const result = await action("department.move", args, opts);
        const handle = await context.writeResource(
          "department_action",
          "move",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    restore: {
      description:
        "department.restore: Restores a department. Requires the `organizationWrite` permission.",
      arguments: z.object({
        departmentId: z.string().describe("The department's ID"),
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
          operation: "department.restore",
        });
        const result = await action("department.restore", args, opts);
        const handle = await context.writeResource(
          "department_action",
          "restore",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
