import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtExact, fmtPercent } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { decode } from "../../model/circuit";
import { basis, probabilities, rotate } from "../../model/statevector";
import { memoryScales, physicalPerLogical, scenario, stateVectorSize } from "../../model/tick";
import {
  ALL_PAIRS,
  ALL_TICKS,
  BITS,
  MUL,
  PAIRS,
  Q_ADD,
  Q_MUL,
  RELAY_ADD,
  RELAY_MUL,
  RUNS,
  TURN,
  TURN_DEG,
  X,
  Y,
} from "./numbers";

const t = ru.ch5;
const tick = ru.chapters.ch1;
const XY = { x: String(X), y: String(Y) };

/** Дверей в лотерее — как в пинболе «Квантового алгоритма»; кубитов — log₂ дверей. */
export const DOORS = scenario.pinball_doors;
export const QUBITS = Math.log2(DOORS);
/** Ряд растёт до стольких амплитуд, сколько ячеек в сравнении «Квантового алгоритма». */
export const MAX_QUBITS = Math.log2(scenario.compare_items);
/** Сколько фотонов игрок пускает через фильтр и сколько дверей открывает. */
export const MEASURES = 10;
export const LOOKS = 3;
/** Цель настройки стрелки: фильтр «1» пропускает фотон в трёх случаях из четырёх (выбор сцены, ±5 п. п.). Цель вентиля — через раз. */
export const TARGET = { p: 0.75, tolerance: 0.05, half: 0.5 };
/** Равная смесь: «0» после вентиля главы. */
export const MIXED = rotate(basis(1), 0, TURN);
/** Подписи двух исходов кубита: значения бита, а не числа модели. */
export const BIT = { zero: "«0»", one: "«1»" };

const [D_MIN, D_MAX] = params.surface_code.distances;
export const LATTICE = physicalPerLogical(D_MIN);
export const WILLOW = params.timeline.willow.qubits;
/** Первое число кубитов из доски памяти «Своего поля», чьи 2ⁿ амплитуд не влезают в ноутбук. */
const LAPTOP = memoryScales.find((s) => s.id === "laptop")!.capacity_numbers;
const BIG = scenario.memory_n.find((n) => stateVectorSize(n) > LAPTOP)!;

type Twice = keyof typeof t.interference.reply;
type See = keyof typeof t.lottery.reply;

