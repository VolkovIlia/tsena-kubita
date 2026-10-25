// Регрессионные тесты: числа, на которые опираются реплики сценария.
// Если тест упал после правки data/params.json — обновите и тексты в story/05_draft, и docs/.
import { describe, expect, it } from "vitest";
import {
  amdahl,
  crossover,
  DAY,
  derivedRate,
  dijkstraAge,
  dijkstraSeconds,
  executors,
  groverOptimal,
  groverSuccess,
  loadSeconds,
  opsPerCycle,
  oracleFavour,
  oracleShareDone,
  passwordLength,
  period,
  physicalPerLogical,
  powerOfTenBelow,
  rateRatio,
  scenario,
  solveSeconds,
  stateVectorSize,
} from "./tick";

describe("гл. 4: точки пересечения (график концепта)", () => {
  it("против одного ядра: N≈3·10¹³, ≈39 мин", () => {
    const c = crossover("master");
    expect(c.n / 1e13).toBeCloseTo(2.97, 1);
    expect(c.seconds / 60).toBeCloseTo(38.6, 0);
  });
  it("против 64 ядер: N≈10¹⁷, ≈37 ч", () => {
    const c = crossover("brigade");
    expect(c.n / 1e16).toBeCloseTo(9.84, 1);
    expect(c.seconds / 3600).toBeCloseTo(37.1, 0);
  });
  it("против GPU: N≈4,5·10²⁰, ≈105 дней", () => {
    const c = crossover("factory");
    expect(c.n / 1e20).toBeCloseTo(4.53, 1);
    expect(Math.round(c.seconds / DAY)).toBe(105);
  });
});

describe("гл. 4: сейф на 10¹⁶ кодов", () => {
  const safe = scenario.safe_codes;
  it("Мастер ≈9 дней, Оракул ≈12 ч, Фабрика ≈3,3 мин", () => {
    expect(solveSeconds("master", safe) / DAY).toBeCloseTo(9.04, 1);
    expect(solveSeconds("oracle", safe) / 3600).toBeCloseTo(11.82, 1);
    expect(solveSeconds("factory", safe)).toBeCloseTo(200, 5);
  });
  it("сюжет: Оракул обгоняет Мастера, Фабрика обгоняет Оракула", () => {
    expect(solveSeconds("oracle", safe)).toBeLessThan(solveSeconds("master", safe));
    expect(solveSeconds("factory", safe)).toBeLessThan(solveSeconds("oracle", safe));
  });
  it("к финишу Фабрики Оракул прошёл ≈0,5% пути", () => {
    expect(oracleShareDone(safe, solveSeconds("factory", safe))).toBeCloseTo(0.0047, 3);
  });
  it("Оракул ×100: 15 мин на проверке в 100 тиков, снова 105 дней на проверке в 10⁶ тиков", () => {
    expect(crossover("factory", 100, 100).seconds / 60).toBeCloseTo(15.1, 0);
    expect(Math.round(crossover("factory", 1e6, 100).seconds / DAY)).toBe(105);
  });
  it("проверка в 10⁴ тиков отодвигает финиш примерно на 29 лет", () => {
    expect(crossover("factory", 1e4).seconds / (365 * DAY)).toBeCloseTo(28.7, 0);
  });
});

describe("гл. 4: цена тика", () => {
  it("тик Оракула больше чем в 10 миллиардов раз дороже, чем у Фабрики", () => {
    const r = rateRatio("factory", "oracle");
    expect(r).toBeGreaterThan(1e10);
    expect(r).toBeLessThan(1e11);
    expect(powerOfTenBelow(r)).toBe(1e10);
  });
  it("ширина: Фабрика ≈3,5 миллиона операций за такт, Оракул ≈2,35", () => {
    expect(opsPerCycle("factory") / 1e6).toBeCloseTo(3.545, 2);
    expect(opsPerCycle("oracle")).toBeCloseTo(2.35, 5);
  });
  it("скорости CPU в JSON совпадают с выводом из ядер, ширины и частоты", () => {
    expect(derivedRate("master")).toBe(executors.master.ops_per_s);
    expect(derivedRate("brigade")).toBe(executors.brigade.ops_per_s);
  });
  it("поверхностный код: 338 и 1 458 физических кубитов на логический", () => {
    expect(physicalPerLogical(13)).toBe(338);
    expect(physicalPerLogical(27)).toBe(1458);
  });
  it("пересечение с Фабрикой — пароли из 11–12 символов", () => {
    const len = passwordLength(crossover("factory").n);
    expect(len).toBeGreaterThan(11);
    expect(len).toBeLessThan(12);
  });
  it("Дейкстре 70 лет, миллион перекрёстков — около 122 мс", () => {
    expect(dijkstraAge()).toBe(70);
    expect(dijkstraSeconds(1e6) * 1000).toBeCloseTo(122, 0);
  });
  it("√N для Оракула и N для Мастера подыгрывают Оракулу в π/2 ≈ 1,57 раза", () => {
    expect(oracleFavour()).toBeCloseTo(Math.PI / 2, 12);
    expect(oracleFavour()).toBeCloseTo(1.571, 3);
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
