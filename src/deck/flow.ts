/** Правила перехода между слайдами: чистые функции, без стора и DOM. */
import type { Ctx, Slide } from "./types";

/** Кнопка «Дальше» доступна: next — всегда, scene — после действия в сцене, ставку двигает сам ответ. */
export function canAdvance(slide: Slide, sceneDone: boolean): boolean {
  if (slide.act.kind === "next") return true;
  if (slide.act.kind === "scene") return sceneDone;
  return false;
}

/** Новый ctx с ответом на ставку; исходный не меняется. */
export function answer(ctx: Ctx, betId: string, optionId: string): Ctx {
  return { answers: { ...ctx.answers, [betId]: optionId }, scene: { ...ctx.scene } };
}

/** Ставка верна, если совпала с правильным ответом; ставка-мнение без правильного ответа верна всегда. */
export function isCorrect(slide: Slide, ctx: Ctx, optionId: string): boolean {
  if (slide.act.kind !== "bet" || !slide.act.correct) return true;
  return slide.act.correct(ctx) === optionId;
}