export const slides: Slide[] = [
  {
    id: "nature",
    top: () => fill(t.nature.top, { year: String(eventYear("feynman")) }),
    bottom: () => t.nature.bottom,
    cites: ["feynman", "qcvc"],
    act: { kind: "next" },
  },
  {
    id: "arrow",
    top: (c) =>
      c.scene.filtered
        ? fill(t.arrow.filtered.top, { pf: fmtPercent(c.scene.pf ?? 0) })
        : c.scene.measured
          ? fill(t.arrow.done.top, { ones: String(c.scene.ones ?? 0), n: String(MEASURES), po: fmtPercent(c.scene.runP ?? 0) })
          : c.scene.tuned
            ? fill(t.arrow.tuned.top, { ...BIT, po: fmtPercent(c.scene.po ?? 0) })
            : fill(t.arrow.start.top, { tick: ru.chapters.ch1 }),
    bottom: (c) =>
      c.scene.filtered
        ? t.arrow.filtered.bottom
        : c.scene.measured
          ? t.arrow.done.bottom
          : c.scene.tuned
            ? t.arrow.tuned.bottom
            : fill(t.arrow.start.bottom, BIT),
    curious: [() => t.arrow.curious, () => t.arrow.curious2],
    cites: ["quillen", "qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "gate",
    top: (c) => {
      if (!c.scene.gated) return fill(t.gate.top, { tick: ru.chapters.ch1 });
      const pg = c.scene.pg ?? TARGET.half;
      if (pg < 0.01 || pg > 0.99) return fill(t.gate.done.axis, { bit: pg > 0.5 ? BIT.one : BIT.zero });
      return fill(t.gate.done.top, { ...BIT, p: fmtPercent(pg) });
    },
    bottom: (c) => (c.scene.gated ? t.gate.done.bottom : fill(t.gate.bottom, BIT)),
    curious: [() => t.gate.curious],
    cites: ["qcvc", "arute"],
    act: { kind: "scene" },
  },
  {
    id: "twiceBet",
    top: () => fill(t.twiceBet.top, { deg: TURN_DEG }),
    bottom: () => t.twiceBet.bottom,
    act: {
      kind: "bet",
      id: "twice",
      options: (["half", "zero", "one"] as const).map((id) => ({ id, label: () => fill(t.twiceBet[id], BIT) })),
      correct: () => (probabilities(rotate(MIXED, 0, TURN))[1] > 0.99 ? "one" : "half"),
    },
  },
  {
    id: "interference",
    top: (c) =>
      c.scene.interfered
        ? fill(t.interference.done.top, BIT)
        : fill(t.interference.ask, { deg: TURN_DEG, reply: t.interference.reply[c.answers.twice as Twice] ?? t.interference.reply.half }),
    bottom: (c) => (c.scene.interfered ? fill(t.interference.done.bottom, BIT) : t.interference.watch),
    cites: ["qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "lotteryBet",
    top: () => fill(t.lotteryBet.top, { q: String(QUBITS), doors: String(DOORS), deg: TURN_DEG }),
    bottom: () => t.lotteryBet.bottom,
    act: {
      kind: "bet",
      id: "see",
      options: (["all", "one", "none"] as const).map((id) => ({ id, label: () => t.lotteryBet[id] })),
      correct: () => "one",
    },
  },
  {
    id: "lottery",
    top: (c) =>
      c.scene.looked
        ? fill(t.lottery.done.top, {
            list: Array.from({ length: LOOKS }, (_, i) => String((c.scene[`look${i}`] ?? 0) + 1)).join(", "),
            doors: String(DOORS),
          })
        : fill(t.lottery.ask, { reply: t.lottery.reply[c.answers.see as See] ?? t.lottery.reply.all }),
    bottom: (c) => (c.scene.looked ? t.lottery.done.bottom : t.lottery.watch),
    curious: [() => fill(t.lottery.curious, { q: String(QUBITS) })],
    cites: ["qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "twoN",
    top: (c) => (c.scene.grown ? fill(t.twoN.done.top, { big: String(BIG), amps: fmtCount(stateVectorSize(BIG)) }) : t.twoN.top),
    bottom: (c) => (c.scene.grown ? fill(t.twoN.done.bottom, { field: ru.chapters.ch9 }) : t.twoN.bottom),
    cites: ["qcvc", "apple"],
    act: { kind: "scene" },
  },
  {
    id: "wires",
    top: (c) => (c.scene.wired ? fill(t.wires.done.top, BIT) : fill(t.wires.top, { deg: TURN_DEG })),
    bottom: (c) => (c.scene.wired ? fill(t.wires.done.bottom, { ...BIT, tick }) : t.wires.bottom),
    act: { kind: "scene" },
    cites: ["cuccaro"],
  },
  {
    id: "qadd",
    top: (c) =>
      fill(c.scene.qadded ? t.qadd.done.top : t.qadd.top, {
        ...XY,
        ...BIT,
        tick,
        sum: String(X + Y),
        q: fmtExact(Q_ADD),
        r: fmtExact(RELAY_ADD),
        bits: String(BITS),
      }),
    bottom: (c) => (c.scene.qadded ? fill(t.qadd.done.bottom, BIT) : t.qadd.bottom),
    curious: [
      () => t.qadd.curious1,
      () =>
        fill(t.qadd.curious2, {
          maj: String(params.quantum_adder.maj_gates),
          uma: String(params.quantum_adder.uma_gates),
          z: String(params.quantum_adder.carry_out_gates),
        }),
    ],
    cites: ["cuccaro"],
    act: { kind: "scene" },
  },
  {
    id: "qmul",
    top: (c) =>
      fill(c.scene.allDone ? t.qmul.all.top : c.scene.multiplied ? t.qmul.done.top : t.qmul.top, {
        ...XY,
        tick,
        p: String(X * Y),
        q: fmtExact(Q_MUL),
        r: fmtExact(RELAY_MUL),
        list: Array.from({ length: RUNS }, (_, k) => {
          const d = decode(ALL_PAIRS, c.scene[`pair${k}`] ?? 0);
          return fill(t.scene.product, { x: String(d.a), y: String(d.b), p: String(d.p) });
        }).join(", "),
        pairs: String(PAIRS),
        k: fmtExact(ALL_TICKS),
      }),
    bottom: (c) =>
      c.scene.allDone
        ? fill(t.qmul.all.bottom, { w: String(MUL.wires.length), amps: fmtCount(stateVectorSize(MUL.wires.length)) })
        : c.scene.runs
          ? t.qmul.again
          : c.scene.multiplied
            ? fill(t.qmul.done.bottom, { deg: TURN_DEG })
            : t.qmul.bottom,
    curious: [
      () => fill(t.qmul.curious1, { s: String(2 * BITS) }),
      () => fill(t.qmul.curious2, { turns: String(2 * BITS), deg: TURN_DEG }),
    ],
    cites: ["hoefler", "cuccaro"],
    act: { kind: "scene" },
  },
  {
    id: "qsandbox",
    top: (c) => (c.scene.qplayed ? t.qsandbox.done.top : fill(t.qsandbox.top, { deg: TURN_DEG })),
    bottom: (c) =>
      c.scene.qplayed
        ? fill(t.qsandbox.done.bottom, {
            ra: fmtExact(RELAY_ADD),
            rm: fmtExact(RELAY_MUL),
            qa: fmtExact(Q_ADD),
            qm: fmtExact(Q_MUL),
          })
        : t.qsandbox.bottom,
    cites: ["cuccaro"],
    act: { kind: "scene" },
  },
  {
    id: "noisy",
    top: () => t.noisy.top,
    bottom: () => fill(t.noisy.bottom, { min: fmtCount(physicalPerLogical(D_MIN)), max: fmtCount(physicalPerLogical(D_MAX)) }),
    cites: ["preskill", "beverland"],
    act: { kind: "next" },
  },
  {
    id: "today",
    top: () => fill(t.today.top, { willow: fmtCount(WILLOW) }),
    bottom: () => t.today.bottom,
    cites: ["willow", "willowNature", "hoefler"],
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r5",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch6 }) },
  },
];
