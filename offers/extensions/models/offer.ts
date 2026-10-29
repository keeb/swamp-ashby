// Auto-generated extension model for @keeb/ashby/offers/offer
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby offer.
 *
 * Wraps Ashby's `offer.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import {
  action,
  create,
  listAll,
  read,
  tryRead,
  update,
} from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  offerProcessId: z.string().describe(
    "The id of the offer process associated with the offer you're creating. This value is the id included in the response of the `offerProcess.start` API. Sent by create only; offer.update does not accept it.",
  ).optional(),
  offerFormId: z.string().describe(
    "The id of the form associated with the offer. This value is the id included in the response of the `offer.start` API. Sent by create only; offer.update does not accept it.",
  ).optional(),
  offerForm: z.object({
    fieldSubmissions: z.array(
      z.object({ path: z.string(), value: z.unknown() }),
    ),
  }).describe("The offer form submission").optional(),
  excludeFormDefinition: z.boolean().nullable().describe(
    "If true, omit the form definition from the response. Also sent by sync.",
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
  decidedAt: z.string().nullish(),
  applicationId: z.string().nullish(),
  acceptanceStatus: z.string().nullish(),
  offerStatus: z.string().nullish(),
  latestVersion: z.record(z.string(), z.unknown()).nullish(),
  formDefinition: z.record(z.string(), z.unknown()).nullish(),
  versions: z.array(z.unknown()).nullish(),
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
  offerProcessId: z.string().optional(),
  offerFormId: z.string().optional(),
  offerForm: z.object({
    fieldSubmissions: z.array(
      z.object({ path: z.string(), value: z.unknown() }),
    ),
  }).optional(),
  excludeFormDefinition: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby offer. Registered at `@keeb/ashby/offers/offer`. */
export const model = {
  type: "@keeb/ashby/offers/offer",
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
      description: "Ashby offer state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    offer_lookup: {
      description:
        "Ashby offer lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    offer_action: {
      description: "Ashby offer action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a offer from the model's global arguments (offer.create). Creates a new Offer Requires the `offersWrite` permission.",
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
          operation: "offer.create",
        });
        const instanceName = ("current").replace(/[\/\\]/g, "_").replace(
          /\.\./g,
          "_",
        ).replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["offerProcessId"] !== undefined) {
          body["offerProcessId"] = g["offerProcessId"];
        }
        if (g["offerFormId"] !== undefined) {
          body["offerFormId"] = g["offerFormId"];
        }
        if (g["offerForm"] !== undefined) body["offerForm"] = g["offerForm"];
        if (g["excludeFormDefinition"] !== undefined) {
          body["excludeFormDefinition"] = g["excludeFormDefinition"];
        }
        const result = await create("offer.create", body, opts);
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
        "Get a offer and record it as this model's state (offer.info). Returns details about a single offer by id. Requires the `offersRead` permission.",
      kind: "read",
      arguments: z.object({
        offerId: z.string().describe("The id of the offer to fetch"),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
        ).optional(),
        expand: z.object({
          individualSignedPacketDocuments: z.boolean().optional(),
        }).describe("Additional data to include in the response.").optional(),
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
          operation: "offer.info",
        });
        const result = await read("offer.info", args, opts);
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
        "List offer records and record each as a data artifact (offer.list; capped at 500 by default; writes a offer_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only offers updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "The API will return data after this date, expressed as milliseconds since the Unix epoch.",
        ).optional(),
        offerStatus: z.array(
          z.enum([
            "WaitingOnOfferCreation",
            "WaitingOnApprovalStart",
            "WaitingOnOfferApproval",
            "WaitingOnApprovalDefinition",
            "WaitingOnCandidateResponse",
            "CandidateRejected",
            "CandidateAccepted",
            "OfferCancelled",
          ]),
        ).nullable().describe(
          "When supplied, only offers with provided offer-status(es) will be returned. Array must contain at least one value.",
        ).optional(),
        acceptanceStatus: z.array(
          z.enum(["Accepted", "Declined", "Pending", "Created", "Cancelled"]),
        ).nullable().describe(
          "When supplied, only offers with provided acceptance-status(es) will be returned. Array must contain at least one value.",
        ).optional(),
        applicationId: z.string().nullable().describe(
          "If provided, only returns the offers for the application with the supplied id",
        ).optional(),
        approvalStatus: z.array(
          z.enum(["Approved", "WaitingOnApprovals", "Declined"]),
        ).nullable().describe(
          "When supplied, only offers whose latest version has one of the provided approval status(es) will be returned. Array must contain at least one value. This filter currently matches imported offers only; it does not yet match approvals made in Ashby.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the offer_lookup record reports truncated: true.",
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
          operation: "offer.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("offer.list", filters, {
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
          await context.writeResource("offer_lookup", "lookup", {
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
    update: {
      description:
        "Apply the model's global arguments to the stored offer (offer.update). Run create or get first.",
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
          operation: "offer.update",
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
        const body: Record<string, unknown> = { "offerId": existing.id };
        if (g["offerForm"] !== undefined) body["offerForm"] = g["offerForm"];
        if (g["excludeFormDefinition"] !== undefined) {
          body["excludeFormDefinition"] = g["excludeFormDefinition"];
        }
        const result = await update("offer.update", body, opts);
        const handle = await context.writeResource(
          "state",
          instanceName,
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    sync: {
      description:
        "Sync the stored offer from Ashby (offer.info); records status not_found when it is gone. Sends the model's excludeFormDefinition too.",
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
          operation: "offer.info",
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
        const body: Record<string, unknown> = { "offerId": existing.id };
        if (g["excludeFormDefinition"] !== undefined) {
          body["excludeFormDefinition"] = g["excludeFormDefinition"];
        }
        const result = await tryRead("offer.info", body, opts);
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
    approve: {
      description:
        "offer.approve: Approves an offer or a specific approval step within an offer's approval process. Requires the `offersWrite` permission.",
      arguments: z.object({
        offerVersionId: z.string().describe(
          "The id of the offer version that needs approval. This can be obtained as the `entityId` from the `approval.list` endpoint.",
        ),
        approvalStepId: z.string().nullable().describe(
          "The id of the specific approval step to approve. If provided, `userId` must also be provided. If omitted, the entire offer approval process will be approved. This can be obtained from the `approval.list` endpoint.",
        ).optional(),
        userId: z.string().nullable().describe(
          "The id of the user approving the step. Required if `approvalStepId` is provided. Must be an approver for the specified approval step.",
        ).optional(),
        comment: z.string().nullable().describe(
          "An optional comment to record with the approval. Only supported when `approvalStepId` and `userId` are provided.",
        ).optional(),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
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
          method: "approve",
          operation: "offer.approve",
        });
        const result = await action("offer.approve", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "approve",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    reject: {
      description:
        "offer.reject: Rejects the current step in an offer's approval process. Requires the `offersWrite` permission.",
      arguments: z.object({
        offerVersionId: z.string().describe(
          "The id of the offer version to reject. This can be obtained as the `entityId` from the `approval.list` endpoint.",
        ),
        approvalStepId: z.string().describe(
          "The id of the current approval step. This can be obtained from the `approval.list` endpoint.",
        ),
        userId: z.string().describe(
          "The id of a user who is an approver for the current approval step.",
        ),
        comment: z.string().nullable().describe(
          "An optional comment to record with the rejection.",
        ).optional(),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
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
          method: "reject",
          operation: "offer.reject",
        });
        const result = await action("offer.reject", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "reject",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_decided_at: {
      description:
        "offer.setDecidedAt: Updates an offer's decidedAt timestamp. Requires the `offersWrite` permission.",
      arguments: z.object({
        offerId: z.string().describe(
          "The id of the offer whose decided at timestamp should be updated.",
        ),
        decidedAt: z.string().describe(
          "The time the offer was accepted or declined.",
        ),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
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
          method: "set_decided_at",
          operation: "offer.setDecidedAt",
        });
        const result = await action("offer.setDecidedAt", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "set_decided_at",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_status: {
      description:
        "offer.setStatus: Updates an offer's acceptance status. Requires the `offersWrite` permission.",
      arguments: z.object({
        offerId: z.string().describe(
          "The id of the offer whose status should be updated.",
        ),
        acceptanceStatus: z.enum(["Accepted", "Declined", "Cancelled"])
          .describe(
            "The offer acceptance status. Ashby derives the offer status from this value.",
          ),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
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
          method: "set_status",
          operation: "offer.setStatus",
        });
        const result = await action("offer.setStatus", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "set_status",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    start: {
      description:
        "offer.start: The offer.start endpoint creates and returns an offer version instance that can be filled out and submitted using the `offer.create` endpoint. Requires the `offersWrite` permission.",
      arguments: z.object({
        offerProcessId: z.string().describe(
          "The ID of the offer process to start. This value is the id included in the response of the `offerProcess.start` API.",
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
          method: "start",
          operation: "offer.start",
        });
        const result = await action("offer.start", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "start",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    start_approval_process: {
      description:
        'offer.startApprovalProcess: Starts the approval process for an offer in a "WaitingOnApprovalStart" state. Once started, the approval is sent to the configured approvers. Requires the `offersWrite` permission.',
      arguments: z.object({
        offerVersionId: z.string().describe(
          "The id of the offer version whose approval process should be started",
        ),
        note: z.string().nullable().describe(
          "Optional note to attach to the approval request",
        ).optional(),
        excludeFormDefinition: z.boolean().nullable().describe(
          "If true, omit the form definition from the response.",
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
          method: "start_approval_process",
          operation: "offer.startApprovalProcess",
        });
        const result = await action("offer.startApprovalProcess", args, opts);
        const handle = await context.writeResource(
          "offer_action",
          "start_approval_process",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
