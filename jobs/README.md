# @keeb/ashby/jobs

Auto-generated [swamp](https://github.com/swamp-club/swamp) extension models for
the [Ashby](https://www.ashbyhq.com) ATS API — jobs, job postings, openings,
locations, departments, hiring teams, approvals, job boards and templates.

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

| Model                                  | Methods                                                                                                                                                               |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@keeb/ashby/jobs/job`                 | `create`, `get`, `lookup`, `update`, `sync`, `search`, `set_status`, `start_approval_process`, `update_compensation`, `update_compensation_settings`                  |
| `@keeb/ashby/jobs/job-posting`         | `create`, `get`, `lookup`, `update`, `sync`, `set_custom_field_value`, `set_custom_field_values`, `set_status`, `update_compensation`, `update_compensation_settings` |
| `@keeb/ashby/jobs/job-template`        | `lookup`                                                                                                                                                              |
| `@keeb/ashby/jobs/job-board`           | `lookup`                                                                                                                                                              |
| `@keeb/ashby/jobs/opening`             | `create`, `get`, `lookup`, `update`, `sync`, `add_job`, `add_location`, `remove_job`, `remove_location`, `search`, `set_archived`, `set_opening_state`                |
| `@keeb/ashby/jobs/location`            | `create`, `get`, `lookup`, `sync`, `archive`, `move`, `restore`, `update_address`, `update_external_name`, `update_name`, `update_workplace_type`                     |
| `@keeb/ashby/jobs/department`          | `create`, `get`, `lookup`, `update`, `sync`, `archive`, `move`, `restore`                                                                                             |
| `@keeb/ashby/jobs/hiring-team`         | `add_member`, `remove_member`                                                                                                                                         |
| `@keeb/ashby/jobs/hiring-team-role`    | `lookup`                                                                                                                                                              |
| `@keeb/ashby/jobs/approval`            | `lookup`                                                                                                                                                              |
| `@keeb/ashby/jobs/approval-definition` | `update_action`                                                                                                                                                       |
| `@keeb/ashby/jobs/close-reason`        | `lookup`                                                                                                                                                              |

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
swamp extension pull @keeb/ashby/jobs

# Create a model instance
swamp model create @keeb/ashby/jobs/job my-job \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'

# Record every job as data
swamp model method run my-job lookup
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
