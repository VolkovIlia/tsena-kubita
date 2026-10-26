import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtPercent } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { basis, hadamard, probabilities } from "../../model/statevector";
import { memoryScales, physicalPerLogical, scenario, stateVectorSize } from "../../model/tick";

const t = ru.ch5;

/** Дверей в лотерее — как в пинболе «Квантового алгоритма»; кубитов — log₂ дверей. */
export const DOORS = scenario.pinball_doors;
export const QUBITS = Math.log2(DOORS);
/** Ряд растёт до стольких амплитуд, сколько ячеек в сравнении «Квантового алгоритма». */
export const MAX_QUBITS = Math.log2(scenario.compare_items);
/** Сколько раз игрок измеряет смешанный кубит и открывает дверь. */
export const MEASURES = 10;
export const LOOKS = 3;
/** Смешанный кубит: Адамар на нуле. */
export const MIXED = hadamard(basis(1), 0);
/** Подписи двух исходов кубита: значения бита, а не числа модели. */
export const BIT = { zero: "«0»", one: "«1»" };

const [D_MIN, D_MAX] = params.surface_code.distances;
export const LATTICE = physicalPerLogical(D_MIN);
export const WILLOW = params.timeline.willow.qubits;
/** Первое число кубитов из доски памяти «Своего поля», чьи 2ⁿ амплитуд не влезают в ноутбук. */
const LAPTOP = memoryScales.find((s) => s.id === "laptop")!.capacity_numbers;
const BIG = scenario.memory_n.find((n) => stateVectorSize(n) > LAPTOP)!;

const p = fmtPercent(probabilities(MIXED)[0]);
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
      c.scene.measured
        ? fill(t.arrow.done.top, {
            ...BIT,
            zeros: String(c.scene.zeros ?? 0),
            ones: String(c.scene.ones ?? 0),
            pz: fmtPercent(c.scene.pz ?? 0),
            po: fmtPercent(c.scene.po ?? 0),
          })
        : fill(t.arrow.top, BIT),
    bottom: (c) => (c.scene.measured ? t.arrow.done.bottom : t.arrow.bottom),
    curious: [() => t.arrow.curious],
    cites: ["qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "gate",
    top: (c) => (c.scene.gated ? fill(t.gate.done.top, { ...BIT, p }) : fill(t.gate.top, { tick: ru.chapters.ch1 })),
    bottom: (c) => (c.scene.gated ? t.gate.done.bottom : fill(t.gate.bottom, BIT)),
    curious: [() => fill(t.gate.curious, BIT)],
    cites: ["qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "twiceBet",
    top: () => t.twiceBet.top,
    bottom: () => t.twiceBet.bottom,
    act: {
      kind: "bet",
      id: "twice",
      options: (["half", "zero", "one"] as const).map((id) => ({ id, label: () => fill(t.twiceBet[id], BIT) })),
      correct: () => "zero",
    },
  },
  {
    id: "interference",
    top: (c) =>
      c.scene.interfered
        ? fill(t.interference.done.top, BIT)
        : fill(t.interference.ask, { reply: t.interference.reply[c.answers.twice as Twice] ?? t.interference.reply.half }),
    bottom: (c) => (c.scene.interfered ? fill(t.interference.done.bottom, BIT) : t.interference.watch),
    cites: ["qcvc"],
    act: { kind: "scene" },
  },
  {
    id: "lotteryBet",
    top: () => fill(t.lotteryBet.top, { q: String(QUBITS), doors: String(DOORS) }),
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
