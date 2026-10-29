// Auto-generated extension model for @keeb/ashby/surveys/survey-submission
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby survey submission.
 *
 * Wraps Ashby's `surveySubmission.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, listAll } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  surveyFormDefinitionId: z.string().describe(
    "The unique identifier of the survey form definition to submit",
  ).optional(),
  candidateId: z.string().describe(
    "The unique identifier of the candidate submitting the survey",
  ).optional(),
  applicationId: z.string().describe(
    "The unique identifier of the associated application",
  ).optional(),
  submittedValues: z.record(z.string(), z.unknown()).describe(
    "A map of form field paths to submitted values",
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
  surveyFormDefinitionId: z.string().nullish(),
  submittedAt: z.string().nullish(),
  candidateId: z.string().nullish(),
  applicationId: z.string().nullish(),
  surveyType: z.string().nullish(),
  formDefinition: z.record(z.string(), z.unknown()).nullish(),
  submittedValues: z.record(z.string(), z.unknown()).nullish(),
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
  surveyFormDefinitionId: z.string().optional(),
  candidateId: z.string().optional(),
  applicationId: z.string().optional(),
  submittedValues: z.record(z.string(), z.unknown()).optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby survey submission. Registered at `@keeb/ashby/surveys/survey-submission`. */
export const model = {
  type: "@keeb/ashby/surveys/survey-submission",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby survey submission state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    survey_submission_lookup: {
      description:
        "Ashby survey submission lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description:
        "Create a survey submission from the model's global arguments (surveySubmission.create). Creates a survey submission for a candidate and application. Requires the `candidatesWrite` permission.",
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
          operation: "surveySubmission.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["surveyFormDefinitionId"] !== undefined) {
          body["surveyFormDefinitionId"] = g["surveyFormDefinitionId"];
        }
        if (g["candidateId"] !== undefined) {
          body["candidateId"] = g["candidateId"];
        }
        if (g["applicationId"] !== undefined) {
          body["applicationId"] = g["applicationId"];
        }
        if (g["submittedValues"] !== undefined) {
          body["submittedValues"] = g["submittedValues"];
        }
        const result = await create("surveySubmission.create", body, opts);
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
        "List survey submission records and record each as a data artifact (surveySubmission.list; capped at 500 by default; writes a survey_submission_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        surveyType: z.enum([
          "CandidateExperience",
          "Questionnaire",
          "HiringManagerExperience",
        ]).describe(
          "The type of survey submissions to fetch. Supported values: CandidateExperience, Questionnaire, HiringManagerExperience.",
        ),
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only survey submissions updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().int().nullable().describe(
          "Return survey submissions created at or after this date. Unix timestamp in milliseconds.",
        ).optional(),
        includeVisibilityConditions: z.boolean().nullable().describe(
          "This feature is in beta and may not be available for all organizations. When true, each form field's visibilityCondition tree is included. Defaults to false on this endpoint to keep responses small.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the survey_submission_lookup record reports truncated: true.",
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
          operation: "surveySubmission.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("surveySubmission.list", filters, {
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
          await context.writeResource("survey_submission_lookup", "lookup", {
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
