/**
 * Модель «тика» — честный счёт времени для всех гонок игры.
 * T = W(N) · M / R, где W(N) — число проверок (N для перебора, √N для Гровера),
 * M — тиков на одну проверку, R — тиков в секунду у исполнителя.
 * Источник модели: Hoefler, Häner, Troyer, CACM 2023 (arXiv:2307.00523).
 * Не вписывайте числа в тексты руками — берите их из этих функций.
 */
import params from "../../data/params.json";

export type ExecutorId = keyof typeof params.executors;
export const executors = params.executors;
export const DEFAULT_CHECK = params.defaults.check_ticks;
export const DAY = 86400;

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
