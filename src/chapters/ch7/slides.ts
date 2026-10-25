import type { Slide } from "../../deck/types";
import { fill } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { cards } from "./cards";

const t = ru.ch7;
type Reply = keyof typeof t.callback.reply;

export const slides: Slide[] = [
  { id: "sunday", say: { who: "margo", text: () => t.sunday.say }, top: () => t.sunday.top, act: { kind: "next" } },
  { id: "dispatch", bottom: () => t.dispatch.bottom, act: { kind: "scene" } },
  {
    id: "dispatchDone",
    top: (c) =>
      [
        fill(t.dispatchDone.top, { right: String(c.scene.right ?? 0), total: String(cards.length) }),
        c.scene.keyWrong ? t.dispatchDone.keyWrong : "",
      ].join(" ").trim(),
    act: { kind: "next" },
  },
  { id: "headlines", top: () => t.headlines.top, act: { kind: "scene" }, cites: ["googleEcho", "ieeeEcho", "gidney", "nist"] },
  { id: "memo", top: () => t.memo.top, act: { kind: "scene" } },
  { id: "verdict", say: { who: "margo", text: () => t.verdict.say }, mood: true, act: { kind: "next" } },
  {
    id: "callback",
    top: (c) => t.callback.reply[c.answers.prologue as Reply] ?? t.callback.reply.skipped,
    say: { who: "oracle", text: () => t.callback.say },
    act: { kind: "next" },
  },
  {
    id: "last",
    say: { who: "master", text: () => t.last.say },
    top: () => t.last.top,
    act: { kind: "next", label: () => t.last.label },
  },
  {
    id: "sandbox",
    top: () => t.sandbox.top,
    curious: [() => t.sandbox.basisFormula, () => ru.ui.basisUnit],
    cites: ["hoefler", "babbush", "shor"],
    act: { kind: "next", label: () => ru.ui.play },
  },
];
