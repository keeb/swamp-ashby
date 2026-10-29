// Auto-generated extension model for @keeb/ashby/candidates/assessment
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby assessment.
 *
 * Wraps Ashby's `assessment.*` endpoints as a swamp model so they can be
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

/** Swamp extension model for an Ashby assessment. Registered at `@keeb/ashby/candidates/assessment`. */
export const model = {
  type: "@keeb/ashby/candidates/assessment",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby assessment state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    assessment_action: {
      description: "Ashby assessment action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    add_completed_to_candidate: {
      description:
        "assessment.addCompletedToCandidate: Add a completed assessment to a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to whom to add the completed assessment",
        ),
        partnerId: z.string().describe(
          "The id of the partner adding the assessment",
        ),
        assessment: z.object({
          assessmentTypeId: z.string(),
          assessmentId: z.string(),
          assessmentName: z.string(),
          result: z.object({
            identifier: z.string(),
            label: z.string(),
            description: z.string().nullable().optional(),
            type: z.enum([
              "boolean_success",
              "numeric_score",
              "numeric_duration_milliseconds",
              "numeric_duration_minutes",
              "single_sign_on_url",
              "string",
              "numeric_timestamp_milliseconds",
              "url",
            ]),
            value: z.unknown(),
            isInternal: z.boolean().nullable().optional(),
          }),
          metadata: z.array(z.object({
            identifier: z.string(),
            label: z.string(),
            description: z.string().nullable().optional(),
            type: z.enum([
              "boolean_success",
              "numeric_score",
              "numeric_duration_milliseconds",
              "numeric_duration_minutes",
              "single_sign_on_url",
              "string",
              "numeric_timestamp_milliseconds",
              "url",
            ]),
            value: z.unknown(),
            isInternal: z.boolean().nullable().optional(),
          })),
        }).describe("The completed assessment to add"),
        timestamp: z.number().int().describe(
          "The timestamp in milliseconds since the unix epoch when the assessment was completed",
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
          method: "add_completed_to_candidate",
          operation: "assessment.addCompletedToCandidate",
        });
        const result = await action(
          "assessment.addCompletedToCandidate",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "assessment_action",
          "add_completed_to_candidate",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_action: {
      description:
        "assessment.update: Update Ashby about the status of a started assessment. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        assessment_id: z.string().describe(
          "Identifier of the assessment being updated",
        ),
        timestamp: z.number().describe(
          "The timestamp in milliseconds since the unix epoch when the assessment update occurred",
        ),
        assessment_status: z.object({
          identifier: z.string(),
          label: z.string(),
          description: z.string().nullable().optional(),
          type: z.enum([
            "boolean_success",
            "numeric_score",
            "numeric_duration_milliseconds",
            "numeric_duration_minutes",
            "single_sign_on_url",
            "string",
            "numeric_timestamp_milliseconds",
            "url",
          ]),
          value: z.unknown(),
          isInternal: z.boolean().nullable().optional(),
        }).nullable().describe(
          'The current status of the assessment. Setting this with a value of "Started" will signal Ashby to store the timestamp the assessment started. Required when `cancelled_reason` is not set.',
        ).optional(),
        assessment_profile_url: z.object({
          identifier: z.string(),
          label: z.string(),
          description: z.string().nullable().optional(),
          type: z.enum([
            "boolean_success",
            "numeric_score",
            "numeric_duration_milliseconds",
            "numeric_duration_minutes",
            "single_sign_on_url",
            "string",
            "numeric_timestamp_milliseconds",
            "url",
          ]),
          value: z.unknown(),
          isInternal: z.boolean().nullable().optional(),
        }).nullable().describe(
          "The url back to the assessment/candidate on the partner's website. This value should always be of type url. Required when `assessment_result` is set.",
        ).optional(),
        assessment_result: z.object({
          identifier: z.string(),
          label: z.string(),
          description: z.string().nullable().optional(),
          type: z.enum([
            "boolean_success",
            "numeric_score",
            "numeric_duration_milliseconds",
            "numeric_duration_minutes",
            "single_sign_on_url",
            "string",
            "numeric_timestamp_milliseconds",
            "url",
          ]),
          value: z.unknown(),
          isInternal: z.boolean().nullable().optional(),
        }).nullable().describe(
          "The result of the assessment. Sending an update with this field will signal to Ashby that the assessment is complete.",
        ).optional(),
        cancelled_reason: z.object({
          identifier: z.string(),
          label: z.string(),
          description: z.string().nullable().optional(),
          type: z.enum([
            "boolean_success",
            "numeric_score",
            "numeric_duration_milliseconds",
            "numeric_duration_minutes",
            "single_sign_on_url",
            "string",
            "numeric_timestamp_milliseconds",
            "url",
          ]),
          value: z.unknown(),
          isInternal: z.boolean().nullable().optional(),
        }).nullable().describe(
          "The reason the assessment was cancelled. This field will signal to Ashby that the assessment is cancelled.",
        ).optional(),
        metadata: z.array(z.object({
          identifier: z.string(),
          label: z.string(),
          description: z.string().nullable().optional(),
          type: z.enum([
            "boolean_success",
            "numeric_score",
            "numeric_duration_milliseconds",
            "numeric_duration_minutes",
            "single_sign_on_url",
            "string",
            "numeric_timestamp_milliseconds",
            "url",
          ]),
          value: z.unknown(),
          isInternal: z.boolean().nullable().optional(),
        })).nullable().describe(
          "Any other metadata about the assessment (e.g. ETA until complete). All assessment data should have unique identifiers.",
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
          method: "update_action",
          operation: "assessment.update",
        });
        const result = await action("assessment.update", args, opts);
        const handle = await context.writeResource(
          "assessment_action",
          "update_action",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
