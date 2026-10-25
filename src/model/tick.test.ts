// Регрессионные тесты: числа, на которые опираются реплики сценария.
// Если тест упал после правки data/params.json — обновите и тексты в story/05_draft, и docs/.
import { describe, expect, it } from "vitest";
import { amdahl, crossover, DAY, groverOptimal, groverSuccess, loadSeconds, period, solveSeconds, stateVectorSize } from "./tick";

describe("гл. 4: точки пересечения (график концепта)", () => {
  it("против одного ядра: N≈1,8·10⁹, ≈18 с", () => {
    const c = crossover("master");
    expect(c.n / 1e9).toBeCloseTo(1.81, 1);
    expect(c.seconds).toBeCloseTo(18.1, 0);
  });
  it("против 64 ядер: N≈7,4·10¹², ≈19 мин", () => {
    const c = crossover("brigade");
    expect(c.n / 1e12).toBeCloseTo(7.42, 1);
    expect(c.seconds / 60).toBeCloseTo(19.3, 0);
  });
  it("против GPU: N≈4,5·10²⁰, ≈105 дней", () => {
    const c = crossover("factory");
    expect(c.n / 1e20).toBeCloseTo(4.53, 1);
    expect(Math.round(c.seconds / DAY)).toBe(105);
  });
});

describe("гл. 4: сейф на 10¹⁰ кодов", () => {
  it("Мастер ≈100 с, Оракул ≈43 с, Фабрика ≈0,2 мс", () => {
    expect(solveSeconds("master", 1e10)).toBeCloseTo(100, 5);
    expect(solveSeconds("oracle", 1e10)).toBeCloseTo(42.6, 0);
    expect(solveSeconds("factory", 1e10) * 1000).toBeCloseTo(0.2, 3);
  });
  it("Оракул ×100: 15 мин на проверке в 100 тиков, снова 105 дней на проверке в 10⁶ тиков", () => {
    expect(crossover("factory", 100, 100).seconds / 60).toBeCloseTo(15.1, 0);
    expect(Math.round(crossover("factory", 1e6, 100).seconds / DAY)).toBe(105);
  });
  it("проверка в 10⁴ тиков отодвигает финиш примерно на 29 лет", () => {
    expect(crossover("factory", 1e4).seconds / (365 * DAY)).toBeCloseTo(28.7, 0);
  });
});

describe("гл. 3: волновой пинбол, 8 дверей", () => {
  it("12,5% → 78% → 94,5% → 33%", () => {
    expect(groverSuccess(8, 0)).toBeCloseTo(0.125, 3);
    expect(groverSuccess(8, 1)).toBeCloseTo(0.781, 2);
    expect(groverSuccess(8, 2)).toBeCloseTo(0.945, 2);
    expect(groverSuccess(8, 3)).toBeCloseTo(0.33, 2);
  });
  it("оптимум: 2 повтора для 8 дверей, 785 для миллиона", () => {
    expect(groverOptimal(8)).toBe(2);
    expect(groverOptimal(1e6)).toBe(785);
  });
});

describe("гл. 5: узкое горлышко, 100 ГБ", () => {
  it("Фабрика 0,08 с, Оракул ≈13 мин за проход; 100 проходов ≈22 ч", () => {
    expect(loadSeconds("factory", 100e9)).toBeCloseTo(0.08, 3);
    expect(loadSeconds("oracle", 100e9) / 60).toBeCloseTo(13.3, 0);
    expect((100 * loadSeconds("oracle", 100e9)) / 3600).toBeCloseTo(22.2, 0);
  });
});

describe("гл. 2 и 6", () => {
  it("Амдал: 10% неделимой работы → меньше 10× даже с миллионом работников", () => {
    expect(amdahl(0.1, 1e6)).toBeLessThan(10);
    expect(amdahl(0.1, 1e6)).toBeGreaterThan(9.99);
  });
  it("доска памяти: 2¹⁰, ~10⁹, ~10¹⁵, ~10²⁴, >10⁸⁰", () => {
    expect(stateVectorSize(10)).toBe(1024);
    expect(Math.log10(stateVectorSize(30))).toBeCloseTo(9.03, 1);
    expect(Math.log10(stateVectorSize(50))).toBeCloseTo(15.05, 1);
    expect(Math.log10(stateVectorSize(80))).toBeCloseTo(24.08, 1);
    expect(Math.log10(stateVectorSize(300))).toBeGreaterThan(80);
  });
  it("ритм числа 15: период 7^x mod 15 = 4, множители 3 и 5", () => {
    expect(period(7, 15)).toBe(4);
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    expect([gcd(7 ** 2 - 1, 15), gcd(7 ** 2 + 1, 15)]).toEqual([3, 5]);
  });
});
