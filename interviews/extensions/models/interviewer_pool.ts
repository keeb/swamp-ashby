// Auto-generated extension model for @keeb/ashby/interviews/interviewer-pool
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby interviewer pool.
 *
 * Wraps Ashby's `interviewerPool.*` endpoints as a swamp model so they can be
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
  title: z.string().describe("The title of the interviewer pool").optional(),
  requiresTraining: z.boolean().nullable().describe(
    "Whether the interviewer pool requires training",
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
  title: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  trainingPath: z.record(z.string(), z.unknown()).nullish(),
  qualifiedMembers: z.array(z.unknown()).nullish(),
  trainees: z.array(z.unknown()).nullish(),
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
  title: z.string().optional(),
  requiresTraining: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby interviewer pool. Registered at `@keeb/ashby/interviews/interviewer-pool`. */
export const model = {
  type: "@keeb/ashby/interviews/interviewer-pool",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby interviewer pool state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    interviewer_pool_lookup: {
      description:
        "Ashby interviewer pool lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    interviewer_pool_action: {
      description: "Ashby interviewer pool action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a interviewer pool from the model's global arguments (interviewerPool.create). Create an interviewer pool. Requires the `hiringProcessMetadataWrite` permission.",
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
          operation: "interviewerPool.create",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["requiresTraining"] !== undefined) {
          body["requiresTraining"] = g["requiresTraining"];
        }
        const result = await create("interviewerPool.create", body, opts);
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
        "Get a interviewer pool and record it as this model's state (interviewerPool.info). Get information about an interviewer pool. Requires the `hiringProcessMetadataRead` permission.",
      kind: "read",
      arguments: z.object({
        interviewerPoolId: z.string().describe(
          "The id of the interviewer pool",
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
          operation: "interviewerPool.info",
        });
        const result = await read("interviewerPool.info", args, opts);
        const instanceName = (g.title?.toString() ?? "current").replace(
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
        "List interviewer pool records and record each as a data artifact (interviewerPool.list; capped at 500 by default; writes a interviewer_pool_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only interviewer pools updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        includeArchivedPools: z.boolean().nullable().describe(
          "When true, includes archived pools. Defaults to false.",
        ).optional(),
        includeArchivedTrainingStages: z.boolean().nullable().describe(
          "When true, includes archived training stages. Defaults to true.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the interviewer_pool_lookup record reports truncated: true.",
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
          operation: "interviewerPool.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("interviewerPool.list", filters, {
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
          await context.writeResource("interviewer_pool_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored interviewer pool (interviewerPool.update). Run create or get first.",
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
          operation: "interviewerPool.update",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
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
        const body: Record<string, unknown> = {
          "interviewerPoolId": existing.id,
        };
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["requiresTraining"] !== undefined) {
          body["requiresTraining"] = g["requiresTraining"];
        }
        const result = await update("interviewerPool.update", body, opts);
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
        "Sync the stored interviewer pool from Ashby (interviewerPool.info); records status not_found when it is gone.",
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
          operation: "interviewerPool.info",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
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
        const result = await tryRead("interviewerPool.info", {
          "interviewerPoolId": existing.id,
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
    add_user: {
      description:
        "interviewerPool.addUser: Add a user to an interviewer pool. Requires the `hiringProcessMetadataWrite` permission.",
      arguments: z.object({
        interviewerPoolId: z.string().describe(
          "The id of the interviewer pool",
        ),
        userId: z.string().describe(
          "The id of the user to add to the interviewer pool",
        ),
        interviewerPoolTrainingPathStageId: z.string().nullable().describe(
          "The id of the training path stage to add the user to. If this is not provided, the user will be added as a fully qualified member of the pool.",
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
          method: "add_user",
          operation: "interviewerPool.addUser",
        });
        const result = await action("interviewerPool.addUser", args, opts);
        const handle = await context.writeResource(
          "interviewer_pool_action",
          "add_user",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    archive: {
      description:
        "interviewerPool.archive: Archives an interviewer pool. Requires the `hiringProcessMetadataWrite` permission.",
      arguments: z.object({
        interviewerPoolId: z.string().describe(
          "The id of the interviewer pool to archive",
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
          method: "archive",
          operation: "interviewerPool.archive",
        });
        const result = await action("interviewerPool.archive", args, opts);
        const handle = await context.writeResource(
          "interviewer_pool_action",
          "archive",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_user: {
      description:
        "interviewerPool.removeUser: Remove a user from an interviewer pool. Requires the `hiringProcessMetadataWrite` permission.",
      arguments: z.object({
        interviewerPoolId: z.string().describe(
          "The id of the interviewer pool",
        ),
        userId: z.string().describe(
          "The id of the user to remove from the interviewer pool",
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
          method: "remove_user",
          operation: "interviewerPool.removeUser",
        });
        const result = await action("interviewerPool.removeUser", args, opts);
        const handle = await context.writeResource(
          "interviewer_pool_action",
          "remove_user",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    restore: {
      description:
        "interviewerPool.restore: Restores an archived interviewer pool. Requires the `hiringProcessMetadataWrite` permission.",
      arguments: z.object({
        interviewerPoolId: z.string().describe(
          "The id of the interviewer pool to restore",
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
          method: "restore",
          operation: "interviewerPool.restore",
        });
        const result = await action("interviewerPool.restore", args, opts);
        const handle = await context.writeResource(
          "interviewer_pool_action",
          "restore",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
