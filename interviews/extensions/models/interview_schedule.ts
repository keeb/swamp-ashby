// Auto-generated extension model for @keeb/ashby/interviews/interview-schedule
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby interview schedule.
 *
 * Wraps Ashby's `interviewSchedule.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, create, listAll, update } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  applicationId: z.string().describe(
    "The id of the application for this interview schedule. Sent by create only; interviewSchedule.update does not accept it.",
  ).optional(),
  interviewEvents: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    interviewers: z.array(
      z.object({
        email: z.string(),
        feedbackRequired: z.boolean().nullable().optional(),
      }),
    ),
    extraData: z.record(z.string(), z.string()).nullable().optional(),
    interviewId: z.string().nullable().optional(),
  })).describe(
    "The list of events that make up this interview schedule. Sent by create only; interviewSchedule.update does not accept it.",
  ).optional(),
  interviewEvent: z.union([
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      interviewers: z.array(
        z.object({
          email: z.string(),
          feedbackRequired: z.boolean().nullable().optional(),
        }),
      ),
      extraData: z.record(z.string(), z.string()).nullable().optional(),
      interviewId: z.string().nullable().optional(),
      interviewEventId: z.string().nullable().optional(),
    }),
    z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      interviewers: z.array(
        z.object({
          email: z.string(),
          feedbackRequired: z.boolean().nullable().optional(),
        }),
      ),
      extraData: z.record(z.string(), z.string()).nullable().optional(),
      interviewId: z.string().nullable().optional(),
      interviewEventId: z.string().nullable().optional(),
    })),
  ]).nullable().describe(
    "An event (or array of events) on the interview schedule to create or update. To update an event, its `interviewEventId` must be included in the request. Sent by update only; interviewSchedule.create does not accept it.",
  ).optional(),
  interviewEventIdToCancel: z.union([
    z.string(),
    z.array(z.string().nullable()),
  ]).nullable().describe(
    "The id (or array of ids) of interview events to cancel. Sent by update only; interviewSchedule.create does not accept it.",
  ).optional(),
  allowFeedbackDeletion: z.boolean().nullable().describe(
    "By default, events with submitted feedback cannot be cancelled because cancellation deletes the associated feedback. Pass `true` to allow cancelling events with submitted feedback. Sent by update only; interviewSchedule.create does not accept it.",
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
  status: z.string().nullish(),
  applicationId: z.string().nullish(),
  interviewStageId: z.string().nullish(),
  scheduledBy: z.record(z.string(), z.unknown()).nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  interviewEvents: z.array(z.unknown()).nullish(),
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
  applicationId: z.string().optional(),
  interviewEvents: z.array(z.object({
    startTime: z.string(),
    endTime: z.string(),
    interviewers: z.array(
      z.object({
        email: z.string(),
        feedbackRequired: z.boolean().nullable().optional(),
      }),
    ),
    extraData: z.record(z.string(), z.string()).nullable().optional(),
    interviewId: z.string().nullable().optional(),
  })).optional(),
  interviewEvent: z.union([
    z.object({
      startTime: z.string(),
      endTime: z.string(),
      interviewers: z.array(
        z.object({
          email: z.string(),
          feedbackRequired: z.boolean().nullable().optional(),
        }),
      ),
      extraData: z.record(z.string(), z.string()).nullable().optional(),
      interviewId: z.string().nullable().optional(),
      interviewEventId: z.string().nullable().optional(),
    }),
    z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
      interviewers: z.array(
        z.object({
          email: z.string(),
          feedbackRequired: z.boolean().nullable().optional(),
        }),
      ),
      extraData: z.record(z.string(), z.string()).nullable().optional(),
      interviewId: z.string().nullable().optional(),
      interviewEventId: z.string().nullable().optional(),
    })),
  ]).nullable().optional(),
  interviewEventIdToCancel: z.union([
    z.string(),
    z.array(z.string().nullable()),
  ]).nullable().optional(),
  allowFeedbackDeletion: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby interview schedule. Registered at `@keeb/ashby/interviews/interview-schedule`. */
export const model = {
  type: "@keeb/ashby/interviews/interview-schedule",
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
      description: "Ashby interview schedule state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    interview_schedule_lookup: {
      description:
        "Ashby interview schedule lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    interview_schedule_action: {
      description: "Ashby interview schedule action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a interview schedule from the model's global arguments (interviewSchedule.create). Create a scheduled interview in Ashby. Requires the `interviewsWrite` permission.",
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
          operation: "interviewSchedule.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["applicationId"] !== undefined) {
          body["applicationId"] = g["applicationId"];
        }
        if (g["interviewEvents"] !== undefined) {
          body["interviewEvents"] = g["interviewEvents"];
        }
        const result = await create("interviewSchedule.create", body, opts);
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
        "List interview schedule records and record each as a data artifact (interviewSchedule.list; capped at 500 by default; writes a interview_schedule_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        applicationId: z.string().nullable().describe(
          "The id of the application, for which to fetch interview schedules",
        ).optional(),
        interviewStageId: z.string().nullable().describe(
          "The id of the interview stage, for which to fetch interview schedules",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "The API will return data after this date, which is the time since the unix epoch in milliseconds",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "An opaque token representing the last time the data was successfully synced from the API. A new, updated one is returned after successfully fetching the last page of data.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the interview_schedule_lookup record reports truncated: true.",
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
          operation: "interviewSchedule.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("interviewSchedule.list", filters, {
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
          await context.writeResource("interview_schedule_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored interview schedule (interviewSchedule.update). Run create or get first.",
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
          operation: "interviewSchedule.update",
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
        const body: Record<string, unknown> = {
          "interviewScheduleId": existing.id,
        };
        if (g["interviewEvent"] !== undefined) {
          body["interviewEvent"] = g["interviewEvent"];
        }
        if (g["interviewEventIdToCancel"] !== undefined) {
          body["interviewEventIdToCancel"] = g["interviewEventIdToCancel"];
        }
        if (g["allowFeedbackDeletion"] !== undefined) {
          body["allowFeedbackDeletion"] = g["allowFeedbackDeletion"];
        }
        const result = await update("interviewSchedule.update", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    cancel: {
      description:
        "interviewSchedule.cancel: Cancel an interview schedule by id. Requires the `interviewsWrite` permission.",
      arguments: z.object({
        id: z.string().describe("The id of the interview schedule to cancel"),
        allowReschedule: z.boolean().nullable().describe(
          "Whether or not this interview schedule can be rescheduled.",
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
          method: "cancel",
          operation: "interviewSchedule.cancel",
        });
        const result = await action("interviewSchedule.cancel", args, opts);
        const handle = await context.writeResource(
          "interview_schedule_action",
          "cancel",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
