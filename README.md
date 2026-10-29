# @keeb/ashby

Swamp models for the [Ashby](https://www.ashbyhq.com) ATS public API, covering
every client-callable endpoint: candidates, applications, jobs, job postings,
openings, interviews and schedules, feedback, offers, projects, sourcing
sequences, surveys, referrals, custom fields, reports, webhooks, users and org
metadata.

- **201 endpoints across 57 models**, one model per Ashby resource:
  `candidate.list` is method `list` on `@keeb/ashby/candidate`,
  `jobPosting.setStatus` is method `setStatus` on `@keeb/ashby/job-posting`.
  The full map is in [docs/ENDPOINTS.md](docs/ENDPOINTS.md).
- **Method arguments are the request body.** Every field, enum and required
  flag comes from Ashby's OpenAPI spec, so `swamp model type describe` shows
  exactly what each endpoint accepts.
- **Pagination is handled.** Paginated `list` methods follow `nextCursor` to the
  end by default and return the `syncToken` for incremental sync.
- **Failures fail.** Ashby reports most errors as `200 { success: false }`.
  Those throw, with Ashby's error code and request id in the message. 429s and
  5xx are retried with `Retry-After`.
- **Reports wait.** `report.generate` polls until the report is complete.
- **Files upload.** `@keeb/ashby/file` `upload` sends a local file through
  Ashby's presigned-URL flow and returns the handle that `uploadResume` /
  `uploadFile` expect.

## Setup

Create an API key in Ashby (Admin → Integrations → API Keys) with the module
permissions you need, and store it in a vault:

```bash
swamp vault put default ASHBY_API_KEY
```

Then create a definition for each resource you want to work with. The API key
is resolved from the vault at run time:

```bash
swamp model create @keeb/ashby/candidate ashby-candidates \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'

swamp model create @keeb/ashby/application ashby-applications \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'
```

Global arguments shared by every model:

| Argument     | Required | Purpose                                                       |
| ------------ | -------- | ------------------------------------------------------------- |
| `apiKey`     | yes      | Ashby API key (sensitive).                                    |
| `apiVersion` | no       | Pin a version with the `Ashby-Version` header.                |
| `onBehalfOf` | no       | Ashby user id for `X-On-Behalf-Of`, on endpoints that use it. |
| `baseUrl`    | no       | Override `https://api.ashbyhq.com` (fixtures, proxies).       |

## Running methods

```bash
# Every candidate (all pages)
swamp model method run ashby-candidates list

# One page of 25
swamp model method run ashby-candidates list --input limit=25 --input fetchAll=false

# Look someone up, then add a note
swamp model method run ashby-candidates search --input email=ada@example.com
swamp model method run ashby-candidates createNote \
  --input candidateId=<id> --input note="Strong systems background"

# Move an application to a new stage
swamp model method run ashby-applications changeStage \
  --input applicationId=<id> --input interviewStageId=<stage-id>
```

## Reading results

Each method writes one resource **named after the method**, holding Ashby's
`results` unchanged plus paging metadata:

```json
{
  "operation": "candidate.list",
  "results": [{ "id": "…", "name": "Ada Lovelace" }],
  "count": 1,
  "pages": 1,
  "moreDataAvailable": false,
  "syncToken": "…",
  "warnings": [],
  "fetchedAt": "2026-10-29T17:34:28.158Z"
}
```

So the latest result of `list` on `ashby-candidates` is
`data.latest("ashby-candidates", "list")`, which you can query or wire into
the next step of a workflow:

```bash
swamp data query 'modelName == "ashby-candidates" && name == "list"' \
  --select attributes.results
```

```yaml
- name: first-candidate
  task:
    type: model_method
    modelIdOrName: ashby-candidates
    methodName: info
    inputs:
      id: ${{ data.latest("ashby-candidates", "search").attributes.results[0].id }}
```

## Incremental sync

Paginated `list` methods return a `syncToken` on their final page. Pass it back
to fetch only records that changed since then:

```yaml
- name: changed-candidates
  task:
    type: model_method
    modelIdOrName: ashby-candidates
    methodName: list
    inputs:
      syncToken: ${{ data.latest("ashby-candidates", "list").attributes.syncToken }}
```

If Ashby answers `sync_token_expired`, run once without `syncToken` to take a
fresh full snapshot.

Paging controls on every paginated method (swamp-side only, never sent to
Ashby):

| Argument     | Default | Effect                                                                                                                    |
| ------------ | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `fetchAll`   | `true`  | Follow `nextCursor` to the last page. `false` fetches one page.                                                           |
| `maxResults` | none    | Stop once at least this many rows are in hand. Whole pages are kept, so `nextCursor` resumes exactly after the last row. |

## Reports

`report.generate` starts a report build and, by default, polls once a second
until it is complete or failed. That makes it usable as a single workflow step:

```bash
swamp model create @keeb/ashby/report ashby-reports \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'
swamp model method run ashby-reports generate --input reportId=<report-id>
```

Pass `waitForCompletion=false` to get the first status back immediately, and
tune polling with `pollIntervalSeconds` (default 1) and `timeoutSeconds`
(default 300). For small reports, `synchronous` returns data in one call.

## Uploading a resume

Ashby's API never takes file bytes directly. `upload` requests a presigned
target, sends the file there, and records the handle:

```bash
swamp model create @keeb/ashby/file ashby-files \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'
swamp model method run ashby-files upload \
  --input path=./ada-lovelace.pdf --input fileUploadContext=CandidateResume
```

Then attach it to the candidate:

```yaml
- name: attach-resume
  task:
    type: model_method
    modelIdOrName: ashby-candidates
    methodName: uploadResume
    inputs:
      candidateId: ${{ inputs.candidateId }}
      resumeHandle: ${{ data.latest("ashby-files", "upload").attributes.handle }}
```

## Secrets in results

Webhook settings include their `secretToken`, so every `@keeb/ashby/webhook`
result is written with `sensitiveOutput` and its contents are stored in the
vault rather than in plain data. Arguments named like secrets or passwords
(e.g. `secretToken` on `webhook.create`) are marked sensitive.

## Not wrapped

- `assessment.start`, `assessment.list`, `assessment.cancel` and
  `customFields.fetch` are endpoints an assessment partner implements and Ashby
  calls. They are not callable on Ashby.
- `application.change_stage` / `application.change_source` are deprecated
  aliases of `changeStage` / `changeSource`, which are wrapped.
- Webhook payloads are inbound events. Receive them with a `swamp serve`
  webhook route.

## Regenerating

The models are generated from Ashby's published OpenAPI fragments. To pick up
API changes:

```bash
~/.swamp/deno/deno run --allow-net=developers.ashbyhq.com --allow-read=. --allow-write=spec scripts/fetch-spec.ts
~/.swamp/deno/deno run --allow-read --allow-write scripts/generate.ts 2026.11.01.1
swamp extension fmt manifest.yaml
~/.swamp/deno/deno test --allow-read --allow-write=/tmp --allow-env tests/
```

`generate.ts` rewrites `extensions/models/*.ts` (except `lib/`), the `models:`
list in `manifest.yaml`, and `docs/ENDPOINTS.md`. Hand-written behavior lives
in `extensions/models/lib/`: `client.ts` (HTTP, retries, pagination),
`runtime.ts` (shared method execution) and `upload.ts`. The tests check that
every client-callable endpoint in the spec is wrapped exactly once.

## License

MIT
