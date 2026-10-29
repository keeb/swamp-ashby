// Auto-generated extension model for @keeb/ashby/candidates/application-form
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby application form.
 *
 * Wraps Ashby's `applicationForm.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action } from "./_lib/ashby.ts";

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

/** Swamp extension model for an Ashby application form. Registered at `@keeb/ashby/candidates/application-form`. */
export const model = {
  type: "@keeb/ashby/candidates/application-form",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby application form state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    application_form_action: {
      description: "Ashby application form action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    submit: {
      description:
        "applicationForm.submit: Submits a completed application form for a job posting. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        jobPostingId: z.string().describe(
          "The id of the job posting to submit the application for",
        ),
        applicationForm: z.object({
          fieldSubmissions: z.array(
            z.object({ path: z.string(), value: z.unknown() }),
          ),
        }).describe("The application form data containing field submissions"),
        utmData: z.object({
          utm_source: z.string().nullable().optional(),
          utm_medium: z.string().nullable().optional(),
          utm_campaign: z.string().nullable().optional(),
          utm_term: z.string().nullable().optional(),
          utm_content: z.string().nullable().optional(),
        }).nullable().describe("Optional UTM tracking data").optional(),
        tagIds: z.array(z.string()).nullable().describe(
          "Optional array of tag ids to apply to the candidate",
        ).optional(),
        allowSubmissionForUnpublishedJobPosting: z.boolean().nullable()
          .describe(
            "If false, applications for unpublished job postings will be rejected. Defaults to true.",
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
          method: "submit",
          operation: "applicationForm.submit",
        });
        const result = await action("applicationForm.submit", args, opts);
        const handle = await context.writeResource(
          "application_form_action",
          "submit",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
