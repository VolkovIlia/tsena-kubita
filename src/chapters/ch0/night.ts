/**
 * «Ночь диспетчера» — первая игра: пять заказов, четыре машины; не успел до утра — заказ сорван.
 * Время каждого заказа на каждой машине считает модель; выбор игрока сравнивается с простыми стратегиями.
 */
import { chainSeconds, memoryPlace, scenario, solveSeconds, workSeconds, type ExecutorId } from "../../model/tick";

export const ORDERS = ["video", "bank", "archive", "mail", "fertilizer"] as const;
export type OrderId = (typeof ORDERS)[number];
export const MACHINES: readonly ExecutorId[] = ["core", "cores", "gpu", "qc"];
export type Picks = Partial<Record<OrderId, ExecutorId>>;
export type Verdict = "best" | "done" | "fail";

/** Ночь — срок каждого заказа, секунды (выбор сценария, не факт). */
export const NIGHT = scenario.night_hours * 3600;
/** Сколько «мест» у фермента: последнее деление доски памяти из главы «Своё поле». */
export const MOLECULE_PLACES = scenario.memory_n[scenario.memory_n.length - 1];
const PIXELS = scenario.cartoon_frames * scenario.cartoon_pixels;
/** Пароль от почты: латинские буквы обоих регистров и цифры, mail_password_chars символов. */
export const MAIL_VARIANTS = scenario.password_alphabet ** scenario.mail_password_chars;

/**
 * Время заказа, секунды. Infinity — обычной машине не хватит памяти всех накопителей Земли;
 * null — квантовому по силам, но точного времени у источника нет (Reiher 2017: «reasonable time»).
 */
export function orderSeconds(order: OrderId, id: ExecutorId): number | null {
  switch (order) {
    case "video":
      return workSeconds(id, PIXELS, scenario.pixel_ticks);
    case "bank":
      return id === "qc"
        ? workSeconds(id, scenario.payments, scenario.payment_ticks)
        : chainSeconds(id, scenario.payments, scenario.payment_ticks);
    case "archive":
      return solveSeconds(id, scenario.key_codes);
    case "mail":
      return solveSeconds(id, MAIL_VARIANTS);
    case "fertilizer":
      return id === "qc" ? null : memoryPlace(MOLECULE_PLACES).fits ? 0 : Infinity;
  }
}

/** Порядок для сравнения: известное время < «по силам, время неизвестно» < невозможно. */
const rank = (s: number | null) => (s === null ? Number.MAX_VALUE : s);

export function bestMachine(order: OrderId): ExecutorId {
  return MACHINES.reduce((a, b) => (rank(orderSeconds(order, b)) < rank(orderSeconds(order, a)) ? b : a));
}

/** Лучший выбор — любая машина с лучшим временем: на цепочке одно ядро и 64 ядра идут вровень. */
export function verdict(order: OrderId, id: ExecutorId): Verdict {
  const s = orderSeconds(order, id);
  if (rank(s) === rank(orderSeconds(order, bestMachine(order)))) return "best";
  return s !== null && s > NIGHT ? "fail" : "done";
}

export interface Score {
  best: number;
  fail: number;
  grid: Verdict[];
}

/** Итог ночи: сколько лучших выборов и сорванных заказов; непройденные заказы не считаются. */
export function score(picks: Picks): Score {
  const grid = ORDERS.flatMap((o) => (picks[o] ? [verdict(o, picks[o])] : []));
  return { best: grid.filter((v) => v === "best").length, fail: grid.filter((v) => v === "fail").length, grid };
}

/** Простая стратегия «всё одной машине». */
export function always(id: ExecutorId): Picks {
  return Object.fromEntries(ORDERS.map((o) => [o, id])) as Picks;
}

/** Таблица: больше лучших выборов — выше; при равенстве выше тот, кто меньше сорвал. */
export function byScore(a: Score, b: Score): number {
  return b.best - a.best || a.fail - b.fail;
}

export const EMOJI: Record<Verdict, string> = { best: "🟩", done: "🟨", fail: "🟥" };

export function emojiGrid(s: Score): string {
  return s.grid.map((v) => EMOJI[v]).join("");
}
