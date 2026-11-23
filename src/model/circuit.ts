/**
 * Обратимые схемы на кубитах для главы «Кубит»: сумматор Куккаро и умножение столбиком.
 * Чисел здесь нет — число вентилей и проводов следует из устройства схем; tick.ts считает те же тики формулами,
 * совпадение проверяет circuit.test.ts. Провод k — кубит k вектора состояния (бит k индекса).
 */
import { cnot, rotate, toffoli, type Amps } from "./statevector";

/** Регистры: слагаемые a и b, перенос c, старший разряд суммы z, произведение p, строка «И» s. */
export type Reg = "a" | "b" | "c" | "z" | "p" | "s";
export interface Wire {
  reg: Reg;
  i: number;
}
export type Gate =
  | { kind: "cx"; c: number; t: number }
  | { kind: "ccx"; c1: number; c2: number; t: number }
  | { kind: "turn"; q: number; theta: number };
export interface Circuit {
  wires: Wire[];
  gates: Gate[];
}

const REGS: Reg[] = ["a", "b", "c", "z", "p", "s"];
const cx = (c: number, t: number): Gate => ({ kind: "cx", c, t });
const ccx = (c1: number, c2: number, t: number): Gate => ({ kind: "ccx", c1, c2, t });
const range = (from: number, n: number) => Array.from({ length: n }, (_, i) => from + i);
const reg = (r: Reg, n: number): Wire[] => range(0, n).map((i) => ({ reg: r, i }));

/** Блок MAJ: перенос поднимается в провод a (2 CNOT + Тоффоли). */
const maj = (c: number, b: number, a: number): Gate[] => [cx(a, b), cx(a, c), ccx(c, b, a)];
/** Блок UMA: перенос убирается, в b остаётся разряд суммы (Тоффоли + 2 CNOT). */
const uma = (c: number, b: number, a: number): Gate[] => [ccx(c, b, a), cx(a, c), cx(c, b)];

/** Сумматор Куккаро: B += A, старший разряд — в Z; X — перенос, на входе и выходе 0. */
function adderGates(A: number[], B: number[], X: number, Z: number): Gate[] {
  const n = A.length;
  const up = range(1, n - 1).flatMap((i) => maj(A[i - 1], B[i], A[i]));
  const down = range(1, n - 1)
    .reverse()
    .flatMap((i) => uma(A[i - 1], B[i], A[i]));
  return [...maj(X, B[0], A[0]), ...up, cx(A[n - 1], Z), ...down, ...uma(X, B[0], A[0])];
}

/** Сложение bits-битных a и b: после схемы b — младшие разряды суммы, z — старший, a восстановлено, c = 0. */
export function adder(bits: number): Circuit {
  const A = range(0, bits);
  const B = range(bits, bits);
  return {
    wires: [...reg("a", bits), ...reg("b", bits), ...reg("c", 1), ...reg("z", 1)],
    gates: adderGates(A, B, 2 * bits, 2 * bits + 1),
  };
}

/** Умножение столбиком: на каждый разряд b_j — строка s = a·b_j (Тоффоли), сложение p[j…] += s, строка убирается. */
export function multiplier(bits: number): Circuit {
  const A = range(0, bits);
  const B = range(bits, bits);
  const P = range(2 * bits, 2 * bits);
  const S = range(4 * bits, bits);
  const C = 5 * bits;
  const row = (j: number) => A.map((a, i) => ccx(a, B[j], S[i]));
  return {
    wires: [...reg("a", bits), ...reg("b", bits), ...reg("p", 2 * bits), ...reg("s", bits), ...reg("c", 1)],
    gates: range(0, bits).flatMap((j) => [...row(j), ...adderGates(S, P.slice(j, j + bits), C, P[j + bits]), ...row(j)]),
  };
}

/** Спереди — по повороту на theta каждого провода из regs, в порядке проводов: все входы сразу. */
export function withTurns(c: Circuit, regs: Reg[], theta: number): Circuit {
  const turns: Gate[] = c.wires.flatMap((w, q) => (regs.includes(w.reg) ? [{ kind: "turn" as const, q, theta }] : []));
  return { wires: c.wires, gates: [...turns, ...c.gates] };
}

export function applyGate(a: Amps, g: Gate): Amps {
  if (g.kind === "cx") return cnot(a, g.c, g.t);
  if (g.kind === "ccx") return toffoli(a, g.c1, g.c2, g.t);
  return rotate(a, g.q, g.theta);
}

/** states[k] — состояние после первых k вентилей; длина gates.length + 1. */
export function states(c: Circuit, start: Amps): Amps[] {
  const out = [start];
  for (const g of c.gates) out.push(applyGate(out[out.length - 1], g));
  return out;
}

/** Базисный индекс: бит i регистра — провод {reg, i}. */
export function encode(c: Circuit, values: Partial<Record<Reg, number>>): number {
  return c.wires.reduce((idx, w, k) => idx | ((((values[w.reg] ?? 0) >> w.i) & 1) << k), 0);
}

/** Значения регистров по базисному индексу; регистров, которых нет в схеме, — 0. */
export function decode(c: Circuit, index: number): Record<Reg, number> {
  const out = Object.fromEntries(REGS.map((r) => [r, 0])) as Record<Reg, number>;
  c.wires.forEach((w, k) => (out[w.reg] |= ((index >> k) & 1) << w.i));
  return out;
}

/** Индекс, если состояние — один базисный вектор (|амплитуда| > 0,999), иначе null. */
export function basisIndex(a: Amps): number | null {
  const i = a.findIndex((x) => Math.abs(x) > 0.999);
  return i < 0 ? null : i;
}

/** Бит каждого провода, если он одинаков во всех исходах с ненулевой амплитудой, иначе null — кубит в смеси. */
export function wireValues(c: Circuit, a: Amps): (number | null)[] {
  const live = a.flatMap((x, i) => (Math.abs(x) > 1e-6 ? [i] : []));
  return c.wires.map((_, q) => {
    const bit = (live[0] >> q) & 1;
    return live.every((i) => ((i >> q) & 1) === bit) ? bit : null;
  });
}

/** Число вентилей Тоффоли. */
export function toffolis(c: Circuit): number {
  return c.gates.filter((g) => g.kind === "ccx").length;
}
