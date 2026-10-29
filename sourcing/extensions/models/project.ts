// Auto-generated extension model for @keeb/ashby/sourcing/project
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby project.
 *
 * Wraps Ashby's `project.*` endpoints as a swamp model so they can be
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
  title: z.string().describe("The project's title.").optional(),
  description: z.object({
    type: z.enum(["text/plain", "text/html"]),
    value: z.string(),
  }).nullable().describe(
    "The project's description. Omission, null, or empty content leaves it unset.",
  ).optional(),
  customFields: z.array(
    z.object({
      fieldId: z.string().optional(),
      referenceIdentifier: z.string().optional(),
      fieldValue: z.union([
        z.string(),
        z.boolean(),
        z.number(),
        z.array(z.string()),
      ]).nullable(),
    }),
  ).describe(
    "Initial values. Supply every required field. Supports String, LongText, Boolean, Number, Date, ValueSelect, MultiValueSelect, Url and User fields. Requires Project custom fields availability. Discover definitions using customField.list with hiringProcessMetadata:read; User discovery retains organization:read.",
  ).optional(),
  confidential: z.boolean().describe(
    "Whether the project is confidential. Defaults to false. Requires confidential project availability.",
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
  createdAt: z.string().nullish(),
  title: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  authorId: z.string().nullish(),
  descriptionPlain: z.string().nullish(),
  descriptionHtml: z.string().nullish(),
  confidential: z.boolean().nullish(),
  customFieldEntries: z.array(z.unknown()).nullish(),
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
  title: z.string().optional(),
  description: z.object({
    type: z.enum(["text/plain", "text/html"]),
    value: z.string(),
  }).nullable().optional(),
  customFields: z.array(
    z.object({
      fieldId: z.string().optional(),
      referenceIdentifier: z.string().optional(),
      fieldValue: z.union([
        z.string(),
        z.boolean(),
        z.number(),
        z.array(z.string()),
      ]).nullable(),
    }),
  ).optional(),
  confidential: z.boolean().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby project. Registered at `@keeb/ashby/sourcing/project`. */
export const model = {
  type: "@keeb/ashby/sourcing/project",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby project state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    project_lookup: {
      description:
        "Ashby project lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    project_action: {
      description: "Ashby project action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a project from the model's global arguments (project.create). Creates a project. The effective actor becomes the author, including authorized on-behalf-of requests. Confidential projects are available on Plus, Legacy Plus, and Enterprise plans. Authors retain access to projects they create. Supply initial customFields for every active required Project custom field definition.",
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
          operation: "project.create",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["customFields"] !== undefined) {
          body["customFields"] = g["customFields"];
        }
        if (g["confidential"] !== undefined) {
          body["confidential"] = g["confidential"];
        }
        const result = await create("project.create", body, opts);
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
        "Get a project and record it as this model's state (project.info). Retrieves a project by its UUID. Requires one of the `projectsRead` or `candidatesRead` permissions.",
      kind: "read",
      arguments: z.object({
        projectId: z.string().describe("The id of the project"),
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
          operation: "project.info",
        });
        const result = await read("project.info", args, opts);
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
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
        "List project records and record each as a data artifact (project.list; capped at 500 by default; writes a project_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        createdAfter: z.number().int().nullable().describe(
          "The API will return data after this date, which is the time since the unix epoch in milliseconds",
        ).optional(),
        syncToken: z.string().nullable().describe(
          "An opaque token representing the last time the data was successfully synced from the API. A new, updated one is returned after successfully fetching the last page of data.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the project_lookup record reports truncated: true.",
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
          operation: "project.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("project.list", filters, {
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
          await context.writeResource("project_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored project (project.update). Run create or get first.",
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
          operation: "project.update",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const body: Record<string, unknown> = { "projectId": existing.id };
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        const result = await update("project.update", body, opts);
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
        "Sync the stored project from Ashby (project.info); records status not_found when it is gone.",
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
          operation: "project.info",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const content = await context.dataRepository.getContent(
          context.modelType,
          context.modelId,
          instanceName,
        );
        if (!content) {
          throw new Error("No data found - run create or get first");
        }
        const existing = JSON.parse(new TextDecoder().decode(content));
        const result = await tryRead("project.info", {
          "projectId": existing.id,
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
    archive: {
      description:
        "project.archive: Archives a project. The effective actor must have permission to edit the project, including authorized on-behalf-of requests. Calling this endpoint on an already archived project succeeds. Candidate memberships, history, authorship, confidentiality, descriptions, and custom-field values are preserved. This endpoint does not permanently delete projects or candidates. Requires the `projectsWrite` permission.",
      arguments: z.object({
        projectId: z.string().describe("The project's unique identifier."),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "archive",
          operation: "project.archive",
        });
        const result = await action("project.archive", args, opts);
        const handle = await context.writeResource(
          "project_action",
          "archive",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    restore: {
      description:
        "project.restore: Restores a project. The effective actor must have permission to edit the project, including authorized on-behalf-of requests. Calling this endpoint on an already active project succeeds. Candidate memberships, history, authorship, confidentiality, descriptions, and custom-field values are preserved. This endpoint does not permanently delete projects or candidates. Requires the `projectsWrite` permission.",
      arguments: z.object({
        projectId: z.string().describe("The project's unique identifier."),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "restore",
          operation: "project.restore",
        });
        const result = await action("project.restore", args, opts);
        const handle = await context.writeResource(
          "project_action",
          "restore",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    search: {
      description:
        "project.search: Search for projects by title. Requires one of the `projectsRead` or `candidatesRead` permissions.",
      kind: "list",
      arguments: z.object({
        title: z.string().describe("The project's title"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "search",
          operation: "project.search",
        });
        const result = await action("project.search", args, opts);
        const handle = await context.writeResource(
          "project_action",
          "search",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_custom_field_value: {
      description:
        "project.setCustomFieldValue: Updates one custom field on a project, including archived projects. Returns the affected entry, including value: null when already empty. The effective actor must have permission to edit the project. Requires Project custom fields availability; private and API-only field permissions apply. Delegated humans may preserve API-only values but cannot change or clear them.",
      arguments: z.object({
        fieldId: z.string().describe("An active Project custom field ID.")
          .optional(),
        referenceIdentifier: z.string().describe(
          "Beta. This field is in beta and may not be available for all organizations. The reference ID assigned to the object. Use the value exactly as saved.",
        ).optional(),
        fieldValue: z.union([
          z.string(),
          z.boolean(),
          z.number(),
          z.array(z.string()),
        ]).nullable().describe(
          "Canonical field value. Null clears an optional field, including when already empty.",
        ),
        projectId: z.string().describe("The project to edit."),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "set_custom_field_value",
          operation: "project.setCustomFieldValue",
        });
        const result = await action("project.setCustomFieldValue", args, opts);
        const handle = await context.writeResource(
          "project_action",
          "set_custom_field_value",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_custom_field_values: {
      description:
        "project.setCustomFieldValues: Updates a nonempty batch of distinct custom fields on a project, including archived projects. Returns affected entries in request order, including value: null for cleared fields. Duplicate field IDs are rejected. The effective actor must have permission to edit the project. Requires Project custom fields availability; private and API-only field permissions apply.",
      arguments: z.object({
        projectId: z.string().describe("The project to edit."),
        values: z.array(
          z.object({
            fieldId: z.string().optional(),
            referenceIdentifier: z.string().optional(),
            fieldValue: z.union([
              z.string(),
              z.boolean(),
              z.number(),
              z.array(z.string()),
            ]).nullable(),
          }),
        ).describe(
          "Values to replace, in response order. Omitted fields remain unchanged. Use null to clear an optional field.",
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
          method: "set_custom_field_values",
          operation: "project.setCustomFieldValues",
        });
        const result = await action("project.setCustomFieldValues", args, opts);
        const handle = await context.writeResource(
          "project_action",
          "set_custom_field_values",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
