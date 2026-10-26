/** Времена главы «Видеокарта»: мультфильм делится между ядрами, цепочку платежей считает одно ядро. */
import { chainSeconds, scenario, solveSeconds, type Classical } from "../../model/tick";

export const CREW: Classical[] = ["core", "cores", "gpu"];
export const CARTOON_ITEMS = scenario.cartoon_frames * scenario.cartoon_pixels;

/** Мультфильм: точки независимы, каждый исполнитель работает всеми ядрами. */
export const cartoon = Object.fromEntries(
  CREW.map((id) => [id, solveSeconds(id, CARTOON_ITEMS, scenario.pixel_ticks)]),
) as Record<Classical, number>;
/** Цепочка платежей: работает одно ядро исполнителя. */
export const chain = Object.fromEntries(
  CREW.map((id) => [id, chainSeconds(id, scenario.payments, scenario.payment_ticks)]),
) as Record<Classical, number>;
