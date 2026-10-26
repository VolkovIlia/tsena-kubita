// Регрессионные тесты: числа, на которые опираются реплики сценария.
// Если тест упал после правки data/params.json — обновите и тексты в story/05_draft, и docs/.
import { describe, expect, it } from "vitest";
import params from "../../data/params.json";
import { fmtCount, fmtDuration, fmtExact, fmtNum, fmtTimes } from "../i18n/format";
import * as tickNumbers from "../chapters/ch1/numbers";
import {
  adderTicks,
  AS_OF_YEAR,
  amdahlSeconds,
  amdahl,
  bestExecutor,
  chainSeconds,
  coldRatio,
  complexitySteps,
  crossover,
  DAY,
  derivedRate,
  dijkstraAge,
  dijkstraSeconds,
  executors,
  type ExecutorId,
  groverOptimal,
  groverSuccess,
  halvingSteps,
  handSteps,
  hands,
  ioRatio,
  ladderSeconds,
  laneRatio,
  laneRate,
  loadSeconds,
  memoryPlace,
  memoryScales,
  opsPerCycle,
  qcFavour,
  qcShareDone,
  qcSteps,
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
  stepCrossover,
  stateVectorSize,
  steps,
  ticksPerCycle,
  type Classical,
  universeAgeSeconds,
} from "./tick";

const classical: Classical[] = ["core", "cores", "gpu"];
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
  it("мультфильм: видеокарта 40 мс, 64 ядра 2,7 с, 1 ядро 2,6 мин", () => {
    expect(pixels).toBe(2e9);
    expect(solveSeconds("gpu", pixels, scenario.pixel_ticks)).toBeCloseTo(0.04, 6);
    expect(solveSeconds("cores", pixels, scenario.pixel_ticks)).toBeCloseTo(2.713, 2);
    expect(solveSeconds("core", pixels, scenario.pixel_ticks) / 60).toBeCloseTo(2.6, 1);
  });
  it("цепочка: 1 ядро 78 мкс, 64 ядра 87 мкс, видеокарта 2,2 мс", () => {
    expect(chain("core")).toBeCloseTo(7.81e-5, 7);
    expect(chain("cores")).toBeCloseTo(8.68e-5, 7);
    expect(chain("gpu")).toBeCloseTo(2.216e-3, 5);
  });
  it("сюжет: толпа выигрывает мультфильм, одиночка — цепочку, ядро из 64 ≈ одному ядру", () => {
    expect(bestExecutor(timesOf((id) => solveSeconds(id, pixels, scenario.pixel_ticks)))).toBe("gpu");
    expect(bestExecutor(timesOf(chain))).toBe("core");
    expect(chain("core")).toBeLessThan(chain("gpu"));
    expect(Math.abs(chain("core") - chain("cores")) / chain("core")).toBeLessThan(0.2);
  });
  it("Амдал: 10% неделимой работы → меньше 10× даже с миллионом работников", () => {
    expect(amdahl(0.1, scenario.amdahl_workers)).toBeLessThan(10);
    expect(amdahl(0.1, scenario.amdahl_workers)).toBeGreaterThan(9.99);
  });
  it("дорожки Амдала: при s = 0 — время гонки, при 10% видеокарта ≈16 с и не быстрее закона", () => {
    const t = (id: Classical, s: number) => amdahlSeconds(id, pixels, scenario.pixel_ticks, s);
    expect(t("gpu", 0)).toBe(solveSeconds("gpu", pixels, scenario.pixel_ticks));
    expect(t("gpu", 0.1)).toBeCloseTo(15.66, 1);
    expect(t("core", 0.1) / t("gpu", 0.1)).toBeLessThanOrEqual(amdahl(0.1, scenario.amdahl_workers));
  });
});

