// Auto-generated extension model for @keeb/ashby/organization/user
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby user.
 *
 * Wraps Ashby's `user.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, listAll, read, tryRead } from "./_lib/ashby.ts";

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
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  email: z.string().nullish(),
  globalRole: z.string().nullish(),
  isEnabled: z.boolean().nullish(),
  updatedAt: z.string().nullish(),
  managerId: z.string().nullish(),
  customFields: z.array(z.unknown()).nullish(),
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
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby user. Registered at `@keeb/ashby/organization/user`. */
export const model = {
  type: "@keeb/ashby/organization/user",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby user state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    user_lookup: {
      description:
        "Ashby user lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    user_action: {
      description: "Ashby user action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    get: {
      description:
        "Get a user and record it as this model's state (user.info). Retrieves detailed information about a specific user by their ID. Requires the `organizationRead` permission.",
      kind: "read",
      arguments: z.object({
        userId: z.string().describe("The unique identifier for the user"),
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
          operation: "user.info",
        });
        const result = await read("user.info", args, opts);
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
        "List user records and record each as a data artifact (user.list; capped at 500 by default; writes a user_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        includeDeactivated: z.boolean().describe(
          "Whether to include deactivated users in the results. Defaults to false.",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only users updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the user_lookup record reports truncated: true.",
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
          operation: "user.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("user.list", filters, {
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
          await context.writeResource("user_lookup", "lookup", {
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
        "Sync the stored user from Ashby (user.info); records status not_found when it is gone.",
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
          operation: "user.info",
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
        const result = await tryRead(
          "user.info",
          { "userId": existing.id },
          opts,
        );
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
    create_interviewer_pause: {
      description:
        "user.createInterviewerPause: Creates an interviewer pause for a user. While paused, the user will not be scheduled for interviews. Requires the `organizationWrite` permission.",
      arguments: z.object({
        userId: z.string().describe("The id of the user to pause."),
        startsAt: z.string().nullable().describe(
          "The start date and time of the pause. Defaults to the current time if not provided.",
        ).optional(),
        endsAt: z.string().nullable().describe(
          "The end date and time of the pause. If not provided, the pause is indefinite.",
        ).optional(),
        comment: z.string().nullable().describe(
          "An optional comment describing the reason for the pause.",
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
          method: "create_interviewer_pause",
          operation: "user.createInterviewerPause",
        });
        const result = await action("user.createInterviewerPause", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "create_interviewer_pause",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    delete_interviewer_pause: {
      description:
        "user.deleteInterviewerPause: Deletes an interviewer pause. Requires the `organizationWrite` permission.",
      arguments: z.object({
        interviewerPauseId: z.string().describe(
          "The id of the interviewer pause to delete.",
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
          method: "delete_interviewer_pause",
          operation: "user.deleteInterviewerPause",
        });
        const result = await action("user.deleteInterviewerPause", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "delete_interviewer_pause",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    interviewer_settings: {
      description:
        "user.interviewerSettings: Get interviewer settings for a user. Requires the `organizationRead` permission.",
      kind: "read",
      arguments: z.object({
        userId: z.string().describe(
          "The id of the user to get interviewer settings for",
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
          method: "interviewer_settings",
          operation: "user.interviewerSettings",
        });
        const result = await action("user.interviewerSettings", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "interviewer_settings",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    list_interviewer_pauses: {
      description:
        "user.listInterviewerPauses: Lists all active or scheduled interviewer pauses for a user. Requires the `organizationRead` permission.",
      kind: "list",
      arguments: z.object({
        userId: z.string().describe("The id of the user to list pauses for."),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "list_interviewer_pauses",
          operation: "user.listInterviewerPauses",
        });
        const result = await action("user.listInterviewerPauses", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "list_interviewer_pauses",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    search: {
      description:
        "user.search: Searches for users by email address. Requires the `organizationRead` permission.",
      kind: "list",
      arguments: z.object({
        email: z.string().describe("The email address to search for"),
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
          operation: "user.search",
        });
        const result = await action("user.search", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "search",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_custom_field_value: {
      description:
        "user.setCustomFieldValue: Set the value of a custom field on an employee. Requires the `organizationWrite` permission.",
      arguments: z.object({
        userId: z.string().describe(
          "The id of the employee to set the custom field value for",
        ),
        fieldId: z.string().describe(
          "The unique id of the Custom Field definition for the field",
        ).optional(),
        referenceIdentifier: z.string().describe(
          "Beta. This field is in beta and may not be available for all organizations. The reference ID assigned to the object. Use the value exactly as saved.",
        ).optional(),
        fieldValue: z.union([
          z.boolean(),
          z.number(),
          z.string(),
          z.array(z.string()),
          z.object({ value: z.number(), currencyCode: z.string() }),
          z.object({
            type: z.string(),
            minValue: z.number(),
            maxValue: z.number(),
          }),
          z.object({
            type: z.string(),
            minValue: z.number(),
            maxValue: z.number(),
            currencyCode: z.string(),
            interval: z.string(),
          }),
          z.object({
            country: z.string().optional(),
            region: z.string().optional(),
            city: z.string().optional(),
          }),
        ]).nullable().describe(
          'The value to store in the field. Type depends on the custom field type (boolean, string, number, object, etc.) - Location field: An object with the following properties: `{ country: "USA", city: "San Francisco", region: "California" }`. You may provide any combination of these properties and we will attempt to geocode the location. For best results, provide all three properties.',
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
          method: "set_custom_field_value",
          operation: "user.setCustomFieldValue",
        });
        const result = await action("user.setCustomFieldValue", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "set_custom_field_value",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_custom_field_values: {
      description:
        "user.setCustomFieldValues: Set the values of multiple custom fields on an employee in a single call. This is the recommended approach when updating multiple fields on the same employee to avoid race conditions that can occur with concurrent `user.setCustomFieldValue` calls. Requires the `organizationWrite` permission.",
      arguments: z.object({
        userId: z.string().describe(
          "The id of the employee to set custom field values for",
        ),
        values: z.array(z.object({
          fieldId: z.string().optional(),
          referenceIdentifier: z.string().optional(),
          fieldValue: z.union([
            z.boolean(),
            z.number(),
            z.string(),
            z.array(z.string()),
            z.object({ value: z.number(), currencyCode: z.string() }),
            z.object({
              type: z.string(),
              minValue: z.number(),
              maxValue: z.number(),
            }),
            z.object({
              type: z.string(),
              minValue: z.number(),
              maxValue: z.number(),
              currencyCode: z.string(),
              interval: z.string(),
            }),
            z.object({
              country: z.string().optional(),
              region: z.string().optional(),
              city: z.string().optional(),
            }),
          ]).nullable(),
        })).describe("Array of custom field updates to apply"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "set_custom_field_values",
          operation: "user.setCustomFieldValues",
        });
        const result = await action("user.setCustomFieldValues", args, opts);
        const handle = await context.writeResource(
          "user_action",
          "set_custom_field_values",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_interviewer_settings: {
      description:
        "user.updateInterviewerSettings: Update interviewer settings for a user. Requires the `organizationWrite` permission.",
      arguments: z.object({
        userId: z.string().describe(
          "The id of the user to update interviewer settings for",
        ),
        dailyLimit: z.number().int().nullable().describe(
          "Maximum number of interviews per day for this interviewer",
        ).optional(),
        weeklyLimit: z.number().int().nullable().describe(
          "Maximum number of interviews per week for this interviewer",
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
          method: "update_interviewer_settings",
          operation: "user.updateInterviewerSettings",
        });
        const result = await action(
          "user.updateInterviewerSettings",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "user_action",
          "update_interviewer_settings",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
