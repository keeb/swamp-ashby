/**
 * Refresh spec/ashby-openapi.json from Ashby's developer docs.
 *
 *   ~/.swamp/deno/deno run --allow-net=developers.ashbyhq.com --allow-write=spec scripts/fetch-spec.ts
 *
 * Ashby does not publish a single OpenAPI document. Each reference page
 * (listed in https://developers.ashbyhq.com/llms.txt) embeds a complete
 * OpenAPI 3.1 fragment for its endpoint, components included. This fetches
 * every page and merges the fragments. Run scripts/generate.ts afterwards.
 */
const BASE = "https://developers.ashbyhq.com";
const root = new URL("..", import.meta.url).pathname;

// fetchPage is hoisted; the index is subject to the same rate limit.
const index = await fetchPage(`${BASE}/llms.txt`);
const urls = [
  ...new Set(
    [...index.matchAll(
      /\((https:\/\/developers\.ashbyhq\.com\/reference\/[a-z0-9_-]+\.md)\)/g,
    )]
      .map((m) => m[1]),
  ),
].sort();

// deno-lint-ignore no-explicit-any
const merged: Record<string, any> = {
  openapi: "3.1.0",
  info: {},
  paths: {},
  components: { schemas: {}, securitySchemes: {} },
};
// deno-lint-ignore no-explicit-any
const tags = new Map<string, any>();
let fragments = 0;

// The docs host rate-limits bursts with 429s, so fetch one page at a time and
// honor Retry-After.
async function fetchPage(url: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await fetch(url);
    if (res.ok) return await res.text();
    await res.body?.cancel();
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : Math.min(60_000, 2000 * 2 ** attempt);
    console.error(`${url}: HTTP ${res.status}, retrying in ${waitMs / 1000}s`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  throw new Error(`could not fetch ${url}`);
}

const pages: string[] = [];
for (const url of urls) pages.push(await fetchPage(url));
for (const text of pages) {
  const m = text.match(/# OpenAPI definition\s+```json\n([\s\S]*?)\n```/);
  if (!m) continue;
  const spec = JSON.parse(m[1]);
  fragments++;
  merged.info = spec.info;
  merged.servers = spec.servers;
  for (const t of spec.tags ?? []) tags.set(t.name, t);
  for (const [p, v] of Object.entries(spec.paths ?? {})) {
    merged.paths[p] = { ...(merged.paths[p] ?? {}), ...(v as object) };
  }
  for (const [k, v] of Object.entries(spec.components ?? {})) {
    merged.components[k] = {
      ...(merged.components[k] ?? {}),
      ...(v as object),
    };
  }
  for (const [k, v] of Object.entries(spec.webhooks ?? {})) {
    merged.webhooks = { ...(merged.webhooks ?? {}), [k]: v };
  }
}
// A partial fetch must never replace a good spec: the generator would
// faithfully delete every model the missing pages described.
if (urls.length < 100 || Object.keys(merged.paths).length < 100) {
  throw new Error(
    `refusing to write spec: only ${urls.length} pages / ${
      Object.keys(merged.paths).length
    } paths found`,
  );
}

merged.tags = [...tags.values()].sort((a, b) => a.name.localeCompare(b.name));
merged.paths = Object.fromEntries(
  Object.entries(merged.paths).sort(([a], [b]) => a.localeCompare(b)),
);
merged.components.schemas = Object.fromEntries(
  Object.entries(merged.components.schemas).sort(([a], [b]) =>
    a.localeCompare(b)
  ),
);

await Deno.writeTextFile(
  `${root}spec/ashby-openapi.json`,
  JSON.stringify(merged, null, 2) + "\n",
);
console.log(
  `${urls.length} pages, ${fragments} fragments, ${
    Object.keys(merged.paths).length
  } paths, ${
    Object.keys(merged.components.schemas).length
  } schemas (API version ${merged.info.version})`,
);