describe("гл. 5: обучение на 100 ГБ фотографий", () => {
  const bytes = scenario.dataset_bytes;
  it("проход: видеокарта 80 мс, квантовый ≈13 мин; 100 проходов: 8 с и ≈22 ч", () => {
    expect(loadSeconds("gpu", bytes)).toBeCloseTo(0.08, 5);
    expect(loadSeconds("gpu", bytes) * scenario.epochs).toBeCloseTo(8, 5);
    expect(loadSeconds("qc", bytes) / 60).toBeCloseTo(13.3, 1);
    expect((loadSeconds("qc", bytes) * scenario.epochs) / 3600).toBeCloseTo(22.2, 1);
  });
  it("вход видеокарты в 10 000 раз шире", () => {
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
  it("ключ среди триллиона — видеокарте, а не квантовому", () => {
    const n = scenario.key_codes;
    const all = { ...timesOf((id) => solveSeconds(id, n)), qc: solveSeconds("qc", n) };
    expect(bestExecutor(all)).toBe("gpu");
  });
  it("карточка ключа: 1 ядро 1,3 мин, 64 ядра 1,4 с, видеокарта 20 мс, квантовый 7,1 мин", () => {
    const ids = ["core", "cores", "gpu", "qc"] as const;
    expect(ids.map((id) => fmtDuration(solveSeconds(id, scenario.key_codes)))).toEqual(["1,3 мин", "1,4 с", "20 мс", "7,1 мин"]);
  });
  it("заголовок Google: в 13 000 раз", () => {
    expect(fmtCount(params.quantum_echoes.speedup_claim)).toBe("13\u00a0000");
  });
  it("виды ускорения: N^¼ и (log₂N)³", () => {
    expect(qcSteps("quartic", 1e8)).toBeCloseTo(100, 9);
    expect(qcSteps("poly", 2 ** 10)).toBeCloseTo(1000, 9);
    expect(qcSteps("sqrt", 1e8)).toBe(1e4);
  });
  it("10³⁰ вариантов и полиномиальное ускорение — квантовый впереди всех", () => {
    const n = 1e30;
    const t = (id: "core" | "cores" | "gpu" | "qc") => sandboxSeconds(id, n, scenario.check_ticks, "poly");
    expect(bestExecutor({ core: t("core"), cores: t("cores"), gpu: t("gpu"), qc: t("qc") })).toBe(
      "qc",
    );
  });
});

describe("гл. 4: точки пересечения (график концепта)", () => {
  it("против одного ядра: N≈3·10¹³, ≈39 мин", () => {
    const c = crossover("core");
    expect(c.n / 1e13).toBeCloseTo(2.97, 1);
    expect(c.seconds / 60).toBeCloseTo(38.6, 0);
  });
  it("против 64 ядер: N≈10¹⁷, ≈37 ч", () => {
    const c = crossover("cores");
    expect(c.n / 1e16).toBeCloseTo(9.84, 1);
    expect(c.seconds / 3600).toBeCloseTo(37.1, 0);
  });
  it("против GPU: N≈4,5·10²⁰, ≈105 дней", () => {
    const c = crossover("gpu");
    expect(c.n / 1e20).toBeCloseTo(4.53, 1);
    expect(Math.round(c.seconds / DAY)).toBe(105);
  });
});

describe("гл. 4: сейф на 10¹⁶ кодов", () => {
  const safe = scenario.safe_codes;
  it("1 ядро ≈9 дней, квантовый ≈12 ч, видеокарта ≈3,3 мин", () => {
    expect(solveSeconds("core", safe) / DAY).toBeCloseTo(9.04, 1);
    expect(solveSeconds("qc", safe) / 3600).toBeCloseTo(11.82, 1);
    expect(solveSeconds("gpu", safe)).toBeCloseTo(200, 5);
  });
  it("16-значные коды; квантовому — 100 миллионов проверок", () => {
    expect(Math.log10(safe)).toBe(16);
    expect(fmtCount(steps("qc", safe))).toBe("100 миллионов");
  });
  it("сюжет: квантовый обгоняет 1 ядро, видеокарта обгоняет квантовый", () => {
    expect(solveSeconds("qc", safe)).toBeLessThan(solveSeconds("core", safe));
    expect(solveSeconds("gpu", safe)).toBeLessThan(solveSeconds("qc", safe));
  });
  it("к финишу видеокарты квантовый прошёл ≈0,5% пути", () => {
    expect(qcShareDone(safe, solveSeconds("gpu", safe))).toBeCloseTo(0.0047, 3);
  });
  it("квантовый ×100: 15 мин на проверке в 100 тиков, снова 105 дней на проверке в 10⁶ тиков", () => {
    expect(crossover("gpu", 100, 100).seconds / 60).toBeCloseTo(15.1, 0);
    expect(Math.round(crossover("gpu", 1e6, 100).seconds / DAY)).toBe(105);
  });
  it("проверка в 10⁴ тиков отодвигает финиш примерно на 29 лет", () => {
    expect(crossover("gpu", 1e4).seconds / (365 * DAY)).toBeCloseTo(28.7, 0);
  });
});

describe("гл. 4: цена тика", () => {
  it("тик квантового больше чем в 10 миллиардов раз дороже, чем у видеокарты", () => {
    const r = rateRatio("gpu", "qc");
    expect(r).toBeGreaterThan(1e10);
    expect(r).toBeLessThan(1e11);
    expect(powerOfTenBelow(r)).toBe(1e10);
  });
  it("ширина: видеокарта ≈3,5 миллиона операций за такт, квантовый ≈2,35", () => {
    expect(opsPerCycle("gpu") / 1e6).toBeCloseTo(3.545, 2);
    expect(opsPerCycle("qc")).toBeCloseTo(2.35, 5);
  });
  it("скорости CPU в JSON совпадают с выводом из ядер, ширины и частоты", () => {
    expect(derivedRate("core")).toBe(executors.core.ops_per_s);
    expect(derivedRate("cores")).toBe(executors.cores.ops_per_s);
  });
  it("поверхностный код: 338 и 1 458 физических кубитов на логический", () => {
    expect(physicalPerLogical(13)).toBe(338);
    expect(physicalPerLogical(27)).toBe(1458);
  });
  it("пересечение с видеокартой — пароли из 11–12 символов", () => {
    const len = passwordLength(crossover("gpu").n);
    expect(len).toBeGreaterThan(11);
    expect(len).toBeLessThan(12);
  });
  it("Дейкстре 70 лет, миллион перекрёстков — около 122 мс", () => {
    expect(dijkstraAge()).toBe(70);
    expect(dijkstraSeconds(1e6) * 1000).toBeCloseTo(122, 0);
  });
  it("√N для квантового и N для одного ядра подыгрывают квантовому в π/2 ≈ 1,57 раза", () => {
    expect(qcFavour()).toBeCloseTo(Math.PI / 2, 12);
    expect(qcFavour()).toBeCloseTo(1.571, 3);
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

describe("хроника: тик, лестница, ядра", () => {
  const pixels = scenario.cartoon_frames * scenario.cartoon_pixels;
  it("сумматор: 8 бит — 40 тиков; такт ядра — 256 тиков; ядро — 1,28·10¹² тиков в секунду", () => {
    expect(adderTicks(8)).toBe(40);
    expect(ticksPerCycle("core")).toBe(256);
    expect(derivedRate("core")).toBe(1.28e12);
  });
  it("лестница: все комбинации 40 — 1,4 мин, 60 — 2,9 года, 100 — дольше возраста Вселенной", () => {
    expect(ladderSeconds("exp", 40)).toBeCloseTo(85.9, 1);
    expect(fmtDuration(ladderSeconds("exp", 40))).toBe("1,4 мин");
    expect(fmtDuration(ladderSeconds("exp", 60))).toBe("2,9 года");
    expect(ladderSeconds("exp", 80) / (365.25 * DAY)).toBeCloseTo(3.0e6, -5);
    expect(ladderSeconds("exp", 80)).toBeLessThan(universeAgeSeconds());
    expect(ladderSeconds("exp", 100)).toBeGreaterThan(universeAgeSeconds());
    expect(ladderSeconds("square", 100)).toBeCloseTo(7.8e-7, 8);
    expect(ladderSeconds("linear", 100)).toBeCloseTo(7.8e-9, 10);
    expect(complexitySteps("log", 100)).toBe(7);
  });
  it("мультфильм на 64 ядрах — почти в 58 раз быстрее, а не в 64", () => {
    const x = solveSeconds("core", pixels, scenario.pixel_ticks) / solveSeconds("cores", pixels, scenario.pixel_ticks);
    expect(x).toBeCloseTo(57.6, 6);
    expect(fmtNum(x)).toBe("58");
  });
  it("считают одновременно: 1, 64, 6 912, 1; ядро в 28 раз сильнее потока видеокарты", () => {
    expect(["core", "cores", "gpu", "qc"].map((id) => hands(id as ExecutorId))).toEqual([1, 64, 6912, 1]);
    expect(executors.gpu.lane.sm * executors.gpu.lane.lanes_per_sm).toBe(executors.gpu.lane.lanes);
    expect(laneRatio()).toBeCloseTo(28.4, 1);
  });
  it("шагов подряд: миллион — 1 000 000 / 15 625 / 145 / 785; 64 — 64 / 1 / 1 / 6; триллион — 144 675 926 против 785 398", () => {
    const ids: ExecutorId[] = ["core", "cores", "gpu", "qc"];
    expect(ids.map((id) => handSteps(id, 1e6))).toEqual([1e6, 15625, 145, 785]);
    expect(ids.map((id) => handSteps(id, scenario.compare_items))).toEqual([64, 1, 1, 6]);
    expect(handSteps("qc", scenario.compare_n_big)).toBe(785398);
    expect(handSteps("gpu", scenario.compare_n_big)).toBe(144675926);
  });
  it("по шагам квантовый обгоняет видеокарту с ≈29 миллионов вариантов", () => {
    const n = stepCrossover("gpu");
    expect(n).toBeCloseTo(2.95e7, -5);
    expect(fmtCount(n)).toBe("29 миллионов");
    expect(handSteps("qc", 2 * n)).toBeLessThan(handSteps("gpu", 2 * n));
    expect(handSteps("qc", n / 2)).toBeGreaterThan(handSteps("gpu", n / 2));
  });
  it("сейф на 64 ядрах — 3,8 ч", () => {
    expect(solveSeconds("cores", scenario.safe_codes) / 3600).toBeCloseTo(3.77, 2);
    expect(fmtDuration(solveSeconds("cores", scenario.safe_codes))).toBe("3,8 ч");
  });
  it("криостат почти в 200 раз холоднее космоса", () => {
    expect(coldRatio()).toBeGreaterThan(190);
    expect(coldRatio()).toBeLessThan(200);
  });
});

describe("хроника: числа событий", () => {
  const tl = params.timeline;
  it("Sycamore: 53 кубита, 200 с против заявленных 10 000 лет; оценка IBM — 2,5 дня", () => {
    expect(fmtCount(tl.sycamore.qubits)).toBe("53");
    expect(fmtCount(tl.sycamore.quantum_seconds)).toBe("200");
    expect(fmtCount(tl.sycamore.claimed_classical_years)).toBe("10 000");
    expect(fmtNum(tl.sycamore.ibm_days)).toBe("2,5");
  });
  it("Willow — 105 кубитов; облако IBM — 5 кубитов; Quantum Echoes — в 13 000 раз", () => {
    expect(fmtCount(tl.willow.qubits)).toBe("105");
    expect(fmtCount(tl.ibmCloud.qubits)).toBe("5");
    expect(fmtCount(params.quantum_echoes.speedup_claim)).toBe("13 000");
  });
  it("Majorana 2: время жизни в 1 000 раз дольше, цель — 2029; Starling — 200 логических кубитов, 100 миллионов гейтов", () => {
    expect(fmtCount(tl.majorana2.reliability_claim)).toBe("1 000");
    expect(tl.majorana2.target_year).toBe(2029);
    expect(tl.starling.year).toBe(2029);
    expect(fmtCount(tl.starling.logical_qubits)).toBe("200");
    expect(fmtCount(tl.starling.gates)).toBe("100 миллионов");
  });
  it("заголовки пролога идут по порядку лет", () => {
    const prologue = [tl.sycamore, tl.willow, tl.echoes, tl.majorana2];
    const years = prologue.map((e) => e.year);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });
});

describe("гл. «Новости», «Тик», «Алгоритм»: строки на экране", () => {
  const tl = params.timeline;
  it("Новости: заголовки 2019 → 2026, расчёт Хёфлера — 2023, Majorana 2 — июнь 2026, обещания — 2029", () => {
    const ids = ["sycamore", "hoefler", "willow", "echoes", "majorana2"] as const;
    expect(ids.map((id) => tl[id].year)).toEqual([2019, 2023, 2024, 2025, 2026]);
    expect(tl.majorana2.month).toBe(6);
    expect(String(tl.majorana2.target_year)).toBe("2029");
    expect(String(tl.starling.year)).toBe("2029");
  });
  it("Тик: 8 разрядов × 5 вентилей = 40 тиков; такт 5 миллиардов в секунду, 4 команды × 64 бита = 256 тиков", () => {
    const n = tickNumbers;
    expect([fmtExact(n.BITS), fmtExact(n.GATES), fmtExact(n.ADD_TICKS)]).toEqual(["8", "5", "40"]);
    expect(fmtCount(n.CYCLE.clock_hz)).toBe("5 миллиардов");
    expect([fmtExact(n.CYCLE.ops_per_cycle), fmtExact(n.CYCLE.bits_per_op), fmtCount(n.TPC)]).toEqual(["4", "64", "256"]);
  });
  it("Тик: ставка «больше, чем 1 триллион» верна, счётчик — 1 280 000 000 000, подпись — 1,3 триллиона", () => {
    const n = tickNumbers;
    expect(fmtCount(n.RATE_FLOOR)).toBe("1 триллион");
    expect(n.RATE).toBeGreaterThan(n.RATE_FLOOR);
    expect(n.RATE).toBeLessThan(10 * n.RATE_FLOOR);
    expect(n.CYCLE.clock_hz).toBeLessThan(n.RATE_FLOOR);
    expect(fmtExact(n.RATE)).toBe("1\u00a0280\u00a0000\u00a0000\u00a0000");
    expect(fmtCount(n.RATE)).toBe("1,3 триллиона");
  });
  it("Тик: вслух — 40 589 лет; сложение — 0,031 нс; сутки ядра — 111 квадриллионов тиков", () => {
    const n = tickNumbers;
    expect(fmtDuration(n.COUNT_ALOUD_S)).toBe("40\u00a0589 лет");
    expect(fmtDuration(n.coreSeconds(n.ADD_TICKS))).toBe("0,031 нс");
    expect(n.coreSeconds(n.DAY_TICKS)).toBe(DAY);
    expect(fmtCount(n.DAY_TICKS)).toBe("111 квадриллионов");
  });
  it("Алгоритм: книга 1 000 → 1 миллион страниц, в 1 000 раз; шагов пополам 10 → 20, в 2 раза; работы меньше в 50 000 раз", () => {
    const [small, big] = [scenario.book_pages, scenario.book_pages_big];
    expect([fmtCount(small), fmtCount(big), fmtTimes(big / small)]).toEqual(["1\u00a0000", "1 миллион", "1\u00a0000 раз"]);
    expect(fmtTimes(halvingSteps(big) / halvingSteps(small))).toBe("2 раза");
    expect(fmtTimes(big / halvingSteps(big))).toBe("50\u00a0000 раз");
  });
  it("Алгоритм: ползунок до 40 (последняя ступень короче суток), ставка про 100; шаг — 100 тиков", () => {
    const short = scenario.ladder_n.filter((n) => ladderSeconds("exp", n) < DAY);
    expect(short.at(-1)).toBe(40);
    expect(scenario.ladder_n.at(-1)).toBe(100);
    expect(fmtCount(scenario.check_ticks)).toBe("100");
  });
  it("Алгоритм: N = 100 — 0,55 нс / 7,8 нс / 781 нс / 3,1 триллиона лет; Вселенной около 14 миллиардов лет, в 228 раз меньше", () => {
    const kinds = ["log", "linear", "square", "exp"] as const;
    expect(kinds.map((k) => fmtDuration(ladderSeconds(k, 100)))).toEqual(["0,55 нс", "7,8 нс", "781 нс", "3,1 триллиона лет"]);
    expect(fmtDuration(universeAgeSeconds())).toBe("14 миллиардов лет");
    expect(fmtTimes(ladderSeconds("exp", 100) / universeAgeSeconds())).toBe("228 раз");
  });
  it("Алгоритм: город на 1 миллион перекрёстков — 122 мс; Дейкстра придумал в 1956, опубликовал в 1959", () => {
    expect(fmtCount(scenario.route_nodes)).toBe("1 миллион");
    expect(fmtDuration(dijkstraSeconds(scenario.route_nodes))).toBe("122 мс");
    expect([params.dijkstra.conceived, params.dijkstra.published]).toEqual([1956, 1959]);
  });
  it("Алгоритм: 64 ядра даже в 64 раза быстрее — всего 6 лишних переключателей в нижней строке", () => {
    const x = hands("cores");
    expect(fmtTimes(x)).toBe("64 раза");
    const k = Math.floor(Math.log2(x));
    expect(k).toBe(6);
    expect(ladderSeconds("exp", 40 + k) / x).toBeCloseTo(ladderSeconds("exp", 40), 9);
  });
});

describe("гл. «Своё поле» и финал «Так будет ли на столе?»: строки на экране", () => {
  const tl = params.timeline;
  it("Своё поле: Шор — 1994, Рейхер — 2017; доска — 10 / 40 / 60 / 80 мест по 16 байт; период — 4", () => {
    expect([tl.shor.year, tl.reiher.year]).toEqual([1994, 2017]);
    expect(scenario.memory_n.map(String)).toEqual(["10", "40", "60", "80"]);
    expect(String(scenario.bytes_per_amplitude)).toBe("16");
    expect(String(shorFactors(scenario.shor_a, scenario.shor_n).r)).toBe("4");
    expect(fmtCount(tl.willow.qubits)).toBe("105");
    expect(tl.willow.qubits).toBeLessThan(params.rsa2048.physical_qubits_max);
  });
  it("финал, desk: криостат почти в 195 раз холоднее космоса; около 14 мК против 2,7 К; на полосах — 0,014 К и 2,7 К", () => {
    expect(fmtTimes(coldRatio())).toBe("195 раз");
    expect(coldRatio()).toBeLessThan(195);
    expect(fmtNum(params.cryostat.kelvin * 1000)).toBe("14");
    expect(fmtNum(params.cryostat.cmb_kelvin)).toBe("2,7");
    expect(fmtNum(params.cryostat.kelvin)).toBe("0,014");
  });
  it("финал: облако IBM — 2016; Starling и Microsoft — 2029, 200 логических кубитов; Majorana 2 — в 1 000 раз", () => {
    expect(String(tl.ibmCloud.year)).toBe("2016");
    expect([String(tl.starling.year), String(tl.majorana2.target_year)]).toEqual(["2029", "2029"]);
    expect(fmtCount(tl.starling.logical_qubits)).toBe("200");
    expect(fmtCount(tl.majorana2.reliability_claim)).toBe("1\u00a0000");
  });
  it("финал: карточка ключа — 1 триллион вариантов; песочница по умолчанию показывает те же 1,3 мин / 1,4 с / 20 мс / 7,1 мин", () => {
    expect(fmtCount(scenario.key_codes)).toBe("1 триллион");
    const ids = ["core", "cores", "gpu", "qc"] as const;
    const check = Math.round(10 ** Math.round(Math.log10(scenario.check_ticks)));
    expect(fmtCount(check)).toBe("100");
    expect(ids.map((id) => fmtDuration(sandboxSeconds(id, scenario.key_codes, check, "sqrt")))).toEqual([
      "1,3 мин",
      "1,4 с",
      "20 мс",
      "7,1 мин",
    ]);
  });
  it("финал, песочница: N от 1 000 до 10³⁰, цена проверки от 1 до 1 миллиона тиков", () => {
    expect(fmtCount(10 ** scenario.sandbox_log_n_min)).toBe("1\u00a0000");
    expect(fmtCount(10 ** scenario.sandbox_log_n_max)).toBe("10³⁰");
    expect(fmtCount(scenario.check_ticks_realistic)).toBe("1 миллион");
  });
  it("документы «Люди и машины» и концепт: 4,5 ГГц на всех ядрах против 5 ГГц у одного; варп — 32 потока; 1,3·10¹² тиков в секунду", () => {
    expect(fmtNum(executors.cores.derivation.clock_hz / 1e9)).toBe("4,5");
    expect(fmtNum(executors.core.derivation.clock_hz / 1e9)).toBe("5");
    expect(executors.gpu.lane.warp).toBe(32);
    expect(fmtCount(executors.core.ops_per_s)).toBe("1,3 триллиона");
    expect(fmtNum(crossover("cores").seconds / DAY)).toBe("1,5");
  });
});

import * as format from "../i18n/format";
import * as registry from "../game/chapters";
import * as model from "./tick";

describe("гл. «Квантовый алгоритм», «Гонка», «Узкое горлышко»: строки на экране", () => {
  const sp = (s: string) => s.replace(/\u00a0/g, " ");
  const ids: ExecutorId[] = ["core", "cores", "gpu", "qc"];
  it("Квантовый алгоритм: 8 дверей, 1996; шансы 12,5% → 78% → 94,5% → 33% → 1%; оптимум 2, ещё один повтор — 33%", () => {
    const doors = scenario.pinball_doors;
    expect(String(doors)).toBe("8");
    expect(registry.eventYear("grover")).toBe(1996);
    expect([0, 1, 2, 3, 4].map((k) => format.fmtPercent(groverSuccess(doors, k)))).toEqual(["12,5%", "78%", "94,5%", "33%", "1%"]);
    expect(format.fmtCount(groverOptimal(doors))).toBe("2");
  });
  it("Квантовый алгоритм: миллион дверей — 785 повторов; подыгрыш ≈ 1,6 раза; среди 64 — 64 / 1 / 1 / 6; среди миллиона — 145 у видеокарты против 785", () => {
    expect(format.fmtCount(scenario.pinball_big_n)).toBe("1 миллион");
    expect(format.fmtCount(groverOptimal(scenario.pinball_big_n))).toBe("785");
    expect(fmtTimes(qcFavour())).toBe("1,6 раза");
    expect(format.fmtCount(scenario.compare_items)).toBe("64");
    expect(ids.map((id) => format.fmtCount(handSteps(id, scenario.compare_items)))).toEqual(["64", "1", "1", "6"]);
    expect(ids.map((id) => sp(format.fmtCount(handSteps(id, scenario.pinball_big_n))))).toEqual(["1 миллион", "15 625", "145", "785"]);
    expect(sp(format.fmtCount(hands("gpu")))).toBe("6 912");
    expect(format.fmtCount(stepCrossover("gpu"))).toBe("29 миллионов");
    expect(format.fmtCount(scenario.compare_n_big)).toBe("1 триллион");
  });
  it("Гонка: 2023; сейф 10 квадриллионов кодов, 16 цифр, проверка 100 тиков; 9 дней / 3,8 ч / 3,3 мин / 12 ч; 0,5% пути", () => {
    const n = scenario.safe_codes;
    expect(registry.eventYear("hoefler")).toBe(2023);
    expect(format.fmtCount(n)).toBe("10 квадриллионов");
    expect(String(Math.log10(n))).toBe("16");
    expect(format.fmtCount(model.DEFAULT_CHECK)).toBe("100");
    expect(ids.map((id) => fmtDuration(solveSeconds(id, n)))).toEqual(["9 дней", "3,8 ч", "3,3 мин", "12 ч"]);
    expect(format.fmtPercent(qcShareDone(n, solveSeconds("gpu", n)))).toBe("0,5%");
    expect(format.fmtCount(steps("qc", n))).toBe("100 миллионов");
    expect(format.fmtCount(handSteps("qc", n))).toBe("79 миллионов");
  });
  it("Гонка: такт 10 мкс против 0,71 нс; за такт 3,5 миллиона против 2; 338–1 458 шумных; дороже больше чем в 10 миллиардов раз", () => {
    expect(fmtDuration(model.cycleSeconds("qc"))).toBe("10 мкс");
    expect(fmtDuration(model.cycleSeconds("gpu"))).toBe("0,71 нс");
    expect(format.fmtCount(opsPerCycle("gpu"))).toBe("3,5 миллиона");
    expect(format.fmtCount(Math.round(opsPerCycle("qc")))).toBe("2");
    const [dMin, dMax] = params.surface_code.distances;
    expect([physicalPerLogical(dMin), physicalPerLogical(dMax)].map((x) => sp(format.fmtCount(x)))).toEqual(["338", "1 458"]);
    expect(format.fmtCount(powerOfTenBelow(rateRatio("gpu", "qc")))).toBe("10 миллиардов");
  });
  it("Гонка: пересечение с видеокартой — 4,5·10²⁰ кодов, пароли 11–12 символов, 105 дней; ×100 — 15 мин; проверка 1 миллион тиков — снова 105 дней", () => {
    const c = crossover("gpu");
    expect(format.fmtSci(c.n)).toBe("4,5·10²⁰");
    const len = passwordLength(c.n);
    expect([String(Math.floor(len)), String(Math.ceil(len))]).toEqual(["11", "12"]);
    expect(fmtDuration(c.seconds)).toBe("105 дней");
    const x = scenario.qc_speedup_slider;
    expect(fmtNum(x)).toBe("100");
    expect(fmtDuration(crossover("gpu", model.DEFAULT_CHECK, x).seconds)).toBe("15 мин");
    expect(format.fmtCount(scenario.check_ticks_realistic)).toBe("1 миллион");
    expect(fmtDuration(crossover("gpu", scenario.check_ticks_realistic, x).seconds)).toBe("105 дней");
  });
  it("Узкое горлышко: 1 миллион фотографий, 100 ГБ; 80 мс против 13 мин; 100 проходов — 8 с против 22 ч; вход в 10 000 раз уже; 2016 и 2018", () => {
    const bytes = scenario.dataset_bytes;
    expect(format.fmtCount(scenario.cat_photos)).toBe("1 миллион");
    expect(format.fmtBytes(bytes)).toBe("100 ГБ");
    expect([fmtDuration(loadSeconds("gpu", bytes)), fmtDuration(loadSeconds("qc", bytes))]).toEqual(["80 мс", "13 мин"]);
    expect(format.fmtCount(scenario.epochs)).toBe("100");
    expect([fmtDuration(loadSeconds("gpu", bytes) * scenario.epochs), fmtDuration(loadSeconds("qc", bytes) * scenario.epochs)]).toEqual(["8 с", "22 ч"]);
    expect(sp(format.fmtCount(ioRatio()))).toBe("10 000");
    expect([params.kerenidis.year, registry.eventYear("tang")]).toEqual([2016, 2018]);
  });
});

import * as fmtB from "../i18n/format";
import * as chaptersB from "../game/chapters";
import * as svB from "./statevector";
import * as modelB from "./tick";

describe("гл. «Много ядер», «Видеокарта», «Кубит»: строки на экране", () => {
  const sp = (s: string) => s.replace(/\u00a0/g, " ");
  const crew: Classical[] = ["core", "cores", "gpu"];
  const pixels = scenario.cartoon_frames * scenario.cartoon_pixels;
  const cartoon = (id: Classical) => solveSeconds(id, pixels, scenario.pixel_ticks);
  const chain = (id: Classical) => chainSeconds(id, scenario.payments, scenario.payment_ticks);
  const lane = executors.gpu.lane;
  it("заказы: 1 000 кадров по 2 миллиона точек, 100 000 тиков на точку; 1 миллион платежей", () => {
    expect(sp(fmtB.fmtCount(scenario.cartoon_frames))).toBe("1 000");
    expect(fmtB.fmtCount(scenario.cartoon_pixels)).toBe("2 миллиона");
    expect(sp(fmtB.fmtCount(scenario.pixel_ticks))).toBe("100 000");
    expect(fmtB.fmtCount(scenario.payments)).toBe("1 миллион");
  });
  it("Много ядер: 2005; 64 ядра, «в 64 раза», «почти в 58 раз»; 5 и 4,5 ГГц; 2,6 мин / 2,7 с; 78 / 87 мкс; мостик — 6 912 ядер", () => {
    expect(chaptersB.eventYear("sutter")).toBe(2005);
    expect(String(hands("cores"))).toBe("64");
    expect(fmtTimes(hands("cores"))).toBe("64 раза");
    expect(fmtTimes(cartoon("core") / cartoon("cores"))).toBe("58 раз");
    expect(fmtNum(executors.core.derivation.clock_hz / 1e9)).toBe("5");
    expect(fmtNum(executors.cores.derivation.clock_hz / 1e9)).toBe("4,5");
    expect(crew.map((id) => fmtDuration(cartoon(id)))).toEqual(["2,6 мин", "2,7 с", "40 мс"]);
    expect(crew.map((id) => fmtDuration(chain(id)))).toEqual(["78 мкс", "87 мкс", "2,2 мс"]);
    expect(chain("core")).toBeLessThan(chain("cores"));
    expect(sp(fmtB.fmtCount(hands("gpu")))).toBe("6 912");
  });
  it("Много ядер, Амдал: 1967; при 10% неделимого 64 ядра — 8,6 раза, миллион рук — не больше 10 раз; ползунок до 50%", () => {
    expect(chaptersB.eventYear("amdahl")).toBe(1967);
    const s = 0.1;
    const x = amdahlSeconds("core", pixels, scenario.pixel_ticks, s) / amdahlSeconds("cores", pixels, scenario.pixel_ticks, s);
    expect(fmtB.fmtPercent(s)).toBe("10%");
    expect(fmtTimes(x)).toBe("8,6 раза");
    expect(fmtB.fmtCount(scenario.amdahl_workers)).toBe("1 миллион");
    expect(fmtTimes(amdahl(s, scenario.amdahl_workers))).toBe("10 раз");
    expect(fmtTimes(1 / s)).toBe("10 раз");
    expect(fmtB.fmtPercent(scenario.amdahl_serial_max)).toBe("50%");
  });
  it("Видеокарта: 2007; 108 блоков × 64 = 6 912 ядер, в 108 раз больше 64 ядер; группа — 32", () => {
    expect(chaptersB.eventYear("cuda")).toBe(2007);
    expect([lane.sm, lane.lanes_per_sm].map(fmtB.fmtCount)).toEqual(["108", "64"]);
    expect(sp(fmtB.fmtCount(lane.lanes))).toBe("6 912");
    expect(fmtTimes(hands("gpu") / hands("cores"))).toBe("108 раз");
    expect(fmtB.fmtCount(lane.warp)).toBe("32");
  });
  it("Видеокарта: рука — 1,4 миллиарда тактов × 32 бита = 45 миллиардов тиков/с, в 28 раз слабее ядра (1,3 триллиона)", () => {
    expect(fmtB.fmtCount(lane.clock_hz)).toBe("1,4 миллиарда");
    expect(fmtB.fmtCount(lane.bits_per_op)).toBe("32");
    expect(modelB.laneRate("gpu")).toBe(lane.clock_hz * lane.ops_per_cycle * lane.bits_per_op);
    expect(fmtB.fmtCount(modelB.laneRate("gpu"))).toBe("45 миллиардов");
    expect(fmtTimes(laneRatio())).toBe("28 раз");
    expect(fmtB.fmtCount(executors.core.ops_per_s)).toBe("1,3 триллиона");
  });
  it("Видеокарта, табло: считают одновременно 1 / 64 / 6 912; тиков в секунду 1,3 триллиона / 74 триллиона / 5 квадриллионов; сумма рук — 312 триллионов", () => {
    expect(crew.map((id) => sp(fmtB.fmtCount(hands(id))))).toEqual(["1", "64", "6 912"]);
    expect(crew.map((id) => fmtB.fmtCount(executors[id].ops_per_s))).toEqual(["1,3 триллиона", "74 триллиона", "5 квадриллионов"]);
    // Пик — двоичные операции тензорных ядер A100 (whitepaper, Table 2: Binary TC 4 992 TOPS; Хёфлер, Table 1).
    expect(executors.gpu.ops_per_s / 4.992e15).toBeCloseTo(1, 2);
    const sum = lane.lanes * modelB.laneRate("gpu");
    expect(fmtB.fmtCount(sum)).toBe("312 триллионов");
    expect(sum).toBeLessThan(executors.gpu.ops_per_s);
    expect(bestExecutor(timesOf(cartoon))).toBe("gpu");
    expect(bestExecutor(timesOf(chain))).toBe("core");
  });
  it("Видеокарта, шагов в гонке мультфильма: 2·10⁹ / 31 миллион / 289 352", () => {
    expect(crew.map((id) => handSteps(id, pixels))).toEqual([2e9, 31250000, 289352]);
    expect(fmtB.fmtSci(handSteps("core", pixels))).toBe("2·10⁹");
    expect(fmtB.fmtCount(handSteps("cores", pixels))).toBe("31 миллион");
    expect(sp(fmtB.fmtCount(handSteps("gpu", pixels)))).toBe("289 352");
  });
  it("Кубит: 1982; смешанный кубит — столбики 0,71, шанс 50%; 3 кубита — 8 дверей; ряд до 6 кубитов / 64 амплитуд", () => {
    expect(chaptersB.eventYear("feynman")).toBe(1982);
    const mixed = svB.hadamard(svB.basis(1), 0);
    expect(fmtNum(mixed[0])).toBe("0,71");
    expect(svB.probabilities(mixed).map(fmtB.fmtPercent)).toEqual(["50%", "50%"]);
    expect(svB.probabilities(svB.hadamard(mixed, 0))[0]).toBeCloseTo(1, 12);
    expect(String(scenario.pinball_doors)).toBe("8");
    expect(String(Math.log2(scenario.pinball_doors))).toBe("3");
    expect(String(Math.log2(scenario.compare_items))).toBe("6");
    expect(fmtB.fmtCount(stateVectorSize(Math.log2(scenario.compare_items)))).toBe("64");
  });
  it("Кубит: 40 кубитов — 1,1 триллиона амплитуд, в ноутбук не влезает; надёжный кубит — 338–1 458 шумных; Willow — 105", () => {
    const laptop = memoryScales.find((s) => s.id === "laptop")!.capacity_numbers;
    const big = scenario.memory_n.find((n) => stateVectorSize(n) > laptop)!;
    expect(String(big)).toBe("40");
    expect(fmtB.fmtCount(stateVectorSize(big))).toBe("1,1 триллиона");
    const [dMin, dMax] = params.surface_code.distances;
    expect([physicalPerLogical(dMin), physicalPerLogical(dMax)].map((x) => sp(fmtB.fmtCount(x)))).toEqual(["338", "1 458"]);
    expect(fmtB.fmtCount(params.timeline.willow.qubits)).toBe("105");
    expect(params.timeline.willow.qubits).toBeLessThan(physicalPerLogical(dMin));
  });
});

describe("видеокарта: пик тензорных блоков против суммы рук", () => {
  it("пик (Hoefler, binary) в ≈16 раз больше, чем 6 912 ядер вместе", () => {
    expect(executors.gpu.ops_per_s / (hands("gpu") * laneRate("gpu"))).toBeCloseTo(16, 0);
  });
});

describe("пролог «Новости»: «сейчас» и цена шага", () => {
  it("сейчас 2026-й; шаг квантового дороже шага видеокарты больше чем в 10 миллиардов раз", () => {
    expect(AS_OF_YEAR).toBe(2026);
    expect(fmtCount(powerOfTenBelow(rateRatio("gpu", "qc")))).toBe("10 миллиардов");
  });
});
