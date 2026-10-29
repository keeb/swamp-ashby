// Auto-generated extension model for @keeb/ashby/organization/webhook
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby webhook.
 *
 * Wraps Ashby's `webhook.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { create, read, remove, tryRead, update } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  webhookType: z.enum([
    "applicationSubmit",
    "applicationUpdate",
    "candidateHire",
    "candidateStageChange",
    "candidateDelete",
    "candidateMerge",
    "candidateRecentEmailMessagesUpdated",
    "interviewPlanTransition",
    "interviewScheduleCreate",
    "interviewScheduleUpdate",
    "jobCreate",
    "jobUpdate",
    "jobPostingUpdate",
    "jobPostingDelete",
    "jobPostingPublish",
    "jobPostingUnpublish",
    "openingCreate",
    "openingDelete",
    "openingUpdate",
    "offerCreate",
    "offerUpdate",
    "offerDelete",
    "pushToHRIS",
    "surveySubmit",
    "takeHomeAssignmentAssigned",
    "takeHomeAssignmentCancelled",
    "takeHomeAssignmentCompleted",
    "takeHomeAssignmentSubmitted",
    "signatureRequestUpdate",
  ]).describe(
    "The type of webhook to create. Sent by create only; webhook.update does not accept it.",
  ).optional(),
  requestUrl: z.string().describe("The URL the webhook will send requests to")
    .optional(),
  secretToken: z.string().meta({ sensitive: true }).describe(
    "The secret token used to sign the webhook request. See our documentation here for more information.",
  ).optional(),
  enabled: z.boolean().describe(
    "Whether or not the webhook setting is enabled. Sent by update only; webhook.create does not accept it.",
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
  enabled: z.boolean().nullish(),
  requestUrl: z.string().nullish(),
  webhookType: z.unknown().nullish(),
}).passthrough();

const InputsSchema = z.object({
  webhookType: z.enum([
    "applicationSubmit",
    "applicationUpdate",
    "candidateHire",
    "candidateStageChange",
    "candidateDelete",
    "candidateMerge",
    "candidateRecentEmailMessagesUpdated",
    "interviewPlanTransition",
    "interviewScheduleCreate",
    "interviewScheduleUpdate",
    "jobCreate",
    "jobUpdate",
    "jobPostingUpdate",
    "jobPostingDelete",
    "jobPostingPublish",
    "jobPostingUnpublish",
    "openingCreate",
    "openingDelete",
    "openingUpdate",
    "offerCreate",
    "offerUpdate",
    "offerDelete",
    "pushToHRIS",
    "surveySubmit",
    "takeHomeAssignmentAssigned",
    "takeHomeAssignmentCancelled",
    "takeHomeAssignmentCompleted",
    "takeHomeAssignmentSubmitted",
    "signatureRequestUpdate",
  ]).optional(),
  requestUrl: z.string().optional(),
  secretToken: z.string().meta({ sensitive: true }).optional(),
  enabled: z.boolean().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby webhook. Registered at `@keeb/ashby/organization/webhook`. */
export const model = {
  type: "@keeb/ashby/organization/webhook",
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
      description: "Ashby webhook state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
      sensitiveOutput: true,
    },
  },
  methods: {
    create: {
      description:
        "Create a webhook from the model's global arguments (webhook.create). Creates a webhook setting. Requires the `apiKeysWrite` permission.",
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
          operation: "webhook.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["webhookType"] !== undefined) {
          body["webhookType"] = g["webhookType"];
        }
        if (g["requestUrl"] !== undefined) body["requestUrl"] = g["requestUrl"];
        if (g["secretToken"] !== undefined) {
          body["secretToken"] = g["secretToken"];
        }
        const result = await create("webhook.create", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    get: {
      description:
        "Get a webhook and record it as this model's state (webhook.info). Retrieves information about a specific webhook setting by its ID. Requires the `apiKeysRead` permission.",
      kind: "read",
      arguments: z.object({
        webhookId: z.string().describe(
          "The id of the webhook setting to retrieve",
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
          operation: "webhook.info",
        });
        const result = await read("webhook.info", args, opts);
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
    update: {
      description:
        "Apply the model's global arguments to the stored webhook (webhook.update). Run create or get first.",
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
          operation: "webhook.update",
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
        const body: Record<string, unknown> = { "webhookId": existing.id };
        if (g["enabled"] !== undefined) body["enabled"] = g["enabled"];
        if (g["requestUrl"] !== undefined) body["requestUrl"] = g["requestUrl"];
        if (g["secretToken"] !== undefined) {
          body["secretToken"] = g["secretToken"];
        }
        const result = await update("webhook.update", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    delete: {
      description:
        "Delete the webhook (webhook.delete). An already-absent webhook is recorded as not_found rather than failing.",
      arguments: z.object({
        id: z.string().describe("The id of the webhook"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "delete",
          operation: "webhook.delete",
        });
        const { existed } = await remove("webhook.delete", {
          "webhookId": args.id,
        }, opts);
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const handle = await context.writeResource("state", instanceName, {
          id: args.id,
          existed,
          status: existed ? "deleted" : "not_found",
          deletedAt: new Date().toISOString(),
        });
        return { dataHandles: [handle] };
      },
    },
    sync: {
      description:
        "Sync the stored webhook from Ashby (webhook.info); records status not_found when it is gone.",
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
          operation: "webhook.info",
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
        const result = await tryRead("webhook.info", {
          "webhookId": existing.id,
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
