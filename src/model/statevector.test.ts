import { describe, expect, it } from "vitest";
import { basis, filterPass, hadamard, mark, mean, measure, probabilities, reflect, rotate, uniform, type Amps } from "./statevector";
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

describe("поворот кубита (глава «Кубит»)", () => {
  it("поворот «0» на четверть прямого угла даёт ту же смесь, что Адамар: шансы пополам", () => {
    close(rotate(basis(1), 0, Math.PI / 4), hadamard(basis(1), 0));
  });
  it("второй такой поворот приводит точно в «1»: пути в «0» гасят друг друга", () => {
    close(rotate(rotate(basis(1), 0, Math.PI / 4), 0, Math.PI / 4), basis(1, 1));
  });
  it("поворот не меняет длину стрелки", () => {
    expect(norm(rotate([0.6, 0.8], 0, 1.234))).toBeCloseTo(1, 12);
  });
});

describe("фильтр для фотона-кубита", () => {
  it("фильтр «1» пропускает с шансом квадрата амплитуды «1»", () => {
    const a = rotate(basis(1), 0, Math.PI / 3);
    expect(filterPass(a, Math.PI / 2)).toBeCloseTo(probabilities(a)[1], 12);
  });
  it("фильтр вдоль стрелки пропускает всегда, поперёк — никогда", () => {
    const a = rotate(basis(1), 0, 0.7);
    expect(filterPass(a, 0.7)).toBeCloseTo(1, 12);
    expect(filterPass(a, 0.7 + Math.PI / 2)).toBeCloseTo(0, 12);
  });
});
