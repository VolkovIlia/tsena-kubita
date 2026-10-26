import type { Ctx, Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtDuration, fmtExact } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { ADD_TICKS, BITS, COUNT_ALOUD_S, CYCLE, DAY_TICKS, GATES, RATE, RATE_FLOOR, TPC, coreSeconds } from "./numbers";

const t = ru.ch1;
const n = {
  year: String(eventYear("shannon")),
  bits: fmtExact(BITS),
  gates: fmtExact(GATES),
  ticks: fmtExact(ADD_TICKS),
  hz: fmtCount(CYCLE.clock_hz),
  ops: fmtExact(CYCLE.ops_per_cycle),
  wordBits: fmtExact(CYCLE.bits_per_op),
  tpc: fmtCount(TPC),
  floor: fmtCount(RATE_FLOOR),
  rate: fmtCount(RATE),
  rateExact: fmtExact(RATE),
  years: fmtDuration(COUNT_ALOUD_S),
  add: fmtDuration(coreSeconds(ADD_TICKS)),
  dayTicks: fmtCount(DAY_TICKS),
};
type Rate = keyof typeof t.second.reply;
/** Живой слайд: пока игрок не сделал действие — задание, после — объяснение. Ключ — то, что ставит сцена. */
const live = (key: string, before: string, after: string) => (c: Ctx) => fill(c.scene[key] ? after : before, n);

export const slides: Slide[] = [
  {
    id: "lamp",
    top: live("lamp", t.lamp.top, t.lamp.done.top),
    bottom: live("lamp", t.lamp.bottom, t.lamp.done.bottom),
    act: { kind: "scene" },
    cites: ["shannon"],
  },
  {
    id: "xor",
    top: live("xor", t.xor.top, t.xor.done.top),
    bottom: live("xor", t.xor.bottom, t.xor.done.bottom),
    act: { kind: "scene" },
    cites: ["hoefler"],
  },
  {
    id: "adder",
    top: live("added", t.adder.top, t.adder.done.top),
    bottom: live("added", t.adder.bottom, t.adder.done.bottom),
    act: { kind: "scene" },
    curious: [() => fill(t.adder.curious, n)],
    cites: ["kuphaldt"],
  },
  {
    id: "clock",
    top: () => fill(t.clock.top, { ...n, bits: n.wordBits }),
    bottom: () => fill(t.clock.bottom, n),
    act: { kind: "next" },
    curious: [() => t.clock.curious],
    cites: ["uops", "amd"],
  },
  {
    id: "rateBet",
    top: () => t.rateBet.top,
    bottom: () => t.rateBet.bottom,
    act: {
      kind: "bet",
      id: "rate",
      options: (["cycle", "clock", "more"] as const).map((id) => ({ id, label: () => fill(t.rateBet[id], n) })),
      correct: () => "more",
    },
  },
  {
    id: "second",
    top: (c) => fill(t.second.reply[(c.answers.rate as Rate) in t.second.reply ? (c.answers.rate as Rate) : "more"], n),
    bottom: () => fill(t.second.bottom, n),
    act: { kind: "next" },
    curious: [() => t.second.curious],
    cites: ["hoefler"],
  },
  {
    id: "price",
    top: live("day", t.price.top, t.price.done.top),
    bottom: live("day", t.price.bottom, t.price.done.bottom),
    act: { kind: "scene" },
    curious: [() => fill(t.price.curious, { ...n, rate: n.rateExact })],
  },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r1",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch2 }) },
  },
];
