/** Реестр глав: порядок — критический путь недели. Значения hype — сюжетные (story/04_design/state_model.md). */
export type ChapterId = "ch0" | "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6" | "ch7";
export type Day = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type RuleId = "r1" | "r2" | "r3" | "r4" | "r5" | "r6";

export interface Chapter {
  id: ChapterId;
  hash: string;
  day: Day;
  rule: RuleId | null;
  hypeOnEntry: number;
  informedOnEntry: boolean;
}

export const chapters: readonly Chapter[] = [
  { id: "ch0", hash: "prologue", day: "mon", rule: null, hypeOnEntry: 100, informedOnEntry: false },
  { id: "ch1", hash: "chapter-1", day: "mon", rule: "r1", hypeOnEntry: 100, informedOnEntry: false },
  { id: "ch2", hash: "chapter-2", day: "tue", rule: "r2", hypeOnEntry: 100, informedOnEntry: false },
  { id: "ch3", hash: "chapter-3", day: "wed", rule: "r3", hypeOnEntry: 100, informedOnEntry: false },
  { id: "ch4", hash: "chapter-4", day: "thu", rule: "r4", hypeOnEntry: 100, informedOnEntry: false },
  { id: "ch5", hash: "chapter-5", day: "fri", rule: "r5", hypeOnEntry: 40, informedOnEntry: false },
  { id: "ch6", hash: "chapter-6", day: "sat", rule: "r6", hypeOnEntry: 10, informedOnEntry: false },
  { id: "ch7", hash: "finale", day: "sun", rule: null, hypeOnEntry: 10, informedOnEntry: true },
];

export const days: readonly Day[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export function chapterIndex(id: ChapterId): number {
  return chapters.findIndex((c) => c.id === id);
}
