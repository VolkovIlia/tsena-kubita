/** Времена главы 2: мультфильм (делится), цепочка платежей (не делится), закон Амдала. */
import { amdahlSeconds as modelAmdahl, chainSeconds, solveSeconds, scenario, type Classical } from "../../model/tick";

export const CREW: Classical[] = ["master", "brigade", "factory"];
export const CARTOON_ITEMS = scenario.cartoon_frames * scenario.cartoon_pixels;

const each = (f: (id: Classical) => number) =>
  Object.fromEntries(CREW.map((id) => [id, f(id)])) as Record<Classical, number>;

/** Мультфильм: точки независимы, каждый исполнитель работает всеми ядрами. */
export const cartoon = each((id) => solveSeconds(id, CARTOON_ITEMS, scenario.pixel_ticks));
/** Цепочка платежей: работает одна дорожка исполнителя. */
export const chain = each((id) => chainSeconds(id, scenario.payments, scenario.payment_ticks));

/** Мультфильм с неделимой долей s (модель — amdahlSeconds). */
export function amdahlSeconds(id: Classical, s: number): number {
  return modelAmdahl(id, CARTOON_ITEMS, scenario.pixel_ticks, s);
}
