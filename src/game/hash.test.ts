import { describe, expect, it } from "vitest";
import { chapters } from "./chapters";
import { hashOf, parseHash } from "./hash";

describe("ссылки на главы", () => {
  it("каждая глава открывается по своей ссылке", () => {
    for (const c of chapters) expect(parseHash(hashOf(c.id))).toBe(c.id);
  });
  it("пролог, глава и финал", () => {
    expect(parseHash("#prologue")).toBe("ch0");
    expect(parseHash("#chapter-3")).toBe("ch3");
    expect(parseHash("#finale")).toBe("ch7");
  });
  it.each(["#chapter-9", "", "#chapter-", "#", "#Chapter-3"])("незнакомая ссылка %j → null", (h) => {
    expect(parseHash(h)).toBeNull();
  });
});
