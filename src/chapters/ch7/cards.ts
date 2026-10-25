/** Карточки диспетчерской финала: заказ недели, правило из блокнота и лучший исполнитель по модели. */
import type { RuleId } from "../../game/chapters";
import { bestExecutor, chainSeconds, scenario, solveSeconds, type ExecutorId } from "../../model/tick";

export type CardId = "superconductor" | "nina" | "recommend" | "llm" | "render" | "key" | "route" | "payments";

const ALL: ExecutorId[] = ["master", "brigade", "factory", "oracle"];
const CLASSICAL = ["master", "brigade", "factory"] as const;

const keyBest = () => bestExecutor(Object.fromEntries(ALL.map((id) => [id, solveSeconds(id, scenario.key_codes)])));
const paymentsBest = () =>
  bestExecutor(Object.fromEntries(CLASSICAL.map((id) => [id, chainSeconds(id, scenario.payments, scenario.payment_ticks)])));

export const cards: { id: CardId; rule: RuleId; best: () => ExecutorId }[] = [
  { id: "superconductor", rule: "r6", best: () => "oracle" },
  { id: "nina", rule: "r6", best: () => "oracle" },
  { id: "recommend", rule: "r5", best: () => "factory" },
  { id: "llm", rule: "r5", best: () => "factory" },
  { id: "render", rule: "r2", best: () => "factory" },
  { id: "key", rule: "r4", best: keyBest },
  { id: "route", rule: "r1", best: () => "master" },
  { id: "payments", rule: "r2", best: paymentsBest },
];

export const executorIds = ALL;
