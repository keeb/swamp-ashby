// Auto-generated extension model for @keeb/ashby/candidates/application
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby application.
 *
 * Wraps Ashby's `application.*` endpoints as a swamp model so they can be
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
  remove,
  tryRead,
  update,
} from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  candidateId: z.string().describe(
    "The id of the candidate to consider for a job. Sent by create only; application.update does not accept it.",
  ).optional(),
  jobId: z.string().describe(
    "The id of the job to consider the candidate for. Sent by create only; application.update does not accept it.",
  ).optional(),
  interviewPlanId: z.string().nullable().describe(
    "The id of the interview plan to place the application in. If none is provided, the default interview plan is used. Sent by create only; application.update does not accept it.",
  ).optional(),
  interviewStageId: z.union([z.string(), z.literal("FirstPreInterviewScreen")])
    .nullable().describe(
      'The interview stage of the interview plan to place the application in. If none is provided, the application is placed in the first "Lead" stage. You can also supply the special string "FirstPreInterviewScreen", which selects the first pre-interview-screen stage on the job\'s interview plan. Sent by create only; application.update does not accept it.',
    ).optional(),
  sourceId: z.string().nullable().describe(
    "The source to set on the application being created.",
  ).optional(),
  creditedToUserId: z.string().nullable().describe(
    "The id of the user the application will be credited to.",
  ).optional(),
  createdAt: z.string().nullable().describe(
    "An ISO date string to set the application's `createdAt` timestamp. Defaults to the time the call was made when not provided.",
  ).optional(),
  applicationHistory: z.array(z.object({
    stageId: z.string(),
    stageNumber: z.number().int(),
    enteredStageAt: z.string(),
    applicationHistoryId: z.string().nullable().optional(),
    archiveReasonId: z.string().nullable().optional(),
  })).nullable().describe(
    "An array of objects representing the application history. When provided, the application is created with the supplied history events. Sent by create only; application.update does not accept it.",
  ).optional(),
  sendNotifications: z.boolean().nullable().describe(
    "Whether users subscribed to the application should be notified that the application was updated. Defaults to `true`. Sent by update only; application.create does not accept it.",
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
  openings: z.array(z.unknown()).nullish(),
  applicationHistory: z.array(z.unknown()).nullish(),
  applicationFormSubmissions: z.array(z.unknown()).nullish(),
  referrals: z.array(z.unknown()).nullish(),
  resumeFileHandle: z.record(z.string(), z.unknown()).nullish(),
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
  candidateId: z.string().optional(),
  jobId: z.string().optional(),
  interviewPlanId: z.string().nullable().optional(),
  interviewStageId: z.union([z.string(), z.literal("FirstPreInterviewScreen")])
    .nullable().optional(),
  sourceId: z.string().nullable().optional(),
  creditedToUserId: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  applicationHistory: z.array(z.object({
    stageId: z.string(),
    stageNumber: z.number().int(),
    enteredStageAt: z.string(),
    applicationHistoryId: z.string().nullable().optional(),
    archiveReasonId: z.string().nullable().optional(),
  })).nullable().optional(),
  sendNotifications: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby application. Registered at `@keeb/ashby/candidates/application`. */
export const model = {
  type: "@keeb/ashby/candidates/application",
  version: "2026.10.29.2",
  upgrades: [
    {
      toVersion: "2026.10.29.2",
      description:
        "sync now sends read parameters configured as global arguments (jobPosting includeUnpublishedJobPostings, offer excludeFormDefinition) instead of recording unpublished/filtered records as not_found; global arguments accepted by only create or only update now say so",
      upgradeAttributes: (old: Record<string, unknown>) => old,
    },
  ],
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby application state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    application_lookup: {
      description:
        "Ashby application lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    application_action: {
      description: "Ashby application action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a application from the model's global arguments (application.create). Consider a candidate for a job (e.g. when sourcing a candidate for a job posting). Requires the `candidatesWrite` permission.",
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
          operation: "application.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["candidateId"] !== undefined) {
          body["candidateId"] = g["candidateId"];
        }
        if (g["jobId"] !== undefined) body["jobId"] = g["jobId"];
        if (g["interviewPlanId"] !== undefined) {
          body["interviewPlanId"] = g["interviewPlanId"];
        }
        if (g["interviewStageId"] !== undefined) {
          body["interviewStageId"] = g["interviewStageId"];
        }
        if (g["sourceId"] !== undefined) body["sourceId"] = g["sourceId"];
        if (g["creditedToUserId"] !== undefined) {
          body["creditedToUserId"] = g["creditedToUserId"];
        }
        if (g["createdAt"] !== undefined) body["createdAt"] = g["createdAt"];
        if (g["applicationHistory"] !== undefined) {
          body["applicationHistory"] = g["applicationHistory"];
        }
        const result = await create("application.create", body, opts);
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
        "Get a application and record it as this model's state (application.info). Fetch application details by application id or by submitted form instance id (which is returned by the `applicationForm.submit` endpoint). If both `applicationId` and `submittedFormInstanceId` are provided, the lookup uses `applicationId`. Requires the `candidatesRead` permission.",
      kind: "read",
      arguments: z.object({
        applicationId: z.string().nullable().describe(
          "The id of the application to fetch.",
        ).optional(),
        submittedFormInstanceId: z.string().nullable().describe(
          "The id of the application's submitted form instance to fetch. Either `applicationId` or `submittedFormInstanceId` must be provided. When both are supplied, the lookup uses `applicationId`.",
        ).optional(),
        expand: z.array(z.string()).nullable().describe(
          "Choose to expand the result and include additional data for related objects.",
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
          method: "get",
          operation: "application.info",
        });
        const result = await read("application.info", args, opts);
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
        "List application records and record each as a data artifact (application.list; capped at 500 by default; writes a application_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only applications updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "Unix timestamp (milliseconds). When provided, only applications created at or after this time are returned. Must not be later than createdBefore or in the future.",
        ).optional(),
        createdBefore: z.number().nullable().describe(
          "Unix timestamp (milliseconds). When provided, only applications created at or before this time are returned. Must not be in the future.",
        ).optional(),
        status: z.string().nullable().describe(
          "Filter applications by status. Comparison is case-insensitive against `Hired`, `Archived`, `Active`, `Lead`.",
        ).optional(),
        jobId: z.string().nullable().describe(
          "Only return applications for the job with the supplied id.",
        ).optional(),
        expand: z.array(z.string()).nullable().describe(
          "Choose to expand the result and include additional data for related objects.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the application_lookup record reports truncated: true.",
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
          operation: "application.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("application.list", filters, {
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
          await context.writeResource("application_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored application (application.update). Run create or get first.",
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
          operation: "application.update",
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
        const body: Record<string, unknown> = { "applicationId": existing.id };
        if (g["sourceId"] !== undefined) body["sourceId"] = g["sourceId"];
        if (g["creditedToUserId"] !== undefined) {
          body["creditedToUserId"] = g["creditedToUserId"];
        }
        if (g["createdAt"] !== undefined) body["createdAt"] = g["createdAt"];
        if (g["sendNotifications"] !== undefined) {
          body["sendNotifications"] = g["sendNotifications"];
        }
        const result = await update("application.update", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    delete: {
      description:
        "Delete the application (application.delete). An already-absent application is recorded as not_found rather than failing.",
      arguments: z.object({
        id: z.string().describe("The id of the application"),
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
          operation: "application.delete",
        });
        const { existed } = await remove("application.delete", {
          "applicationId": args.id,
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
    sync: {
      description:
        "Sync the stored application from Ashby (application.info); records status not_found when it is gone.",
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
          operation: "application.info",
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
        const result = await tryRead("application.info", {
          "applicationId": existing.id,
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
    add_hiring_team_member: {
      description:
        "application.addHiringTeamMember: Adds an Ashby user to the hiring team at the application level. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The application to assign the user a role on.",
        ),
        teamMemberId: z.string().describe(
          "The id of the user to assign the role to.",
        ),
        roleId: z.string().describe(
          "The id of the hiring team role to assign.",
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
          method: "add_hiring_team_member",
          operation: "application.addHiringTeamMember",
        });
        const result = await action(
          "application.addHiringTeamMember",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "application_action",
          "add_hiring_team_member",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    change_source: {
      description:
        "application.changeSource: Change the source of an application. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application to update the source of.",
        ),
        sourceId: z.string().nullable().describe(
          "The source to set on the application. Pass `null` to unset an application's source.",
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
          method: "change_source",
          operation: "application.changeSource",
        });
        const result = await action("application.changeSource", args, opts);
        const handle = await context.writeResource(
          "application_action",
          "change_source",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    change_stage: {
      description:
        "application.changeStage: Change the stage of an application. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application to update the stage of.",
        ),
        interviewStageId: z.string().describe(
          "The interview stage to move the application to.",
        ),
        archiveReasonId: z.string().nullable().describe(
          "Archive Reason to set when moving to an Interview Stage with type `Archived`. Required when moving to an `Archived` stage.",
        ).optional(),
        archiveEmail: z.object({
          communicationTemplateId: z.string(),
          sendAt: z.string().nullable().optional(),
        }).nullable().optional(),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "change_stage",
          operation: "application.changeStage",
        });
        const result = await action("application.changeStage", args, opts);
        const handle = await context.writeResource(
          "application_action",
          "change_stage",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    list_criteria_evaluations: {
      description:
        "application.listCriteriaEvaluations: Fetch a paginated list of AI criteria evaluations for an application. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application to fetch criteria evaluations for.",
        ),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_criteria_evaluations",
          operation: "application.listCriteriaEvaluations",
        });
        const { max_items, ...filters } = args;
        const page = await listAll(
          "application.listCriteriaEvaluations",
          filters,
          { ...opts, maxItems: max_items ?? 500, paginated: true },
        );
        const handle = await context.writeResource(
          "application_action",
          "list_criteria_evaluations",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    list_history: {
      description:
        "application.listHistory: Fetch a paginated list of application history items for an application. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application to fetch.",
        ),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_history",
          operation: "application.listHistory",
        });
        const { max_items, ...filters } = args;
        const page = await listAll("application.listHistory", filters, {
          ...opts,
          maxItems: max_items ?? 500,
          paginated: true,
        });
        const handle = await context.writeResource(
          "application_action",
          "list_history",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    remove_hiring_team_member: {
      description:
        "application.removeHiringTeamMember: Unassigns a hiring team role from an Ashby user at the application level. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The application to unassign the user a role from.",
        ),
        teamMemberId: z.string().describe(
          "The id of the user to unassign the role from.",
        ),
        roleId: z.string().describe(
          "The id of the hiring team role to unassign.",
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
          method: "remove_hiring_team_member",
          operation: "application.removeHiringTeamMember",
        });
        const result = await action(
          "application.removeHiringTeamMember",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "application_action",
          "remove_hiring_team_member",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    transfer: {
      description:
        "application.transfer: Transfer an application to a different job. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application to transfer.",
        ),
        jobId: z.string().describe(
          "The id of the job to transfer the application to.",
        ),
        interviewPlanId: z.string().describe(
          "The id of the interview plan to transfer the application to.",
        ),
        interviewStageId: z.string().describe(
          "The interview stage of the interview plan to transfer the application to.",
        ),
        startAutomaticActivities: z.boolean().nullable().describe(
          "Whether to start any automatic activities set on the target interview stage. Defaults to `true` when omitted.",
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
          method: "transfer",
          operation: "application.transfer",
        });
        const result = await action("application.transfer", args, opts);
        const handle = await context.writeResource(
          "application_action",
          "transfer",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_history: {
      description:
        "application.updateHistory: Update the history of an application. Used to update stage timestamps and to delete history events. Also requires the `Allow updating application history?` setting found in your admin API key permissions configuration.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The id of the application whose history to update.",
        ),
        applicationHistory: z.array(z.object({
          stageId: z.string(),
          stageNumber: z.number().int(),
          enteredStageAt: z.string(),
          applicationHistoryId: z.string().nullable().optional(),
          archiveReasonId: z.string().nullable().optional(),
        })).describe(
          "The updated array of application history events. This array should contain all history events for the application, not just the events being updated.",
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
          method: "update_history",
          operation: "application.updateHistory",
        });
        const result = await action("application.updateHistory", args, opts);
        const handle = await context.writeResource(
          "application_action",
          "update_history",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
