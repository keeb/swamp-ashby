# swamp-ashby

[swamp](https://github.com/swamp-club/swamp) extensions for the
[Ashby](https://www.ashbyhq.com) ATS API, generated from Ashby's OpenAPI
spec. Every client-callable Ashby endpoint (201 of them) is covered, split
into seven extensions by area:

| Extension | Covers |
| --- | --- |
| [`@keeb/ashby/candidates`](candidates/) | candidates, tags, applications and their history, application feedback, application forms, referrals, assessments, file uploads |
| [`@keeb/ashby/jobs`](jobs/) | jobs, job postings, openings, locations, departments, hiring teams, approvals, job boards, job templates |
| [`@keeb/ashby/interviews`](interviews/) | interviews, interview plans and stages, schedules and events, briefings, interviewer pools, feedback forms, take-home assignments, notetaker transcripts |
| [`@keeb/ashby/offers`](offers/) | offer processes, offers, offer approvals and decisions |
| [`@keeb/ashby/sourcing`](sourcing/) | projects, sequences and sequence templates, sources and tracking links, email senders, the email sync blocklist, communication templates, archive reasons |
| [`@keeb/ashby/surveys`](surveys/) | survey form definitions, requests and submissions |
| [`@keeb/ashby/organization`](organization/) | users and interviewer settings, brands, custom fields, webhooks, reports, the audit log, API key info, API versions |

Each Ashby resource is one model, `@keeb/ashby/<extension>/<resource>`, with
the standard swamp method set where the resource supports it — `create`,
`get`, `lookup`, `update`, `delete`, `sync` — and a snake_case action for
every other endpoint (`candidate.addTag` → `add_tag`). Each extension's README
lists its models and methods.

```bash
swamp extension pull @keeb/ashby/jobs
swamp model create @keeb/ashby/jobs/job ashby-job \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'
swamp model method run ashby-job lookup
```

## Layout

```
codegen/
  fetch-spec.ts      refresh spec/ashby-openapi.json from Ashby's docs
  generate.ts        write every package from the spec
  lib/ashby.ts       the shared HTTP helper, copied into each package's _lib/
  endpoints.json     generated map of every endpoint to its model and method
spec/                Ashby's OpenAPI spec, merged from the reference pages
<extension>/         one generated package per extension (do not edit)
```

## Regenerating

```bash
deno task fetch-spec   # pick up Ashby API changes
deno task generate     # rewrite every package
deno task test         # lib, per-model, and coverage tests
```

`generate.ts` asserts the registry's listing limits (50 models per
extension, 50 methods per model, 30 arguments per method or model) and writes
every listed field literally in each model file, so a package that would
publish without a listing fails to generate instead. `codegen/coverage_test.ts`
checks every client-callable endpoint is wrapped exactly once.

Not wrapped: the four endpoints Ashby calls on assessment partners
(`assessment.start`, `assessment.list`, `assessment.cancel`,
`customFields.fetch`) and the deprecated aliases `application.change_stage` /
`application.change_source`.

## Publishing

```bash
for d in candidates jobs interviews offers sourcing surveys organization; do
  (cd "$d" && swamp extension push manifest.yaml --yes)
done
```

## License

MIT — see [LICENSE.txt](LICENSE.txt).
