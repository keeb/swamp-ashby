// Auto-generated extension model for @keeb/ashby/organization/custom-field
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby custom field.
 *
 * Wraps Ashby's `customField.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, create, listAll, read, tryRead } from "./_lib/ashby.ts";

const GlobalArgsSchema = z.object({
  fieldType: z.enum([
    "Boolean",
    "CompensationRange",
    "Currency",
    "Date",
    "LongText",
    "MultiValueSelect",
    "Number",
    "NumberRange",
    "String",
    "ValueSelect",
    "Url",
    "UUID",
  ]).describe("The type of field being created. This value is case-sensitive.")
    .optional(),
  objectType: z.enum([
    "Application",
    "Candidate",
    "Job",
    "Job_Posting",
    "Employee",
    "Talent_Project",
    "Opening",
    "Offer",
    "Opening_Version",
    "Offer_Version",
  ]).describe("The type of object the field can be associated with.")
    .optional(),
  title: z.string().describe("The name of the field").optional(),
  description: z.string().nullable().describe("A description for the field")
    .optional(),
  selectableValues: z.array(z.object({ label: z.string(), value: z.string() }))
    .nullable().describe(
      "Required when the field type is ValueSelect or MultiValueSelect. An array of selectable values for the field.",
    ).optional(),
  isDateOnlyField: z.boolean().nullable().describe(
    "Only applies to fields with a fieldType of Date. Whether or not the field includes content other than a date.",
  ).optional(),
  isExposableToCandidate: z.boolean().nullable().describe(
    "Determines whether the field can be exposed to a candidate in certain contexts. In order for a custom field to be available in an email template this value must be true.",
  ).optional(),
  isPrivate: z.boolean().nullable().describe(
    "Whether the custom field should be private.",
  ).optional(),
  isEditableOnlyViaPublicApi: z.boolean().nullable().describe(
    "Whether the custom field's value can only be edited through the API. Supported for Job, Job Posting and Opening custom fields when enabled for the organization.",
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
  referenceIdentifier: z.string().nullish(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  objectType: z.string().nullish(),
  isArchived: z.boolean().nullish(),
  isPrivate: z.boolean().nullish(),
  isEditableOnlyViaPublicApi: z.boolean().nullish(),
  fieldType: z.string().nullish(),
  isRequired: z.boolean().nullish(),
  isDateOnlyField: z.boolean().nullish(),
  referencedObjectType: z.string().nullish(),
  selectableValues: z.array(z.unknown()).nullish(),
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
  fieldType: z.enum([
    "Boolean",
    "CompensationRange",
    "Currency",
    "Date",
    "LongText",
    "MultiValueSelect",
    "Number",
    "NumberRange",
    "String",
    "ValueSelect",
    "Url",
    "UUID",
  ]).optional(),
  objectType: z.enum([
    "Application",
    "Candidate",
    "Job",
    "Job_Posting",
    "Employee",
    "Talent_Project",
    "Opening",
    "Offer",
    "Opening_Version",
    "Offer_Version",
  ]).optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  selectableValues: z.array(z.object({ label: z.string(), value: z.string() }))
    .nullable().optional(),
  isDateOnlyField: z.boolean().nullable().optional(),
  isExposableToCandidate: z.boolean().nullable().optional(),
  isPrivate: z.boolean().nullable().optional(),
  isEditableOnlyViaPublicApi: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby custom field. Registered at `@keeb/ashby/organization/custom-field`. */
export const model = {
  type: "@keeb/ashby/organization/custom-field",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby custom field state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    custom_field_lookup: {
      description:
        "Ashby custom field lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    custom_field_action: {
      description: "Ashby custom field action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a custom field from the model's global arguments (customField.create). Create a new custom field. Requires the `hiringProcessMetadataWrite` permission.",
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
          operation: "customField.create",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["fieldType"] !== undefined) body["fieldType"] = g["fieldType"];
        if (g["objectType"] !== undefined) body["objectType"] = g["objectType"];
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["selectableValues"] !== undefined) {
          body["selectableValues"] = g["selectableValues"];
        }
        if (g["isDateOnlyField"] !== undefined) {
          body["isDateOnlyField"] = g["isDateOnlyField"];
        }
        if (g["isExposableToCandidate"] !== undefined) {
          body["isExposableToCandidate"] = g["isExposableToCandidate"];
        }
        if (g["isPrivate"] !== undefined) body["isPrivate"] = g["isPrivate"];
        if (g["isEditableOnlyViaPublicApi"] !== undefined) {
          body["isEditableOnlyViaPublicApi"] = g["isEditableOnlyViaPublicApi"];
        }
        const result = await create("customField.create", body, opts);
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
        "Get a custom field and record it as this model's state (customField.info). Get information about a custom field. Requires the `hiringProcessMetadataRead` permission.",
      kind: "read",
      arguments: z.object({
        customFieldId: z.string().describe(
          "The id of the custom field to fetch",
        ).optional(),
        referenceIdentifier: z.string().describe(
          "Beta. This field is in beta and may not be available for all organizations. The reference ID assigned to the custom field, for example cost_center. Use the value exactly as saved.",
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
          operation: "customField.info",
        });
        const result = await read("customField.info", args, opts);
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
        "List custom field records and record each as a data artifact (customField.list; capped at 500 by default; writes a custom_field_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only custom fields updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        includeArchived: z.boolean().nullable().describe(
          "If true, archived custom fields will be included in the response",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the custom_field_lookup record reports truncated: true.",
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
          operation: "customField.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("customField.list", filters, {
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
          await context.writeResource("custom_field_lookup", "lookup", {
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
        "Sync the stored custom field from Ashby (customField.info); records status not_found when it is gone.",
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
          operation: "customField.info",
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
        const result = await tryRead("customField.info", {
          "customFieldId": existing.id,
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
    set_reference_identifier: {
      description:
        "customField.setReferenceIdentifier (Beta): Assign, change, or remove a custom field's reference ID. Read the current ID with `customField.info` and pass it as `expectedReferenceIdentifier` (`null` if unset). Pass `referenceIdentifier: null` to remove the ID. A removed ID can be reused. If another field holds the ID, `errorInfo.meta.conflictingCustomFieldId` identifies it when this API key can access that field.",
      arguments: z.object({
        customFieldId: z.string().describe(
          "The UUID of the custom field definition to update.",
        ),
        referenceIdentifier: z.string().nullable().describe(
          "Beta. This field is in beta and may not be available for all organizations. The new reference ID. Pass null to clear the current reference ID.",
        ),
        expectedReferenceIdentifier: z.string().nullable().describe(
          "The exact current reference ID returned by customField.info or customField.list. Pass null for initial assignment. A mismatch rejects the update to prevent overwriting a concurrent change.",
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
          method: "set_reference_identifier",
          operation: "customField.setReferenceIdentifier",
        });
        const result = await action(
          "customField.setReferenceIdentifier",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "custom_field_action",
          "set_reference_identifier",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_value: {
      description:
        "customField.setValue: Set the value of a custom field for a given object. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        objectId: z.string().describe(
          "The id of the object the field value is being set on.",
        ),
        objectType: z.enum(["Application", "Candidate", "Job", "Opening"])
          .describe("The type of object the field is associated with."),
        fieldId: z.string().describe(
          "The unique id of the Custom Field definition for the field",
        ).optional(),
        referenceIdentifier: z.string().describe(
          "Beta. This field is in beta and may not be available for all organizations. The reference ID assigned to the custom field, for example cost_center. Use the value exactly as saved.",
        ).optional(),
        fieldValue: z.union([
          z.boolean(),
          z.number(),
          z.string(),
          z.array(z.string()),
          z.object({ value: z.number(), currencyCode: z.string() }),
          z.object({
            type: z.string(),
            minValue: z.number(),
            maxValue: z.number(),
          }),
          z.object({
            type: z.string(),
            minValue: z.number(),
            maxValue: z.number(),
            currencyCode: z.string(),
            interval: z.string(),
          }),
          z.object({
            country: z.string().optional(),
            region: z.string().optional(),
            city: z.string().optional(),
          }),
        ]).nullable().describe(
          'The value to store in the field. Pass `null` to clear the current value. The accepted non-null type depends on the custom field\'s `fieldType` (boolean, string, number, ISO date, object, array, etc.). See the description above for the full per-type table. - Location field: An object with the following properties: `{ country: "USA", city: "San Francisco", region: "California" }`.',
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
          method: "set_value",
          operation: "customField.setValue",
        });
        const result = await action("customField.setValue", args, opts);
        const handle = await context.writeResource(
          "custom_field_action",
          "set_value",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_values: {
      description:
        "customField.setValues: Set the values of multiple custom fields for a given object in a single call. This is the recommended approach when updating multiple fields on the same object to avoid race conditions that can occur with concurrent `customField.setValue` calls. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        objectId: z.string().describe(
          "The id of the object the field values are being set on.",
        ),
        objectType: z.enum(["Application", "Candidate", "Job", "Opening"])
          .describe("The type of object the fields are associated with."),
        values: z.array(z.object({
          fieldId: z.string().optional(),
          referenceIdentifier: z.string().optional(),
          fieldValue: z.union([
            z.boolean(),
            z.number(),
            z.string(),
            z.array(z.string()),
            z.object({ value: z.number(), currencyCode: z.string() }),
            z.object({
              type: z.string(),
              minValue: z.number(),
              maxValue: z.number(),
            }),
            z.object({
              type: z.string(),
              minValue: z.number(),
              maxValue: z.number(),
              currencyCode: z.string(),
              interval: z.string(),
            }),
            z.object({
              country: z.string().optional(),
              region: z.string().optional(),
              city: z.string().optional(),
            }),
          ]).nullable(),
        })).describe("Array of custom field updates to apply"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "set_values",
          operation: "customField.setValues",
        });
        const result = await action("customField.setValues", args, opts);
        const handle = await context.writeResource(
          "custom_field_action",
          "set_values",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_selectable_values: {
      description:
        "customField.updateSelectableValues: Update the selectable values for a custom field. Requires the `hiringProcessMetadataWrite` permission.",
      arguments: z.object({
        customFieldId: z.string().describe(
          "The id of the custom field to update",
        ).optional(),
        referenceIdentifier: z.string().describe(
          "Beta. This field is in beta and may not be available for all organizations. The reference ID assigned to the custom field, for example cost_center. Use the value exactly as saved.",
        ).optional(),
        selectableValues: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            isArchived: z.boolean().nullable().optional(),
          }),
        ).describe(
          "An array of selectable values to merge with the existing values. Only `label`, `value`, and optionally `isArchived` should be provided.",
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
          method: "update_selectable_values",
          operation: "customField.updateSelectableValues",
        });
        const result = await action(
          "customField.updateSelectableValues",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "custom_field_action",
          "update_selectable_values",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
