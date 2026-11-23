// Схемы на кубитах считают правильно, и их тики совпадают с формулами tick.ts.
import { describe, expect, it } from "vitest";
import { adder, basisIndex, decode, encode, multiplier, states, toffolis, wireValues, withTurns, type Circuit } from "./circuit";
import { basis, probabilities } from "./statevector";
import { quantumAdderTicks, quantumMultiplierTicks } from "./tick";
import { BRIDGE } from "../chapters/ch5/numbers";

/** Итоговый базисный индекс схемы на входе values. */
function run(c: Circuit, values: Parameters<typeof encode>[1]): number {
  const s = states(c, basis(c.wires.length, encode(c, values)));
  const i = basisIndex(s[s.length - 1]);
  expect(i).not.toBeNull();
  return i!;
}

describe("сумматор Куккаро", () => {
  it.each([2, 3])("%i бита: все пары складываются, a восстановлено, перенос обнулён", (n) => {
    const c = adder(n);
    for (let a = 0; a < 2 ** n; a++)
      for (let b = 0; b < 2 ** n; b++) {
        const out = decode(c, run(c, { a, b }));
        expect(out.b + out.z * 2 ** n).toBe(a + b);
        expect([out.a, out.c]).toEqual([a, 0]);
      }
    expect(c.gates.length).toBe(quantumAdderTicks(n));
  });
  it("13 и 19 вентилей; у двух разрядов — 4 Тоффоли", () => {
    expect([adder(2).gates.length, adder(3).gates.length]).toEqual([13, 19]);
    expect(toffolis(adder(2))).toBe(4);
  });
  it("обратим: вентили в обратном порядке возвращают вход", () => {
    const c = adder(2);
    const start = encode(c, { a: 3, b: 2 });
    const forward = run(c, { a: 3, b: 2 });
    const back = states({ ...c, gates: [...c.gates].reverse() }, basis(c.wires.length, forward));
    expect(basisIndex(back[back.length - 1])).toBe(start);
  });
});

describe("умножение столбиком", () => {
  it("2 × 2 бита: все 16 пар, строка и перенос обнулены; 34 вентиля на 11 кубитах", () => {
    const c = multiplier(2);
    for (let a = 0; a < 4; a++)
      for (let b = 0; b < 4; b++) {
        const out = decode(c, run(c, { a, b }));
        expect([out.p, out.s, out.c]).toEqual([a * b, 0, 0]);
      }
    expect(c.gates.length).toBe(quantumMultiplierTicks(2));
    expect(c.gates.length).toBe(34);
    expect(c.wires.length).toBe(11);
  });
  it("все пары сразу: 16 равных исходов, у каждого p = a·b; 38 вентилей", () => {
    const c = withTurns(multiplier(2), ["a", "b"], Math.PI / 4);
    const s = states(c, basis(c.wires.length));
    const p = probabilities(s[s.length - 1]);
    const outcomes = p.flatMap((x, i) => (x > 1e-9 ? [i] : []));
    expect(outcomes).toHaveLength(16);
    for (const i of outcomes) {
      expect(p[i]).toBeCloseTo(1 / 16, 9);
      const out = decode(c, i);
      expect(out.p).toBe(out.a * out.b);
    }
    expect(c.gates.length).toBe(38);
  });
  it("песочница: повёрнутые входы сложения — 16 исходов, у каждого b + z·4 − a — исходное b; 17 вентилей", () => {
    const c = withTurns(adder(2), ["a", "b"], Math.PI / 4);
    const s = states(c, basis(c.wires.length));
    const p = probabilities(s[s.length - 1]);
    const outcomes = p.flatMap((x, i) => (x > 1e-9 ? [i] : []));
    expect(outcomes).toHaveLength(16);
    for (const i of outcomes) {
      const d = decode(c, i);
      expect(d.b + d.z * 4 - d.a).toBeGreaterThanOrEqual(0);
      expect(d.b + d.z * 4 - d.a).toBeLessThanOrEqual(3);
      expect(d.c).toBe(0);
    }
    expect(c.gates.length).toBe(quantumAdderTicks(2) + 4);
    expect(c.gates.length).toBe(17);
  });
});

describe("мост главы «Кубит»", () => {
  it("CNOT при A = «0» не трогает B; два поворота на 45° доводят A до «1»; тот же CNOT переворачивает B; 4 вентиля", () => {
    const s = states(BRIDGE, basis(BRIDGE.wires.length));
    expect(basisIndex(s[1])).toBe(encode(BRIDGE, { a: 0, b: 0 }));
    expect(wireValues(BRIDGE, s[2])).toEqual([null, 0]);
    expect(basisIndex(s[3])).toBe(encode(BRIDGE, { a: 1, b: 0 }));
    expect(basisIndex(s[4])).toBe(encode(BRIDGE, { a: 1, b: 1 }));
    expect(BRIDGE.gates.length).toBe(4);
  });
});
