import { describe, expect, it } from "vitest";
import { chapters } from "./chapters";
import { hashOf, parseHash } from "./hash";

describe("ссылки на главы", () => {
  it("11 глав, каждая открывается по своей ссылке", () => {
    expect(chapters).toHaveLength(11);
    for (const c of chapters) expect(parseHash(hashOf(c.id))).toBe(c.id);
  });
  it("пролог, глава и финал", () => {
    expect(parseHash("#prologue")).toBe("ch0");
    expect(parseHash("#chapter-9")).toBe("ch9");
    expect(parseHash("#finale")).toBe("ch10");
  });
  it.each(["#chapter-10", "#chapter-0", "", "#chapter-", "#", "#Chapter-3"])("незнакомая ссылка %j → null", (h) => {
    expect(parseHash(h)).toBeNull();
  });
});
