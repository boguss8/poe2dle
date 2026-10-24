import { describe, expect, it } from "vitest";
import {
  firstReleasedMinor,
  minorFromClientVersion,
  minorFromDate,
  releasedGems,
} from "./build-skill-versions.mjs";

const gem = (id, name, state = "released") => ({
  base_item: { id, display_name: name, release_state: state },
});

describe("minorFromClientVersion", () => {
  it("maps client builds 4.x.* to game patch 0.x", () => {
    expect(minorFromClientVersion("4.3.1.1")).toBe("0.3");
    expect(minorFromClientVersion("4.5.5.2\n")).toBe("0.5");
    expect(minorFromClientVersion("")).toBeNull();
    expect(minorFromClientVersion("3.29.3.3")).toBeNull();
  });
});

describe("minorFromDate", () => {
  it("assigns pre-version exports to 0.1 and 0.2 and leaves later ones to version.txt", () => {
    expect(minorFromDate(Date.UTC(2025, 1, 22))).toBe("0.1");
    expect(minorFromDate(Date.UTC(2025, 5, 7))).toBe("0.2");
    expect(minorFromDate(Date.UTC(2025, 9, 1))).toBeNull();
  });
});

describe("releasedGems", () => {
  it("reads both the list and the dictionary file formats", () => {
    const fromList = releasedGems([gem("a", "A"), gem("b", "B", "unreleased")]);
    const fromDict = releasedGems({ a: gem("a", "A"), b: gem("b", "B", "unreleased") });
    for (const parsed of [fromList, fromDict]) {
      expect(parsed.byId.get("a")).toBe(true);
      expect(parsed.byId.get("b")).toBe(false);
      expect(parsed.byName.get("A")).toBe(true);
    }
  });

  it("treats a missing release state as released", () => {
    const parsed = releasedGems([{ base_item: { id: "a", display_name: "A" } }]);
    expect(parsed.byId.get("a")).toBe(true);
  });
});

describe("firstReleasedMinor", () => {
  const snapshots = [
    { minor: "0.2", gems: releasedGems([gem("old", "Old"), gem("mid", "Mid")]) },
    { minor: "0.1", gems: releasedGems([gem("old", "Old"), gem("hidden", "Hidden", "unreleased")]) },
  ];
  const current = {
    old: gem("old", "Old"),
    mid: gem("mid", "Mid"),
    hidden: gem("hidden", "Hidden"),
    fresh: gem("fresh", "Fresh"),
    renamed: gem("renamed-id", "Old"),
  };

  it("returns the earliest release that contained each released gem", () => {
    const result = firstReleasedMinor(snapshots, current, "0.5");
    expect(result.get("old")).toBe("0.1");
    expect(result.get("mid")).toBe("0.2");
  });

  it("ignores unreleased entries and defaults new gems to the current release", () => {
    const result = firstReleasedMinor(snapshots, current, "0.5");
    expect(result.get("hidden")).toBe("0.5");
    expect(result.get("fresh")).toBe("0.5");
  });

  it("matches a re-keyed gem by display name", () => {
    expect(firstReleasedMinor(snapshots, current, "0.5").get("renamed")).toBe("0.1");
  });
});
