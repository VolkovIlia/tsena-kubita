import type { Ctx, Slide } from "../../deck/types";
import { eventYear } from "../../game/chapters";
import { fill, fmtCount, fmtDuration, fmtNum, fmtPercent, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { amdahl, hands, scenario } from "../../model/tick";
import { exName } from "../../ui/names";
import { cartoon, chain, GHZ, speedup } from "./times";

const t = ru.ch3;
const one = exName("core");
const many = exName("cores");
const n = String(hands("cores"));
const xn = fmtTimes(hands("cores"));
const x = fmtTimes(speedup(0));
const ghz = { fOne: fmtNum(GHZ.one), fAll: fmtNum(GHZ.all) };
const serial = (c: Ctx) => c.scene.serial ?? 0;

export const slides: Slide[] = [
  {
    id: "freeLunch",
    top: () => t.freeLunch.top,
    quote: { who: "sutter", text: () => t.freeLunch.quote, cite: "sutter" },
    act: { kind: "next" },
  },
  {
    id: "howCores",
    top: () => fill(t.howCores.top, { many, n }),
    bottom: () => fill(t.howCores.bottom, { n, ...ghz }),
    cites: ["sutter", "amd"],
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
    bottom: () => fill(t.cartoonBet.bottom, { many, one }),
    act: {
      kind: "bet",
      id: "speedup",
      options: [
        { id: "x64", label: () => fill(t.cartoonBet.x64, { x: xn }) },
        { id: "almost", label: () => fill(t.cartoonBet.almost, { x }) },
        { id: "twice", label: () => t.cartoonBet.twice },
      ],
      correct: () => (speedup(0) < hands("cores") ? "almost" : "x64"),
    },
  },
  {
    id: "cartoonRace",
    top: (c) =>
      c.scene.cartoon
        ? fill(t.cartoonRace.done.top, { one, many, tOne: fmtDuration(cartoon.core), tMany: fmtDuration(cartoon.cores), x, n: xn })
        : fill(t.cartoonRace.reply[c.answers.speedup as keyof typeof t.cartoonRace.reply] ?? t.cartoonRace.reply.almost, { n: xn }),
    bottom: (c) => (c.scene.cartoon ? fill(t.cartoonRace.done.bottom, { n: xn, x, ...ghz }) : t.cartoonRace.bottom),
    curious: [() => fill(t.cartoonRace.curious, { tick: ru.chapters.ch1, n, x, ...ghz })],
    cites: ["amd"],
    act: { kind: "scene" },
  },
  {
    id: "chainBet",
    top: () => fill(t.chainBet.top, { payments: fmtCount(scenario.payments) }),
    bottom: () => fill(t.chainBet.bottom, { many, one }),
    act: {
      kind: "bet",
      id: "chain",
      options: [
        { id: "x64", label: () => fill(t.chainBet.x64, { x: xn }) },
        { id: "same", label: () => t.chainBet.same },
        { id: "slower", label: () => t.chainBet.slower },
      ],
      correct: () => (chain.cores > chain.core ? "slower" : chain.cores === chain.core ? "same" : "x64"),
    },
  },
  {
    id: "chainRace",
    top: (c) =>
      c.scene.chain
        ? fill(t.chainRace.done.top, { one, many, tOne: fmtDuration(chain.core), tMany: fmtDuration(chain.cores), n })
        : (t.chainRace.reply[c.answers.chain as keyof typeof t.chainRace.reply] ?? t.chainRace.reply.slower),
    bottom: (c) => (c.scene.chain ? fill(t.chainRace.done.bottom, ghz) : t.chainRace.bottom),
    curious: [() => fill(t.chainRace.curious, { many })],
    cites: ["amd"],
    act: { kind: "scene" },
  },
  {
    id: "amdahl",
    top: () => t.amdahl.top,
    bottom: (c) =>
      serial(c) === 0
        ? fill(t.amdahl.none, { many, x })
        : fill(t.amdahl.some, {
            s: fmtPercent(serial(c)),
            many,
            x: fmtTimes(speedup(serial(c))),
            w: fmtCount(scenario.amdahl_workers),
            xw: fmtTimes(amdahl(serial(c), scenario.amdahl_workers)),
          }),
    act: { kind: "scene" },
  },
  {
    id: "amdahlHow",
    top: () => fill(t.amdahlHow.top, { year: String(eventYear("amdahl")) }),
    bottom: (c) =>
      serial(c) === 0
        ? t.amdahlHow.none
        : fill(t.amdahlHow.some, { s: fmtPercent(serial(c)), lim: fmtTimes(1 / serial(c)) }),
    cites: ["amdahl"],
    act: { kind: "next" },
  },
  { id: "razbor", top: () => fill(t.razbor.top, { many, x }), act: { kind: "next" } },
  {
    id: "bridge",
    top: () => fill(t.bridge.top, { n, g: fmtCount(hands("gpu")) }),
    bottom: () => t.bridge.bottom,
    act: { kind: "next" },
  },
  {
    id: "rule",
    top: () => t.rule.top,
    rule: "r3",
    act: { kind: "next", label: () => fill(ru.ui.nextChapter, { name: ru.chapters.ch4 }) },
  },
];
