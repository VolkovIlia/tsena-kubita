import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtDuration } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { DAY, memoryPlace, scenario, shorFactors, stateVectorSize } from "../../model/tick";
import { exName } from "../../ui/names";

const t = ru.ch9;
const A = scenario.shor_a;
const N = scenario.shor_n;
const NS = scenario.memory_n;
const shor = shorFactors(A, N);
const { rsa250, rsa2048 } = params;

/** «помещается в ноутбук» / «не помещается даже во все накопители Земли». */
function place(n: number): string {
  const { id, fits } = memoryPlace(n);
  const s = t.scales[id];
  return fill(fits ? t.board.fits : t.board.over, { prep: s.prep, name: s.in });
}

export const slides: Slide[] = [
  {
    id: "field",
    top: () => fill(t.field.top, { race: ru.chapters.ch7, neck: ru.chapters.ch8, year: String(eventYear("shor")) }),
    act: { kind: "next", label: () => t.field.label },
    cites: ["shor"],
  },
  {
    id: "nitrogen",
    top: () => fill(t.nitrogen.top, { year: String(eventYear("reiher")) }),
    act: { kind: "next" },
    curious: [() => t.nitrogen.curious],
    cites: ["reiher", "hoefler"],
  },
  { id: "fertilizer", top: () => t.fertilizer.top, act: { kind: "next" }, cites: ["reiher"] },
  {
    id: "memoryBet",
    top: () => t.memoryBet.top,
    bottom: () => t.memoryBet.bottom,
    act: {
      kind: "bet",
      id: "memory",
      options: (["gpu", "qc"] as const).map((id) => ({ id, label: () => exName(id) })),
      correct: () => "qc",
    },
  },
  {
    id: "board",
    top: (c) => fill(t.board.top, { reply: t.board.reply[c.answers.memory as keyof typeof t.board.reply] ?? "" }).trim(),
    bottom: (c) => {
      const n = c.scene.n ?? NS[0];
      return fill(t.board.bottom, { n: String(n), count: fmtCount(stateVectorSize(n)), place: place(n) });
    },
    act: { kind: "scene" },
    curious: [() => fill(t.board.curious, { b: String(scenario.bytes_per_amplitude) })],
    cites: ["apple", "llnl", "idc"],
  },
  {
    id: "wall",
    top: () => fill(t.wall.top, { n: String(NS[NS.length - 1]), place: place(NS[NS.length - 1]) }),
    act: { kind: "next" },
  },
  { id: "double", top: () => t.double.top, act: { kind: "next" }, curious: [() => t.double.curious], cites: ["reiher"] },
  { id: "ladder", top: () => fill(t.ladder.top, { algo: ru.chapters.ch2 }), act: { kind: "next" } },
  {
    id: "honest",
    top: () => t.honest.top,
    act: { kind: "next" },
    curious: [() => t.honest.curious],
    cites: ["reiher", "lee"],
  },
  {
    id: "become",
    top: () => t.become.top,
    act: { kind: "next" },
    curious: [() => t.become.curious],
    cites: ["reiher"],
  },
  {
    id: "feynman",
    top: () => fill(t.feynman.top, { qubit: ru.chapters.ch5 }),
    act: { kind: "next" },
    curious: [() => t.feynman.curious],
    cites: ["feynman", "reiher"],
  },
  {
    id: "bank",
    top: () => t.bank.top,
    quote: { who: "shor", text: () => t.bank.quote, cite: "shor" },
    act: { kind: "next" },
  },
  {
    id: "fifteen",
    top: () => fill(t.fifteen.top, { n: String(N), p: String(shor.p), q: String(shor.q) }),
    act: { kind: "next" },
  },
  {
    id: "rhythm",
    top: () => fill(t.rhythm.top, { a: String(A), n: String(N) }),
    bottom: () => t.rhythm.bottom,
    act: { kind: "scene" },
  },
  {
    id: "period",
    top: () => fill(t.period.top, { r: String(shor.r) }),
    act: { kind: "next" },
    curious: [
      () =>
        fill(t.period.curious, {
          a: String(A),
          half: String(shor.half),
          square: String(shor.square),
          sm: String(shor.square - 1),
          sp: String(shor.square + 1),
          p: String(shor.p),
          q: String(shor.q),
        }),
    ],
    cites: ["shor"],
  },
  {
    id: "waves",
    top: () => t.waves.top,
    act: { kind: "next" },
    curious: [() => fill(t.waves.curious, { qubit: ru.chapters.ch5 })],
    cites: ["shor"],
  },
  {
    id: "rsa1",
    top: () =>
      fill(t.rsa1.top, {
        digits: String(rsa2048.digits),
        rd: String(rsa250.digits),
        ry: String(rsa250.year),
        cy: fmtCount(rsa250.core_years),
      }),
    act: { kind: "next" },
    cites: ["rsa250"],
  },
  {
    id: "rsa2",
    top: () =>
      fill(t.rsa2.top, {
        gy: String(rsa2048.year),
        days: fmtDuration(rsa2048.runtime_days_max * DAY),
        qubits: fmtCount(rsa2048.physical_qubits_max),
      }),
    act: { kind: "next" },
    cites: ["gidney"],
  },
  { id: "safe", top: () => fill(t.safe.top, { race: ru.chapters.ch7 }), act: { kind: "next" }, cites: ["gidney"] },
  {
    id: "calm",
    top: () => fill(t.calm.top, { w: fmtCount(params.timeline.willow.qubits) }),
    act: { kind: "next" },
    cites: ["willow", "nist"],
  },
  { id: "razbor", top: () => t.razbor.top, act: { kind: "next" }, cites: ["reiher", "lee", "shor"] },
  { id: "bridge", top: () => t.bridge.top, act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r9",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch10 }) },
  },
];
