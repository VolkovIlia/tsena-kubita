/** Прогресс игрока: чистые функции над неизменяемым состоянием (story/04_design/state_model.md). */
import { chapterIndex, chapters, type ChapterId, type RuleId } from "./chapters";

export type PrologueAnswer = "soon" | "never" | "unknown";

export interface Bet {
  chapter: ChapterId;
  id: string;
  correct: boolean;
}

export interface Progress {
  notebook: RuleId[];
  bets: Bet[];
  prologueAnswer: PrologueAnswer | null;
  memo: string[];
  done: ChapterId[];
  /** Выбор игрока в «Ночи диспетчера» пролога: заказ → машина (для реванша в финале). */
  night: Record<string, string>;
}

export function initial(): Progress {
  return { notebook: [], bets: [], prologueAnswer: null, memo: [], done: [], night: {} };
}

function withRules(notebook: RuleId[], add: RuleId[]): RuleId[] {
  const all = new Set([...notebook, ...add]);
  return chapters.flatMap((c) => (c.rule && all.has(c.rule) ? [c.rule] : []));
}

/** Вход в главу: пропущенные правила предыдущих глав выдаются (карточка «что ты уже знаешь»). */
export function enter(p: Progress, id: ChapterId): { progress: Progress; granted: RuleId[] } {
  const granted = chapters
    .slice(0, chapterIndex(id))
    .flatMap((c) => (c.rule && !p.notebook.includes(c.rule) ? [c.rule] : []));
  if (granted.length === 0) return { progress: p, granted };
  return { progress: { ...p, notebook: withRules(p.notebook, granted) }, granted };
}

/** Глава пройдена: правило в блокнот, глава отмечена один раз. */
export function finish(p: Progress, id: ChapterId): Progress {
  const rule = chapters[chapterIndex(id)].rule;
  return {
    ...p,
    done: p.done.includes(id) ? p.done : [...p.done, id],
    notebook: rule ? withRules(p.notebook, [rule]) : p.notebook,
  };
}

/** Ставка: повтор той же ставки заменяет прежнюю. */
export function recordBet(p: Progress, bet: Bet): Progress {
  const rest = p.bets.filter((b) => b.chapter !== bet.chapter || b.id !== bet.id);
  return { ...p, bets: [...rest, bet] };
}

/** Записка из финала: выбранные условия. */
export function setMemo(p: Progress, memo: string[]): Progress {
  return { ...p, memo };
}

/** Ночь диспетчера: выбор игрока целиком (новая ночь заменяет прежнюю). */
export function setNight(p: Progress, night: Record<string, string>): Progress {
  return { ...p, night };
}

export function answerPrologue(p: Progress, answer: PrologueAnswer): Progress {
  return { ...p, prologueAnswer: answer };
}

const chapterIds = new Set<unknown>(chapters.map((c) => c.id));
const ruleIds = new Set<unknown>(chapters.map((c) => c.rule).filter(Boolean));
const answers = new Set<unknown>(["soon", "never", "unknown", null]);
const KEYS = ["notebook", "bets", "prologueAnswer", "memo", "done", "night"];
const machines = new Set<unknown>(["core", "cores", "gpu", "qc"]);

function isBet(x: unknown): boolean {
  const b = x as Bet;
  return typeof b === "object" && b !== null && chapterIds.has(b.chapter) && typeof b.id === "string" && typeof b.correct === "boolean";
}

/** Проверка формы сохранённого прогресса: всё незнакомое (в том числе лишние поля) — повод начать заново. */
export function isProgress(x: unknown): x is Progress {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Progress;
  return (
    Object.keys(p).every((k) => KEYS.includes(k)) &&
    Array.isArray(p.notebook) && p.notebook.every((r) => ruleIds.has(r)) &&
    Array.isArray(p.bets) && p.bets.every(isBet) &&
    answers.has(p.prologueAnswer) &&
    Array.isArray(p.memo) && p.memo.every((m) => typeof m === "string") &&
    Array.isArray(p.done) && p.done.every((d) => chapterIds.has(d)) &&
    typeof p.night === "object" && p.night !== null && !Array.isArray(p.night) && Object.values(p.night).every((m) => machines.has(m))
  );
}
