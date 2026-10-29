// Auto-generated extension model for @keeb/ashby/candidates/candidate
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby candidate.
 *
 * Wraps Ashby's `candidate.*` endpoints as a swamp model so they can be
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
  name: z.string().describe(
    "The first and last name of the candidate to be created",
  ).optional(),
  email: z.string().nullable().describe(
    "Primary, personal email of the candidate to be created",
  ).optional(),
  phoneNumber: z.string().nullable().describe(
    "Primary, personal phone number of the candidate to be created",
  ).optional(),
  linkedInUrl: z.string().nullable().describe(
    "Url to the candidate's LinkedIn profile. Must be a valid Url.",
  ).optional(),
  githubUrl: z.string().nullable().describe(
    "Url to the candidate's Github profile. Must be a valid Url.",
  ).optional(),
  website: z.string().nullable().describe(
    "Url of the candidate's website. Must be a valid Url.",
  ).optional(),
  alternateEmailAddresses: z.array(z.string()).nullable().describe(
    "Array of alternate email addresses to add to the candidate's profile",
  ).optional(),
  sourceId: z.string().nullable().describe(
    "The source to set on the candidate being created",
  ).optional(),
  creditedToUserId: z.string().nullable().describe(
    "The id of the user the candidate will be credited to",
  ).optional(),
  location: z.object({
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  }).nullable().describe("The location of the candidate").optional(),
  createdAt: z.string().nullable().describe(
    "An ISO date string to set the candidate's `createdAt` timestamp. When this value isn't provided, the `createdAt` timestamp defaults to the time the call was made.",
  ).optional(),
  websiteUrl: z.string().nullable().describe(
    "Url of the candidate's website. Must be a valid Url.",
  ).optional(),
  alternateEmail: z.string().nullable().describe(
    "An alternate email address to add to the candidate's profile",
  ).optional(),
  socialLinks: z.array(z.object({ type: z.string(), url: z.string() }))
    .nullable().describe(
      "An array of social links to set on the candidate. This value replaces existing socialLinks that have been set on the candidate. If this value is submitted along with linkedInUrl, gitHubUrl or websiteUrl fields, those values will be ignored.",
    ).optional(),
  sendNotifications: z.boolean().nullable().describe(
    "Whether or not users who are subscribed to the candidate should be notified that the candidate was updated. Default is true.",
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
  updatedAt: z.string().nullish(),
  name: z.string().nullish(),
  primaryEmailAddress: z.record(z.string(), z.unknown()).nullish(),
  emailAddresses: z.array(z.unknown()).nullish(),
  primaryPhoneNumber: z.record(z.string(), z.unknown()).nullish(),
  phoneNumbers: z.array(z.unknown()).nullish(),
  socialLinks: z.array(z.unknown()).nullish(),
  tags: z.array(z.unknown()).nullish(),
  position: z.string().nullish(),
  company: z.string().nullish(),
  school: z.string().nullish(),
  applicationIds: z.array(z.unknown()).nullish(),
  resumeFileHandle: z.record(z.string(), z.unknown()).nullish(),
  fileHandles: z.array(z.unknown()).nullish(),
  customFields: z.array(z.unknown()).nullish(),
  profileUrl: z.string().nullish(),
  source: z.record(z.string(), z.unknown()).nullish(),
  creditedToUser: z.record(z.string(), z.unknown()).nullish(),
  timezone: z.string().nullish(),
  location: z.record(z.string(), z.unknown()).nullish(),
  fraudStatus: z.string().nullish(),
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
  name: z.string().optional(),
  email: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  linkedInUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  alternateEmailAddresses: z.array(z.string()).nullable().optional(),
  sourceId: z.string().nullable().optional(),
  creditedToUserId: z.string().nullable().optional(),
  location: z.object({
    city: z.string().nullable().optional(),
    region: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
  }).nullable().optional(),
  createdAt: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  alternateEmail: z.string().nullable().optional(),
  socialLinks: z.array(z.object({ type: z.string(), url: z.string() }))
    .nullable().optional(),
  sendNotifications: z.boolean().nullable().optional(),
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby candidate. Registered at `@keeb/ashby/candidates/candidate`. */
export const model = {
  type: "@keeb/ashby/candidates/candidate",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby candidate state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    candidate_lookup: {
      description:
        "Ashby candidate lookup coverage — whether the walk exhausted the collection, and the sync token for the next one",
      schema: LookupSummarySchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    candidate_action: {
      description: "Ashby candidate action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    create: {
      description:
        "Create a candidate from the model's global arguments (candidate.create). Creates a new candidate. Requires the `candidatesWrite` permission.",
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
          operation: "candidate.create",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
          /[\/\\]/g,
          "_",
        ).replace(/\.\./g, "_").replace(/\0/g, "");
        const body: Record<string, unknown> = {};
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["email"] !== undefined) body["email"] = g["email"];
        if (g["phoneNumber"] !== undefined) {
          body["phoneNumber"] = g["phoneNumber"];
        }
        if (g["linkedInUrl"] !== undefined) {
          body["linkedInUrl"] = g["linkedInUrl"];
        }
        if (g["githubUrl"] !== undefined) body["githubUrl"] = g["githubUrl"];
        if (g["website"] !== undefined) body["website"] = g["website"];
        if (g["alternateEmailAddresses"] !== undefined) {
          body["alternateEmailAddresses"] = g["alternateEmailAddresses"];
        }
        if (g["sourceId"] !== undefined) body["sourceId"] = g["sourceId"];
        if (g["creditedToUserId"] !== undefined) {
          body["creditedToUserId"] = g["creditedToUserId"];
        }
        if (g["location"] !== undefined) body["location"] = g["location"];
        if (g["createdAt"] !== undefined) body["createdAt"] = g["createdAt"];
        const result = await create("candidate.create", body, opts);
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
        "Get a candidate and record it as this model's state (candidate.info). Fetches details about a single candidate by id or external mapping id. Requires the `candidatesRead` permission.",
      kind: "read",
      arguments: z.object({
        id: z.string().nullable().describe("The id of the candidate to fetch")
          .optional(),
        externalMappingId: z.string().nullable().describe(
          "An id assigned to a candidate outside of Ashby. Used to associate Ashby candidates with their profiles in external systems (BambooHR, Rippling, Gusto, etc.)",
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
          operation: "candidate.info",
        });
        const result = await read("candidate.info", args, opts);
        const instanceName = (g.name?.toString() ?? "current").replace(
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
        "List candidate records and record each as a data artifact (candidate.list; capped at 500 by default; writes a candidate_lookup record with the coverage of the walk and the sync token)",
      kind: "list",
      arguments: z.object({
        syncToken: z.string().nullable().describe(
          "A sync token to retrieve only candidates updated since the last sync. Obtained from a previous list response.",
        ).optional(),
        createdAfter: z.number().nullable().describe(
          "Unix timestamp (milliseconds). When provided, only candidates created at or after this time are returned. Must not be later than createdBefore or in the future.",
        ).optional(),
        createdBefore: z.number().nullable().describe(
          "Unix timestamp (milliseconds). When provided, only candidates created at or before this time are returned. Must not be in the future.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the candidate_lookup record reports truncated: true.",
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
          operation: "candidate.list",
        });
        const { max_items, ...filters } = args;
        const maxItems = max_items ?? 500;
        const page = await listAll("candidate.list", filters, {
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
          await context.writeResource("candidate_lookup", "lookup", {
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
        "Apply the model's global arguments to the stored candidate (candidate.update). Run create or get first.",
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
          operation: "candidate.update",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
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
        const body: Record<string, unknown> = { "candidateId": existing.id };
        if (g["name"] !== undefined) body["name"] = g["name"];
        if (g["email"] !== undefined) body["email"] = g["email"];
        if (g["phoneNumber"] !== undefined) {
          body["phoneNumber"] = g["phoneNumber"];
        }
        if (g["linkedInUrl"] !== undefined) {
          body["linkedInUrl"] = g["linkedInUrl"];
        }
        if (g["githubUrl"] !== undefined) body["githubUrl"] = g["githubUrl"];
        if (g["websiteUrl"] !== undefined) body["websiteUrl"] = g["websiteUrl"];
        if (g["alternateEmail"] !== undefined) {
          body["alternateEmail"] = g["alternateEmail"];
        }
        if (g["socialLinks"] !== undefined) {
          body["socialLinks"] = g["socialLinks"];
        }
        if (g["sourceId"] !== undefined) body["sourceId"] = g["sourceId"];
        if (g["creditedToUserId"] !== undefined) {
          body["creditedToUserId"] = g["creditedToUserId"];
        }
        if (g["location"] !== undefined) body["location"] = g["location"];
        if (g["createdAt"] !== undefined) body["createdAt"] = g["createdAt"];
        if (g["sendNotifications"] !== undefined) {
          body["sendNotifications"] = g["sendNotifications"];
        }
        const result = await update("candidate.update", body, opts);
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
        "Sync the stored candidate from Ashby (candidate.info); records status not_found when it is gone.",
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
          operation: "candidate.info",
        });
        const instanceName = (g.name?.toString() ?? "current").replace(
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
        const result = await tryRead(
          "candidate.info",
          { "id": existing.id },
          opts,
        );
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
    add_email_message: {
      description:
        "candidate.addEmailMessage: Attaches an existing email message (e.g. fetched from a partner provider) to a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The candidate to attach this email to",
        ),
        emailProviderEmailId: z.string().describe(
          "Unique identifier for this message in the partner system. Must be unique per API key.",
        ),
        subject: z.string().describe("The email subject line"),
        from: z.string().describe("The sender email address"),
        to: z.string().describe("The recipient email address"),
        body: z.string().describe("The html body of the email"),
        userId: z.string().nullable().describe(
          "The Ashby user ID to associate with this email. Defaults to the API key user.",
        ).optional(),
        sentAt: z.string().nullable().describe(
          "When the email was sent. Defaults to the current time.",
        ).optional(),
        cc: z.string().nullable().describe("CC recipients").optional(),
        messageUrl: z.string().nullable().describe(
          "URL to view the message in the partner application",
        ).optional(),
        messageIdHeader: z.string().nullable().describe(
          "RFC 5322 message identifier",
        ).optional(),
        threadId: z.string().nullable().describe(
          "Thread identifier to group this message with others. Defaults to emailProviderEmailId.",
        ).optional(),
        isPrivate: z.boolean().nullable().describe(
          'Whether the email should be marked as private. Private emails require "Allow access to non-offer private fields?" API key permission to create and view. Defaults to false.',
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
          method: "add_email_message",
          operation: "candidate.addEmailMessage",
        });
        const result = await action("candidate.addEmailMessage", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "add_email_message",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    add_project: {
      description:
        "candidate.addProject: Adds a candidate to a project. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe("The id of the candidate"),
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
          method: "add_project",
          operation: "candidate.addProject",
        });
        const result = await action("candidate.addProject", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "add_project",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    add_tag: {
      description:
        "candidate.addTag: Adds a tag to a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The unique id of the candidate to add the tag to",
        ),
        tagId: z.string().describe(
          "The unique id of the tag to add to the candidate",
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
          method: "add_tag",
          operation: "candidate.addTag",
        });
        const result = await action("candidate.addTag", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "add_tag",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    anonymize: {
      description:
        "candidate.anonymize: Anonymizes a candidate's personally identifiable information. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to anonymize",
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
          method: "anonymize",
          operation: "candidate.anonymize",
        });
        const result = await action("candidate.anonymize", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "anonymize",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    create_note: {
      description:
        "candidate.createNote: Creates a note on a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe("The id of the candidate"),
        note: z.union([
          z.string(),
          z.object({
            type: z.enum(["text/plain", "text/html"]),
            value: z.string(),
          }),
        ]).describe(
          "The note to add to the candidate. Either a plain string, or an object `{ type, value }` where `type` is `text/plain` or `text/html`.",
        ),
        sendNotifications: z.boolean().nullable().describe(
          "Whether or not users who are subscribed to the candidate should be notified that the note was posted. Default is false.",
        ).optional(),
        isPrivate: z.boolean().nullable().describe(
          'Whether the note should be marked as private. Private notes require "Allow access to non-offer private fields?" API key permission to create and view. Default is false.',
        ).optional(),
        createdAt: z.string().nullable().describe(
          "An ISO date string to set the note's `createdAt` timestamp",
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
          method: "create_note",
          operation: "candidate.createNote",
        });
        const result = await action("candidate.createNote", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "create_note",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    get_recent_email_messages: {
      description:
        "candidate.getRecentEmailMessages (Beta): Returns recent email messages for a candidate, newest first. A request without a `cursor` starts a point-in-time snapshot containing at most 200 matching messages. Requires the `emailsRead` permission.",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "The unique identifier of the candidate",
        ),
        direction: z.enum(["sent", "received"]).describe(
          "Only return messages sent or received by the organization",
        ).optional(),
        sentAfter: z.string().describe(
          "Only return messages sent after this ISO 8601 timestamp",
        ).optional(),
        watermark: z.string().describe(
          "An opaque token from the candidateRecentEmailMessagesUpdated webhook. Pass it unchanged. Only a request with this watermark is guaranteed to include the up-to-date email change that triggered the webhook. Start a new request with this watermark and omit cursor. The watermark applies only to this candidate and is valid for starting the first page for one hour from the webhook delivery attempt.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "get_recent_email_messages",
          operation: "candidate.getRecentEmailMessages",
        });
        const { max_items, ...filters } = args;
        const page = await listAll(
          "candidate.getRecentEmailMessages",
          filters,
          { ...opts, maxItems: max_items ?? 500, paginated: true },
        );
        const handle = await context.writeResource(
          "candidate_action",
          "get_recent_email_messages",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    list_client_info: {
      description:
        "candidate.listClientInfo: Lists client information records (IP, user agent) collected for a candidate. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to fetch client info for",
        ),
        syncToken: z.string().nullable().describe(
          "An opaque token representing the last time the data was successfully synced from the API. A new, updated one is returned after successfully fetching the last page of data.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_client_info",
          operation: "candidate.listClientInfo",
        });
        const { max_items, ...filters } = args;
        const page = await listAll("candidate.listClientInfo", filters, {
          ...opts,
          maxItems: max_items ?? 500,
          paginated: true,
        });
        const handle = await context.writeResource(
          "candidate_action",
          "list_client_info",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    list_fraud_checks: {
      description:
        "candidate.listFraudChecks: Lists the fraud checks performed on a candidate. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to fetch fraud checks for",
        ),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_fraud_checks",
          operation: "candidate.listFraudChecks",
        });
        const { max_items, ...filters } = args;
        const page = await listAll("candidate.listFraudChecks", filters, {
          ...opts,
          maxItems: max_items ?? 500,
          paginated: true,
        });
        const handle = await context.writeResource(
          "candidate_action",
          "list_fraud_checks",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    list_notes: {
      description:
        "candidate.listNotes: Lists the notes that have been added to a candidate, ordered from newest to oldest. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to fetch notes for",
        ),
        syncToken: z.string().nullable().describe(
          "Accepted for backward compatibility. This endpoint does not currently support incremental synchronization.",
        ).optional(),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_notes",
          operation: "candidate.listNotes",
        });
        const { max_items, ...filters } = args;
        const page = await listAll("candidate.listNotes", filters, {
          ...opts,
          maxItems: max_items ?? 500,
          paginated: true,
        });
        const handle = await context.writeResource(
          "candidate_action",
          "list_notes",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    list_projects: {
      description:
        "candidate.listProjects: Lists the projects a candidate has been added to. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to fetch projects for",
        ),
        max_items: z.number().int().min(1).max(100000).describe(
          "Stop after this many results (default 500). Whole pages are kept, so the recorded next_cursor resumes exactly after the last row. When the walk stops with rows still on offer, the result reports truncated: true.",
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
          method: "list_projects",
          operation: "candidate.listProjects",
        });
        const { max_items, ...filters } = args;
        const page = await listAll("candidate.listProjects", filters, {
          ...opts,
          maxItems: max_items ?? 500,
          paginated: true,
        });
        const handle = await context.writeResource(
          "candidate_action",
          "list_projects",
          {
            count: page.items.length,
            items: page.items,
            truncated: page.truncated,
            pages: page.pages,
            next_cursor: page.nextCursor,
            sync_token: page.syncToken,
            listedAt: new Date().toISOString(),
          },
        );
        return { dataHandles: [handle] };
      },
    },
    push_to_hris: {
      description:
        "candidate.pushToHris (Beta): Pushes a candidate's data to an HRIS system (e.g. Workday, BambooHR, ADP). Requires the `candidatesWrite` permission.",
      arguments: z.object({
        applicationId: z.string().describe(
          "The ID of the application whose candidate should be pushed to the HRIS.",
        ),
        externalSystem: z.enum([
          "ADP",
          "BambooHR",
          "bob",
          "Charthop",
          "Dayforce",
          "Enboarder",
          "Gusto",
          "Lattice",
          "Namely",
          "OracleHCM",
          "Paychex",
          "Paylocity",
          "Personio",
          "Remote",
          "Rippling",
          "SAP",
          "SelfServe",
          "UKG",
          "Workday",
        ]).describe(
          'The HRIS system to push the candidate to. Note: HiBob uses the value "bob".',
        ),
        integrationPartnerId: z.string().describe(
          "The ID of the integration partner. Required for SelfServe integrations.",
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
          method: "push_to_hris",
          operation: "candidate.pushToHris",
        });
        const result = await action("candidate.pushToHris", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "push_to_hris",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_project: {
      description:
        "candidate.removeProject: Removes the candidate from a project. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe("The id of the candidate"),
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
          method: "remove_project",
          operation: "candidate.removeProject",
        });
        const result = await action("candidate.removeProject", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "remove_project",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_tag: {
      description:
        "candidate.removeTag: Removes a tag from a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to remove the tag from",
        ),
        tagId: z.string().describe(
          "The id of the tag to remove from the candidate",
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
          method: "remove_tag",
          operation: "candidate.removeTag",
        });
        const result = await action("candidate.removeTag", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "remove_tag",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    search: {
      description:
        "candidate.search: Searches for candidates by email and/or name. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        email: z.string().nullable().describe("The candidate's email")
          .optional(),
        name: z.string().nullable().describe("The candidate's name").optional(),
        limit: z.number().int().nullable().describe(
          "The maximum number of candidates to return. Defaults to 100 and cannot exceed 100.",
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
          operation: "candidate.search",
        });
        const result = await action("candidate.search", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "search",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    search_suggestions: {
      description:
        "candidate.searchSuggestions: Searches for candidates by email and/or name and returns a minimal suggestion shape for typeahead use cases. Requires the `candidatesRead` permission.",
      kind: "list",
      arguments: z.object({
        email: z.string().describe("The candidate's email").optional(),
        name: z.string().describe("The candidate's name").optional(),
        limit: z.number().int().describe(
          "The maximum number of candidate suggestions to return. Defaults to 10 and cannot exceed 100.",
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
          method: "search_suggestions",
          operation: "candidate.searchSuggestions",
        });
        const result = await action("candidate.searchSuggestions", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "search_suggestions",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    set_fraud_status: {
      description:
        "candidate.setFraudStatus: Updates the manual fraud-review status of a candidate. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe(
          "The id of the candidate to set the fraud status for",
        ),
        fraudStatus: z.enum(["Fraudulent", "NotFraudulent", "Unsure"]).describe(
          "The fraud status to set for the candidate",
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
          method: "set_fraud_status",
          operation: "candidate.setFraudStatus",
        });
        const result = await action("candidate.setFraudStatus", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "set_fraud_status",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    upload_file: {
      description:
        "candidate.uploadFile: Uploads a file for a candidate. Accepts either a multipart/form-data request with a `file` file part, or a JSON body with a `fileHandle` previously created via `file.createFileUploadHandle`. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe("The id of the candidate"),
        fileHandle: z.string().nullable().describe(
          "A handle returned by `file.createFileUploadHandle` after uploading a file to the presigned URL.",
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
          method: "upload_file",
          operation: "candidate.uploadFile",
        });
        const result = await action("candidate.uploadFile", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "upload_file",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    upload_resume: {
      description:
        "candidate.uploadResume: Uploads a resume for a candidate. Accepts either a multipart/form-data request with a `resume` file part, or a JSON body with a `resumeHandle` previously created via `file.createFileUploadHandle`. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        candidateId: z.string().describe("The id of the candidate"),
        resumeHandle: z.string().nullable().describe(
          "A handle returned by `file.createFileUploadHandle` after uploading a resume file to the presigned URL.",
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
          method: "upload_resume",
          operation: "candidate.uploadResume",
        });
        const result = await action("candidate.uploadResume", args, opts);
        const handle = await context.writeResource(
          "candidate_action",
          "upload_resume",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
