import type { Slide } from "../../deck/types";
import { answerPrologue, type PrologueAnswer } from "../../game/progress";
import { update } from "../../game/store.svelte";
import { fill } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { exName } from "../../ui/names";
import { always, byScore, MACHINES, ORDERS, score } from "./night";
import { news as n } from "./news";

const t = ru.ch0;
const ANSWERS = ["soon", "never", "unknown"] as const;
const total = String(ORDERS.length);
/** Сильнейшая из стратегий «всё одной машине» — с ней сравнивается игрок. */
const rival = MACHINES.map((id) => ({ id, s: score(always(id)) })).sort((a, b) => byScore(a.s, b.s))[0];
const headline = {
  x: n.echoes,
  target: n.target,
  qubits: n.qubits,
  name: n.name,
  life: n.lifetime,
  starling: n.starling,
  logical: n.logical,
};

export const slides: Slide[] = [
  {
    id: "news",
    top: () => fill(t.news.top, { year: n.year.supremacy, seconds: n.seconds, years: n.years }),
    bottom: () => fill(t.news.bottom, { days: n.days }),
    curious: t.news.curious.map((c) => () => fill(c, { days: n.days })),
    cites: ["arute", "ibmSupremacy"],
    act: { kind: "next" },
  },
  {
    id: "headlines",
    top: () => fill(t.headlines.top, headline),
    bottom: () => t.headlines.bottom,
    curious: t.headlines.curious.map((c) => () => fill(c, headline)),
    cites: ["willow", "willowNature", "googleEcho", "ieeeEcho", "majorana2", "majoranaCritics", "starling"],
    act: { kind: "next" },
  },
  {
    id: "hoefler",
    top: () => fill(t.hoefler.top, { year: n.year.hoefler, x: n.stepPrice }),
    bottom: () => t.hoefler.bottom,
    cites: ["hoefler"],
    act: { kind: "next" },
  },
  {
    id: "question",
    top: () => t.question.top,
    bottom: () => t.question.bottom,
    act: {
      kind: "bet",
      id: "prologue",
      options: ANSWERS.map((id) => ({ id, label: () => t.question[id] })),
    },
    onAnswer: (id) => update((p) => answerPrologue(p, id as PrologueAnswer)),
  },
  {
    id: "night",
    top: (c) =>
      fill(t.night.top, { reply: t.night.reply[c.answers.prologue as PrologueAnswer] ?? t.night.reply.unknown, n: total }),
    bottom: () => t.night.bottom,
    curious: t.night.curious.map((c) => () => c),
    cites: ["hoefler", "reiher"],
    act: { kind: "scene" },
  },
  {
    id: "results",
    top: (c) => fill(t.results.top, { best: String(c.scene.best ?? 0), n: total, fail: String(c.scene.fail ?? 0) }),
    bottom: (c) => {
      const vs = byScore({ best: c.scene.best ?? 0, fail: c.scene.fail ?? 0, grid: [] }, rival.s);
      if (vs < 0) return t.results.won;
      const name = fill(t.game.always, { name: exName(rival.id) });
      return fill(vs === 0 ? t.results.tie : t.results.lost, { name });
    },
    act: { kind: "next" },
  },
  {
    id: "plan",
    top: () => t.plan.top,
    bottom: () => t.plan.bottom,
    curious: t.plan.curious.map((c) => () => c),
    cites: ["hoefler"],
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch1 }) },
  },
];
