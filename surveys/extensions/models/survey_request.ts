// Auto-generated extension model for @keeb/ashby/surveys/survey-request
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby survey request.
 *
 * Wraps Ashby's `surveyRequest.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, listAll } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  candidateId: z.string().describe(
    "The id of the candidate to create a survey request for.",
  ).optional(),
  applicationId: z.string().describe(
    "The id of the application to associate with the survey request.",
  ).optional(),
  surveyFormDefinitionId: z.string().describe(
    "The ID of the survey form that the candidate will see when they visit the URL returned in the `surveyURL` property of the API response. Survey forms IDs can be obtained using the `surveyFormDefinition.list` endpoint.",
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
  surveyUrl: z.string().nullish(),
  surveyFormDefinitionId: z.string().nullish(),
  applicationId: z.string().nullish(),
  candidateId: z.string().nullish(),
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
  candidateId: z.string().optional(),
  applicationId: z.string().optional(),
  surveyFormDefinitionId: z.string().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby survey request. Registered at `@keeb/ashby/surveys/survey-request`. */
export const model = {
  type: "@keeb/ashby/surveys/survey-request",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby survey request state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    survey_request_lookup: {
      description:
        "Ashby survey request lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description:
        "Create a survey request from the model's global arguments (surveyRequest.create). This endpoint generates a survey request and returns a survey URL. You can send this URL to a candidate to allow them to complete a survey. Requires the `candidatesWrite` permission.",
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
          operation: "surveyRequest.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["candidateId"] !== undefined) {
          body["candidateId"] = g["candidateId"];
        }
        if (g["applicationId"] !== undefined) {
          body["applicationId"] = g["applicationId"];
        }
        if (g["surveyFormDefinitionId"] !== undefined) {
          body["surveyFormDefinitionId"] = g["surveyFormDefinitionId"];
        }
        const result = await create("surveyRequest.create", body, opts);
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
        "List survey request records and record each as a data artifact (surveyRequest.list; capped at 500 by default; writes a survey_request_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        surveyType: z.enum(["CandidateExperience", "Questionnaire"]).describe(
          "Returns only the survey requests of the given type.",
        ),
        applicationId: z.string().nullable().describe(
          "If provided, only returns the survey requests for the application with the supplied id.",
        ).optional(),
        candidateId: z.string().nullable().describe(
          "If provided, only returns the survey requests for the candidate with the supplied id.",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only survey requests updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "Return survey requests created at or after this date. Unix timestamp in milliseconds.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the survey_request_lookup record reports truncated: true.",
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
          operation: "surveyRequest.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("surveyRequest.list", filters, {
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
          await context.writeResource("survey_request_lookup", "lookup", {
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
