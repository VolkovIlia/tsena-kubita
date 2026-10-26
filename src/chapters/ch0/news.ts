/** Числа пролога: всё из params.timeline и модели, общий источник для слайдов и сцены. */
import params from "../../../data/params.json";
import { eventYear } from "../../game/chapters";
import { fmtCount, fmtNum } from "../../i18n/format";
import { AS_OF_YEAR, powerOfTenBelow, rateRatio } from "../../model/tick";

const tl = params.timeline;

export const news = {
  year: {
    supremacy: String(eventYear("sycamore")),
    willow: String(eventYear("willow")),
    echoes: String(eventYear("echoes")),
    majorana: String(eventYear("majorana2")),
    hoefler: String(eventYear("hoefler")),
  },
  now: String(AS_OF_YEAR),
  seconds: fmtCount(tl.sycamore.quantum_seconds),
  years: fmtCount(tl.sycamore.claimed_classical_years),
  days: fmtNum(tl.sycamore.ibm_days),
  qubits: fmtCount(tl.willow.qubits),
  echoes: fmtCount(params.quantum_echoes.speedup_claim),
  name: tl.majorana2.name,
  target: String(tl.majorana2.target_year),
  lifetime: fmtCount(tl.majorana2.reliability_claim),
  starling: String(tl.starling.year),
  logical: fmtCount(tl.starling.logical_qubits),
  /** Шаг будущего квантового компьютера дороже шага видеокарты больше чем во столько раз (Hoefler, Table 1). */
  stepPrice: fmtCount(powerOfTenBelow(rateRatio("gpu", "qc"))),
};

/** Порядок заголовков на стене: слайд с тем же id добавляет свою карточку. */
export const CARDS = ["supremacy", "ibm", "willow", "echoes", "majorana", "hoefler"] as const;
export type CardId = (typeof CARDS)[number];
