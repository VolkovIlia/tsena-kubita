/**
 * Модель «тика» — честный счёт времени для всех гонок игры.
 * T = W(N) · M / R, где W(N) — число проверок (N для перебора, √N для Гровера),
 * M — тиков на одну проверку, R — тиков в секунду у исполнителя.
 * Тик — одна логическая операция над битом (binary op, Hoefler Table 1) у всех исполнителей.
 * Источник модели: Hoefler, Häner, Troyer, CACM 2023 (arXiv:2307.00523).
 * Не вписывайте числа в тексты руками — берите их из этих функций.
 */
import params from "../../data/params.json";

export type ExecutorId = keyof typeof params.executors;
export type Classical = Exclude<ExecutorId, "oracle">;
export type ScaleId = "laptop" | "super" | "world";
export type Speedup = "sqrt" | "quartic" | "poly";
export const executors = params.executors;
export const DEFAULT_CHECK = params.defaults.check_ticks;
export const DAY = 86400;
export const scenario = params.defaults;
export const memoryScales = params.memory_scales;
export const AS_OF_YEAR = Number(params.as_of.slice(0, 4));

/** Сколько проверок нужно исполнителю для поиска среди n вариантов (√N — порядок Гровера; точнее ≈ π/4·√N). */
export function steps(id: ExecutorId, n: number): number {
  return executors[id].algorithm === "grover" ? Math.sqrt(n) : n;
}

/** Время решения неструктурированного поиска среди n вариантов, секунды. */
export function solveSeconds(id: ExecutorId, n: number, checkTicks = DEFAULT_CHECK, oracleSpeedup = 1): number {
  const rate = executors[id].ops_per_s * (id === "oracle" ? oracleSpeedup : 1);
  return (steps(id, n) * checkTicks) / rate;
}

/** Где Оракул (Гровер) догоняет классического исполнителя: N* = (Rc/Rq)², T* = Rc·M/Rq². */
export function crossover(classical: Exclude<ExecutorId, "oracle">, checkTicks = DEFAULT_CHECK, oracleSpeedup = 1) {
  const rc = executors[classical].ops_per_s;
  const rq = executors.oracle.ops_per_s * oracleSpeedup;
  return { n: (rc / rq) ** 2, seconds: (rc * checkTicks) / rq ** 2 };
}

/** Вероятность найти отмеченный вариант после k итераций Гровера среди n: sin²((2k+1)θ), sinθ = 1/√n. */
export function groverSuccess(n: number, k: number): number {
  const theta = Math.asin(1 / Math.sqrt(n));
  return Math.sin((2 * k + 1) * theta) ** 2;
}

/** Оптимальное число итераций Гровера ≈ π/4·√n. */
export function groverOptimal(n: number): number {
  const theta = Math.asin(1 / Math.sqrt(n));
  return Math.max(0, Math.round(Math.PI / (4 * theta) - 0.5));
}

/** Время загрузки данных через канал ввода-вывода, секунды. */
export function loadSeconds(who: "factory" | "oracle", bytes: number): number {
  return (bytes * 8) / (params.io_gbit_per_s[who].value * 1e9);
}

/** Сколько чисел нужно хранить классически для точного описания n квантовых «мест»: 2ⁿ. */
export function stateVectorSize(n: number): number {
  return 2 ** n;
}

/** Закон Амдала: ускорение при доле неделимой работы s и p исполнителях. */
export function amdahl(serialFraction: number, workers: number): number {
  return 1 / (serialFraction + (1 - serialFraction) / workers);
}

/** Учебный Шор: период a^x mod n (только для маленьких n). */
export function period(a: number, n: number): number {
  let v = a % n;
  for (let r = 1; r <= n; r++) {
    if (v === 1) return r;
    v = (v * a) % n;
  }
  throw new Error("период не найден");
}

/** Во сколько раз тики одного исполнителя быстрее, чем у другого. */
export function rateRatio(fast: ExecutorId, slow: ExecutorId): number {
  return executors[fast].ops_per_s / executors[slow].ops_per_s;
}

/** Длительность одного такта, секунды. */
export function cycleSeconds(id: "factory" | "oracle"): number {
  return executors[id].cycle_s;
}

/** «Ширина»: сколько тиков исполнитель делает за один такт. */
export function opsPerCycle(id: "factory" | "oracle"): number {
  return executors[id].ops_per_s * cycleSeconds(id);
}

/** Тиков в секунду, пересчитанные из ядер, операций за такт, бит на операцию и частоты. */
export function derivedRate(id: "master" | "brigade"): number {
  const d = executors[id].derivation;
  return d.cores * d.ops_per_cycle * d.bits_per_op * d.clock_hz;
}

/** Какую долю своего перебора Оракул прошёл за seconds (не больше 1). */
export function oracleShareDone(n: number, seconds: number, checkTicks = DEFAULT_CHECK): number {
  return Math.min(1, seconds / solveSeconds("oracle", n, checkTicks));
}

