// Auto-generated extension model for @keeb/ashby/jobs/job
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby job.
 *
 * Wraps Ashby's `job.*` endpoints as a swamp model so they can be
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
  title: z.string().describe("The title of the job").optional(),
  teamId: z.string().describe(
    "The id of the department or team associated with the job",
  ).optional(),
  locationId: z.string().describe(
    "The id of the location associated with the job",
  ).optional(),
  defaultInterviewPlanId: z.string().nullable().describe(
    "The id of the default interview plan for this job. A job cannot be opened without a default interview plan.",
  ).optional(),
  jobTemplateId: z.string().nullable().describe(
    "The id of the job template to use for this job. Only active job templates can be used to create a job. Sent by create only; job.update does not accept it.",
  ).optional(),
  employmentType: z.enum([
    "FullTime",
    "PartTime",
    "Intern",
    "Contract",
    "Temporary",
  ]).describe(
    "The employment type for the job. When omitted, inherits from the job template or defaults to FullTime.",
  ).optional(),
  brandId: z.string().nullable().describe(
    "The id of the brand to use for this job. Sent by create only; job.update does not accept it.",
  ).optional(),
  customRequisitionId: z.string().nullable().describe(
    "The new custom requisition id for the job. Pass `null` (together with another field to update) to clear the existing value. Sent by update only; job.create does not accept it.",
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
  confidential: z.boolean().nullish(),
  status: z.string().nullish(),
  employmentType: z.string().nullish(),
  locationId: z.string().nullish(),
  departmentId: z.string().nullish(),
  defaultInterviewPlanId: z.string().nullish(),
  interviewPlanIds: z.array(z.unknown()).nullish(),
  jobPostingIds: z.array(z.unknown()).nullish(),
  customRequisitionId: z.string().nullish(),
  brandId: z.string().nullish(),
  hiringTeam: z.array(z.unknown()).nullish(),
  openings: z.array(z.unknown()).nullish(),
  location: z.record(z.string(), z.unknown()).nullish(),
  compensation: z.record(z.string(), z.unknown()).nullish(),
  customFields: z.array(z.unknown()).nullish(),
  author: z.record(z.string(), z.unknown()).nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  openedAt: z.string().nullish(),
  closedAt: z.string().nullish(),
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
  teamId: z.string().optional(),
  locationId: z.string().optional(),
  defaultInterviewPlanId: z.string().nullable().optional(),
  jobTemplateId: z.string().nullable().optional(),
  employmentType: z.enum([
    "FullTime",
    "PartTime",
    "Intern",
    "Contract",
    "Temporary",
  ]).optional(),
  brandId: z.string().nullable().optional(),
  customRequisitionId: z.string().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby job. Registered at `@keeb/ashby/jobs/job`. */
export const model = {
  type: "@keeb/ashby/jobs/job",
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
      description: "Ashby job state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    job_lookup: {
      description:
        "Ashby job lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    job_action: {
      description: "Ashby job action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a job from the model's global arguments (job.create). Creates a new job. Requires the `jobsWrite` permission.",
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
          operation: "job.create",
        });
        const instanceName = (g.title?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["teamId"] !== undefined) body["teamId"] = g["teamId"];
        if (g["locationId"] !== undefined) body["locationId"] = g["locationId"];
        if (g["defaultInterviewPlanId"] !== undefined) {
          body["defaultInterviewPlanId"] = g["defaultInterviewPlanId"];
        }
        if (g["jobTemplateId"] !== undefined) {
          body["jobTemplateId"] = g["jobTemplateId"];
        }
        if (g["employmentType"] !== undefined) {
          body["employmentType"] = g["employmentType"];
        }
        if (g["brandId"] !== undefined) body["brandId"] = g["brandId"];
        const result = await create("job.create", body, opts);
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
        "Get a job and record it as this model's state (job.info). Fetches details of a single job by id. Requires the `jobsRead` permission.",
      kind: "read",
      arguments: z.object({
        id: z.string().describe("The id of the job to fetch"),
        includeUnpublishedJobPostingsIds: z.boolean().nullable().describe(
          "Whether to include unpublished job posting ids in the response",
        ).optional(),
        expand: z.array(
          z.enum(["opening", "openings", "location", "compensation"]),
        ).nullable().describe(
          "Expand the result with related objects. Supported values are `openings`, `location`, and `compensation`.",
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
          operation: "job.info",
        });
        const result = await read("job.info", args, opts);
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
        "List job records and record each as a data artifact (job.list; capped at 500 by default; writes a job_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only jobs updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        status: z.array(z.string()).nullable().describe(
          "When supplied, only jobs with the provided status(es) are returned. Accepted values are `Draft`, `Open`, `Closed`, and `Archived` (case-insensitive).",
        ).optional(),
        createdAfter: z.number().int().nullable().describe(
          "Return jobs created at or after this date. Unix timestamp in milliseconds.",
        ).optional(),
        openedAfter: z.number().int().nullable().describe(
          "Return jobs opened after this date. Unix timestamp in milliseconds.",
        ).optional(),
        openedBefore: z.number().int().nullable().describe(
          "Return jobs opened before this date. Unix timestamp in milliseconds.",
        ).optional(),
        closedAfter: z.number().int().nullable().describe(
          "Return jobs closed after this date. Unix timestamp in milliseconds.",
        ).optional(),
        closedBefore: z.number().int().nullable().describe(
          "Return jobs closed before this date. Unix timestamp in milliseconds.",
        ).optional(),
        includeUnpublishedJobPostingsIds: z.boolean().nullable().describe(
          "Whether to include unpublished job posting ids in the response",
        ).optional(),
        expand: z.array(z.enum(["opening", "openings", "location"])).nullable()
          .describe(
            "Expand the result with related objects. Supported values are `openings` and `location`.",
          ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the job_lookup record reports truncated: true.",
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
          operation: "job.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("job.list", filters, {
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
          await context.writeResource("job_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored job (job.update). Run create or get first.",
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
          operation: "job.update",
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
        const body: Record<string, unknown> = { "jobId": existing.id };
        if (g["title"] !== undefined) body["title"] = g["title"];
        if (g["teamId"] !== undefined) body["teamId"] = g["teamId"];
        if (g["locationId"] !== undefined) body["locationId"] = g["locationId"];
        if (g["defaultInterviewPlanId"] !== undefined) {
          body["defaultInterviewPlanId"] = g["defaultInterviewPlanId"];
        }
        if (g["employmentType"] !== undefined) {
          body["employmentType"] = g["employmentType"];
        }
        if (g["customRequisitionId"] !== undefined) {
          body["customRequisitionId"] = g["customRequisitionId"];
        }
        const result = await update("job.update", body, opts);
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
        "Sync the stored job from Ashby (job.info); records status not_found when it is gone.",
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
          operation: "job.info",
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
        const result = await tryRead("job.info", { "id": existing.id }, opts);
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
    search: {
      description:
        "job.search: Searches jobs by title or custom requisition id. At least one of `title` or `requisitionId` must be provided. Requires the `jobsRead` permission.",
      kind: "list",
      arguments: z.object({
        title: z.string().nullable().describe(
          "The title (or substring of a title) of the job to search for",
        ).optional(),
        requisitionId: z.string().nullable().describe(
          "The custom requisition id (or substring) of the job to search for",
        ).optional(),
        limit: z.number().int().nullable().describe(
          "The maximum number of jobs to return. Defaults to 100 and cannot exceed 100.",
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
          method: "search",
          operation: "job.search",
        });
        const result = await action("job.search", args, opts);
        const handle = await context.writeResource(
          "job_action",
          "search",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_status: {
      description:
        "job.setStatus: Sets the status of a job. When setting a job to Closed, you can optionally provide a `closeReasonId` from `closeReason.list`. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobId: z.string().describe(
          "The unique id of the job to set the status of",
        ),
        status: z.enum(["Draft", "Open", "Closed", "Archived"]).describe(
          "The status to apply to the job",
        ),
        closeReasonId: z.string().nullable().describe(
          "The unique id of the close reason. Only valid when setting the job status to Closed",
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
          operation: "job.setStatus",
        });
        const result = await action("job.setStatus", args, opts);
        const handle = await context.writeResource(
          "job_action",
          "set_status",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    start_approval_process: {
      description:
        "job.startApprovalProcess: Starts the approval process for a job. Creates an approval instance and submits it to the configured approvers. Requires the `approvalsWrite` permission.",
      arguments: z.object({
        jobId: z.string().describe(
          "The id of the job whose approval process should be started",
        ),
        note: z.object({
          type: z.enum(["text/plain", "text/html"]),
          value: z.string(),
        }).describe(
          'Optional note to attach to the approval request using `{ type: "text/plain" | "text/html", value }`.',
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
          operation: "job.startApprovalProcess",
        });
        const result = await action("job.startApprovalProcess", args, opts);
        const handle = await context.writeResource(
          "job_action",
          "start_approval_process",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_compensation: {
      description:
        "job.updateCompensation: Replaces the compensation tiers on a job. Pass an empty array to clear existing compensation. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobId: z.string().describe("The unique id of the job to update"),
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
        })).describe(
          "The compensation tiers to set on the job. Pass an empty array to clear existing compensation.",
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
          method: "update_compensation",
          operation: "job.updateCompensation",
        });
        const result = await action("job.updateCompensation", args, opts);
        const handle = await context.writeResource(
          "job_action",
          "update_compensation",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    update_compensation_settings: {
      description:
        "job.updateCompensationSettings: Updates compensation display settings for a job. Requires the `jobsWrite` permission.",
      arguments: z.object({
        jobId: z.string().describe(
          "The unique id of the job whose compensation display settings to update",
        ),
        shouldShowOnJobBoard: z.boolean().nullable().describe(
          "Whether compensation should appear on the job board listing. Omit to leave unchanged. Pass `null` to clear the override and inherit from the brand.",
        ).optional(),
        shouldShowOnJobPostings: z.boolean().nullable().describe(
          "Whether compensation should appear on individual job postings. Omit to leave unchanged. Pass `null` to clear the override and inherit from the brand. Note: organization-level pay transparency settings can force this on regardless.",
        ).optional(),
        compensationTierGuideUrl: z.string().nullable().describe(
          "A URL explaining the compensation tiers. Omit to leave unchanged. Pass `null` to clear the override and inherit from the brand.",
        ).optional(),
        compensationPhilosophy: z.object({
          type: z.enum(["text/plain", "text/html"]),
          value: z.string(),
        }).nullable().describe(
          "The compensation philosophy as a `{ type, value }` object using `text/plain` or `text/html`. Omit to leave unchanged. Pass `null` to clear the override and inherit from the brand.",
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
          operation: "job.updateCompensationSettings",
        });
        const result = await action(
          "job.updateCompensationSettings",
          args,
          opts,
        );
        const handle = await context.writeResource(
          "job_action",
          "update_compensation_settings",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
