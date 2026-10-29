// Auto-generated extension model for @keeb/ashby/interviews/interview-briefing
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby interview briefing.
 *
 * Wraps Ashby's `interviewBriefing.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { read } from "./_lib/ashby.ts";

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
  applicationId: z.string().nullish(),
  interviewId: z.string().nullish(),
  interviewStageId: z.string().nullish(),
  interviewers: z.array(z.unknown()).nullish(),
  hasSubmittedFeedback: z.boolean().nullish(),
  feedbackFormDefinitionId: z.string().nullish(),
  feedbackFormDefinition: z.record(z.string(), z.unknown()).nullish(),
  application: z.record(z.string(), z.unknown()).nullish(),
  candidate: z.record(z.string(), z.unknown()).nullish(),
  job: z.record(z.string(), z.unknown()).nullish(),
  interview: z.record(z.string(), z.unknown()).nullish(),
}).passthrough();

const InputsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby interview briefing. Registered at `@keeb/ashby/interviews/interview-briefing`. */
export const model = {
  type: "@keeb/ashby/interviews/interview-briefing",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby interview briefing state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    get: {
      description:
        "Get a interview briefing and record it as this model's state (interviewBriefing.info). Fetch the briefing data for an interview event. Returns the application, interview, per-interviewer status, and the feedback form definition id needed to render an interviewer-facing briefing or to submit feedback via `applicationFeedback.submit`. Requires the `interviewsRead` permission.",
      kind: "read",
      arguments: z.object({
        interviewEventId: z.string().describe(
          "The id of the interview event whose briefing should be returned.",
        ),
        expand: z.array(
          z.enum([
            "feedbackFormDefinition",
            "application",
            "candidate",
            "job",
            "interview",
            "interviewers",
          ]),
        ).nullable().describe(
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
          operation: "interviewBriefing.info",
        });
        const result = await read("interviewBriefing.info", args, opts);
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
  },
};
