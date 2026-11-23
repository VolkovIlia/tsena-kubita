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
  supremacyQubits: fmtCount(tl.sycamore.qubits),
  qubits: fmtCount(tl.willow.qubits),
  echoes: fmtCount(params.quantum_echoes.speedup_claim),
  echoQubits: fmtCount(params.quantum_echoes.qubits_used),
  echoChip: fmtCount(params.quantum_echoes.chip_qubits),
  echoHours: fmtNum(params.quantum_echoes.duration_hours),
  name: tl.majorana2.name,
  lifetime: fmtCount(tl.majorana2.reliability_claim),
  lifetimeSeconds: fmtNum(tl.majorana2.mean_lifetime_s),
  maxLifetimeSeconds: fmtNum(tl.majorana2.max_lifetime_s),
  target: String(tl.majorana2.target_year),
  starling: String(tl.starling.year),
  logical: fmtCount(tl.starling.logical_qubits),
  /** Шаг будущего квантового компьютера дороже шага видеокарты больше чем во столько раз (Hoefler, Table 1). */
  stepPrice: fmtCount(powerOfTenBelow(rateRatio("gpu", "qc"))),
};

/** Порядок заголовков на стене: слайд с тем же id добавляет свою карточку. */
export const CARDS = ["supremacy", "ibm", "willow", "echoes", "majorana", "hoefler"] as const;
export type CardId = (typeof CARDS)[number];
