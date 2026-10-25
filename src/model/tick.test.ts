// Регрессионные тесты: числа, на которые опираются реплики сценария.
// Если тест упал после правки data/params.json — обновите и тексты в story/05_draft, и docs/.
import { describe, expect, it } from "vitest";
import params from "../../data/params.json";
import { fmtCount, fmtDuration } from "../i18n/format";
import {
  amdahlSeconds,
  amdahl,
  bestExecutor,
  chainSeconds,
  crossover,
  DAY,
  derivedRate,
  dijkstraAge,
  dijkstraSeconds,
  executors,
  groverOptimal,
  groverSuccess,
  halvingSteps,
  ioRatio,
  loadSeconds,
  memoryPlace,
  memoryScales,
  opsPerCycle,
  oracleFavour,
  oracleShareDone,
  oracleSteps,
  passwordLength,
  period,
  physicalPerLogical,
  powerOfTenBelow,
  powersMod,
  rateRatio,
  sandboxSeconds,
  scenario,
  shorFactors,
  solveSeconds,
  stateVectorSize,
  steps,
  type Classical,
} from "./tick";

const classical: Classical[] = ["master", "brigade", "factory"];
const timesOf = (f: (id: Classical) => number) => Object.fromEntries(classical.map((id) => [id, f(id)]));

describe("гл. 1: телефонная книга", () => {
  it("пополам: 10 шагов на 1 000 страниц, 20 — на миллион", () => {
    expect(halvingSteps(scenario.book_pages)).toBe(10);
    expect(halvingSteps(scenario.book_pages_big)).toBe(20);
  });
  it("сноски: Европа — 18 миллионов перекрёстков за 2,2 с; коммивояжёр — 200 городов за 6,6 с в 1999 году", () => {
    expect(fmtCount(params.road_network.nodes)).toBe("18 миллионов");
    expect(fmtDuration(params.road_network.dijkstra_seconds)).toBe("2,2 с");
    expect(params.tsp.instance_stops).toBe(200);
    expect(fmtDuration(params.tsp.concorde_seconds)).toBe("6,6 с");
    expect(params.tsp.year).toBe(1999);
  });
});

describe("гл. 2: мультфильм и цепочка платежей", () => {
  const pixels = scenario.cartoon_frames * scenario.cartoon_pixels;
  const chain = (id: Classical) => chainSeconds(id, scenario.payments, scenario.payment_ticks);
  it("мультфильм: Фабрика 40 мс, Бригада 2,7 с, Мастер 2,6 мин", () => {
    expect(pixels).toBe(2e9);
    expect(solveSeconds("factory", pixels, scenario.pixel_ticks)).toBeCloseTo(0.04, 6);
    expect(solveSeconds("brigade", pixels, scenario.pixel_ticks)).toBeCloseTo(2.713, 2);
    expect(solveSeconds("master", pixels, scenario.pixel_ticks) / 60).toBeCloseTo(2.6, 1);
  });
  it("цепочка: Мастер 78 мкс, Бригада 87 мкс, Фабрика 2,2 мс", () => {
    expect(chain("master")).toBeCloseTo(7.81e-5, 7);
    expect(chain("brigade")).toBeCloseTo(8.68e-5, 7);
    expect(chain("factory")).toBeCloseTo(2.216e-3, 5);
  });
  it("сюжет: толпа выигрывает мультфильм, одиночка — цепочку, ядро Бригады ≈ Мастер", () => {
    expect(bestExecutor(timesOf((id) => solveSeconds(id, pixels, scenario.pixel_ticks)))).toBe("factory");
    expect(bestExecutor(timesOf(chain))).toBe("master");
    expect(chain("master")).toBeLessThan(chain("factory"));
    expect(Math.abs(chain("master") - chain("brigade")) / chain("master")).toBeLessThan(0.2);
  });
  it("Амдал: 10% неделимой работы → меньше 10× даже с миллионом работников", () => {
    expect(amdahl(0.1, scenario.amdahl_workers)).toBeLessThan(10);
    expect(amdahl(0.1, scenario.amdahl_workers)).toBeGreaterThan(9.99);
  });
  it("дорожки Амдала: при s = 0 — время гонки, при 10% Фабрика ≈16 с и не быстрее закона", () => {
    const t = (id: Classical, s: number) => amdahlSeconds(id, pixels, scenario.pixel_ticks, s);
    expect(t("factory", 0)).toBe(solveSeconds("factory", pixels, scenario.pixel_ticks));
    expect(t("factory", 0.1)).toBeCloseTo(15.66, 1);
    expect(t("master", 0.1) / t("factory", 0.1)).toBeLessThanOrEqual(amdahl(0.1, scenario.amdahl_workers));
  });
});

describe("гл. 5: обучение на 100 ГБ фотографий", () => {
  const bytes = scenario.dataset_bytes;
  it("проход: Фабрика 80 мс, Оракул ≈13 мин; 100 проходов: 8 с и ≈22 ч", () => {
    expect(loadSeconds("factory", bytes)).toBeCloseTo(0.08, 5);
    expect(loadSeconds("factory", bytes) * scenario.epochs).toBeCloseTo(8, 5);
    expect(loadSeconds("oracle", bytes) / 60).toBeCloseTo(13.3, 1);
    expect((loadSeconds("oracle", bytes) * scenario.epochs) / 3600).toBeCloseTo(22.2, 1);
  });
  it("вход Фабрики в 10 000 раз шире", () => {
    expect(ioRatio()).toBe(1e4);
  });
});

