import params from "../../../data/params.json";
import type { Slide } from "../../deck/types";
import { fill, fmtCount, fmtNum, fmtTimes } from "../../i18n/format";
import { ru } from "../../i18n/ru";
import { coldRatio } from "../../model/tick";
import { cards, chapterNames } from "./cards";

const t = ru.ch10;
const { starling, majorana2, ibmCloud } = params.timeline;
type Reply = keyof typeof t.callback.reply;

export const slides: Slide[] = [
  { id: "back", top: () => t.back.top, act: { kind: "next" }, cites: ["arute", "ibmSupremacy", "willow", "googleEcho", "majorana2", "hoefler"] },
  {
    id: "promise",
    top: () =>
      fill(t.promise.top, {
        starling: String(starling.year),
        logical: fmtCount(starling.logical_qubits),
        majorana: String(majorana2.target_year),
      }),
    bottom: () => t.promise.bottom,
    act: { kind: "next" },
    cites: ["starling", "majorana2"],
  },
  {
    id: "dispatch",
    top: () => fill(t.dispatch.top, { total: String(cards.length) }),
    bottom: () => t.dispatch.bottom,
    act: { kind: "scene" },
  },
  {
    id: "dispatchDone",
    top: (c) =>
      [
        fill(t.dispatchDone.top, { right: String(c.scene.right ?? 0), total: String(cards.length) }),
        c.scene.keyWrong ? fill(t.dispatchDone.keyWrong, chapterNames) : "",
      ].join(" ").trim(),
    bottom: () => t.dispatchDone.bottom,
    act: { kind: "next" },
  },
  {
    id: "headlines",
    top: () => t.headlines.top,
    act: { kind: "scene" },
    cites: ["googleEcho", "ieeeEcho", "gidney", "nist", "majorana2", "majoranaCritics"],
  },
  { id: "memo", top: () => t.memo.top, act: { kind: "scene" } },
  {
    id: "desk",
    top: () => fill(t.desk.top, { cold: fmtTimes(coldRatio()) }),
    bottom: () => t.desk.bottom,
    curious: [
      () => fill(t.desk.curious, { mk: fmtNum(params.cryostat.kelvin * 1000), cmb: fmtNum(params.cryostat.cmb_kelvin) }),
    ],
    cites: ["krinner", "fixsen"],
    act: { kind: "next" },
  },
  { id: "deskTasks", top: () => t.deskTasks.top, bottom: () => t.deskTasks.bottom, act: { kind: "next" } },
  {
    id: "deskCloud",
    top: () => fill(t.deskCloud.top, { year: String(ibmCloud.year) }),
    bottom: () => fill(t.deskCloud.bottom, { ...chapterNames, target: String(starling.year) }),
    cites: ["ibm2016", "starling", "majorana2"],
    act: { kind: "next" },
  },
  {
    id: "callback",
    top: (c) => t.callback.reply[c.answers.prologue as Reply] ?? t.callback.reply.skipped,
    act: { kind: "next" },
  },
  { id: "last", top: () => t.last.top, bottom: () => t.last.bottom, act: { kind: "next", label: () => t.last.label } },
  {
    id: "sandbox",
    top: () => t.sandbox.top,
    curious: [() => t.sandbox.basisFormula, () => ru.ui.basisUnit],
    cites: ["hoefler", "babbush", "shor"],
    act: { kind: "next", label: () => ru.ui.play },
  },
];
