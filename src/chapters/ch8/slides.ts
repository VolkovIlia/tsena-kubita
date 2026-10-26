import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtBytes, fmtCount, fmtDuration } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import params from "../../../data/params.json";
import { ioRatio, loadSeconds, scenario } from "../../model/tick";
import { exName } from "../../ui/names";

const t = ru.ch8;
const bytes = scenario.dataset_bytes;
const once = { gpu: loadSeconds("gpu", bytes), qc: loadSeconds("qc", bytes) };
type Pick = keyof typeof once;

export const slides: Slide[] = [
  {
    id: "order",
    top: () => t.order.top,
    bottom: () => fill(t.order.bottom, { photos: fmtCount(scenario.cat_photos), size: fmtBytes(bytes) }),
    act: {
      kind: "bet",
      id: "ai",
      options: (["gpu", "qc"] as const).map((id) => ({ id, label: () => exName(id) })),
      correct: () => (once.gpu <= once.qc ? "gpu" : "qc"),
    },
  },
  {
    id: "pipes",
    top: (c) => t.pipes.reply[c.answers.ai as Pick] ?? t.pipes.reply.qc,
    bottom: () => t.pipes.bottom,
    act: { kind: "scene" },
  },
  {
    id: "once",
    top: () => fill(t.once.top, { f: fmtDuration(once.gpu), o: fmtDuration(once.qc) }),
    act: { kind: "next" },
  },
  {
    id: "howIn",
    top: () => t.howIn.top,
    bottom: () => fill(t.howIn.bottom, { x: fmtCount(ioRatio()) }),
    basis: ["gpu", "qc"],
    cites: ["hoefler", "bernstein"],
    act: { kind: "next" },
  },
  {
    id: "epochs",
    top: () => fill(t.epochs.top, { e: fmtCount(scenario.epochs) }),
    bottom: () =>
      fill(t.epochs.bottom, {
        f: fmtDuration(once.gpu * scenario.epochs),
        o: fmtDuration(once.qc * scenario.epochs),
      }),
    act: { kind: "scene" },
  },
  { id: "straw", top: () => t.straw.top, bottom: () => fill(t.straw.bottom, { race: ru.chapters.ch7 }), act: { kind: "next" } },
  {
    id: "claim",
    top: () => fill(t.claim.top, { year: String(params.kerenidis.year) }),
    bottom: () => t.claim.bottom,
    cites: ["kerenidis", "tang"],
    act: { kind: "next", label: () => t.claim.label },
  },
  {
    id: "tang",
    top: () => fill(t.tang.top, { year: String(eventYear("tang")) }),
    bottom: () => t.tang.bottom,
    cites: ["tang", "chia"],
    act: { kind: "next" },
  },
  {
    id: "quote",
    top: () => t.quote.top,
    quote: { who: "tang", text: () => t.quote.text, cite: "quanta" },
    bottom: () => t.quote.bottom,
    act: { kind: "next" },
  },
  { id: "bridge", top: () => t.bridge.top, bottom: () => t.bridge.bottom, act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r8",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch9 }) },
  },
];