describe("гл. 6: доска памяти и ритм", () => {
  it("2¹⁰ = 1 024, 2⁴⁰ ≈ 1,1 триллиона, 2⁶⁰ ≈ 1,2·10¹⁸, 2⁸⁰ ≈ 1,2·10²⁴", () => {
    expect(scenario.memory_n.map((n) => fmtCount(stateVectorSize(n)))).toEqual([
      "1\u00a0024",
      "1,1 триллиона",
      "1,2·10¹⁸",
      "1,2·10²⁴",
    ]);
  });
  it("ёмкости = байты из источников ÷ 16: ноутбук 16 GiB, El Capitan 6,33·10¹⁵ Б, накопители 6,7 ЗБ", () => {
    const bytes = memoryScales.map((s) => s.capacity_numbers * scenario.bytes_per_amplitude);
    expect(bytes[0]).toBe(16 * 2 ** 30);
    expect(bytes[1] / 6.33e15).toBeCloseTo(1, 2);
    expect(bytes[2] / 6.7e21).toBeCloseTo(1, 2);
  });
  it("10 — в ноутбук, 40 — в суперкомпьютер, 60 — во все накопители, 80 — никуда", () => {
    expect(scenario.memory_n.map((n) => memoryPlace(n))).toEqual([
      { id: "laptop", fits: true },
      { id: "super", fits: true },
      { id: "world", fits: true },
      { id: "world", fits: false },
    ]);
  });
  it("ритм 7 по модулю 15: 7, 4, 13, 1 и снова", () => {
    expect(powersMod(scenario.shor_a, scenario.shor_n, 8)).toEqual([7, 4, 13, 1, 7, 4, 13, 1]);
  });
  it("из периода 4: 7² = 49, множители 3 и 5", () => {
    expect(shorFactors(scenario.shor_a, scenario.shor_n)).toEqual({ r: 4, half: 2, square: 49, p: 3, q: 5 });
  });
  it("нечётный период — не годится", () => {
    expect(() => shorFactors(2, 7)).toThrow("нечётный период");
  });
});

describe("гл. 6: шифр банка", () => {
  it("2048 бит — 617 цифр; рекорд RSA-250: 250 цифр, 2020, ≈2 700 ядро-лет", () => {
    expect(Math.ceil(2048 * Math.log10(2))).toBe(params.rsa2048.digits);
    expect([params.rsa250.digits, params.rsa250.year, fmtCount(params.rsa250.core_years)]).toEqual([250, 2020, "2\u00a0700"]);
  });
  it("оценка Гидни 2025: меньше 7 дней и меньше 1 миллиона шумных кубитов", () => {
    expect(params.rsa2048.year).toBe(2025);
    expect(fmtDuration(params.rsa2048.runtime_days_max * DAY)).toBe("7 дней");
    expect(fmtCount(params.rsa2048.physical_qubits_max)).toBe("1 миллион");
  });
});

describe("финал: карточки и песочница", () => {
  it("ключ среди триллиона — Фабрике, а не Оракулу", () => {
    const n = scenario.key_codes;
    const all = { ...timesOf((id) => solveSeconds(id, n)), oracle: solveSeconds("oracle", n) };
    expect(bestExecutor(all)).toBe("factory");
  });
  it("карточка ключа: Мастер 1,3 мин, Бригада 1,4 с, Фабрика 20 мс, Оракул 7,1 мин", () => {
    const ids = ["master", "brigade", "factory", "oracle"] as const;
    expect(ids.map((id) => fmtDuration(solveSeconds(id, scenario.key_codes)))).toEqual(["1,3 мин", "1,4 с", "20 мс", "7,1 мин"]);
  });
  it("заголовок Google: в 13 000 раз", () => {
    expect(fmtCount(params.quantum_echoes.speedup_claim)).toBe("13\u00a0000");
  });
  it("виды ускорения: N^¼ и (log₂N)³", () => {
    expect(oracleSteps("quartic", 1e8)).toBeCloseTo(100, 9);
    expect(oracleSteps("poly", 2 ** 10)).toBeCloseTo(1000, 9);
    expect(oracleSteps("sqrt", 1e8)).toBe(1e4);
  });
  it("10³⁰ вариантов и полиномиальное ускорение — Оракул впереди всех", () => {
    const n = 1e30;
    const t = (id: "master" | "brigade" | "factory" | "oracle") => sandboxSeconds(id, n, scenario.check_ticks, "poly");
    expect(bestExecutor({ master: t("master"), brigade: t("brigade"), factory: t("factory"), oracle: t("oracle") })).toBe(
      "oracle",
    );
  });
});

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
  it("16-значные коды; Оракулу — 100 миллионов проверок", () => {
    expect(Math.log10(safe)).toBe(16);
    expect(fmtCount(steps("oracle", safe))).toBe("100 миллионов");
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
