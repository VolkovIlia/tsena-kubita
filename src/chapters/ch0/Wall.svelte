<script lang="ts">
  /** Стена заголовков пролога: её же финал показывает на слайде «Вернёмся к заголовкам». */
  import { fill } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { news as n, type CardId } from "./news";

  let {
    shown,
    lit = [],
    fresh = [],
    quiet = false,
  }: { shown: readonly CardId[]; lit?: CardId[]; fresh?: CardId[]; quiet?: boolean } = $props();
  /** Новые карточки появляются по очереди, чтобы их успели прочитать. */
  const STAGGER_MS = 700;
  const t = ru.ch0.scene;

  const YEAR: Record<CardId, string> = { ...n.year, ibm: n.year.supremacy };
  const BADGE: Record<CardId, Record<string, string>> = {
    supremacy: { seconds: n.seconds, years: n.years },
    ibm: { days: n.days, years: n.years },
    willow: { qubits: n.qubits },
    echoes: { x: n.echoes },
    majorana: { target: n.target },
    hoefler: { x: n.stepPrice },
  };
</script>

<section class="wall" class:quiet aria-label={t.label}>
  {#each shown as id (id)}
    <article
      class="card"
      class:lit={lit.includes(id)}
      class:rebuttal={id === "hoefler"}
      style:animation-delay="{Math.max(0, fresh.indexOf(id)) * STAGGER_MS}ms"
    >
      <p class="meta num">{t.cards[id].source} · {YEAR[id]}</p>
      <p class="title">«{fill(t.cards[id].title, { name: n.name })}»</p>
      <p class="badge num">{fill(t.badges[id], BADGE[id])}</p>
    </article>
  {/each}
</section>
<p class="note">{t.translated}</p>

<style>
  .wall { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); transition: opacity 300ms; }
  .wall.quiet { opacity: 0.45; }
  .card {
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    background: var(--paper);
    color: var(--muted);
    animation: drop 350ms ease-out both;
  }
  .card.lit { border: 2px solid var(--ink); color: var(--ink); }
  .card.rebuttal { border-style: dashed; }
  .card.rebuttal.lit { border-style: solid; border-color: var(--qc); }
  .card p { margin: 0; }
  .meta { font-size: 0.8125rem; }
  .title { font-weight: 600; line-height: 1.3; margin: 0.125rem 0 0.25rem; }
  .badge { font-size: 0.9375rem; font-weight: 700; }
  .lit .badge { color: var(--ink); }
  .note { font-size: 0.8125rem; color: var(--muted); margin: 0.25rem 0 0; }
  @keyframes drop {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }
</style>
