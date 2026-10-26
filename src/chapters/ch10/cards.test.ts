import { describe, expect, it } from "vitest";
import { cards, isRight } from "./cards";

describe("раздача задач в финале", () => {
  const card = (id: string) => cards.find((c) => c.id === id)!;
  it("на цепочке платежей и маршруте одно ядро и 64 ядра идут вровень — оба ответа верны", () => {
    for (const id of ["payments", "route"]) {
      expect(isRight(card(id), "core")).toBe(true);
      expect(isRight(card(id), "cores")).toBe(true);
      expect(isRight(card(id), "gpu")).toBe(false);
    }
  });
  it("без расчёта времени верна только лучшая машина", () => {
    expect(isRight(card("nitrogenase"), "qc")).toBe(true);
    expect(isRight(card("nitrogenase"), "gpu")).toBe(false);
  });
});
