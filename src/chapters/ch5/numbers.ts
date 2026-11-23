/** Числа квантовой арифметики главы «Кубит»: только комбинации функций модели; операнды 2 + 2 и 2 × 2 — выбор сцены. */
import { adder, multiplier, toffolis, withTurns, type Circuit } from "../../model/circuit";
import { adderTicks, multiplierTicks, quantumAdderTicks, quantumMultiplierTicks } from "../../model/tick";

/** Вентиль главы — поворот на четверть прямого угла; из «0» он даёт равную смесь. */
export const TURN = Math.PI / 4;
export const TURN_DEG = String((TURN * 180) / Math.PI);

/** Разрядов в числах сцены и сами числа. */
export const BITS = 2;
export const X = 2;
export const Y = 2;

export const ADD = adder(BITS);
export const MUL = multiplier(BITS);
/** Все пары сразу: входные кубиты повёрнуты на угол вентиля главы. */
export const ALL_PAIRS = withTurns(MUL, ["a", "b"], TURN);

/**
 * Мост от стрелки к схемам: CNOT с A на B, пока A — «0» (B не меняется), два поворота A на угол вентиля главы,
 * тот же CNOT при A = «1» (B переворачивается). withTurns ставит повороты только спереди, поэтому вентили — списком.
 */
export const BRIDGE: Circuit = {
  wires: [{ reg: "a", i: 0 }, { reg: "b", i: 0 }],
  gates: [
    { kind: "cx", c: 0, t: 1 },
    { kind: "turn", q: 0, theta: TURN },
    { kind: "turn", q: 0, theta: TURN },
    { kind: "cx", c: 0, t: 1 },
  ],
};

/** Тики: реле и кубиты; tick.test.ts — 10, 13, 24, 34. */
export const RELAY_ADD = adderTicks(BITS);
export const Q_ADD = quantumAdderTicks(BITS);
export const RELAY_MUL = multiplierTicks(BITS);
export const Q_MUL = quantumMultiplierTicks(BITS);
export const ALL_TICKS = ALL_PAIRS.gates.length;
export const TOFF_ADD = toffolis(ADD);

/** Пар чисел на входе и сколько ответов игрок вытягивает. */
export const PAIRS = 2 ** (2 * BITS);
export const RUNS = 3;
