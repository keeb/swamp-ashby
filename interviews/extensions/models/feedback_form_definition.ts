// Auto-generated extension model for @keeb/ashby/interviews/feedback-form-definition
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby feedback form definition.
 *
 * Wraps Ashby's `feedbackFormDefinition.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { listAll, read, tryRead } from "./_lib/ashby.ts";

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
  organizationId: z.string().nullish(),
  title: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  isDefaultForm: z.boolean().nullish(),
  formDefinition: z.record(z.string(), z.unknown()).nullish(),
  interviewId: z.string().nullish(),
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

/** Swamp extension model for an Ashby feedback form definition. Registered at `@keeb/ashby/interviews/feedback-form-definition`. */
export const model = {
  type: "@keeb/ashby/interviews/feedback-form-definition",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby feedback form definition state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    feedback_form_definition_lookup: {
      description:
        "Ashby feedback form definition lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description:
        "Get a feedback form definition and record it as this model's state (feedbackFormDefinition.info). Returns a single feedback form by id Requires one of the `feedbackFormDefinitionsRead` or `hiringProcessMetadataRead` permissions.",
      kind: "read",
      arguments: z.object({
        feedbackFormDefinitionId: z.string().describe(
          "The unique id of the feedback form you'd like to fetch.",
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
          operation: "feedbackFormDefinition.info",
        });
        const result = await read("feedbackFormDefinition.info", args, opts);
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
        "List feedback form definition records and record each as a data artifact (feedbackFormDefinition.list; capped at 500 by default; writes a feedback_form_definition_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only feedback form definitions updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        includeArchived: z.boolean().nullable().describe(
          "Whether to include archived feedback form definitions in the results.",
        ).optional(),
        sharedOnly: z.boolean().describe(
          "When true, return only reusable shared feedback forms, excluding forms local to an Interview or activity. Defaults to false. Use the default includeArchived:false to find active shared forms.",
        ).optional(),
        includeVisibilityConditions: z.boolean().nullable().describe(
          "This feature is in beta and may not be available for all organizations. When true, each form field's visibilityCondition tree is included. Defaults to false on this endpoint to keep responses small.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the feedback_form_definition_lookup record reports truncated: true.",
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
          operation: "feedbackFormDefinition.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("feedbackFormDefinition.list", filters, {
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
            "feedback_form_definition_lookup",
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
    sync: {
      description:
        "Sync the stored feedback form definition from Ashby (feedbackFormDefinition.info); records status not_found when it is gone.",
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
          operation: "feedbackFormDefinition.info",
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
        const result = await tryRead("feedbackFormDefinition.info", {
          "feedbackFormDefinitionId": existing.id,
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
  },
};
