import type { Slide } from "../../deck/types";
import { fill, fmtBytes, fmtCount, fmtDuration } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { ioRatio, loadSeconds, scenario } from "../../model/tick";

const t = ru.ch5;
const bytes = scenario.dataset_bytes;
const once = { factory: loadSeconds("factory", bytes), oracle: loadSeconds("oracle", bytes) };
type Pick = keyof typeof once;

export const slides: Slide[] = [
  {
    id: "order",
    top: () => t.order.top,
    say: { who: "margo", text: () => fill(t.order.say, { photos: fmtCount(scenario.cat_photos) }) },
    bottom: () => fill(t.order.bottom, { size: fmtBytes(bytes) }),
    act: {
      kind: "bet",
      id: "ai",
      options: (["factory", "oracle"] as const).map((id) => ({ id, label: () => ru.names[id] })),
      correct: () => (once.factory <= once.oracle ? "factory" : "oracle"),
    },
  },
  {
    id: "pipes",
    top: (c) => t.pipes.reply[c.answers.ai as Pick] ?? t.pipes.reply.oracle,
    bottom: () => t.pipes.bottom,
    act: { kind: "scene" },
  },
  {
    id: "once",
    top: () =>
      fill(t.once.top, { f: fmtDuration(once.factory), o: fmtDuration(once.oracle), x: fmtCount(ioRatio()) }),
    act: { kind: "next" },
  },
  {
    id: "epochs",
    top: () =>
      fill(t.epochs.top, {
        e: fmtCount(scenario.epochs),
        f: fmtDuration(once.factory * scenario.epochs),
        o: fmtDuration(once.oracle * scenario.epochs),
      }),
    say: { who: "factory", text: () => t.epochs.say },
    act: { kind: "scene" },
  },
  { id: "straw", top: () => t.straw.top, cites: ["hoefler", "bernstein"], act: { kind: "next" } },
  {
    id: "claim",
    say: { who: "margo", text: () => t.claim.say },
    bottom: () => t.claim.bottom,
    act: { kind: "next", label: () => t.claim.label },
  },
  {
    id: "tang",
    say: { who: "master", text: () => t.tang.say },
    bottom: () => t.tang.bottom,
    cites: ["tang", "chia", "quanta"],
    act: { kind: "next" },
  },
  {
    id: "return",
    say: { who: "margo", text: () => t.return.say },
    bottom: () => t.return.bottom,
    mood: true,
    act: { kind: "next" },
  },
  { id: "rule", top: () => t.rule.top, rule: "r5", act: { kind: "next", label: () => t.rule.label } },
];
