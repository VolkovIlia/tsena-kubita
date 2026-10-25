import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtPercent, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { amdahl, bestExecutor, executors, scenario, type Classical } from "../../model/tick";
import { cartoon, chain, CREW } from "./times";

const t = ru.ch2;
const cores = String(executors.brigade.derivation.cores);
const crew = CREW.map((id) => ({ id, label: () => ru.names[id] }));
const times = (s: Record<Classical, number>) => ({
  m: fmtDuration(s.master),
  b: fmtDuration(s.brigade),
  f: fmtDuration(s.factory),
});
const serial = (c: Ctx) => c.scene.serial ?? 0;

export const slides: Slide[] = [
  {
    id: "arrive",
    top: () => fill(t.arrive.top, { cores }),
    say: { who: "brigade", text: () => fill(t.arrive.say, { cores }) },
    act: { kind: "next" },
  },
  { id: "factory", top: () => t.factory.top, say: { who: "factory", text: () => t.factory.say }, act: { kind: "next" } },
  {
    id: "orderA",
    top: () =>
      fill(t.orderA.top, {
        frames: fmtCount(scenario.cartoon_frames),
        pixels: fmtCount(scenario.cartoon_pixels),
        ticks: fmtCount(scenario.pixel_ticks),
      }),
    bottom: () => t.orderA.bottom,
    act: { kind: "bet", id: "cartoon", options: crew, correct: () => bestExecutor(cartoon) },
  },
  {
    id: "raceA",
    top: (c) => t.raceA.reply[c.answers.cartoon as Classical],
    bottom: () => t.raceA.bottom,
    act: { kind: "scene" },
  },
  {
    id: "raceADone",
    top: () => fill(t.raceADone.top, times(cartoon)),
    say: { who: "factory", text: () => t.raceADone.say },
    act: { kind: "next" },
  },
  {
    id: "orderB",
    top: () => fill(t.orderB.top, { payments: fmtCount(scenario.payments) }),
    bottom: () => t.orderB.bottom,
    act: { kind: "bet", id: "chain", options: crew, correct: () => bestExecutor(chain) },
  },
  {
    id: "raceB",
    top: (c) => t.raceB.reply[c.answers.chain as Classical],
    bottom: () => t.raceB.bottom,
    act: { kind: "scene" },
  },
  {
    id: "raceBDone",
    top: () => fill(t.raceBDone.top, times(chain)),
    say: { who: "brigade", text: () => t.raceBDone.say },
    bottom: () => t.raceBDone.bottom,
    act: { kind: "next" },
  },
  {
    id: "amdahl",
    top: () => t.amdahl.top,
    bottom: (c) =>
      fill(t.amdahl.bottom, {
        s: fmtPercent(serial(c)),
        w: fmtCount(scenario.amdahl_workers),
        x: fmtTimes(amdahl(serial(c), scenario.amdahl_workers)),
      }),
    act: { kind: "scene" },
  },
  {
    id: "razbor",
    top: () => t.razbor.top,
    say: { who: "margo", text: () => t.razbor.say },
    cites: ["amdahl"],
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => t.rule.top,
    say: { who: "master", text: () => t.rule.say },
    rule: "r2",
    act: { kind: "next", label: () => t.rule.label },
  },
];
