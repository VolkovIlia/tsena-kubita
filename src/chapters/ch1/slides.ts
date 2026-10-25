import type { Ctx, Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtExact } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import params from "../../../data/params.json";
import { dijkstraAge, dijkstraSeconds, halvingSteps, scenario } from "../../model/tick";

const t = ru.ch1;
const pages = scenario.book_pages;

/** Размер книги на ползунке: до первого движения — стартовая книга. */
export function bookSize(c: Ctx): number {
  return Math.round(10 ** (c.scene.logPages ?? Math.log10(pages)));
}

export const slides: Slide[] = [
  {
    id: "order",
    top: () => fill(t.order.top, { pages: fmtCount(pages) }),
    bottom: () => t.order.bottom,
    act: {
      kind: "bet",
      id: "pages",
      options: [
        { id: "few", label: () => fill(t.order.few, { k: String(halvingSteps(pages)) }) },
        { id: "half", label: () => t.order.half },
        { id: "all", label: () => fill(t.order.all, { pages: fmtCount(pages) }) },
      ],
      correct: () => "all",
    },
  },
  {
    id: "flip",
    top: (c) => t.flip.reply[c.answers.pages as keyof typeof t.flip.reply] ?? t.flip.reply.all,
    bottom: () => t.flip.bottom,
    act: { kind: "scene" },
  },
  {
    id: "flipDone",
    top: (c) => fill(t.flipDone.top, { opened: fmtExact(c.scene.opened ?? pages) }),
    say: { who: "master", text: () => t.flipDone.say },
    act: { kind: "next", label: () => t.flipDone.label },
  },
  { id: "halve", top: () => t.halve.top, act: { kind: "scene" } },
  {
    id: "halveDone",
    top: (c) =>
      fill(t.halveDone.top, {
        steps: String(c.scene.steps ?? halvingSteps(pages)),
        opened: fmtExact(c.scene.opened ?? pages),
      }),
    say: { who: "master", text: () => t.halveDone.say },
    act: { kind: "next" },
  },
  {
    id: "scale",
    top: () => t.scale.top,
    bottom: (c) => fill(t.scale.bottom, { n: fmtCount(bookSize(c)), k: String(halvingSteps(bookSize(c))) }),
    act: { kind: "scene" },
  },
  { id: "structure", top: () => t.structure.top, act: { kind: "next" } },
  {
    id: "route",
    top: () => t.route.top,
    say: { who: "margo", text: () => fill(t.route.say, { nodes: fmtCount(scenario.route_nodes) }) },
    bottom: () => t.route.bottom,
    act: {
      kind: "bet",
      id: "route",
      options: [
        { id: "wait", label: () => t.route.wait },
        { id: "master", label: () => t.route.master },
      ],
      correct: () => "master",
    },
  },
  {
    id: "wave",
    top: (c) => t.wave.reply[c.answers.route as keyof typeof t.wave.reply] ?? t.wave.reply.master,
    bottom: () => t.wave.bottom,
    act: { kind: "scene" },
  },
  {
    id: "waveDone",
    top: () =>
      fill(t.waveDone.top, { t: fmtDuration(dijkstraSeconds(scenario.route_nodes)), age: String(dijkstraAge()) }),
    say: { who: "master", text: () => t.waveDone.say },
    curious: [
      () =>
        fill(t.waveDone.footnote1, {
          nodes: fmtCount(params.road_network.nodes),
          t: fmtDuration(params.road_network.dijkstra_seconds),
          n: fmtCount(scenario.route_nodes),
        }),
      () =>
        fill(t.waveDone.footnote2, {
          stops: String(params.tsp.instance_stops),
          tc: fmtDuration(params.tsp.concorde_seconds),
          year: String(params.tsp.year),
        }),
    ],
    cites: ["dijkstra", "bast", "concorde"],
    act: { kind: "next" },
  },
  { id: "rule", top: () => t.rule.top, rule: "r1", act: { kind: "next", label: () => t.rule.label } },
];
