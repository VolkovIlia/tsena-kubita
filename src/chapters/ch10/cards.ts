/** Карточки финала: задача, правило из блокнота (глава, где оно записано) и лучшая машина по модели. */
import { chapters, type RuleId } from "../../game/chapters";
import { ru } from "../../i18n/ru";
import { bestExecutor, chainSeconds, scenario, solveSeconds, type ExecutorId } from "../../model/tick";

export type CardId = "superconductor" | "nitrogenase" | "recommend" | "llm" | "render" | "key" | "route" | "payments";

export const executorIds: ExecutorId[] = ["core", "cores", "gpu", "qc"];
const CLASSICAL = ["core", "cores", "gpu"] as const;

const keyBest = () => bestExecutor(Object.fromEntries(executorIds.map((id) => [id, solveSeconds(id, scenario.key_codes)])));
const paymentsBest = () =>
  bestExecutor(Object.fromEntries(CLASSICAL.map((id) => [id, chainSeconds(id, scenario.payments, scenario.payment_ticks)])));

export const cards: { id: CardId; rule: RuleId; best: () => ExecutorId }[] = [
  { id: "superconductor", rule: "r9", best: () => "qc" },
  { id: "nitrogenase", rule: "r9", best: () => "qc" },
  { id: "recommend", rule: "r8", best: () => "gpu" },
  { id: "llm", rule: "r8", best: () => "gpu" },
  { id: "render", rule: "r4", best: () => "gpu" },
  { id: "key", rule: "r7", best: keyBest },
  { id: "route", rule: "r2", best: () => "core" },
  { id: "payments", rule: "r3", best: paymentsBest },
];

/** Название главы, в которой записано правило. */
export function ruleChapter(rule: RuleId): string {
  const ch = chapters.find((c) => c.rule === rule);
  if (!ch) throw new Error(`нет главы с правилом ${rule}`);
  return ru.chapters[ch.id];
}

/** Значения плейсхолдеров глав в текстах финала: ключи без цифр, их проверяет страж ru.test.ts. */
export const chapterNames = { race: ru.chapters.ch7, bottleneck: ru.chapters.ch8, field: ru.chapters.ch9 };
