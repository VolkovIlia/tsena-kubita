import { describe, expect, it } from "vitest";
import { answer, canAdvance, isCorrect } from "./flow";
import type { Ctx, Slide } from "./types";

const empty = (): Ctx => ({ answers: {}, scene: {} });
const bet = (correct?: () => string): Slide => ({
  id: "b",
  act: { kind: "bet", id: "safe", options: [{ id: "a", label: () => "А" }, { id: "b", label: () => "Б" }], correct },
});

describe("переходы между слайдами", () => {
  it("ставку не пропустить кнопкой — двигает только ответ", () => {
    expect(canAdvance(bet(), true)).toBe(false);
  });
  it("слайд со сценой открывается только после действия в сцене", () => {
    const s: Slide = { id: "s", act: { kind: "scene" } };
    expect(canAdvance(s, false)).toBe(false);
    expect(canAdvance(s, true)).toBe(true);
  });
  it("обычный слайд — всегда", () => {
    expect(canAdvance({ id: "n", act: { kind: "next" } }, false)).toBe(true);
  });
});

describe("ответы", () => {
  it("answer не меняет исходный ctx", () => {
    const before = empty();
    const after = answer(before, "safe", "a");
    expect(after.answers).toEqual({ safe: "a" });
    expect(before.answers).toEqual({});
  });
  it("верность ставки сверяется с правильным ответом", () => {
    expect(isCorrect(bet(() => "b"), empty(), "a")).toBe(false);
    expect(isCorrect(bet(() => "b"), empty(), "b")).toBe(true);
  });
  it("ставка-мнение без правильного ответа считается верной", () => {
    expect(isCorrect(bet(), empty(), "a")).toBe(true);
  });
});
