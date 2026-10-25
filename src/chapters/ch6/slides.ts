import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { DAY, memoryPlace, scenario, shorFactors, stateVectorSize } from "../../model/tick";

const t = ru.ch6;
const A = scenario.shor_a;
const N = scenario.shor_n;
const shor = shorFactors(A, N);
const { rsa250, rsa2048 } = params;

function place(n: number): string {
  const { id, fits } = memoryPlace(n);
  const s = t.scales[id];
  return fill(fits ? t.board.fits : t.board.over, { prep: s.prep, name: s.in });
}

export const slides: Slide[] = [
  { id: "nina", top: () => t.nina.top, say: { who: "nina", text: () => t.nina.say }, act: { kind: "next" } },
  { id: "enzyme", say: { who: "nina", text: () => t.enzyme.say }, act: { kind: "next" } },
  {
    id: "bet",
    top: () => t.bet.top,
    bottom: () => t.bet.bottom,
    act: {
      kind: "bet",
      id: "memory",
      options: (["factory", "oracle"] as const).map((id) => ({ id, label: () => ru.names[id] })),
      correct: () => "oracle",
    },
  },
  {
    id: "board",
    top: (c) => fill(t.board.top, { reply: t.board.reply[c.answers.memory as keyof typeof t.board.reply] ?? "" }).trim(),
    bottom: (c) => {
      const n = c.scene.n ?? scenario.memory_n[0];
      return fill(t.board.bottom, { n: String(n), count: fmtCount(stateVectorSize(n)), place: place(n) });
    },
    act: { kind: "scene" },
    curious: [() => fill(t.board.curious, { b: String(scenario.bytes_per_amplitude) })],
    cites: ["apple", "llnl", "idc"],
  },
  { id: "wall", top: () => t.wall.top, say: { who: "factory", text: () => t.wall.say }, act: { kind: "next" } },
  {
    id: "honest",
    top: () => t.honest.top,
    say: { who: "master", text: () => t.honest.say, note: t.honest.note },
    act: { kind: "next" },
    curious: [() => t.honest.curious],
    cites: ["reiher", "lee"],
  },
  {
    id: "become",
    top: () => t.become.top,
    say: { who: "oracle", text: () => t.become.say },
    cites: ["reiher"],
    act: { kind: "next" },
  },
  { id: "thanks", top: () => t.thanks.top, say: { who: "nina", text: () => t.thanks.say }, act: { kind: "next" } },
  { id: "bank", top: () => t.bank.top, act: { kind: "next" } },
  {
    id: "fifteen",
    top: () => fill(t.fifteen.top, { n: String(N) }),
    say: { who: "master", text: () => fill(t.fifteen.say, { p: String(shor.p), q: String(shor.q) }) },
    act: { kind: "next" },
  },
  {
    id: "rhythm",
    say: { who: "oracle", text: () => t.rhythm.say },
    bottom: () => fill(t.rhythm.bottom, { a: String(A), n: String(N) }),
    act: { kind: "scene" },
  },
  {
    id: "period",
    top: () => fill(t.period.top, { r: String(shor.r) }),
    say: { who: "oracle", text: () => t.period.say },
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
  {
    id: "calm",
    top: () => t.calm.top,
    say: { who: "oracle", text: () => t.calm.say },
    act: { kind: "next" },
    cites: ["nist"],
  },
  { id: "razbor", top: () => t.razbor.top, say: { who: "master", text: () => t.razbor.say }, act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    say: { who: "margo", text: () => t.rule.say },
    rule: "r6",
    mood: true,
    act: { kind: "next", label: () => t.rule.label },
  },
];