/** Длина пароля, у которого n вариантов при данном алфавите. */
export function passwordLength(n: number, alphabet = scenario.password_alphabet): number {
  return Math.log(n) / Math.log(alphabet);
}

/** Физических кубитов на один логический в поверхностном коде дистанции d: 2d². */
export function physicalPerLogical(d: number): number {
  return 2 * d * d;
}

/** Сколько лет алгоритму Дейкстры на дату модели. */
export function dijkstraAge(): number {
  return AS_OF_YEAR - params.dijkstra.conceived;
}

/** Линейная оценка времени Дейкстры на одном ядре по замеру на дорожной сети Европы, секунды. */
export function dijkstraSeconds(nodes: number): number {
  return (params.road_network.dijkstra_seconds * nodes) / params.road_network.nodes;
}

/** Ближайшая степень десяти снизу: для «больше чем в 10 миллиардов раз». */
export function powerOfTenBelow(x: number): number {
  return 10 ** Math.floor(Math.log10(x));
}

/**
 * Во сколько раз упрощение «Оракулу √N, Мастеру N» подыгрывает Оракулу по сравнению с точным счётом:
 * Гровер на деле требует ≈π/4·√N итераций (√N завышает ему в 4/π раза), а классическому перебору
 * в среднем хватает N/2 (N завышает вдвое). Итог: 2 / (4/π) = π/2.
 */
export function oracleFavour(): number {
  const groverExact = Math.PI / 4;
  const classicalAverage = 1 / 2;
  return groverExact / classicalAverage;
}

/** Шагов деления пополам, чтобы найти страницу среди n. */
export function halvingSteps(n: number): number {
  return Math.ceil(Math.log2(n));
}

/** Тиков в секунду у одного работника: одно ядро CPU или один поток GPU. */
export function laneRate(id: Classical): number {
  if (id === "factory") {
    const l = executors.factory.lane;
    return l.clock_hz * l.ops_per_cycle * l.bits_per_op;
  }
  const d = executors[id].derivation;
  return d.ops_per_cycle * d.bits_per_op * d.clock_hz;
}

/** Цепочка зависимых шагов: её не поделить, считает один работник, секунды. */
export function chainSeconds(id: Classical, items: number, ticks: number): number {
  return (items * ticks) / laneRate(id);
}

/** Во сколько раз вход Фабрики шире, чем у Оракула. */
export function ioRatio(): number {
  return params.io_gbit_per_s.factory.value / params.io_gbit_per_s.oracle.value;
}

/** Куда помещаются 2ⁿ чисел: первое хранилище, которого хватает (fits), иначе — самое большое (over). */
export function memoryPlace(n: number): { id: ScaleId; fits: boolean } {
  const need = stateVectorSize(n);
  const fit = memoryScales.find((s) => s.capacity_numbers >= need);
  const scale = fit ?? memoryScales[memoryScales.length - 1];
  return { id: scale.id as ScaleId, fits: fit !== undefined };
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** Учебный Шор: из периода r числа a по модулю n — множители gcd(a^(r/2) ∓ 1, n). */
export function shorFactors(a: number, n: number) {
  const r = period(a, n);
  if (r % 2 === 1) throw new Error("нечётный период");
  const half = r / 2;
  const square = a ** half;
  return { r, half, square, p: gcd(square - 1, n), q: gcd(square + 1, n) };
}

/** Остатки a¹ … a^count по модулю n: «ритм» для главы 6. */
export function powersMod(a: number, n: number, count: number): number[] {
  const out: number[] = [];
  let v = 1;
  for (let i = 0; i < count; i++) {
    v = (v * a) % n;
    out.push(v);
  }
  return out;
}

/** Исполнитель с наименьшим временем. */
export function bestExecutor(times: Partial<Record<ExecutorId, number>>): ExecutorId {
  const entries = Object.entries(times) as [ExecutorId, number][];
  return entries.reduce((best, e) => (e[1] < best[1] ? e : best))[0];
}

/** Шагов Оракулу при разных видах ускорения: √N, N^¼ и полином от числа цифр (log₂N)^k — оценка, params.poly_speedup. */
export function oracleSteps(kind: Speedup, n: number): number {
  if (kind === "sqrt") return Math.sqrt(n);
  if (kind === "quartic") return n ** 0.25;
  return Math.log2(n) ** params.poly_speedup.log_power;
}

/** Песочница финала: время на задачу размера n при цене проверки checkTicks. */
export function sandboxSeconds(id: ExecutorId, n: number, checkTicks: number, kind: Speedup): number {
  if (id !== "oracle") return solveSeconds(id, n, checkTicks);
  return (oracleSteps(kind, n) * checkTicks) / executors.oracle.ops_per_s;
}

/**
 * Делимая работа с неделимой долей s: неделимую часть считает один работник уровня Мастера,
 * делимую — весь исполнитель. При s = 0 — время гонки; ускорение не больше amdahl(s, работников).
 */
export function amdahlSeconds(id: Classical, items: number, ticks: number, s: number): number {
  return s * solveSeconds("master", items, ticks) + (1 - s) * solveSeconds(id, items, ticks);
}
