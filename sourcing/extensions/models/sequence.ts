// Auto-generated extension model for @keeb/ashby/sourcing/sequence
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby sequence.
 *
 * Wraps Ashby's `sequence.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, listAll, read, tryRead } from "./_lib/ashby.ts";

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
  candidateId: z.string().nullish(),
  applicationId: z.string().nullish(),
  sequenceTemplateId: z.string().nullish(),
  status: z.string().nullish(),
  createdAt: z.string().nullish(),
  stages: z.array(z.unknown()).nullish(),
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
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby sequence. Registered at `@keeb/ashby/sourcing/sequence`. */
export const model = {
  type: "@keeb/ashby/sourcing/sequence",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby sequence state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    sequence_lookup: {
      description:
        "Ashby sequence lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    sequence_action: {
      description: "Ashby sequence action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    get: {
      description:
        "Get a sequence and record it as this model's state (sequence.info). Retrieves a candidate's sourcing sequence enrollment when it is visible to the acting user. Requires the `sourcingRead` permission.",
      kind: "read",
      arguments: z.object({
        sequenceId: z.string().describe(
          "The unique identifier for the sequence enrollment",
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
          operation: "sequence.info",
        });
        const result = await read("sequence.info", args, opts);
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
        "List sequence records and record each as a data artifact (sequence.list; capped at 500 by default; writes a sequence_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "Only return sequence enrollments for this candidate",
        ).optional(),
        syncToken: z.string().describe(
          "A sync token to retrieve only sequence enrollments updated since the last sync",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the sequence_lookup record reports truncated: true.",
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
          operation: "sequence.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("sequence.list", filters, {
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
          await context.writeResource("sequence_lookup", "lookup", {
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
    sync: {
      description:
        "Sync the stored sequence from Ashby (sequence.info); records status not_found when it is gone.",
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
          operation: "sequence.info",
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
        const result = await tryRead("sequence.info", {
          "sequenceId": existing.id,
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
    add: {
      description:
        "sequence.add: Enrolls a candidate in a reusable sourcing sequence. Set start to false to create an editable draft, or true to validate and start the sequence immediately. Requires the `sourcingWrite` permission.",
      arguments: z.object({
        sequenceTemplateId: z.string().describe(
          "The reusable sourcing sequence template to use",
        ),
        candidateId: z.string().describe(
          "The candidate to enroll in the sequence",
        ),
        applicationId: z.string().describe(
          "The candidate's application to use for token resolution",
        ).optional(),
        from: z.object({ email: z.string() }).describe(
          "The sending address to use for every email stage",
        ).optional(),
        start: z.boolean().describe(
          "Whether to validate and start the sequence immediately after creating it",
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
          method: "add",
          operation: "sequence.add",
        });
        const result = await action("sequence.add", args, opts);
        const handle = await context.writeResource(
          "sequence_action",
          "add",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    cancel: {
      description:
        "sequence.cancel: Cancels a running sourcing sequence (campaign) for a candidate. Requires one of the `candidatesWrite` or `sourcingWrite` permissions.",
      arguments: z.object({
        sequenceId: z.string().describe("The id of the sequence to cancel"),
        reason: z.enum(["booked_meeting"]).describe(
          "The reason for cancelling the sequence. Defaults to `booked_meeting`.",
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
          method: "cancel",
          operation: "sequence.cancel",
        });
        const result = await action("sequence.cancel", args, opts);
        const handle = await context.writeResource(
          "sequence_action",
          "cancel",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    discard: {
      description:
        "sequence.discard: Permanently discards a NotStarted sourcing sequence draft owned by the acting user. Drafts created with x-on-behalf-of must be discarded using the same user. Requires the `sourcingWrite` permission.",
      arguments: z.object({
        sequenceId: z.string().describe(
          "The unique identifier for the draft sequence enrollment",
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
          method: "discard",
          operation: "sequence.discard",
        });
        const result = await action("sequence.discard", args, opts);
        const handle = await context.writeResource(
          "sequence_action",
          "discard",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    start: {
      description:
        "sequence.start: Validates and starts an existing NotStarted sourcing sequence draft owned by the acting user. Drafts created with x-on-behalf-of must be started with the same acting user. Requires the `sourcingWrite` permission.",
      arguments: z.object({
        sequenceId: z.string().describe(
          "The unique identifier for the draft sequence enrollment",
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
          operation: "sequence.start",
        });
        const result = await action("sequence.start", args, opts);
        const handle = await context.writeResource(
          "sequence_action",
          "start",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_stage: {
      description:
        "sequence.updateStage: Replaces the supplied subject or HTML body of one email stage in a not-started sourcing sequence. At least one of subject or body is required. The reusable sequence template is not changed. Requires the `sourcingWrite` permission.",
      arguments: z.object({
        sequenceId: z.string().describe(
          "The unique identifier for the sequence enrollment",
        ),
        stageId: z.string().describe(
          "The unique identifier for the email stage to update",
        ),
        subject: z.string().describe(
          "A plain-text subject that replaces the stage's current subject",
        ).optional(),
        body: z.object({ type: z.literal("text/html"), value: z.string() })
          .describe("The rich-text body that replaces the stage's current body")
          .optional(),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "update_stage",
          operation: "sequence.updateStage",
        });
        const result = await action("sequence.updateStage", args, opts);
        const handle = await context.writeResource(
          "sequence_action",
          "update_stage",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
