import type { Ctx, Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtPercent, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { groverOptimal, groverSuccess, handSteps, hands, qcFavour, scenario, stepCrossover, type ExecutorId } from "../../model/tick";
import { exName } from "../../ui/names";

const t = ru.ch6;
const DOORS = scenario.pinball_doors;
export const OPTIMAL = groverOptimal(DOORS);
export const REPEATS = [1, 2, 3, 4];
export const ALL: ExecutorId[] = ["core", "cores", "gpu", "qc"];
export const ITEMS = scenario.compare_items;
export const BIG = scenario.pinball_big_n;

/** Кому нужно меньше всего шагов подряд среди n вариантов. */
export function fewest(n: number): ExecutorId {
  return ALL.reduce((a, b) => (handSteps(b, n) < handSteps(a, n) ? b : a));
}
// Тексты fewestDone называют победителя по имени: если модель изменится, текст должен измениться вместе с ней.
if (fewest(BIG) !== "gpu") throw new Error("ch6: меньше всего шагов среди pinball_big_n больше не у видеокарты — перепиши fewestDone");

/** Цепочка шансов после 0…k пар «Метка → Отражение». */
export function chain(k: number): string {
  return Array.from({ length: k + 1 }, (_, j) => fmtPercent(groverSuccess(DOORS, j))).join(" → ");
}

const prev = { prev: ru.chapters.ch5 };
const chosen = (c: Ctx) => Number(c.answers.repeats ?? OPTIMAL);
const pct = (c: Ctx, key: string) => fmtPercent(c.scene[key] ?? 0);
const steps = (id: ExecutorId, n: number) => fmtCount(handSteps(id, n));

function verdictKey(c: Ctx): keyof typeof t.verdict.reply {
  const k = chosen(c);
  return k < OPTIMAL ? "under" : k > OPTIMAL ? "over" : "right";
}

function fewestReply(c: Ctx): string {
  const pick = (c.answers.fewest ?? "qc") as ExecutorId;
  const values = { best: steps("gpu", BIG), qc: steps("qc", BIG), name: exName(pick), mine: steps(pick, BIG) };
  const key = pick === fewest(BIG) ? "right" : pick === "qc" ? "qc" : "other";
  return fill(t.fewestDone.reply[key], values);
}

export const slides: Slide[] = [
  {
    id: "doors",
    top: () => fill(t.doors.top, { doors: fmtCount(DOORS) }),
    bottom: () => fill(t.doors.bottom, { ...prev, p: fmtPercent(groverSuccess(DOORS, 0)) }),
    act: { kind: "next" },
  },
  {
    id: "idea",
    top: () => fill(t.idea.top, { year: String(eventYear("grover")) }),
    cites: ["grover"],
    act: { kind: "next", label: () => t.idea.label },
  },
  { id: "bars", top: () => fill(t.bars.top, { ...prev, p: fmtPercent(groverSuccess(DOORS, 0)) }), act: { kind: "next" } },
  { id: "mark", top: () => t.mark.top, act: { kind: "scene" } },
  {
    id: "markDone",
    top: (c) => fill(t.markDone.top, { p: pct(c, "p") }),
    act: { kind: "next", label: () => t.markDone.label },
  },
  { id: "reflect", top: () => t.reflect.top, act: { kind: "scene" } },
  {
    id: "reflectDone",
    top: (c) => fill(t.reflectDone.top, { before: pct(c, "p0"), after: pct(c, "p1") }),
    act: { kind: "next", label: () => t.reflectDone.label },
  },
  {
    id: "waves",
    top: () => fill(t.waves.top, prev),
    quote: { who: "grover", text: () => t.waves.quote, cite: "grover" },
    act: { kind: "next", label: () => t.waves.label },
  },
  {
    id: "bet",
    top: () => fill(t.bet.top, { p: fmtPercent(groverSuccess(DOORS, 1)) }),
    bottom: () => t.bet.bottom,
    act: {
      kind: "bet",
      id: "repeats",
      options: REPEATS.map((k) => ({ id: String(k), label: () => fmtCount(k) })),
      correct: () => String(OPTIMAL),
    },
  },
  { id: "play", top: (c) => fill(t.play.top, { k: fmtCount(chosen(c)) }), act: { kind: "scene" } },
  {
    id: "verdict",
    top: (c) => fill(t.verdict.top, { reply: t.verdict.reply[verdictKey(c)], chain: chain(chosen(c)) }),
    act: { kind: "next" },
  },
  {
    id: "optimum",
    top: () =>
      fill(t.optimum.top, {
        k: fmtCount(OPTIMAL),
        pk: fmtPercent(groverSuccess(DOORS, OPTIMAL)),
        next: fmtPercent(groverSuccess(DOORS, OPTIMAL + 1)),
      }),
    act: { kind: "scene", label: () => t.optimum.label },
  },
  {
    id: "million",
    top: () => fill(t.million.top, { n: fmtCount(BIG), k: fmtCount(groverOptimal(BIG)) }),
    bottom: () => t.million.bottom,
    act: { kind: "next" },
  },
  {
    id: "grover",
    top: () => t.grover.top,
    curious: [() => t.grover.footnote1, () => fill(t.grover.footnote2, { x: fmtTimes(qcFavour()) })],
    cites: ["grover", "bbbv", "threeBlue"],
    act: { kind: "next", label: () => t.grover.label },
  },
  {
    id: "compare",
    top: () => fill(t.compare.top, { items: fmtCount(ITEMS) }),
    bottom: () => t.compare.bottom,
    act: { kind: "scene" },
  },
  {
    id: "howSteps",
    top: () => t.howSteps.top,
    bottom: () =>
      fill(t.howSteps.bottom, {
        core: exName("core"),
        cores: exName("cores"),
        a: steps("core", ITEMS),
        b: steps("cores", ITEMS),
        c: steps("gpu", ITEMS),
      }),
    act: { kind: "next" },
  },
  {
    id: "howQc",
    top: () => fill(t.howQc.top, { items: fmtCount(ITEMS), qc: steps("qc", ITEMS) }),
    bottom: () => t.howQc.bottom,
    act: { kind: "next" },
  },
  {
    id: "fewestBet",
    top: () => fill(t.fewestBet.top, { n: fmtCount(BIG) }),
    bottom: () => t.fewestBet.bottom,
    act: {
      kind: "bet",
      id: "fewest",
      options: ALL.map((id) => ({ id, label: () => exName(id) })),
      correct: () => fewest(BIG),
    },
  },
  {
    id: "fewestDone",
    top: fewestReply,
    bottom: () => fill(t.fewestDone.bottom, { lanes: fmtCount(hands("gpu")) }),
    act: { kind: "next" },
  },
  {
    id: "stepSlider",
    top: () => t.stepSlider.top,
    bottom: () => t.stepSlider.bottom,
    curious: [() => fill(t.stepSlider.curious, { n: fmtCount(stepCrossover("gpu")) })],
    act: { kind: "scene" },
  },
  {
    id: "bridge",
    top: () => t.bridge.top,
    bottom: () => fill(t.bridge.bottom, { next: ru.chapters.ch7 }),
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r6",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch7 }) },
  },
];
