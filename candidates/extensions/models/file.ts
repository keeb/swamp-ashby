// Auto-generated extension model for @keeb/ashby/candidates/file
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby file.
 *
 * Wraps Ashby's `file.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action, read, uploadFile } from "./_lib/ashby.ts";

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
  url: z.string().nullish(),
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
  handle: z.string().nullish(),
  filename: z.string().nullish(),
  contentType: z.string().nullish(),
  contentLength: z.number().nullish(),
  fileUploadContext: z.string().nullish(),
  uploadedAt: z.string().nullish(),
}).passthrough();

const InputsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby file. Registered at `@keeb/ashby/candidates/file`. */
export const model = {
  type: "@keeb/ashby/candidates/file",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby file state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    file_action: {
      description: "Ashby file action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    get: {
      description:
        "Get a file and record it as this model's state (file.info). Retrieve the URL for a file referenced by a public API file handle (candidate files, resumes, offer letters, and signature-request files). Requires the `candidatesRead` permission.",
      kind: "read",
      arguments: z.object({
        fileHandle: z.string().describe(
          "A file handle retrieved from the public API",
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
          operation: "file.info",
        });
        const result = await read("file.info", args, opts);
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
    create_file_upload_handle: {
      description:
        "file.createFileUploadHandle: Creates a presigned upload URL that allows uploading a file directly to storage, bypassing the need to send file bytes through the API. Requires the `candidatesWrite` permission.",
      arguments: z.object({
        fileUploadContext: z.enum([
          "CandidateResume",
          "CandidateFiles",
          "ApplicationForm",
        ]).describe(
          "The context for the file upload. Use CandidateResume for resume uploads, CandidateFiles for general file uploads, and ApplicationForm for file fields in application form submissions.",
        ),
        filename: z.string().describe(
          "The name of the file being uploaded, including extension",
        ),
        contentType: z.string().describe(
          "The MIME type of the file being uploaded",
        ),
        contentLength: z.number().int().describe(
          "The size of the file in bytes",
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
          method: "create_file_upload_handle",
          operation: "file.createFileUploadHandle",
        });
        const result = await action("file.createFileUploadHandle", args, opts);
        const handle = await context.writeResource(
          "file_action",
          "create_file_upload_handle",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    upload: {
      description:
        "Upload a local file to Ashby storage (file.createFileUploadHandle, then the presigned POST) and record its handle. Pass the handle to the candidate model's upload_resume / upload_file or to application_form submit.",
      arguments: z.object({
        path: z.string().describe("Local path of the file to upload."),
        fileUploadContext: z.enum([
          "CandidateResume",
          "CandidateFiles",
          "ApplicationForm",
        ]).describe(
          "CandidateResume for candidate upload_resume, CandidateFiles for candidate upload_file, ApplicationForm for application form file fields.",
        ),
        filename: z.string().describe(
          "Name Ashby records for the file. Defaults to the basename of path.",
        ).optional(),
        contentType: z.string().describe(
          "MIME type. Defaults to a guess from the file extension.",
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
          method: "upload",
          operation: "file.createFileUploadHandle",
        });
        const result = await uploadFile({
          path: args.path,
          fileUploadContext: args.fileUploadContext,
          filename: args.filename,
          contentType: args.contentType,
        }, opts);
        const handle = await context.writeResource(
          "file_action",
          "upload",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
