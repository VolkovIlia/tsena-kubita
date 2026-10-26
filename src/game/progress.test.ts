import { describe, expect, it } from "vitest";
import { enter, finish, initial, isProgress, recordBet } from "./progress";

describe("вход по ссылке", () => {
  it("в главу «Видеокарта» с нуля: выданы правила трёх предыдущих глав", () => {
    const { progress, granted } = enter(initial(), "ch4");
    expect(granted).toEqual(["r1", "r2", "r3"]);
    expect(progress.notebook).toEqual(["r1", "r2", "r3"]);
  });
  it("пройденное не выдаётся повторно, недостающее — по порядку глав", () => {
    const p = { ...initial(), notebook: ["r2" as const] };
    expect(enter(p, "ch4").granted).toEqual(["r1", "r3"]);
    expect(enter(p, "ch4").progress.notebook).toEqual(["r1", "r2", "r3"]);
    expect(enter(enter(p, "ch4").progress, "ch4").granted).toEqual([]);
  });
  it("в пролог ничего не выдаётся", () => {
    expect(enter(initial(), "ch0").granted).toEqual([]);
  });
});

describe("конец главы", () => {
  it("«Гонка»: правило r7 в блокнот, глава отмечена один раз", () => {
    const p = finish(finish(enter(initial(), "ch7").progress, "ch7"), "ch7");
    expect(p.notebook).toEqual(["r1", "r2", "r3", "r4", "r5", "r6", "r7"]);
    expect(p.done).toEqual(["ch7"]);
  });
  it("финал без правила только отмечается", () => {
    const p = finish(initial(), "ch10");
    expect(p.notebook).toEqual([]);
    expect(p.done).toEqual(["ch10"]);
  });
});

describe("ставки и загрузка", () => {
  it("повтор ставки заменяет прежнюю", () => {
    const p = recordBet(recordBet(initial(), { chapter: "ch6", id: "repeats", correct: false }), {
      chapter: "ch6",
      id: "repeats",
      correct: true,
    });
    expect(p.bets).toEqual([{ chapter: "ch6", id: "repeats", correct: true }]);
  });
  it("форма сохранения: старая неделя с верой и неизвестные правила отвергаются", () => {
    expect(isProgress(initial())).toBe(true);
    expect(isProgress({ ...initial(), prologueAnswer: "soon", notebook: ["r9"] })).toBe(true);
    expect(isProgress({})).toBe(false);
    expect(isProgress({ ...initial(), hype: 100 })).toBe(false);
    expect(isProgress({ ...initial(), notebook: ["r10"] })).toBe(false);
    expect(isProgress({ ...initial(), prologueAnswer: "all" })).toBe(false);
    expect(isProgress({ ...initial(), night: { cartoon: "gpu" } })).toBe(true);
    expect(isProgress({ ...initial(), night: { cartoon: "oracle" } })).toBe(false);
    const { night: _, ...withoutNight } = initial();
    expect(isProgress(withoutNight)).toBe(false);
  });
});
