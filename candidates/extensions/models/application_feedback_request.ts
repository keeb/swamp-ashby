// Auto-generated extension model for @keeb/ashby/candidates/application-feedback-request
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby application feedback request.
 *
 * Wraps Ashby's `applicationFeedbackRequest.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  applicationId: z.string().describe(
    "The id of the application you are requesting feedback for",
  ).optional(),
  interviewId: z.string().describe(
    "The id of the interview associated with this feedback request",
  ).optional(),
  interviewerUserId: z.string().describe(
    "The user you are requesting feedback from",
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
  interviewEventId: z.string().nullish(),
  interviewerUserId: z.string().nullish(),
  applicationId: z.string().nullish(),
  id: z.string().nullish(),
}).passthrough();

const InputsSchema = z.object({
  applicationId: z.string().optional(),
  interviewId: z.string().optional(),
  interviewerUserId: z.string().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby application feedback request. Registered at `@keeb/ashby/candidates/application-feedback-request`. */
export const model = {
  type: "@keeb/ashby/candidates/application-feedback-request",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby application feedback request state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
  },
  methods: {
    create: {
      description:
        "Create a application feedback request from the model's global arguments (applicationFeedbackRequest.create). Request feedback on an application without scheduling an interview. The `interviewEventId` returned in the response can be provided to `applicationFeedback.submit` to complete the feedback request. Requires the `candidatesWrite` permission.",
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
          operation: "applicationFeedbackRequest.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["applicationId"] !== undefined) {
          body["applicationId"] = g["applicationId"];
        }
        if (g["interviewId"] !== undefined) {
          body["interviewId"] = g["interviewId"];
        }
        if (g["interviewerUserId"] !== undefined) {
          body["interviewerUserId"] = g["interviewerUserId"];
        }
        const result = await create(
          "applicationFeedbackRequest.create",
          body,
          opts,
        );
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
