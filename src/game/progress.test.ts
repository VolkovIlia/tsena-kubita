import { describe, expect, it } from "vitest";
import { enter, finish, initial, isProgress, recordBet } from "./progress";

describe("вход по ссылке", () => {
  it("в главу 4 с нуля: правила 1–3 и полная вера Марго", () => {
    const { progress, granted } = enter(initial(), "ch4");
    expect(granted).toEqual(["r1", "r2", "r3"]);
    expect(progress.notebook).toEqual(["r1", "r2", "r3"]);
    expect(progress.hype).toBe(100);
    expect(progress.day).toBe("thu");
  });
  it("в главу 5 с нуля: вера Марго уже подорвана", () => {
    expect(enter(initial(), "ch5").progress.hype).toBe(40);
  });
  it("в финал: Марго разобралась", () => {
    expect(enter(initial(), "ch7").progress.informed).toBe(true);
  });
  it("после прохождения главы 3 ничего не выдаётся и hype сохраняется", () => {
    const start = { ...enter(initial(), "ch3").progress, hype: 77 };
    const after3 = { ...finish(start, "ch3"), hype: 77 };
    const { progress, granted } = enter(after3, "ch4");
    expect(granted).toEqual([]);
    expect(progress.hype).toBe(77);
  });
});

describe("конец главы", () => {
  it("глава 4: правило 4 в блокнот, hype падает до 40, глава отмечена один раз", () => {
    const p = finish(finish(enter(initial(), "ch4").progress, "ch4"), "ch4");
    expect(p.notebook).toEqual(["r1", "r2", "r3", "r4"]);
    expect(p.hype).toBe(40);
    expect(p.done).toEqual(["ch4"]);
  });
});

describe("ставки и загрузка", () => {
  it("повтор ставки заменяет прежнюю", () => {
    const p = recordBet(recordBet(initial(), { chapter: "ch3", id: "repeats", correct: false }), {
      chapter: "ch3",
      id: "repeats",
      correct: true,
    });
    expect(p.bets).toEqual([{ chapter: "ch3", id: "repeats", correct: true }]);
  });
  it("форма сохранения", () => {
    expect(isProgress(initial())).toBe(true);
    expect(isProgress({})).toBe(false);
    expect(isProgress({ ...initial(), notebook: ["r9"] })).toBe(false);
    expect(isProgress({ ...initial(), day: "monday" })).toBe(false);
  });
});
