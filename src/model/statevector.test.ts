import { describe, expect, it } from "vitest";
import { basis, mark, mean, measure, probabilities, reflect, uniform, type Amps } from "./statevector";
import { groverSuccess } from "./tick";

const close = (a: Amps, b: Amps) => a.forEach((x, i) => expect(x).toBeCloseTo(b[i], 12));
const norm = (a: Amps) => probabilities(a).reduce((s, p) => s + p, 0);

describe("симулятор пинбола, 3 кубита", () => {
  it("равная суперпозиция: все амплитуды 1/√8", () => {
    close(uniform(3), new Array(8).fill(1 / Math.sqrt(8)));
  });
  it("«Отражение» без «Метки» ничего не меняет", () => {
    close(reflect(uniform(3)), uniform(3));
  });
  it("«Отражение» из гейтов — это отражение относительно среднего", () => {
    const a = [0.1, -0.4, 0.3, 0.2, -0.5, 0.6, 0.05, -0.25];
    close(
      reflect(a),
      a.map((x) => 2 * mean(a) - x),
    );
  });
  it.each([0, 1, 2, 3, 4])("%i пар «Метка → Отражение» дают шанс по формуле Гровера", (k) => {
    for (let target = 0; target < 8; target++) {
      let a = uniform(3);
      for (let i = 0; i < k; i++) a = reflect(mark(a, target));
      expect(probabilities(a)[target]).toBeCloseTo(groverSuccess(8, k), 12);
      expect(norm(a)).toBeCloseTo(1, 12);
    }
  });
  it("измерение выбирает по накопленным вероятностям", () => {
    expect(measure(basis(3, 5), () => 0)).toBe(5);
    expect(measure(uniform(3), () => 0)).toBe(0);
    expect(measure(uniform(3), () => 0.999999)).toBe(7);
  });
});
