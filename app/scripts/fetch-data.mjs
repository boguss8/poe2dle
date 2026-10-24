import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR, isMain } from "./paths.mjs";

const REPOE_BASE = "https://repoe-fork.github.io/poe2";

/**
 * Files to mirror: `dir` is relative to the project's data folder.
 * `skills.json` is ~27 MB, so it lives in the git-ignored `data/raw/`.
 */
const DATA_FILES = [
  { name: "skill_gems.json", dir: "." },
  { name: "skills.json", dir: "raw" },
];

/** Download the RePoE-fork data files into destRoot (the project's `data/` folder). */
export async function fetchData(destRoot, fetchImpl = fetch) {
  for (const file of DATA_FILES) {
    const dir = join(destRoot, file.dir);
    mkdirSync(dir, { recursive: true });
    const res = await fetchImpl(`${REPOE_BASE}/${file.name}`);
    if (!res.ok) throw new Error(`Failed to fetch ${file.name}: ${res.status}`);
    writeFileSync(join(dir, file.name), await res.text());
  }
}

if (isMain(import.meta.url)) {
  await fetchData(DATA_DIR);
  console.log(
    `Fetched ${DATA_FILES.map((f) => f.name).join(", ")} to data/ (skills.json in data/raw/)`,
  );
}
