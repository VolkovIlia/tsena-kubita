import type { Slide } from "../../deck/types";
import { fill, fmtCount, fmtDuration, fmtExact, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import params from "../../../data/params.json";
import {
  DAY,
  dijkstraAge,
  dijkstraSeconds,
  executors,
  halvingSteps,
  hands,
  ladderSeconds,
  scenario,
  universeAgeSeconds,
  DEFAULT_CHECK,
} from "../../model/tick";

const t = ru.ch2;
const pages = scenario.book_pages;
const big = scenario.book_pages_big;
const LADDER = scenario.ladder_n;
/** Последняя ступень, которую нижняя строка проходит на одном ядре меньше чем за сутки: дальше ползунок открывает ставка. */
export const LADDER_LOCK = LADDER.reduce((last, n, i) => (ladderSeconds("exp", n) < DAY ? i : last), 0);
const nLock = LADDER[LADDER_LOCK];
const nTop = LADDER[LADDER.length - 1];
const YEAR = 365.25 * DAY;

const stepsRatio = halvingSteps(big) / halvingSteps(pages);
/** Ответ на ставку «во сколько раз больше шагов» по модели: столько же, во столько же, во сколько книга, или меньше. */
function growAnswer(): string {
  if (stepsRatio === 1) return "same";
  return stepsRatio >= big / pages ? "x" : "two";
}
/** Ответ на ставку «все комбинации nTop переключателей»: сравнение с годом и возрастом Вселенной. */
function expAnswer(): string {
  const s = ladderSeconds("exp", nTop);
  return s > universeAgeSeconds() ? "universe" : s > YEAR ? "year" : "second";
}
export const slides: Slide[] = [
  {
    id: "intro",
    top: () => t.intro.top,
    quote: { who: "dijkstra", text: () => t.intro.quote, cite: "dijkstraInterview" },
    act: { kind: "next", label: () => t.intro.label },
  },
  {
    id: "book",
    top: () => fill(t.book.top, { pages: fmtCount(pages) }),
    bottom: () => t.book.bottom,
    act: {
      kind: "bet",
      id: "worst",
      options: [
        { id: "few", label: () => fill(t.book.few, { k: String(halvingSteps(pages)) }) },
        { id: "half", label: () => t.book.half },
        { id: "all", label: () => fill(t.book.all, { pages: fmtCount(pages) }) },
      ],
      correct: () => "all",
    },
  },
  {
    id: "flip",
    top: (c) => t.flip.reply[c.answers.worst as keyof typeof t.flip.reply] ?? t.flip.reply.all,
    bottom: () => t.flip.bottom,
    act: { kind: "scene" },
  },
  {
    id: "flipDone",
    top: (c) => fill(t.flipDone.top, { opened: fmtExact(c.scene.opened ?? pages) }),
    bottom: () => fill(t.flipDone.bottom, { tick: ru.chapters.ch1 }),
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
    bottom: () => t.halveDone.bottom,
    act: { kind: "next" },
  },
  {
    id: "growBet",
    top: () => fill(t.growBet.top, { x: fmtTimes(big / pages), big: fmtCount(big) }),
    bottom: () => t.growBet.bottom,
    act: {
      kind: "bet",
      id: "grow",
      options: [
        { id: "x", label: () => fill(t.growBet.times, { x: fmtTimes(big / pages) }) },
        { id: "two", label: () => fill(t.growBet.times, { x: fmtTimes(stepsRatio) }) },
        { id: "same", label: () => t.growBet.same },
      ],
      correct: growAnswer,
    },
  },
  {
    id: "scale",
    top: (c) =>
      fill(t.scale.reply[c.answers.grow as keyof typeof t.scale.reply] ?? t.scale.reply.two, {
        was: String(halvingSteps(pages)),
        now: String(halvingSteps(big)),
        two: fmtTimes(stepsRatio),
      }),
    bottom: () => t.scale.bottom,
    act: { kind: "scene" },
  },
  {
    id: "ladder",
    top: () => t.ladder.top,
    bottom: () => fill(t.ladder.bottom, { max: String(nLock) }),
    curious: [
      () => fill(t.ladder.curious, { ticks: fmtCount(DEFAULT_CHECK), rate: fmtCount(executors.core.ops_per_s) }),
    ],
    basis: ["core"],
    act: { kind: "scene" },
  },
  {
    id: "expBet",
    top: () => fill(t.expBet.top, { n: String(nLock), t: fmtDuration(ladderSeconds("exp", nLock)) }),
    bottom: () => fill(t.expBet.bottom, { big: String(nTop) }),
    act: {
      kind: "bet",
      id: "exp",
      options: [
        { id: "second", label: () => t.expBet.second },
        { id: "year", label: () => t.expBet.year },
        { id: "universe", label: () => t.expBet.universe },
      ],
      correct: expAnswer,
    },
  },
  {
    id: "ladderAll",
    top: (c) => t.ladderAll.reply[c.answers.exp as keyof typeof t.ladderAll.reply] ?? t.ladderAll.reply.universe,
    curious: [
      () =>
        fill(t.ladderAll.curious, {
          age: fmtDuration(universeAgeSeconds()),
          n: String(nTop),
          t: fmtDuration(ladderSeconds("exp", nTop)),
          x: fmtTimes(ladderSeconds("exp", nTop) / universeAgeSeconds()),
        }),
    ],
    cites: ["planck"],
    act: { kind: "scene" },
  },
  {
    id: "wave",
    top: () => fill(t.wave.top, { nodes: fmtCount(scenario.route_nodes) }),
    bottom: () => t.wave.bottom,
    act: { kind: "scene" },
  },
  {
    id: "waveDone",
    top: () =>
      fill(t.waveDone.top, { t: fmtDuration(dijkstraSeconds(scenario.route_nodes)), age: String(dijkstraAge()) }),
    bottom: () => t.waveDone.bottom,
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
      () =>
        fill(t.waveDone.footnote3, {
          conceived: String(params.dijkstra.conceived),
          published: String(params.dijkstra.published),
        }),
    ],
    cites: ["dijkstra", "dijkstraInterview", "bast", "concorde"],
    act: { kind: "next" },
  },
  {
    id: "hard",
    top: () => t.hard.top,
    bottom: () => t.hard.bottom,
    curious: [() => t.hard.curious],
    cites: ["montanaro"],
    act: { kind: "next" },
  },
  {
    id: "bridge",
    top: () => fill(t.bridge.top, { n: String(hands("cores")) }),
    bottom: () =>
      fill(t.bridge.bottom, {
        x: fmtTimes(hands("cores")),
        /* Машина в x раз быстрее успевает лишь на log₂x переключателей больше: каждый удваивает работу. */
        k: String(Math.floor(Math.log2(hands("cores")))),
      }),
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => fill(t.rule.top, { x: fmtTimes(big / halvingSteps(big)) }),
    rule: "r2",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch3 }) },
  },
];
