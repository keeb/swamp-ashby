// Auto-generated extension model for @keeb/ashby/jobs/approval-definition
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby approval definition.
 *
 * Wraps Ashby's `approvalDefinition.*` endpoints as a swamp model so they can be
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

/** Swamp extension model for an Ashby approval definition. Registered at `@keeb/ashby/jobs/approval-definition`. */
export const model = {
  type: "@keeb/ashby/jobs/approval-definition",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby approval definition state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    approval_definition_action: {
      description: "Ashby approval definition action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    update_action: {
      description:
        "approvalDefinition.update: Create or update an approval definition for a specific entity that requires approval. The entity requiring approval must be within scope of an approval in Ashby that is marked as being managed by the API. Requires the `approvalsWrite` permission.",
      arguments: z.object({
        entityType: z.literal("offer").describe(
          "The type of approval entity being updated.",
        ),
        entityId: z.string().describe(
          "The id of the approval entity being updated, such as the id of the offer version.",
        ),
        approvalStepDefinitions: z.array(
          z.object({
            approvalsRequired: z.number().int(),
            approvers: z.array(
              z.object({ userId: z.string(), type: z.literal("user") }),
            ),
          }),
        ).describe(
          "An ordered list of approval steps that describes the number of required approvers at each step, as well as who is an approver at each step.",
        ),
        submitApprovalRequest: z.boolean().nullable().describe(
          "Control whether an approval request created through this API should be immediately submitted. If false, then the approval will need to be manually submitted in the Ashby app. Defaults to false.",
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
          operation: "approvalDefinition.update",
        });
        const result = await action("approvalDefinition.update", args, opts);
        const handle = await context.writeResource(
          "approval_definition_action",
          "update_action",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
