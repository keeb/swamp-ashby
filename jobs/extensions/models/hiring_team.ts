// Auto-generated extension model for @keeb/ashby/jobs/hiring-team
// Do not edit manually. Re-generate with: deno task generate

// deno-lint-ignore-file no-explicit-any

/**
 * Swamp extension model for an Ashby hiring team.
 *
 * Wraps Ashby's `hiringTeam.*` endpoints as a swamp model so they can be
 * driven through `swamp model`.
 *
 * @module
 */

import { z } from "npm:zod@4.3.6";
import { action } from "./_lib/ashby.ts";

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
}).passthrough();

const InputsSchema = z.object({
  apiKey: z.string().meta({ sensitive: true }).optional(),
  apiVersion: z.string().optional(),
  onBehalfOf: z.string().optional(),
});

/** Swamp extension model for an Ashby hiring team. Registered at `@keeb/ashby/jobs/hiring-team`. */
export const model = {
  type: "@keeb/ashby/jobs/hiring-team",
  version: "2026.10.29.1",
  globalArguments: GlobalArgsSchema,
  inputsSchema: InputsSchema,
  resources: {
    state: {
      description: "Ashby hiring team state",
      schema: ResourceSchema,
      lifetime: "infinite",
      garbageCollection: 10,
    },
    hiring_team_action: {
      description: "Ashby hiring team action result, one per action",
      schema: ActionResultSchema,
      lifetime: "infinite",
      garbageCollection: 5,
    },
  },
  methods: {
    add_member: {
      description:
        "hiringTeam.addMember: Adds an Ashby user to the hiring team at the application, job, or opening level. Requires the `organizationWrite` permission.",
      arguments: z.object({
        applicationId: z.string().nullable().describe(
          "The application to assign the user a role on",
        ).optional(),
        jobId: z.string().nullable().describe(
          "The job to assign the user a role on",
        ).optional(),
        openingId: z.string().nullable().describe(
          "The opening to assign the user a role on",
        ).optional(),
        teamMemberId: z.string().describe(
          "The id of the user to assign the role to",
        ),
        roleId: z.string().describe("The id of the hiring team role to assign"),
      }),
      execute: async (args: Record<string, any>, context: any) => {
        const g = context.globalArgs;
        const opts = {
          apiKey: g.apiKey,
          apiVersion: g.apiVersion,
          onBehalfOf: g.onBehalfOf,
        };
        context.logger?.info("{method}: calling {operation}", {
          method: "add_member",
          operation: "hiringTeam.addMember",
        });
        const result = await action("hiringTeam.addMember", args, opts);
        const handle = await context.writeResource(
          "hiring_team_action",
          "add_member",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
    remove_member: {
      description:
        "hiringTeam.removeMember: Removes an Ashby user from the hiring team at the application, job, or opening level. Requires the `organizationWrite` permission.",
      arguments: z.object({
        applicationId: z.string().nullable().describe(
          "The application to unassign the user role from",
        ).optional(),
        jobId: z.string().nullable().describe(
          "The job to unassign the user role from",
        ).optional(),
        openingId: z.string().nullable().describe(
          "The opening to unassign the user role from",
        ).optional(),
        teamMemberId: z.string().describe(
          "The id of the user to unassign the role from",
        ),
        roleId: z.string().describe(
          "The id of the hiring team role to unassign from",
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
          method: "remove_member",
          operation: "hiringTeam.removeMember",
        });
        const result = await action("hiringTeam.removeMember", args, opts);
        const handle = await context.writeResource(
          "hiring_team_action",
          "remove_member",
          result,
        );
        return { dataHandles: [handle] };
      },
    },
  },
};
