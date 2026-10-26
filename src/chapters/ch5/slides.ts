import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtNum, fmtPercent } from "../../i18n/format";
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

export const slides: Slide[] = [
  {
    id: "nature",
    top: () => fill(t.nature.top, { year: String(eventYear("feynman")) }),
    cites: ["feynman", "qcvc"],
    act: { kind: "next" },
  },
  { id: "bitQubit", top: () => t.bitQubit.top, bottom: () => fill(t.bitQubit.bottom, BIT), act: { kind: "next" } },
  { id: "bitHow", top: () => fill(t.bitHow.top, BIT), cites: ["qcvc"], act: { kind: "next" } },
  { id: "h1", top: () => t.h1.top, act: { kind: "scene" } },
  {
    id: "h1Done",
    top: (c) =>
      fill(t.h1Done.top, {
        ...BIT,
        zeros: String(c.scene.zeros ?? 0),
        ones: String(c.scene.ones ?? 0),
        p: fmtPercent(probabilities(MIXED)[0]),
      }),
    curious: [
      () => fill(t.h1Done.curious1, { a: fmtNum(MIXED[0]), p: fmtPercent(probabilities(MIXED)[0]) }),
      () => t.h1Done.curious2,
    ],
    cites: ["qcvc"],
    act: { kind: "next" },
  },
  { id: "h1Link", top: () => t.h1Link.top, bottom: () => t.h1Link.bottom, cites: ["qcvc"], act: { kind: "next" } },
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
    top: (c) => t.interference.reply[c.answers.twice as "half" | "zero" | "one"] ?? t.interference.reply.half,
    act: { kind: "scene" },
  },
  {
    id: "interferenceHow",
    top: () => fill(t.interferenceHow.top, BIT),
    bottom: () => t.interferenceHow.bottom,
    cites: ["qcvc"],
    act: { kind: "next" },
  },
  {
    id: "interferenceLink",
    top: () => t.interferenceLink.top,
    bottom: () => t.interferenceLink.bottom,
    cites: ["qcvc"],
    act: { kind: "next" },
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
    top: (c) => t.lottery.reply[c.answers.see as "all" | "one" | "none"] ?? t.lottery.reply.all,
    act: { kind: "scene" },
  },
  {
    id: "lotteryDone",
    top: (c) =>
      fill(t.lotteryDone.top, {
        list: Array.from({ length: LOOKS }, (_, i) => String((c.scene[`look${i}`] ?? 0) + 1)).join(", "),
        doors: String(DOORS),
      }),
    bottom: () => t.lotteryDone.bottom,
    curious: [() => fill(t.lotteryDone.curious, { q: String(QUBITS) })],
    cites: ["qcvc"],
    act: { kind: "next" },
  },
  { id: "twoN", top: () => t.twoN.top, act: { kind: "scene" } },
  {
    id: "twoNDone",
    top: () => fill(t.twoNDone.top, { big: String(BIG), amps: fmtCount(stateVectorSize(BIG)) }),
    bottom: () => fill(t.twoNDone.bottom, { field: ru.chapters.ch9 }),
    cites: ["qcvc", "apple"],
    act: { kind: "next" },
  },
  { id: "noisy", top: () => t.noisy.top, bottom: () => t.noisy.bottom, cites: ["preskill"], act: { kind: "next" } },
  {
    id: "logical",
    top: () => t.logical.top,
    bottom: () =>
      fill(t.logical.bottom, { min: fmtCount(physicalPerLogical(D_MIN)), max: fmtCount(physicalPerLogical(D_MAX)) }),
    cites: ["beverland"],
    act: { kind: "next" },
  },
  {
    id: "today",
    top: () => fill(t.today.top, { willow: fmtCount(WILLOW) }),
    bottom: () => fill(t.today.bottom, { min: fmtCount(LATTICE) }),
    cites: ["willow", "willowNature", "beverland"],
    act: { kind: "next" },
  },
  { id: "future", top: () => t.future.top, bottom: () => t.future.bottom, cites: ["hoefler"], act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r5",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch6 }) },
  },
];
