import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPOE_BASE = "https://repoe-fork.github.io/poe2";
export const GEM_FILE = "skill_gems.json";

/** Download the RePoE-fork gem data into destRoot. */
export async function fetchData(destRoot, fetchImpl = fetch) {
  mkdirSync(destRoot, { recursive: true });
  const res = await fetchImpl(`${REPOE_BASE}/${GEM_FILE}`);
  if (!res.ok) throw new Error(`Failed to fetch ${GEM_FILE}: ${res.status}`);
  writeFileSync(join(destRoot, GEM_FILE), await res.text());
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] === thisFile) {
  const projectRoot = dirname(dirname(dirname(thisFile)));
  await fetchData(join(projectRoot, "data"));
  console.log(`Fetched ${GEM_FILE} to data/`);
}
