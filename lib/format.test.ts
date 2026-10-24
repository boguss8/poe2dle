import { describe, expect, it } from "vitest";
import { prettyLabel } from "./format";

describe("prettyLabel", () => {
  it("capitalises the first letter and turns underscores into spaces", () => {
    expect(prettyLabel("projectile")).toBe("Projectile");
    expect(prettyLabel("area_damage")).toBe("Area damage");
    expect(prettyLabel("")).toBe("");
  });
});
