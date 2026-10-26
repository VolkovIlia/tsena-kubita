/** Карточки финала: задача, правило из блокнота (глава, где оно записано) и лучшая машина по модели. */
import { chapters, type RuleId } from "../../game/chapters";
import { ru } from "../../i18n/ru";
import { bestExecutor, chainSeconds, dijkstraSeconds, scenario, solveSeconds, type ExecutorId } from "../../model/tick";

export type CardId = "superconductor" | "nitrogenase" | "recommend" | "llm" | "render" | "key" | "route" | "payments";

export const executorIds: ExecutorId[] = ["core", "cores", "gpu", "qc"];
const CLASSICAL = ["core", "cores", "gpu"] as const;

const keyBest = () => bestExecutor(Object.fromEntries(executorIds.map((id) => [id, solveSeconds(id, scenario.key_codes)])));
const paymentTimes = () =>
  Object.fromEntries(CLASSICAL.map((id) => [id, chainSeconds(id, scenario.payments, scenario.payment_ticks)])) as Partial<
    Record<ExecutorId, number>
  >;

export interface Card {
  id: CardId;
  rule: RuleId;
  best: () => ExecutorId;
  /** Время машин, если оно считается моделью: равное лучшему тоже засчитывается. */
  times?: () => Partial<Record<ExecutorId, number>>;
}

export const cards: Card[] = [
  { id: "superconductor", rule: "r9", best: () => "qc" },
  { id: "nitrogenase", rule: "r9", best: () => "qc" },
  { id: "recommend", rule: "r8", best: () => "gpu" },
  { id: "llm", rule: "r8", best: () => "gpu" },
  { id: "render", rule: "r4", best: () => "gpu" },
  { id: "key", rule: "r7", best: keyBest },
  {
    id: "route",
    rule: "r2",
    best: () => "core",
    /** Волна Дейкстры идёт перекрёсток за перекрёстком на одном ядре; у 64 ядер оно так же разгоняется до 5 ГГц. */
    times: () => ({ core: dijkstraSeconds(scenario.route_nodes), cores: dijkstraSeconds(scenario.route_nodes) }),
  },
  { id: "payments", rule: "r3", best: () => bestExecutor(paymentTimes()), times: paymentTimes },
];

/** Выбор верен, если это лучшая машина или машина с тем же временем (на цепочке одно ядро и 64 ядра вровень). */
export function isRight(card: Card, who: ExecutorId): boolean {
  const best = card.best();
  const times = card.times?.();
  return who === best || (times?.[who] !== undefined && times[who] === times[best]);
}

/** Название главы, в которой записано правило. */
export function ruleChapter(rule: RuleId): string {
  const ch = chapters.find((c) => c.rule === rule);
  if (!ch) throw new Error(`нет главы с правилом ${rule}`);
  return ru.chapters[ch.id];
}

/** Значения плейсхолдеров глав в текстах финала: ключи без цифр, их проверяет страж ru.test.ts. */
export const chapterNames = { race: ru.chapters.ch7, bottleneck: ru.chapters.ch8, field: ru.chapters.ch9 };
