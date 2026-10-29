// Auto-generated extension model for @keeb/ashby/jobs/job-posting
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby job posting.
 *
 * Wraps Ashby's `jobPosting.*` endpoints as a swamp model so they can be
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
  jobId: z.string().describe(
    "The id of the job to create a posting for. Sent by create only; jobPosting.update does not accept it.",
  ).optional(),
  title: z.string().describe(
    "The title for the new job posting. If omitted, defaults to the parent job's title.",
  ).optional(),
  description: z.object({
    type: z.literal("text/html"),
    value: z.string().nullable(),
  }).describe("An HTML block of the job posting description").optional(),
  workplaceType: z.enum(["OnSite", "Hybrid", "Remote"]).describe(
    "The type of workplace",
  ).optional(),
  status: z.enum(["Draft", "Published"]).describe(
    "The initial status of the job posting. Defaults to `Draft` if omitted. A description is required when creating a `Published` posting. Sent by create only; jobPosting.update does not accept it.",
  ).optional(),
  isListed: z.boolean().describe(
    "Whether the posting should be listed on the job board. Defaults to `true` and is forced to `false` when the parent job is confidential. Sent by create only; jobPosting.update does not accept it.",
  ).optional(),
  locationId: z.string().describe(
    "The id of the primary location for the job posting. If omitted, the posting inherits the parent job's location.",
  ).optional(),
  secondaryLocationIds: z.array(z.string()).describe(
    "The secondary locations for the job posting.",
  ).optional(),
  applicationFormDefinitionId: z.string().describe(
    "The id of the application form definition to use for the posting. If omitted, the organization default form is used.",
  ).optional(),
  suppressDescriptionOpening: z.boolean().nullable().describe(
    "When true, the job description opening from the brand will be suppressed. descriptionOpening will be returned as null. Sent by update only; jobPosting.create does not accept it.",
  ).optional(),
  suppressDescriptionClosing: z.boolean().nullable().describe(
    "When true, the job description closing from the brand will be suppressed. descriptionClosing will be returned as null. Sent by update only; jobPosting.create does not accept it.",
  ).optional(),
  applicationConfirmationEmailTemplateId: z.string().nullable().describe(
    "The id of the email template to use for application confirmation emails on this posting. Pass `null` to clear the posting-level override and fall back to organization defaults. Sent by update only; jobPosting.create does not accept it.",
  ).optional(),
  jobBoardAssociations: z.array(
    z.object({ jobBoardId: z.string(), isListed: z.boolean() }),
  ).describe(
    "A full replacement of the Ashby-hosted job boards associated with this posting. Pass an empty array to remove the posting from every Ashby-hosted job board. Omit to leave associations unchanged. Sent by update only; jobPosting.create does not accept it.",
  ).optional(),
  includeUnpublishedJobPostings: z.boolean().nullable().describe(
    "When true, allows updating unpublished (draft) job postings. Required when updating a draft posting. Sent by update only; jobPosting.create does not accept it. Also sent by sync.",
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
  title: z.string().nullish(),
  status: z.string().nullish(),
  descriptionPlain: z.string().nullish(),
  descriptionHtml: z.string().nullish(),
  descriptionSocial: z.string().nullish(),
  descriptionParts: z.record(z.string(), z.unknown()).nullish(),
  departmentName: z.string().nullish(),
  teamName: z.string().nullish(),
  teamNameHierarchy: z.array(z.unknown()).nullish(),
  jobId: z.string().nullish(),
  locationName: z.string().nullish(),
  locationAddress: z.string().nullish(),
  locationIds: z.record(z.string(), z.unknown()).nullish(),
  linkedData: z.record(z.string(), z.unknown()).nullish(),
  publishedDate: z.string().nullish(),
  applicationDeadline: z.string().nullish(),
  address: z.record(z.string(), z.unknown()).nullish(),
  isRemote: z.boolean().nullish(),
  workplaceType: z.string().nullish(),
  employmentType: z.string().nullish(),
  applicationFormDefinition: z.record(z.string(), z.unknown()).nullish(),
  applicationFormDefinitionId: z.string().nullish(),
  surveyFormDefinitions: z.array(z.unknown()).nullish(),
  isListed: z.boolean().nullish(),
  jobBoardAssociations: z.array(z.unknown()).nullish(),
  suppressDescriptionOpening: z.boolean().nullish(),
  suppressDescriptionClosing: z.boolean().nullish(),
  externalLink: z.string().nullish(),
  applyLink: z.string().nullish(),
  compensation: z.record(z.string(), z.unknown()).nullish(),
  updatedAt: z.string().nullish(),
  applicationLimitCalloutHtml: z.string().nullish(),
  applicationConfirmationEmailTemplateId: z.string().nullish(),
  customFields: z.array(z.unknown()).nullish(),
  job: z.record(z.string(), z.unknown()).nullish(),
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
  jobId: z.string().optional(),
  title: z.string().optional(),
  description: z.object({
    type: z.literal("text/html"),
    value: z.string().nullable(),
  }).optional(),
  workplaceType: z.enum(["OnSite", "Hybrid", "Remote"]).optional(),
  status: z.enum(["Draft", "Published"]).optional(),
  isListed: z.boolean().optional(),
  locationId: z.string().optional(),
  secondaryLocationIds: z.array(z.string()).optional(),
  applicationFormDefinitionId: z.string().optional(),
  suppressDescriptionOpening: z.boolean().nullable().optional(),
  suppressDescriptionClosing: z.boolean().nullable().optional(),
  applicationConfirmationEmailTemplateId: z.string().nullable().optional(),
  jobBoardAssociations: z.array(
    z.object({ jobBoardId: z.string(), isListed: z.boolean() }),
  ).optional(),
  includeUnpublishedJobPostings: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby job posting. Registered at `@keeb/ashby/jobs/job-posting`. */
export const model = {
  type: "@keeb/ashby/jobs/job-posting",
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
      description: "Ashby job posting state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    job_posting_lookup: {
      description:
        "Ashby job posting lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    job_posting_action: {
      description: "Ashby job posting action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a job posting from the model's global arguments (jobPosting.create). Creates a new job posting for the specified job. Requires the `jobsWrite` permission.",
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
          operation: "jobPosting.create",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["jobId"] !== undefined) body["jobId"] = g["jobId"];
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["workplaceType"] !== undefined) {
          body["workplaceType"] = g["workplaceType"];
        }
        if (g["status"] !== undefined) body["status"] = g["status"];
        if (g["isListed"] !== undefined) body["isListed"] = g["isListed"];
        if (g["locationId"] !== undefined) body["locationId"] = g["locationId"];
        if (g["secondaryLocationIds"] !== undefined) {
          body["secondaryLocationIds"] = g["secondaryLocationIds"];
        }
        if (g["applicationFormDefinitionId"] !== undefined) {
          body["applicationFormDefinitionId"] =
            g["applicationFormDefinitionId"];
        }
        const result = await create("jobPosting.create", body, opts);
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
        "Get a job posting and record it as this model's state (jobPosting.info). Retrieve an individual job posting. Requires the `jobsRead` permission.",
      kind: "read",
      arguments: z.object({
        jobPostingId: z.string().describe(
          "The id of the job posting to return",
        ),
        jobBoardId: z.string().nullable().describe(
          "If provided, returns the job posting data for the specified job board. If omitted, defaults to an external job board.",
        ).optional(),
        includeUnpublishedJobPostings: z.boolean().nullable().describe(
          "If true, allows retrieving unpublished (draft) job postings. Required when fetching a draft job posting.",
        ).optional(),
        expand: z.array(z.enum(["job"])).nullable().describe(
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
          operation: "jobPosting.info",
        });
        const result = await read("jobPosting.info", args, opts);
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
        "List job posting records and record each as a data artifact (jobPosting.list; capped at 500 by default; writes a job_posting_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        location: z.string().nullable().describe(
          "Filter by location name (case sensitive)",
        ).optional(),
        department: z.string().nullable().describe(
          "Filter by department name (case sensitive)",
        ).optional(),
        listedOnly: z.boolean().nullable().describe(
          "If true, filter out unlisted job postings.",
        ).optional(),
        includeUnpublishedJobPostings: z.boolean().nullable().describe(
          "If true, include unpublished (draft) job postings in addition to published job postings.",
        ).optional(),
        jobBoardId: z.string().nullable().describe(
          "If provided, only returns the job postings on the specified job board. If omitted, this API will return the job postings on the primary external job board.",
        ).optional(),
        expand: z.array(z.enum(["customFields"])).nullable().describe(
          "Choose to expand the result and include additional data. Supported values: `customFields`.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the job_posting_lookup record reports truncated: true.",
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
          operation: "jobPosting.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("jobPosting.list", filters, {
          ...opts,
          maxItems,
          paginated: false,
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
          await context.writeResource("job_posting_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored job posting (jobPosting.update). Run create or get first.",
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
          operation: "jobPosting.update",
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
        const body: Record<string, unknown> = { "jobPostingId": existing.id };
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["workplaceType"] !== undefined) {
          body["workplaceType"] = g["workplaceType"];
        }
        if (g["suppressDescriptionOpening"] !== undefined) {
          body["suppressDescriptionOpening"] = g["suppressDescriptionOpening"];
        }
        if (g["suppressDescriptionClosing"] !== undefined) {
          body["suppressDescriptionClosing"] = g["suppressDescriptionClosing"];
        }
        if (g["description"] !== undefined) {
          body["description"] = g["description"];
        }
        if (g["applicationConfirmationEmailTemplateId"] !== undefined) {
          body["applicationConfirmationEmailTemplateId"] =
            g["applicationConfirmationEmailTemplateId"];
        }
        if (g["locationId"] !== undefined) body["locationId"] = g["locationId"];
        if (g["secondaryLocationIds"] !== undefined) {
          body["secondaryLocationIds"] = g["secondaryLocationIds"];
        }
        if (g["applicationFormDefinitionId"] !== undefined) {
          body["applicationFormDefinitionId"] =
            g["applicationFormDefinitionId"];
        }
        if (g["jobBoardAssociations"] !== undefined) {
          body["jobBoardAssociations"] = g["jobBoardAssociations"];
        }
        if (g["includeUnpublishedJobPostings"] !== undefined) {
          body["includeUnpublishedJobPostings"] =
            g["includeUnpublishedJobPostings"];
        }
        const result = await update("jobPosting.update", body, opts);
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
        "Sync the stored job posting from Ashby (jobPosting.info); records status not_found when it is gone. Sends the model's includeUnpublishedJobPostings too.",
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
          operation: "jobPosting.info",
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
        const body: Record<string, unknown> = { "jobPostingId": existing.id };
        if (g["includeUnpublishedJobPostings"] !== undefined) {
          body["includeUnpublishedJobPostings"] =
            g["includeUnpublishedJobPostings"];
        }
        const result = await tryRead("jobPosting.info", body, opts);
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
    set_custom_field_value: {
      description:
        "jobPosting.setCustomFieldValue (Beta): Updates one custom field on a job posting. Returns the affected entry, including `value: null` when the field is empty. Requires the `jobsWrite` permission.",
      arguments: z.object({
        fieldId: z.string().describe("An active Job Posting custom field ID.")
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
          "Canonical field value: text, boolean, finite number, configured option values, or ISO date or timestamp. Null clears an optional field, including when already empty.",
        ),
        jobPostingId: z.string().describe("The job posting to edit."),
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
          operation: "jobPosting.setCustomFieldValue",
        });
        const result = await action(
          "jobPosting.setCustomFieldValue",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "job_posting_action",
          "set_custom_field_value",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_custom_field_values: {
      description:
        "jobPosting.setCustomFieldValues (Beta): Updates a nonempty batch of distinct custom fields on a job posting. Returns the affected entries in request order, including `value: null` for cleared fields. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobPostingId: z.string().describe("The job posting to edit."),
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
          operation: "jobPosting.setCustomFieldValues",
        });
        const result = await action(
          "jobPosting.setCustomFieldValues",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "job_posting_action",
          "set_custom_field_values",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_status: {
      description:
        "jobPosting.setStatus: Sets the status of a job posting. Use this to publish or unpublish a job posting. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobPostingId: z.string().describe(
          "The unique id of the job posting to update",
        ),
        status: z.enum(["Draft", "Published"]).describe(
          "The status to apply to the job posting. Set to `Draft` to unpublish or `Published` to publish.",
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
          method: "set_status",
          operation: "jobPosting.setStatus",
        });
        const result = await action("jobPosting.setStatus", args, opts);
        const handle = await context.writeResource(
          "job_posting_action",
          "set_status",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_compensation: {
      description:
        "jobPosting.updateCompensation: Updates compensation for an existing job posting. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobPostingId: z.string().describe(
          "The unique id of the job posting to update",
        ),
        compensationTiers: z.array(z.object({
          title: z.string().nullable().optional(),
          additionalInformation: z.string().nullable().optional(),
          components: z.array(z.object({
            compensationType: z.enum([
              "Salary",
              "EquityPercentage",
              "EquityCashValue",
              "Bonus",
              "Commission",
            ]),
            interval: z.enum([
              "NONE",
              "1 TIME",
              "1 HOUR",
              "1 DAY",
              "1 WEEK",
              "2 WEEK",
              "1 MONTH",
              "2 MONTH",
              "1 YEAR",
              "6 MONTH",
              "0.5 MONTH",
              "3 MONTH",
            ]),
            label: z.string().nullable().optional(),
            currencyCode: z.string().nullable().optional(),
            minValue: z.number().nullable().optional(),
            maxValue: z.number().nullable().optional(),
          })),
        })).nullable().describe(
          "The compensation tiers to set on the job posting. Pass `null` to reset the posting to inherit compensation from the parent job.",
        ),
        includeUnpublishedJobPostings: z.boolean().nullable().describe(
          "When true, allows updating compensation for unpublished (draft) job postings. Required when updating a draft posting.",
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
          method: "update_compensation",
          operation: "jobPosting.updateCompensation",
        });
        const result = await action(
          "jobPosting.updateCompensation",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "job_posting_action",
          "update_compensation",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_compensation_settings: {
      description:
        "jobPosting.updateCompensationSettings: Updates compensation display settings for a job posting. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobPostingId: z.string().describe(
          "The unique id of the job posting whose compensation display settings to update",
        ),
        shouldShowOnJobBoard: z.boolean().nullable().describe(
          "Whether compensation should appear on the job board listing for this posting. Omit to leave unchanged. Pass `null` to clear the override and inherit from the parent job.",
        ).optional(),
        shouldShowOnJobPostings: z.boolean().nullable().describe(
          "Whether compensation should appear on this posting's detail page. Omit to leave unchanged. Pass `null` to clear the override and inherit from the parent job. Note: organization-level pay transparency settings can force this on regardless.",
        ).optional(),
        compensationTierGuideUrl: z.string().nullable().describe(
          "A URL explaining the compensation tiers. Omit to leave unchanged. Pass `null` to clear the override and inherit from the parent job.",
        ).optional(),
        compensationPhilosophy: z.object({
          type: z.enum(["text/plain", "text/html"]),
          value: z.string(),
        }).nullable().describe(
          "The compensation philosophy as a `{ type, value }` object using `text/plain` or `text/html`. Omit to leave unchanged. Pass `null` to clear the override and inherit from the parent job.",
        ).optional(),
        includeUnpublishedJobPostings: z.boolean().nullable().describe(
          "When true, allows updating an unpublished (draft) job posting. Required when updating a draft posting.",
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
          method: "update_compensation_settings",
          operation: "jobPosting.updateCompensationSettings",
        });
        const result = await action(
          "jobPosting.updateCompensationSettings",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "job_posting_action",
          "update_compensation_settings",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
