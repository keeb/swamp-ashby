# @keeb/ashby/candidates

Auto-generated [swamp](https://github.com/swamp-club/swamp) extension models for
the [Ashby](https://www.ashbyhq.com) ATS API — candidates, tags, applications
and their history, feedback, application forms, referrals, assessments and file
uploads.

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

| Model                                                 | Methods                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@keeb/ashby/candidates/candidate`                    | `create`, `get`, `lookup`, `update`, `sync`, `add_email_message`, `add_project`, `add_tag`, `anonymize`, `create_note`, `get_recent_email_messages`, `list_client_info`, `list_fraud_checks`, `list_notes`, `list_projects`, `push_to_hris`, `remove_project`, `remove_tag`, `search`, `search_suggestions`, `set_fraud_status`, `upload_file`, `upload_resume` |
| `@keeb/ashby/candidates/candidate-tag`                | `create`, `lookup`, `archive`                                                                                                                                                                                                                                                                                                                                   |
| `@keeb/ashby/candidates/application`                  | `create`, `get`, `lookup`, `update`, `delete`, `sync`, `add_hiring_team_member`, `change_source`, `change_stage`, `list_criteria_evaluations`, `list_history`, `remove_hiring_team_member`, `transfer`, `update_history`                                                                                                                                        |
| `@keeb/ashby/candidates/application-feedback`         | `lookup`, `submit`                                                                                                                                                                                                                                                                                                                                              |
| `@keeb/ashby/candidates/application-feedback-request` | `create`                                                                                                                                                                                                                                                                                                                                                        |
| `@keeb/ashby/candidates/application-form`             | `submit`                                                                                                                                                                                                                                                                                                                                                        |
| `@keeb/ashby/candidates/application-hiring-team-role` | `lookup`                                                                                                                                                                                                                                                                                                                                                        |
| `@keeb/ashby/candidates/referral`                     | `create`, `lookup`, `delete`                                                                                                                                                                                                                                                                                                                                    |
| `@keeb/ashby/candidates/referral-form`                | `get`                                                                                                                                                                                                                                                                                                                                                           |
| `@keeb/ashby/candidates/assessment`                   | `add_completed_to_candidate`, `update_action`                                                                                                                                                                                                                                                                                                                   |
| `@keeb/ashby/candidates/file`                         | `get`, `create_file_upload_handle`, `upload`                                                                                                                                                                                                                                                                                                                    |

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
swamp extension pull @keeb/ashby/candidates

# Create a model instance
swamp model create @keeb/ashby/candidates/candidate my-candidate \
  --global-arg 'apiKey=${{ vault.get("default", "ASHBY_API_KEY") }}'

# Record every candidate as data
swamp model method run my-candidate lookup
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
