<script lang="ts">
  /**
   * Лента хроники: точки событий по порядку лет. Сплошная точка — случилось, полая — обещание
   * (год обещания — target_year, если есть). Широкий экран — горизонтальная ось, узкий — список.
   */
  import params from "../../data/params.json";
  import { eventYear, type EventId } from "../game/chapters";
  import { ru } from "../i18n/ru";
  import { eventText } from "./names";

  let { events, current, promise = [] }: { events: EventId[]; current: EventId | null; promise?: EventId[] } = $props();

  function promiseYear(id: EventId): number {
    const e = id === "dijkstra" ? null : (params.timeline[id] as { target_year?: number });
    return e?.target_year ?? eventYear(id);
  }
  const promises: Partial<Record<EventId, string>> = ru.promises;

  const points = $derived(
    [
      ...events.map((id) => ({ id, year: eventYear(id), hollow: false, text: eventText(id) })),
      ...promise.map((id) => ({ id, year: promiseYear(id), hollow: true, text: eventText(id, promises[id] ?? ru.events[id].text) })),
    ].sort((a, b) => a.year - b.year),
  );
  const now = $derived(points.find((pt) => pt.id === current && !pt.hollow) ?? points.find((pt) => pt.id === current));
</script>

<div class="timeline">
  <ol>
    {#each points as pt (`${pt.id}-${pt.hollow}`)}
      <li class:current={pt === now} class:hollow={pt.hollow} aria-current={pt === now ? "step" : undefined}>
        <span class="dot" aria-hidden="true"></span>
        <span class="year num">{pt.year}</span>
        <span class="text">{pt.text}</span>
      </li>
    {/each}
  </ol>
  {#if now}<p class="now" aria-live="polite"><strong class="num">{now.year}</strong> {now.text}</p>{/if}
</div>

<style>
  .timeline { margin: 0.5rem 0 1rem; }
  ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
  li { display: grid; grid-template-columns: 14px 3rem 1fr; align-items: center; gap: 0.5rem; color: var(--muted); }
  .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--muted); border: 2px solid var(--muted); }
  .hollow .dot { background: transparent; border-style: dashed; }
  .current { color: var(--ink); font-weight: 600; }
  .current .dot { background: var(--ink); border-color: var(--ink); transform: scale(1.4); }
  .current.hollow .dot { background: transparent; }
  .now { display: none; }
  @media (min-width: 600px) {
    ol { display: flex; justify-content: space-between; position: relative; padding-top: 0.5rem; }
    ol::before { content: ""; position: absolute; left: 6px; right: 6px; top: calc(0.5rem + 6px); height: 2px; background: var(--line); }
    li { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; position: relative; flex: 1 1 0; }
    .text { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .year { font-size: 0.8125rem; }
    .now { display: block; margin: 0.75rem 0 0; min-height: 3em; }
  }
</style>
