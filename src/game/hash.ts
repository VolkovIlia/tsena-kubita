import { chapters, chapterIndex, type ChapterId } from "./chapters";

/** «#chapter-3» → «ch3»; всё незнакомое → null. */
export function parseHash(hash: string): ChapterId | null {
  const name = hash.replace(/^#/, "");
  return chapters.find((c) => c.hash === name)?.id ?? null;
}

export function hashOf(id: ChapterId): string {
  return `#${chapters[chapterIndex(id)].hash}`;
}
