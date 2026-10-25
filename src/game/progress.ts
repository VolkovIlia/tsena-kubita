/** Прогресс игрока: чистые функции над неизменяемым состоянием (story/04_design/state_model.md). */
import { chapterIndex, chapters, days, type ChapterId, type Day, type RuleId } from "./chapters";

export type PrologueAnswer = "all" | "none" | "unknown";

export interface Bet {
  chapter: ChapterId;
  id: string;
  correct: boolean;
}

export interface Progress {
  notebook: RuleId[];
  bets: Bet[];
  hype: number;
  informed: boolean;
  day: Day;
  prologueAnswer: PrologueAnswer | null;
  memo: string[];
  done: ChapterId[];
}

export function initial(): Progress {
  return { notebook: [], bets: [], hype: 100, informed: false, day: "mon", prologueAnswer: null, memo: [], done: [] };
}

function withRules(notebook: RuleId[], add: RuleId[]): RuleId[] {
  const all = new Set([...notebook, ...add]);
  return chapters.flatMap((c) => (c.rule && all.has(c.rule) ? [c.rule] : []));
}

/**
 * Вход в главу. Пропущенные правила предыдущих глав выдаются (карточка «что ты уже знаешь»),
 * и тогда hype ставится сюжетной для этой главы; при обычном прохождении hype не трогаем.
 */
export function enter(p: Progress, id: ChapterId): { progress: Progress; granted: RuleId[] } {
  const chapter = chapters[chapterIndex(id)];
  const granted = chapters
    .slice(0, chapterIndex(id))
    .flatMap((c) => (c.rule && !p.notebook.includes(c.rule) ? [c.rule] : []));
  const progress: Progress = { ...p, day: chapter.day };
  if (granted.length > 0) {
    progress.notebook = withRules(p.notebook, granted);
    progress.hype = chapter.hypeOnEntry;
    progress.informed = chapter.informedOnEntry;
  }
  return { progress, granted };
}

/** Вера Марго после главы id: hype и informed — как на входе в следующую главу. */
export function moodAfter(p: Progress, id: ChapterId): Progress {
  const next = chapters[chapterIndex(id) + 1];
  return next ? { ...p, hype: next.hypeOnEntry, informed: next.informedOnEntry } : p;
}

/** Глава пройдена: правило в блокнот, вера Марго — как после главы. */
export function finish(p: Progress, id: ChapterId): Progress {
  const rule = chapters[chapterIndex(id)].rule;
  return moodAfter(
    {
      ...p,
      done: p.done.includes(id) ? p.done : [...p.done, id],
      notebook: rule ? withRules(p.notebook, [rule]) : p.notebook,
    },
    id,
  );
}

/** Ставка: повтор той же ставки заменяет прежнюю. */
export function recordBet(p: Progress, bet: Bet): Progress {
  const rest = p.bets.filter((b) => b.chapter !== bet.chapter || b.id !== bet.id);
  return { ...p, bets: [...rest, bet] };
}

/** Записка Марго из финала: выбранные условия. */
export function setMemo(p: Progress, memo: string[]): Progress {
  return { ...p, memo };
}

export function answerPrologue(p: Progress, answer: PrologueAnswer): Progress {
  return { ...p, prologueAnswer: answer };
}

const chapterIds = new Set<unknown>(chapters.map((c) => c.id));
const ruleIds = new Set<unknown>(chapters.map((c) => c.rule).filter(Boolean));
const answers = new Set<unknown>(["all", "none", "unknown", null]);

function isBet(x: unknown): boolean {
  const b = x as Bet;
  return typeof b === "object" && b !== null && chapterIds.has(b.chapter) && typeof b.id === "string" && typeof b.correct === "boolean";
}

/** Проверка формы сохранённого прогресса: всё незнакомое — повод начать заново. */
export function isProgress(x: unknown): x is Progress {
  if (typeof x !== "object" || x === null) return false;
  const p = x as Progress;
  return (
    Array.isArray(p.notebook) && p.notebook.every((r) => ruleIds.has(r)) &&
    Array.isArray(p.bets) && p.bets.every(isBet) &&
    typeof p.hype === "number" && p.hype >= 0 && p.hype <= 100 &&
    typeof p.informed === "boolean" &&
    days.includes(p.day) &&
    answers.has(p.prologueAnswer) &&
    Array.isArray(p.memo) && p.memo.every((m) => typeof m === "string") &&
    Array.isArray(p.done) && p.done.every((d) => chapterIds.has(d))
  );
}
