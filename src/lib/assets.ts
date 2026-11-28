import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The Worker's static-asset binding, or undefined while prerendering and in local Next.js. */
export function getAssets() {
  try {
    return getCloudflareContext().env.ASSETS;
  } catch {
    return undefined;
  }
}

/**
 * Reads a JSON file from /public. On Cloudflare it comes from the static
 * assets (so it is not bundled into the Worker); elsewhere from disk.
 */
export async function readPublicJson(path: string, assets = getAssets()): Promise<unknown> {
  if (assets) {
    const response = await assets.fetch(`https://assets.internal${path}`);
    if (!response.ok) throw new Error(`Asset ${path} returned HTTP ${response.status}`);
    return response.json();
  }
  return JSON.parse(await readFile(join(process.cwd(), "public", path), "utf8"));
}
