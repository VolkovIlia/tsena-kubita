// Каждый текст каждой колоды собирается без ошибок: fill() падает на отсутствующем {ключе},
// и такая опечатка иначе всплывёт только у игрока на нужном слайде.
import { describe, expect, it } from "vitest";
import type { Ctx, Slide, Text } from "../deck/types";
import { slides as ch0 } from "./ch0/slides";
import { slides as ch1 } from "./ch1/slides";
import { slides as ch2 } from "./ch2/slides";
import { slides as ch3 } from "./ch3/slides";
import { slides as ch4 } from "./ch4/slides";
import { slides as ch5 } from "./ch5/slides";
import { slides as ch6 } from "./ch6/slides";
import { slides as ch7 } from "./ch7/slides";

const decks: Record<string, Slide[]> = { ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7 };
const PROLOGUE = ["all", "none", "unknown", "skipped"];

/** Все тексты слайда, включая подписи кнопок и вариантов ставки. */
function texts(s: Slide): Text[] {
  const act = s.act.kind === "bet" ? s.act.options.map((o) => o.label) : s.act.label ? [s.act.label] : [];
  return [s.top, s.say?.text, s.bottom, ...(s.curious ?? []), ...act].filter((t): t is Text => t !== undefined);
}

/** Контексты: каждый вариант каждой ставки и каждый ответ пролога; числа сцены — единица. */
function contexts(deck: Slide[]): Ctx[] {
  const bets = deck.flatMap((s) => (s.act.kind === "bet" ? [{ id: s.act.id, options: s.act.options.map((o) => o.id) }] : []));
  const base = Object.fromEntries(bets.map((b) => [b.id, b.options[0]]));
  const scene = new Proxy<Record<string, number>>({}, { get: () => 1 });
  const variants = [
    ...PROLOGUE.map((prologue) => ({ ...base, prologue })),
    ...bets.flatMap((b) => b.options.map((o) => ({ ...base, prologue: "skipped", [b.id]: o }))),
  ];
  return variants.map((answers) => ({ answers, scene }));
}

describe.each(Object.entries(decks))("колода %s", (_, deck) => {
  it("все тексты собираются при любом ответе на ставки", () => {
    for (const ctx of contexts(deck))
      for (const s of deck)
        for (const t of texts(s)) {
          const out = t(ctx);
          expect(out, s.id).not.toMatch(/\{\w+\}|undefined|NaN/);
          expect(out.length, s.id).toBeGreaterThan(0);
        }
  });
});
