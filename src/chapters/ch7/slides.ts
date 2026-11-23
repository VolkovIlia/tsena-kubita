import params from "../../../data/params.json";
import { eventYear } from "../../game/chapters";
import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtExact, fmtNum, fmtPercent, fmtSci, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import {
  bestExecutor,
  executors,
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
  workSeconds,
  steps,
  type ExecutorId,
} from "../../model/tick";
import { exName } from "../../ui/names";
import { Q_ADD, RELAY_ADD, TOFF_ADD, X, Y } from "../ch5/numbers";
import { ADD_RATIO, BREAK, CORE_ADD_S, QC_ADD_S, TICK_RATIO } from "./numbers";

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
const qubit = ru.chapters.ch5;
const XY = { x: String(X), y: String(Y) };

/** Ползунки сцены пишут log10 значений; до первого движения — начальные значения. */
const speedOf = (c: Ctx) => 10 ** (c.scene.logSpeed ?? 0);
const checkOf = (c: Ctx) => Math.round(10 ** (c.scene.logCheck ?? Math.log10(DEFAULT_CHECK)));

const options = (ids: ExecutorId[]) => ids.map((id) => ({ id, label: () => exName(id) }));
const ALL: ExecutorId[] = ["core", "cores", "gpu", "qc"];

export const slides: Slide[] = [
  {
    id: "paper",
    top: () => fill(t.paper.top, { year: String(eventYear("hoefler")) }),
    bottom: () => fill(t.paper.bottom, { ...XY, qubit }),
    cites: ["hoefler"],
    act: { kind: "next" },
  },
  {
    id: "qpriceBet",
    top: () =>
      fill(t.qpriceBet.top, {
        qubit,
        q: fmtExact(Q_ADD),
        r: fmtExact(RELAY_ADD),
        rc: fmtCount(executors.core.ops_per_s),
        rq: fmtCount(executors.qc.ops_per_s),
      }),
    bottom: () => fill(t.qpriceBet.bottom, XY),
    act: {
      kind: "bet",
      id: "qprice",
      options: [
        { id: "faster", label: () => t.qpriceBet.faster },
        { id: "same", label: () => t.qpriceBet.same },
        { id: "slower", label: () => fill(t.qpriceBet.slower, { floor: fmtCount(powerOfTenBelow(ADD_RATIO)) }) },
      ],
      correct: () => (ADD_RATIO < 1 ? "faster" : ADD_RATIO < 10 ? "same" : "slower"),
    },
  },
  {
    id: "qprice",
    top: (c) =>
      fill(t.qprice.top, {
        reply: t.qprice.reply[c.answers.qprice as keyof typeof t.qprice.reply] ?? t.qprice.reply.slower,
        tc: fmtDuration(CORE_ADD_S),
        tq: fmtDuration(QC_ADD_S),
        x: fmtCount(ADD_RATIO),
      }),
    bottom: () => fill(t.qprice.bottom, { k: fmtCount(TICK_RATIO) }),
    curious: [
      () => t.qprice.curious1,
      () => fill(t.qprice.curious2, { toff: fmtExact(TOFF_ADD), xt: fmtCount(workSeconds("qc", 1, TOFF_ADD) / CORE_ADD_S) }),
    ],
    basis: ["core", "qc"],
    cites: ["hoefler"],
    act: { kind: "next" },
  },
  {
    id: "qubits",
    top: () => fill(t.qubits.top, { min: fmtCount(physicalPerLogical(dMin)), max: fmtCount(physicalPerLogical(dMax)) }),
    bottom: () => fill(t.qubits.bottom, { qubit }),
    cites: ["beverland"],
    act: { kind: "next" },
  },
  {
    id: "evenBet",
    top: () => t.evenBet.top,
    bottom: () => t.evenBet.bottom,
    act: {
      kind: "bet",
      id: "even",
      options: (["never", "big", "soon"] as const).map((id) => ({ id, label: () => t.evenBet[id] })),
      correct: () => (BREAK.seconds < 1 ? "soon" : "big"),
    },
  },
  {
    id: "evenFind",
    top: (c) =>
      c.scene.even
        ? fill(t.evenFind.done.top, {
            n: fmtCount(BREAK.n),
            ct: fmtCount(BREAK.coreTicks),
            qt: fmtCount(BREAK.qcTicks),
            k: fmtCount(TICK_RATIO),
            t: fmtDuration(BREAK.seconds),
          })
        : fill(t.evenFind.top, { reply: t.evenFind.reply[c.answers.even as keyof typeof t.evenFind.reply] ?? t.evenFind.reply.big }),
    bottom: (c) => (c.scene.even ? t.evenFind.done.bottom : t.evenFind.bottom),
    curious: [() => fill(t.evenFind.curious, { m: fmtCount(DEFAULT_CHECK) })],
    basis: ["core", "qc"],
    act: { kind: "scene" },
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
    top: (c) =>
      c.scene.race1
        ? fill(t.race1Done.top, { ...names, a: time("core"), b: time("qc"), k: fmtCount(steps("qc", N)) })
        : t.race1.reply[c.answers.safe as "core" | "qc"] ?? t.race1.reply.qc,
    bottom: (c) => (c.scene.race1 ? fill(t.race1Done.bottom, { prev: ru.chapters.ch6 }) : ""),
    basis: ["core", "qc"],
    act: { kind: "scene" },
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
    top: (c) =>
      c.scene.race2
        ? fill(t.race2Done.top, {
            ...names,
            g: time("gpu"),
            c: time("cores"),
            pct: fmtPercent(qcShareDone(N, solveSeconds("gpu", N))),
          })
        : fill(t.race2.reply[c.answers.safe4 as ExecutorId] ?? t.race2.reply.gpu, names),
    basis: ALL,
    act: { kind: "scene", label: () => t.race2Done.label },
  },
  {
    id: "price",
    top: () => fill(t.price.top, { q: fmtDuration(cycleSeconds("qc")), g: fmtDuration(cycleSeconds("gpu")) }),
    bottom: () => fill(t.price.bottom, { k: fmtTimes(cycleSeconds("qc") / cycleSeconds("gpu")) }),
    cites: ["hoefler", "nvidia"],
    act: { kind: "next" },
  },
  {
    id: "width",
    top: () => fill(t.width.top, { g: fmtCount(opsPerCycle("gpu")), q: fmtCount(Math.round(opsPerCycle("qc"))) }),
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
