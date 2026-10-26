/**
 * Маленький симулятор вектора состояния для глав «Кубит» и «Квантовый алгоритм».
 * Амплитуды действительные: Адамар, смена знака и отражение их не выводят в комплексные.
 * Базисный индекс i: бит q — состояние кубита q.
 */
export type Amps = number[];

export function basis(n: number, index = 0): Amps {
  const a: Amps = new Array(2 ** n).fill(0);
  a[index] = 1;
  return a;
}

/** Гейт Адамара на кубите q: пары (i, i|2^q) → ((x+y)/√2, (x−y)/√2). */
export function hadamard(a: Amps, q: number): Amps {
  const out = a.slice();
  const bit = 1 << q;
  for (let i = 0; i < a.length; i++) {
    if (i & bit) continue;
    const x = a[i];
    const y = a[i | bit];
    out[i] = (x + y) / Math.SQRT2;
    out[i | bit] = (x - y) / Math.SQRT2;
  }
  return out;
}

/** Поворот кубита q на угол theta: пары (i, i|2^q) → (x·cos − y·sin, x·sin + y·cos). Стрелка «0»→«1» поворачивается к «1». */
export function rotate(a: Amps, q: number, theta: number): Amps {
  const out = a.slice();
  const bit = 1 << q;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  for (let i = 0; i < a.length; i++) {
    if (i & bit) continue;
    const x = a[i];
    const y = a[i | bit];
    out[i] = x * c - y * s;
    out[i | bit] = x * s + y * c;
  }
  return out;
}

/**
 * Шанс, что фотон-кубит пройдёт фильтр, ось которого повёрнута на angle от «0» к «1»:
 * квадрат тени стрелки на ось фильтра (закон Малюса для одного фотона). Фильтр «1» — angle = π/2.
 */
export function filterPass(a: Amps, angle: number): number {
  return (a[0] * Math.cos(angle) + a[1] * Math.sin(angle)) ** 2;
}

export function hadamardAll(a: Amps): Amps {
  let out = a;
  for (let q = 0; 1 << q < a.length; q++) out = hadamard(out, q);
  return out;
}

/** Равная суперпозиция всех 2^n вариантов. */
export function uniform(n: number): Amps {
  return hadamardAll(basis(n, 0));
}

/** «Метка»: знак амплитуды нужной двери меняется на противоположный. */
export function mark(a: Amps, target: number): Amps {
  return a.map((x, i) => (i === target ? -x : x));
}

/** «Отражение» (диффузия Гровера) через гейты: H⊗n · (2|0⟩⟨0| − I) · H⊗n. */
export function reflect(a: Amps): Amps {
  const h = hadamardAll(a);
  return hadamardAll(h.map((x, i) => (i === 0 ? x : -x)));
}

export function probabilities(a: Amps): number[] {
  return a.map((x) => x * x);
}

export function mean(a: Amps): number {
  return a.reduce((s, x) => s + x, 0) / a.length;
}

/** Измерение: случайный исход с вероятностью квадрата амплитуды; rng() ∈ [0, 1). */
export function measure(a: Amps, rng: () => number): number {
  const r = rng();
  let acc = 0;
  let last = 0;
  for (let i = 0; i < a.length; i++) {
    const p = a[i] * a[i];
    if (p === 0) continue;
    acc += p;
    last = i;
    if (r < acc) return i;
  }
  return last;
}
