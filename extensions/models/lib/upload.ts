/**
 * `upload` — put a local file into Ashby's storage and return its handle.
 *
 * Ashby's JSON API never accepts file bytes. To attach a resume or file you
 * ask `file.createFileUploadHandle` for a presigned multipart POST target,
 * upload the bytes there, then pass the returned handle to
 * `candidate.uploadResume` (`resumeHandle`), `candidate.uploadFile`
 * (`fileHandle`) or `applicationForm.submit`. The middle step is not an Ashby
 * endpoint at all, so without this method no swamp workflow could attach a
 * file. It does that one step and nothing else; attaching the handle stays
 * with the candidate model.
 */
import { z } from "npm:zod@4";
import { AshbyApiError } from "./client.ts";
import { clientFor, type MethodContext, type MethodResult } from "./runtime.ts";

/** Arguments for `upload`. */
export const UploadArgsSchema = z.object({
  path: z.string().describe("Local path of the file to upload."),
  fileUploadContext: z.enum([
    "CandidateResume",
    "CandidateFiles",
    "ApplicationForm",
  ])
    .describe(
      "CandidateResume for candidate.uploadResume, CandidateFiles for candidate.uploadFile, ApplicationForm for applicationForm.submit file fields.",
    ),
  filename: z.string().optional().describe(
    "Name Ashby records for the file. Defaults to the basename of `path`.",
  ),
  contentType: z.string().optional().describe(
    "MIME type. Defaults to a guess from the file extension.",
  ),
});

/** Attributes written by `upload`. */
export const UploadResultSchema = z.object({
  operation: z.string(),
  handle: z.string().describe(
    "Pass as resumeHandle / fileHandle to the candidate model, or as a file field value to applicationForm.submit.",
  ),
  filename: z.string(),
  contentType: z.string(),
  contentLength: z.number(),
  fileUploadContext: z.string(),
  fetchedAt: z.string(),
});

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  txt: "text/plain",
  md: "text/markdown",
  html: "text/html",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  odt: "application/vnd.oasis.opendocument.text",
  zip: "application/zip",
};

/** Best-effort MIME type from a filename's extension. */
export function guessContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  return MIME[ext] ?? "application/octet-stream";
}

/** Resource spec for `upload`. */
export const uploadResource = {
  description: "Handle for the last file uploaded with `upload`",
  schema: UploadResultSchema,
  lifetime: "infinite" as const,
  garbageCollection: 10,
};

/** Upload a local file and return its handle. */
export async function uploadFile(
  args: z.infer<typeof UploadArgsSchema>,
  context: MethodContext,
  fetchImpl: typeof fetch = fetch,
): Promise<z.infer<typeof UploadResultSchema>> {
  const bytes = await Deno.readFile(args.path);
  const filename = args.filename ?? args.path.split(/[\\/]/).pop() ?? "upload";
  const contentType = args.contentType ?? guessContentType(filename);

  const client = clientFor(context.globalArgs, { fetch: fetchImpl });
  const envelope = await client.call<{
    handle: string;
    url: string;
    fields: Record<string, string>;
  }>("file.createFileUploadHandle", {
    fileUploadContext: args.fileUploadContext,
    filename,
    contentType,
    contentLength: bytes.byteLength,
  });
  const target = envelope.results;
  if (!target?.handle || !target.url) {
    throw new Error("file.createFileUploadHandle returned no handle or url");
  }

  // The presigned fields (policy, signature, key, …) must precede the file
  // part, or storage rejects the POST.
  const form = new FormData();
  for (const [k, v] of Object.entries(target.fields ?? {})) form.append(k, v);
  form.append("file", new Blob([bytes], { type: contentType }), filename);
  const res = await fetchImpl(target.url, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text();
    throw new AshbyApiError(
      res.status,
      text,
      `Uploading ${filename} to the presigned URL failed: HTTP ${res.status} ${
        text.slice(0, 300)
      }`,
    );
  }
  await res.body?.cancel();

  context.logger.info("uploaded {filename} ({n} bytes) as {ctx}", {
    filename,
    n: bytes.byteLength,
    ctx: args.fileUploadContext,
  });
  return {
    operation: "file.createFileUploadHandle",
    handle: target.handle,
    filename,
    contentType,
    contentLength: bytes.byteLength,
    fileUploadContext: args.fileUploadContext,
    fetchedAt: new Date().toISOString(),
  };
}

/** Method definition for `upload`, merged into the generated file model. */
export const uploadMethod = {
  description:
    "Upload a local file to Ashby storage (file.createFileUploadHandle, then the presigned POST) and write its handle. Pass the handle to candidate uploadResume/uploadFile or applicationForm submit.",
  arguments: UploadArgsSchema,
  execute: async (
    args: z.infer<typeof UploadArgsSchema>,
    context: MethodContext,
  ): Promise<MethodResult> => {
    const attributes = await uploadFile(args, context);
    const handle = await context.writeResource("upload", "upload", attributes);
    return { dataHandles: [handle] };
  },
};
