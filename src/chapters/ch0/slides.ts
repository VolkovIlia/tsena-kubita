import type { Slide } from "../../deck/types";
import { answerPrologue, type PrologueAnswer } from "../../game/progress";
import { update } from "../../game/store.svelte";
import { fill, fmtCount } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { executors } from "../../model/tick";

const t = ru.ch0;

export const slides: Slide[] = [
  { id: "bureau", top: () => t.bureau.top, act: { kind: "next", label: () => t.bureau.label } },
  {
    id: "margo",
    top: () => t.margo.top,
    say: { who: "margo", text: () => t.margo.say },
    act: { kind: "next", label: () => t.margo.label },
  },
  {
    id: "question",
    top: () => t.question.top,
    bottom: () => t.question.bottom,
    act: {
      kind: "bet",
      id: "prologue",
      options: (["all", "none", "unknown"] as const).map((id) => ({ id, label: () => t.question[id] })),
    },
    onAnswer: (id) => update((p) => answerPrologue(p, id as PrologueAnswer)),
  },
  {
    id: "reply",
    top: (c) => t.reply.reply[c.answers.prologue as PrologueAnswer] ?? t.reply.reply.unknown,
    bottom: () => t.reply.bottom,
    act: { kind: "next", label: () => t.reply.label },
  },
  { id: "master", top: () => t.master.top, say: { who: "master", text: () => t.master.say }, act: { kind: "next" } },
  { id: "tick", top: () => t.tick.top, act: { kind: "scene" } },
  { id: "tickName", top: () => t.tickName.top, say: { who: "master", text: () => t.tickName.say }, act: { kind: "next" } },
  {
    id: "second",
    top: () => fill(t.second.top, { rate: fmtCount(executors.master.ops_per_s) }),
    bottom: () => t.second.bottom,
    act: { kind: "next" },
  },
  { id: "week", top: () => t.week.top, say: { who: "margo", text: () => t.week.say }, act: { kind: "next" } },
  { id: "notebook", top: () => t.notebook.top, mood: true, act: { kind: "next", label: () => t.notebook.label } },
];
