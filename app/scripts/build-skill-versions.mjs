import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/*
 * RePoE has no "added in version" field, but its data repo keeps a git
 * history of skill_gems.json. We take the last export of each PoE2 minor
 * release (0.1 .. 0.5) and record the first one that contains a released gem.
 *
 * Client builds are numbered 4.x.y.z; the game's patch is 0.x (4.3.* is 0.3).
 * Exports from before client versions were recorded are dated instead.
 */
const REPO = "repoe-fork/poe2";
const GEM_PATHS = ["skill_gems.json", "data/skill_gems.json"];

/** Patch 0.2.0 shipped on 2025-04-04; 0.3.0 on 2025-08-29. Earlier exports are 0.1.x. */
const RELEASE_0_2_MS = Date.UTC(2025, 3, 4);
const RELEASE_0_3_MS = Date.UTC(2025, 7, 29);

/** "4.3.1.1" -> "0.3"; null when the text is not a client version. */
export function minorFromClientVersion(text) {
  const match = /^4\.(\d+)\./.exec(text?.trim() ?? "");
  return match ? `0.${match[1]}` : null;
}

/** Minor release for an export without a recorded client version. */
export function minorFromDate(dateMs) {
  if (dateMs < RELEASE_0_2_MS) return "0.1";
  if (dateMs < RELEASE_0_3_MS) return "0.2";
  return null;
}

/** gem id -> released? for either of the two historical file formats. */
export function releasedGems(json) {
  const entries = Array.isArray(json) ? json : Object.values(json);
  const byId = new Map();
  const byName = new Map();
  for (const entry of entries) {
    const base = entry?.base_item;
    if (!base?.id) continue;
    const released = (base.release_state ?? "released") === "released";
    byId.set(base.id, released);
    if (base.display_name) byName.set(base.display_name, released);
  }
  return { byId, byName };
}

const compareMinor = (a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]);

/**
 * snapshots: [{ minor: "0.1", gems: releasedGems(...) }]; returns Map id -> minor.
 * A gem renamed or re-keyed between versions is matched by display name.
 */
export function firstReleasedMinor(snapshots, currentGems, currentMinor) {
  const ordered = [...snapshots].sort((a, b) => compareMinor(a.minor, b.minor));
  const result = new Map();
  for (const [id, entry] of Object.entries(currentGems)) {
    const name = entry?.base_item?.display_name;
    const seen = ordered.find(
      (snapshot) =>
        snapshot.gems.byId.get(id) === true ||
        (name !== undefined && snapshot.gems.byName.get(name) === true),
    );
    result.set(id, seen ? seen.minor : currentMinor);
  }
  return result;
}

const headers = { "User-Agent": "poe2dle-data-build" };

async function getJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

async function commitsFor(path) {
  const all = [];
  for (let page = 1; page < 10; page++) {
    const batch = await getJson(
      `https://api.github.com/repos/${REPO}/commits?per_page=100&page=${page}&path=${path}`,
    );
    if (batch.length === 0) break;
    all.push(...batch.map((commit) => ({ ...commit, path })));
  }
  return all;
}

async function rawAt(sha, path) {
  const res = await fetch(
    `https://raw.githubusercontent.com/${REPO}/${sha}/${path}`,
    { headers },
  );
  return res.ok ? res.text() : null;
}

/** The newest export of every minor release (a cumulative superset of that release). */
async function lastExportPerMinor() {
  const commits = (await Promise.all(GEM_PATHS.map(commitsFor)))
    .flat()
    .sort((a, b) => a.commit.author.date.localeCompare(b.commit.author.date));
  const latest = new Map();
  for (const commit of commits) {
    const fromVersion = minorFromClientVersion(
      (await rawAt(commit.sha, "version.txt")) ?? "",
    );
    const minor =
      fromVersion ?? minorFromDate(Date.parse(commit.commit.author.date));
    if (minor) latest.set(minor, commit);
  }
  return latest;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] === thisFile) {
  const projectRoot = dirname(dirname(dirname(thisFile)));
  const current = JSON.parse(
    readFileSync(join(projectRoot, "data", "skill_gems.json"), "utf8"),
  );
  const exports = await lastExportPerMinor();
  // The newest export is the release the local data file comes from.
  const currentMinor = [...exports.keys()].sort(compareMinor).at(-1);
  if (!currentMinor) throw new Error("No exports found");

  const snapshots = [];
  for (const [minor, commit] of exports) {
    if (minor === currentMinor) continue; // the current data covers it
    const text = await rawAt(commit.sha, commit.path);
    if (text === null) throw new Error(`Missing ${commit.path} at ${commit.sha}`);
    snapshots.push({ minor, gems: releasedGems(JSON.parse(text)) });
    console.log(`  ${minor}: ${commit.sha.slice(0, 8)} (${commit.commit.author.date.slice(0, 10)})`);
  }

  const versions = firstReleasedMinor(snapshots, current, currentMinor);
  const sorted = Object.fromEntries([...versions].sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(
    join(projectRoot, "data", "skill_versions.json"),
    `${JSON.stringify(sorted, null, 1)}\n`,
  );
  const counts = {};
  for (const minor of versions.values()) counts[minor] = (counts[minor] ?? 0) + 1;
  console.log(`Wrote ${versions.size} gem versions to data/skill_versions.json`, counts);
}
