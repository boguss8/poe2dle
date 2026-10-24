import { describe, expect, it } from "vitest";
import { compareSkills } from "./compare";
import { makeSkill } from "./fixtures";
import { shareText } from "./share";

const answer = makeSkill({ id: "answer" });
const results = [
  compareSkills(answer, answer),
  compareSkills(makeSkill({ id: "miss", category: "spell", tier: 2 }), answer),
];

describe("shareText", () => {
  it("lists rows oldest first, one square per clue column", () => {
    const lines = shareText(7, "won", results, "https://example.test").split("\n");
    expect(lines[0]).toBe("PoE2dle Skill #7 — solved in 2 guesses");
    const [first, second] = lines.slice(2, 4);
    expect([...first].length).toBeGreaterThan(0);
    expect(first).toContain("🟥");
    expect(first).toContain("⬆️");
    expect(second).toBe("🟩".repeat(10));
    expect(lines.at(-1)).toBe("https://example.test");
  });

  it("notes how many hints were used", () => {
    expect(shareText(7, "won", results, "u", 2).split("\n")[0]).toBe(
      "PoE2dle Skill #7 — solved in 2 guesses 💡2",
    );
    expect(shareText(7, "gave_up", results, "u").split("\n")[0]).toBe(
      "PoE2dle Skill #7 — gave up after 2",
    );
  });
});
