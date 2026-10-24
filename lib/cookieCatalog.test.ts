import { describe, expect, it } from "vitest";
import { COOKIES } from "./cookieCatalog";

describe("cookie catalog", () => {
  const entries = Object.values(COOKIES);

  it("lists each cookie once, with a cookie-safe name and a purpose", () => {
    expect(new Set(entries.map((cookie) => cookie.name)).size).toBe(entries.length);
    for (const cookie of entries) {
      expect(cookie.name).toMatch(/^poe2dle_[a-z_]+$/);
      expect(cookie.purpose.length).toBeGreaterThan(10);
    }
  });
});
