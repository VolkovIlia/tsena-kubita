/** Реестр глав: хроника от новостей к ответу (story/02_story/chapter_list.md). У каждой главы — датированное событие. */
import params from "../../data/params.json";

export type ChapterId = "ch0" | "ch1" | "ch2" | "ch3" | "ch4" | "ch5" | "ch6" | "ch7" | "ch8" | "ch9" | "ch10";
export type RuleId = "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8" | "r9";
export type EventId = keyof typeof params.timeline | "dijkstra";

export interface Chapter {
  id: ChapterId;
  hash: string;
  rule: RuleId | null;
  event: EventId;
}

export const chapters: readonly Chapter[] = [
  { id: "ch0", hash: "prologue", rule: null, event: "sycamore" },
  { id: "ch1", hash: "chapter-1", rule: "r1", event: "shannon" },
  { id: "ch2", hash: "chapter-2", rule: "r2", event: "dijkstra" },
  { id: "ch3", hash: "chapter-3", rule: "r3", event: "sutter" },
  { id: "ch4", hash: "chapter-4", rule: "r4", event: "cuda" },
  { id: "ch5", hash: "chapter-5", rule: "r5", event: "feynman" },
  { id: "ch6", hash: "chapter-6", rule: "r6", event: "grover" },
  { id: "ch7", hash: "chapter-7", rule: "r7", event: "hoefler" },
  { id: "ch8", hash: "chapter-8", rule: "r8", event: "tang" },
  { id: "ch9", hash: "chapter-9", rule: "r9", event: "shor" },
  { id: "ch10", hash: "finale", rule: null, event: "starling" },
];

export function chapterIndex(id: ChapterId): number {
  return chapters.findIndex((c) => c.id === id);
}

/** Год события: у алгоритма Дейкстры — год публикации. */
export function eventYear(id: EventId): number {
  return id === "dijkstra" ? params.dijkstra.published : params.timeline[id].year;
}

/** Ссылка на первоисточник события. */
export function eventUrl(id: EventId): string {
  return id === "dijkstra" ? params.dijkstra.source_url : params.timeline[id].source_url;
}
