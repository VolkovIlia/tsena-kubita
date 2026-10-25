import params from "../../../data/params.json";
import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtNum, fmtPercent, fmtSci } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import {
  bestExecutor,
  crossover,
  cycleSeconds,
  DEFAULT_CHECK,
  oracleShareDone,
  opsPerCycle,
  passwordLength,
  physicalPerLogical,
  powerOfTenBelow,
  rateRatio,
  scenario,
  solveSeconds,
  steps,
} from "../../model/tick";

const t = ru.ch4;
const N = scenario.safe_codes;
const time = (id: "master" | "oracle" | "factory") => fmtDuration(solveSeconds(id, N));
const ratio = fmtCount(powerOfTenBelow(rateRatio("factory", "oracle")));
const first = crossover("factory");
const pwd = passwordLength(first.n);
const [dMin, dMax] = params.surface_code.distances;

/** Ползунки сцены пишут log10 значений; до первого движения — начальные значения. */
const speedOf = (c: Ctx) => 10 ** (c.scene.logSpeed ?? 0);
const checkOf = (c: Ctx) => Math.round(10 ** (c.scene.logCheck ?? Math.log10(DEFAULT_CHECK)));

const options = (ids: ("master" | "factory" | "oracle")[]) => ids.map((id) => ({ id, label: () => ru.names[id] }));

export const slides: Slide[] = [
  {
    id: "order",
    top: () => fill(t.order.top, { n: fmtCount(N), digits: String(Math.log10(N)), m: fmtCount(DEFAULT_CHECK) }),
    bottom: () => t.order.bottom,
    act: {
      kind: "bet",
      id: "safe",
      options: options(["master", "oracle"]),
      correct: () => bestExecutor({ master: solveSeconds("master", N), oracle: solveSeconds("oracle", N) }),
    },
  },
  {
    id: "race1",
    top: (c) => t.race1.reply[c.answers.safe as "oracle" | "master"] ?? t.race1.reply.oracle,
    bottom: () => t.race1.bottom,
    act: { kind: "scene" },
  },
  {
    id: "race1Done",
    top: () => fill(t.race1Done.top, { m: time("master"), o: time("oracle"), k: fmtCount(steps("oracle", N)) }),
    say: { who: "margo", text: () => t.race1Done.say },
    basis: ["master", "oracle"],
    act: { kind: "next" },
  },
  {
    id: "factory",
    top: () => t.factory.top,
    say: { who: "factory", text: () => t.factory.say },
    bottom: () => t.factory.bottom,
    act: {
      kind: "bet",
      id: "safe2",
      options: options(["factory", "oracle"]),
      correct: () => bestExecutor({ factory: solveSeconds("factory", N), oracle: solveSeconds("oracle", N) }),
    },
  },
  {
    id: "race2",
    top: (c) => t.race2.reply[c.answers.safe2 as "factory" | "oracle"] ?? t.race2.reply.factory,
    bottom: () => t.race2.bottom,
    act: { kind: "scene" },
  },
  {
    id: "race2Done",
    top: () =>
      fill(t.race2Done.top, {
        f: time("factory"),
        pct: fmtPercent(oracleShareDone(N, solveSeconds("factory", N))),
      }),
    say: { who: "oracle", text: () => t.race2Done.say },
    basis: ["factory", "oracle"],
    act: { kind: "next", label: () => t.race2Done.label },
  },
  {
    id: "price",
    top: () =>
      fill(t.price.top, { oq: fmtDuration(cycleSeconds("oracle")), fq: fmtDuration(cycleSeconds("factory")) }),
    act: { kind: "next" },
  },
  {
    id: "width",
    top: () =>
      fill(t.width.top, { fo: fmtCount(opsPerCycle("factory")), oo: String(Math.round(opsPerCycle("oracle"))) }),
    act: { kind: "next" },
  },
  {
    id: "qubits",
    top: () =>
      fill(t.qubits.top, { min: fmtCount(physicalPerLogical(dMin)), max: fmtCount(physicalPerLogical(dMax)) }),
    cites: ["beverland"],
    act: { kind: "next" },
  },
  {
    id: "ratio",
    top: () => fill(t.ratio.top, { ratio }),
    bottom: () => t.ratio.bottom,
    cites: ["hoefler", "nvidia"],
    act: { kind: "next" },
  },
  { id: "slider", top: () => t.slider.top, act: { kind: "scene" } },
  {
    id: "found",
    top: () =>
      fill(t.found.top, {
        n: fmtSci(first.n),
        lo: String(Math.floor(pwd)),
        hi: String(Math.ceil(pwd)),
        t: fmtDuration(first.seconds),
      }),
    say: { who: "margo", text: () => t.found.say },
    act: { kind: "next" },
  },
  {
    id: "speed",
    top: () => t.speed.top,
    bottom: (c) =>
      fill(t.speed.bottom, {
        x: fmtNum(speedOf(c)),
        t: fmtDuration(crossover("factory", DEFAULT_CHECK, speedOf(c)).seconds),
      }),
    act: { kind: "scene" },
  },
  {
    id: "check",
    top: (c) =>
      fill(t.check.top, {
        t: fmtDuration(crossover("factory", DEFAULT_CHECK, speedOf(c)).seconds),
        m: fmtCount(DEFAULT_CHECK),
      }),
    bottom: (c) =>
      fill(t.check.bottom, {
        c: fmtCount(checkOf(c)),
        tc: fmtDuration(crossover("factory", checkOf(c), speedOf(c)).seconds),
      }),
    act: { kind: "scene" },
  },
  {
    id: "razbor",
    top: () => fill(t.razbor.top, { ratio }),
    say: { who: "oracle", text: () => t.razbor.say, note: t.razbor.note },
    curious: [() => t.razbor.curious],
    cites: ["ambainis"],
    act: { kind: "next" },
  },
  { id: "rule", top: () => t.rule.top, rule: "r4", mood: true, act: { kind: "next", label: () => t.rule.label } },
];
