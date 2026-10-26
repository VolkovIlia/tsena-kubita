import type { Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtDuration, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { bestExecutor, executors, hands, laneRate, laneRatio, scenario, type Classical } from "../../model/tick";
import { exName } from "../../ui/names";
import { cartoon, chain, CREW } from "./times";

const t = ru.ch4;
const lane = executors.gpu.lane;
const crew = CREW.map((id) => ({ id, label: () => exName(id) }));
/** Времена гонки и имена ядер — для итоговых строк обоих заказов. */
const results = (s: Record<Classical, number>) => ({
  core: fmtDuration(s.core),
  cores: fmtDuration(s.cores),
  gpu: fmtDuration(s.gpu),
  coreName: exName("core"),
  coresName: exName("cores"),
});
const weaker = () => fmtTimes(laneRatio());

export const slides: Slide[] = [
  {
    id: "pixels",
    top: () => t.pixels.top,
    bottom: () => fill(t.pixels.bottom, { year: String(eventYear("cuda")) }),
    cites: ["cudaGuide", "cudaGuide9", "cuda"],
    act: { kind: "next" },
  },
  {
    id: "howGpu",
    top: () =>
      fill(t.howGpu.top, { sm: fmtCount(lane.sm), perSm: fmtCount(lane.lanes_per_sm), lanes: fmtCount(lane.lanes) }),
    bottom: () =>
      fill(t.howGpu.bottom, {
        ch: ru.chapters.ch3,
        cores: fmtCount(hands("cores")),
        x: fmtTimes(hands("gpu") / hands("cores")),
      }),
    cites: ["nvidia"],
    act: { kind: "next" },
  },
  {
    id: "weak",
    top: () => fill(t.weak.top, { x: weaker() }),
    bottom: () => t.weak.bottom,
    curious: [
      () =>
        fill(t.weak.curious, {
          clock: fmtCount(lane.clock_hz),
          bits: fmtCount(lane.bits_per_op),
          lane: fmtCount(laneRate("gpu")),
        }),
    ],
    cites: ["nvidia", "amd", "uops", "cudaGuide"],
    act: { kind: "next" },
  },
  {
    id: "warp",
    top: () => fill(t.warp.top, { warp: fmtCount(lane.warp) }),
    bottom: () => t.warp.bottom,
    cites: ["cudaGuide"],
    act: { kind: "next" },
  },
  {
    id: "diverge",
    top: () => t.diverge.top,
    bottom: () => t.diverge.bottom,
    cites: ["cudaGuide"],
    act: { kind: "scene" },
  },
  {
    id: "same",
    top: () => t.same.top,
    bottom: () => fill(t.same.bottom, { ch: ru.chapters.ch3 }),
    cites: ["cudaGuide9", "cudaGuide"],
    act: { kind: "next" },
  },
  {
    id: "cartoonBet",
    top: () =>
      fill(t.cartoonBet.top, {
        frames: fmtCount(scenario.cartoon_frames),
        pixels: fmtCount(scenario.cartoon_pixels),
        ticks: fmtCount(scenario.pixel_ticks),
      }),
    bottom: () => t.cartoonBet.bottom,
    act: { kind: "bet", id: "gpuCartoon", options: crew, correct: () => bestExecutor(cartoon) },
  },
  {
    id: "cartoonRace",
    top: (c) => t.cartoonRace.reply[c.answers.gpuCartoon as Classical] ?? t.cartoonRace.reply.gpu,
    bottom: () => t.cartoonRace.bottom,
    act: { kind: "scene" },
  },
  {
    id: "cartoonDone",
    top: () => fill(t.cartoonDone.top, results(cartoon)),
    bottom: () => fill(t.cartoonDone.bottom, { x: weaker(), lanes: fmtCount(lane.lanes) }),
    act: { kind: "next" },
  },
  {
    id: "chainBet",
    top: () => fill(t.chainBet.top, { payments: fmtCount(scenario.payments) }),
    bottom: () => t.chainBet.bottom,
    act: {
      kind: "bet",
      id: "gpuChain",
      options: [
        { id: "cpu", label: () => fill(t.chainBet.cpu, { one: exName("core"), many: exName("cores") }) },
        { id: "gpu", label: () => exName("gpu") },
      ],
      /** Одно ядро и 64 ядра на цепочке идут вровень, поэтому ставка — «процессор или видеокарта». */
      correct: () => (Math.min(chain.core, chain.cores) <= chain.gpu ? "cpu" : "gpu"),
    },
  },
  {
    id: "chainRace",
    top: (c) => t.chainRace.reply[c.answers.gpuChain as keyof typeof t.chainRace.reply] ?? t.chainRace.reply.cpu,
    bottom: () => t.chainRace.bottom,
    act: { kind: "scene" },
  },
  {
    id: "chainDone",
    top: () => fill(t.chainDone.top, results(chain)),
    bottom: () => fill(t.chainDone.bottom, { x: weaker() }),
    act: { kind: "next" },
  },
  {
    id: "board",
    top: () => t.board.top,
    bottom: () => t.board.bottom,
    curious: [
      () =>
        fill(t.board.curious, {
          peak: fmtCount(executors.gpu.ops_per_s),
          lanes: fmtCount(lane.lanes),
          sum: fmtCount(lane.lanes * laneRate("gpu")),
        }),
    ],
    cites: ["hoefler", "nvidia"],
    act: { kind: "next" },
  },
  { id: "bridge", top: () => t.bridge.top, bottom: () => t.bridge.bottom, act: { kind: "next" } },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r4",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch5 }) },
  },
];
