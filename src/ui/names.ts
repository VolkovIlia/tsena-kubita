import params from "../../data/params.json";
import { eventYear, type EventId } from "../game/chapters";
import { fill } from "../i18n/format";
import { ru } from "../i18n/ru";
import { hands, type ExecutorId } from "../model/tick";

/** Имя исполнителя: «1 ядро», «64 ядра» — число рук приходит из модели, не из словаря. */
export function exName(id: ExecutorId): string {
  return fill(ru.executors[id], { n: String(hands(id)) });
}

/** Строка события хроники: {name} — имя из params.timeline (в именах вроде «Majorana 2» есть цифры). */
export function eventText(id: EventId, text: string = ru.events[id].text): string {
  const name = id === "dijkstra" ? "" : ((params.timeline[id] as { name?: string }).name ?? "");
  return fill(text, { name, year: String(eventYear(id)) });
}
