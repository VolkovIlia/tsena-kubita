/** Времена главы «Много ядер»: мультфильм (делится), цепочка платежей (не делится), закон Амдала. */
import { amdahlSeconds as modelAmdahl, chainSeconds, executors, scenario, solveSeconds } from "../../model/tick";

export type Crew = "core" | "cores";
export const CREW: Crew[] = ["core", "cores"];
export const CARTOON_ITEMS = scenario.cartoon_frames * scenario.cartoon_pixels;

const each = (f: (id: Crew) => number) => Object.fromEntries(CREW.map((id) => [id, f(id)])) as Record<Crew, number>;

/** Мультфильм: точки независимы, 64 ядра работают все разом. */
export const cartoon = each((id) => solveSeconds(id, CARTOON_ITEMS, scenario.pixel_ticks));
/** Цепочка платежей: работает одно ядро исполнителя. */
export const chain = each((id) => chainSeconds(id, scenario.payments, scenario.payment_ticks));

/** Мультфильм с неделимой долей s (модель — amdahlSeconds). */
export function amdahlSeconds(id: Crew, s: number): number {
  return modelAmdahl(id, CARTOON_ITEMS, scenario.pixel_ticks, s);
}

/** Во сколько раз 64 ядра быстрее одного при неделимой доле s; при s = 0 — ускорение мультфильма. */
export function speedup(s: number): number {
  return amdahlSeconds("core", s) / amdahlSeconds("cores", s);
}

/** Частота в ГГц: одно ядро (max boost) и все ядра разом (all-core boost), паспорт AMD. */
export const GHZ = {
  one: executors.core.derivation.clock_hz / 1e9,
  all: executors.cores.derivation.clock_hz / 1e9,
};
