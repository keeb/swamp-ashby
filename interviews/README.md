# @keeb/ashby/interviews

Auto-generated [swamp](https://github.com/swamp-club/swamp) extension models for
the [Ashby](https://www.ashbyhq.com) ATS API — interviews, interview plans and
stages, schedules and events, briefings, interviewer pools, feedback forms,
take-home assignments and notetaker transcripts.

Each model represents one Ashby resource. Models have **domain properties** that
you configure (the desired state, as global arguments) and **resource
properties** that reflect the live state in Ashby. Standard methods, where the
resource supports them:

- **create** — create the resource from the configured properties
- **get** — fetch one record and store it as the model's state
- **lookup** — list the collection and record each result as a data artifact,
  plus a `<resource>_lookup` record with coverage and the sync token
- **update** — apply property changes to the stored resource
- **delete** — remove the resource (an absent one is recorded as `not_found`)
- **sync** — refresh the stored resource from Ashby

Every other Ashby endpoint is an action named after it in snake_case
(`candidate.addTag` → `add_tag`), writing to `<resource>_action`.

| Model                                             | Methods                                                                                      |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `@keeb/ashby/interviews/interview`                | `get`, `lookup`, `sync`                                                                      |
| `@keeb/ashby/interviews/interview-plan`           | `lookup`                                                                                     |
| `@keeb/ashby/interviews/interview-stage`          | `get`, `lookup`, `sync`                                                                      |
| `@keeb/ashby/interviews/interview-stage-group`    | `lookup`                                                                                     |
| `@keeb/ashby/interviews/interview-schedule`       | `create`, `lookup`, `update`, `cancel`                                                       |
| `@keeb/ashby/interviews/interview-event`          | `lookup`                                                                                     |
| `@keeb/ashby/interviews/interview-briefing`       | `get`                                                                                        |
| `@keeb/ashby/interviews/interviewer-pool`         | `create`, `get`, `lookup`, `update`, `sync`, `add_user`, `archive`, `remove_user`, `restore` |
| `@keeb/ashby/interviews/job-interview-plan`       | `get`                                                                                        |
| `@keeb/ashby/interviews/feedback-form-definition` | `get`, `lookup`, `sync`                                                                      |
| `@keeb/ashby/interviews/take-home-assignment`     | `get`, `lookup`, `sync`                                                                      |
| `@keeb/ashby/interviews/notetaker-transcript`     | `get`, `sync`                                                                                |

Use `swamp model type describe <type>` for every argument and property.

## Authentication

Ashby uses HTTP Basic with the API key as the username. Set it in the
environment:

```bash
export ASHBY_API_KEY=your-api-key
```

### Vault-wireable credentials

Each model also accepts an optional, sensitive `apiKey` global argument that
takes precedence over the environment variable and can be wired with a
`vault.get(...)` expression:

```yaml
globalArgs:
  apiKey: ${{ vault.get("default", "ASHBY_API_KEY") }}
```

`apiVersion` pins the `Ashby-Version` header and `onBehalfOf` sets
`X-On-Behalf-Of` for endpoints that act as a user.

## Quick start

```bash
# Install the extension
swamp extension pull @keeb/ashby/interviews

# Create a model instance
swamp model create @keeb/ashby/interviews/interviewer-pool my-interviewer-pool \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'

# Record every interviewer pool as data
swamp model method run my-interviewer-pool lookup
```

## Errors and limits

Ashby reports most failures as `200 { success: false }`; those throw, with
Ashby's error code and request id in the message. 429 and 5xx responses are
retried honouring `Retry-After`. `lookup` stops at `max_items` (default 500) and
says so in its coverage record rather than returning a silent prefix.

Generated from Ashby's OpenAPI spec (API version 2026-01-01) by
[swamp-ashby](https://github.com/keeb/swamp-ashby).

## License

MIT — see [LICENSE.txt](./LICENSE.txt).
