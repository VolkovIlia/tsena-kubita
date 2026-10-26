<script lang="ts">
  import { eventUrl, eventYear, type EventId } from "../game/chapters";
  import { fill } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { eventText } from "./names";

  /** Событие хроники над заголовком главы: дата, что случилось, первоисточник. */
  let { event }: { event: EventId } = $props();
  const url = $derived(eventUrl(event));
</script>

<p class="date-card">
  <span class="date num">{fill(ru.events[event].date, { year: String(eventYear(event)) })}</span>
  <span class="what">{eventText(event)}</span>
  {#if url}<a href={url} target="_blank" rel="noopener">{ru.ui.source}</a>{/if}
</p>

<style>
  .date-card { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 0.75rem; margin: 0 0 0.25rem; color: var(--muted); }
  .date { font-size: 1.5rem; font-weight: 700; color: var(--ink); }
  .what { flex: 1 1 16rem; }
  a { display: inline-flex; align-items: center; min-height: 44px; font-size: 0.875rem; }
</style>
