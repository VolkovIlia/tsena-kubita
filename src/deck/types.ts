/** Глава как колода слайдов на одной постоянной сцене (формат The Evolution of Trust). */
import type { Component } from "svelte";
import type { RuleId } from "../game/chapters";
import type { Cite, Dict } from "../i18n/ru";
import type { ExecutorId } from "../model/tick";

export type PersonId = keyof Dict["people"];

/** Что знает колода: ответы на ставки (answers.prologue — ответ пролога или "skipped") и числа из сцены. */
export interface Ctx {
  answers: Record<string, string>;
  scene: Record<string, number>;
}
export type Text = (c: Ctx) => string;
export type Act =
  | { kind: "next"; label?: Text }
  | { kind: "scene"; label?: Text }
  | { kind: "bet"; id: string; options: { id: string; label: Text }[]; correct?: (c: Ctx) => string };
export interface Slide {
  id: string;
  /** Рассказчик: 1–3 строки над сценой. */
  top?: Text;
  /** Дословная цитата реального человека из открытого источника. */
  quote?: { who: PersonId; text: Text; cite: Cite };
  /** Вопрос или подсказка под сценой; у ставки — её вопрос. */
  bottom?: Text;
  act: Act;
  /** Карточка «В блокнот». */
  rule?: RuleId;
  /** Блок «На чём основан расчёт». */
  basis?: ExecutorId[];
  /** Абзацы «Для любопытных». */
  curious?: Text[];
  cites?: Cite[];
  onAnswer?: (id: string) => void;
}
export interface SceneProps {
  slide: string;
  ctx: Ctx;
  set: (key: string, v: number) => void;
  done: () => void;
}
export interface Deck {
  slides: Slide[];
  Scene: Component<SceneProps>;
}
