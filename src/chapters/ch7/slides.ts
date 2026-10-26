import params from "../../../data/params.json";
import { eventYear } from "../../game/chapters";
import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtNum, fmtPercent, fmtSci, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import {
  bestExecutor,
  crossover,
  cycleSeconds,
  DEFAULT_CHECK,
  opsPerCycle,
  passwordLength,
  physicalPerLogical,
  powerOfTenBelow,
  qcFavour,
  qcShareDone,
  rateRatio,
  scenario,
  handSteps,
  solveSeconds,
  steps,
  type ExecutorId,
} from "../../model/tick";
import { exName } from "../../ui/names";

const t = ru.ch7;
const N = scenario.safe_codes;
const time = (id: ExecutorId) => fmtDuration(solveSeconds(id, N));
const ratio = fmtCount(powerOfTenBelow(rateRatio("gpu", "qc")));
const first = crossover("gpu");
const pwd = passwordLength(first.n);
const [dMin, dMax] = params.surface_code.distances;
/** Имена внутри фраз — со строчной: «1 ядро или квантовый компьютер». */
const names = Object.fromEntries(
  (["core", "cores", "gpu", "qc"] as const).map((id) => [id, exName(id).toLowerCase()]),
) as Record<ExecutorId, string>;

/** Ползунки сцены пишут log10 значений; до первого движения — начальные значения. */
const speedOf = (c: Ctx) => 10 ** (c.scene.logSpeed ?? 0);
const checkOf = (c: Ctx) => Math.round(10 ** (c.scene.logCheck ?? Math.log10(DEFAULT_CHECK)));

const options = (ids: ExecutorId[]) => ids.map((id) => ({ id, label: () => exName(id) }));
const ALL: ExecutorId[] = ["core", "cores", "gpu", "qc"];

export const slides: Slide[] = [
  {
    id: "paper",
    top: () => fill(t.paper.top, { year: String(eventYear("hoefler")) }),
    bottom: () => t.paper.bottom,
    cites: ["hoefler"],
    act: { kind: "next" },
  },
  {
    id: "order",
    top: () => fill(t.order.top, { n: fmtCount(N), digits: String(Math.log10(N)), m: fmtCount(DEFAULT_CHECK) }),
    bottom: () => fill(t.order.bottom, names),
    act: {
      kind: "bet",
      id: "safe",
      options: options(["core", "qc"]),
      correct: () => bestExecutor({ core: solveSeconds("core", N), qc: solveSeconds("qc", N) }),
    },
  },
  {
    id: "race1",
    top: (c) => t.race1.reply[c.answers.safe as "core" | "qc"] ?? t.race1.reply.qc,
    bottom: () => t.race1.bottom,
    act: { kind: "scene" },
  },
  {
    id: "race1Done",
    top: () => fill(t.race1Done.top, { ...names, a: time("core"), b: time("qc"), k: fmtCount(steps("qc", N)) }),
    bottom: () => fill(t.race1Done.bottom, { prev: ru.chapters.ch6 }),
    basis: ["core", "qc"],
    act: { kind: "next" },
  },
  {
    id: "all4",
    top: () => fill(t.all4.top, names),
    bottom: () => t.all4.bottom,
    act: {
      kind: "bet",
      id: "safe4",
      options: options(ALL),
      correct: () => bestExecutor(Object.fromEntries(ALL.map((id) => [id, solveSeconds(id, N)]))),
    },
  },
  {
    id: "race2",
    top: (c) => fill(t.race2.reply[c.answers.safe4 as ExecutorId] ?? t.race2.reply.gpu, names),
    bottom: () => t.race2.bottom,
    act: { kind: "scene" },
  },
  {
    id: "race2Done",
    top: () =>
      fill(t.race2Done.top, {
        ...names,
        g: time("gpu"),
        c: time("cores"),
        pct: fmtPercent(qcShareDone(N, solveSeconds("gpu", N))),
      }),
    basis: ALL,
    act: { kind: "next", label: () => t.race2Done.label },
  },
  {
    id: "price",
    top: () => fill(t.price.top, { q: fmtDuration(cycleSeconds("qc")), g: fmtDuration(cycleSeconds("gpu")) }),
    cites: ["hoefler", "nvidia"],
    act: { kind: "next" },
  },
  {
    id: "width",
    top: () => fill(t.width.top, { g: fmtCount(opsPerCycle("gpu")), q: fmtCount(Math.round(opsPerCycle("qc"))) }),
    act: { kind: "next" },
  },
  {
    id: "qubits",
    top: () => fill(t.qubits.top, { min: fmtCount(physicalPerLogical(dMin)), max: fmtCount(physicalPerLogical(dMax)) }),
    bottom: () => fill(t.qubits.bottom, { qubit: ru.chapters.ch5 }),
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
  {
    id: "board",
    top: () => fill(t.board.top, names),
    bottom: () => t.board.bottom,
    curious: [() => fill(t.board.curious, { exact: fmtCount(handSteps("qc", N)), rounded: fmtCount(steps("qc", N)) })],
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
    bottom: () => t.found.bottom,
    act: { kind: "next" },
  },
  {
    id: "speed",
    top: () => t.speed.top,
    bottom: (c) =>
      fill(t.speed.bottom, {
        x: fmtNum(speedOf(c)),
        t: fmtDuration(crossover("gpu", DEFAULT_CHECK, speedOf(c)).seconds),
      }),
    act: { kind: "scene" },
  },
  {
    id: "check",
    top: (c) =>
      fill(t.check.top, {
        t: fmtDuration(crossover("gpu", DEFAULT_CHECK, speedOf(c)).seconds),
        m: fmtCount(DEFAULT_CHECK),
      }),
    bottom: (c) =>
      fill(t.check.bottom, {
        c: fmtCount(checkOf(c)),
        tc: fmtDuration(crossover("gpu", checkOf(c), speedOf(c)).seconds),
      }),
    act: { kind: "scene" },
  },
  {
    id: "razbor",
    top: () => fill(t.razbor.top, { ratio }),
    curious: [() => fill(t.razbor.curious1, { x: fmtTimes(qcFavour()) }), () => t.razbor.curious2, () => t.razbor.curious3],
    cites: ["ambainis", "babbush"],
    act: { kind: "next" },
  },
  { id: "bridge", top: () => t.bridge.top, bottom: () => t.bridge.bottom, act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r7",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch8 }) },
  },
];
