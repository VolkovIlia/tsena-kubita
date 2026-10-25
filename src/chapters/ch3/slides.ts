import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtPercent, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { groverOptimal, groverSuccess, oracleFavour, scenario } from "../../model/tick";

const t = ru.ch3;
const DOORS = scenario.pinball_doors;
export const OPTIMAL = groverOptimal(DOORS);
export const REPEATS = [1, 2, 3, 4];

/** Цепочка шансов после 0…k пар «Метка → Отражение». */
export function chain(k: number): string {
  return Array.from({ length: k + 1 }, (_, j) => fmtPercent(groverSuccess(DOORS, j))).join(" → ");
}

const chosen = (c: Ctx) => Number(c.answers.repeats ?? OPTIMAL);
const pct = (c: Ctx, key: string) => fmtPercent(c.scene[key] ?? 0);

function verdictKey(c: Ctx): keyof typeof t.verdict.reply {
  const k = chosen(c);
  return k < OPTIMAL ? "under" : k > OPTIMAL ? "over" : "right";
}

export const slides: Slide[] = [
  { id: "arrive", top: () => t.arrive.top, say: { who: "oracle", text: () => t.arrive.say }, act: { kind: "next" } },
  { id: "future", top: () => t.future.top, say: { who: "oracle", text: () => t.future.say }, act: { kind: "next" } },
  {
    id: "doors",
    top: () => fill(t.doors.top, { doors: String(DOORS) }),
    say: { who: "margo", text: () => t.doors.say },
    bottom: () => t.doors.bottom,
    act: { kind: "scene" },
  },
  {
    id: "lottery",
    top: (c) => fill(t.lottery.top, { looks: String(c.scene.looks ?? 0), hits: String(c.scene.hits ?? 0) }),
    say: { who: "oracle", text: () => t.lottery.say },
    act: { kind: "next" },
  },
  { id: "bars", top: () => t.bars.top, act: { kind: "next" } },
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
    say: { who: "oracle", text: () => t.reflectDone.say },
    act: { kind: "next", label: () => t.reflectDone.label },
  },
  {
    id: "bet",
    top: () => fill(t.bet.top, { p: fmtPercent(groverSuccess(DOORS, 1)) }),
    bottom: () => t.bet.bottom,
    act: {
      kind: "bet",
      id: "repeats",
      options: REPEATS.map((k) => ({ id: String(k), label: () => String(k) })),
      correct: () => String(OPTIMAL),
    },
  },
  { id: "play", top: (c) => fill(t.play.top, { k: String(chosen(c)) }), act: { kind: "scene" } },
  {
    id: "verdict",
    top: (c) => fill(t.verdict.top, { chain: chain(chosen(c)) }),
    say: { who: "oracle", text: (c) => t.verdict.reply[verdictKey(c)] },
    act: { kind: "next" },
  },
  {
    id: "optimum",
    top: () =>
      fill(t.optimum.top, {
        k: String(OPTIMAL),
        pk: fmtPercent(groverSuccess(DOORS, OPTIMAL)),
        next: fmtPercent(groverSuccess(DOORS, OPTIMAL + 1)),
      }),
    act: { kind: "scene", label: () => t.optimum.label },
  },
  {
    id: "million",
    top: () =>
      fill(t.million.top, {
        n: fmtCount(scenario.pinball_big_n),
        k: fmtCount(groverOptimal(scenario.pinball_big_n)),
      }),
    say: { who: "margo", text: () => t.million.say },
    bottom: () => t.million.bottom,
    act: { kind: "next" },
  },
  {
    id: "grover",
    top: () => t.grover.top,
    say: { who: "master", text: () => t.grover.say, note: t.grover.note },
    curious: [() => t.grover.footnote1, () => fill(t.grover.footnote2, { x: fmtTimes(oracleFavour()) })],
    cites: ["grover", "bbbv", "threeBlue"],
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r3",
    act: { kind: "next", label: () => t.rule.label },
  },
];
