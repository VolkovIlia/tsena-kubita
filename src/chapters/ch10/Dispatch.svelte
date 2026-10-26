<script lang="ts">
  import { recordBet } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill, fmtCount } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { scenario, type ExecutorId } from "../../model/tick";
  import { exName } from "../../ui/names";
  import { cards, executorIds, ruleChapter, type CardId } from "./cards";

  let {
    picks = $bindable(),
    onDone,
  }: { picks: Partial<Record<CardId, ExecutorId>>; onDone: (right: number, keyWrong: boolean) => void } = $props();

  const t = ru.ch10;
  let open = $state<CardId | null>(null);
  const best = Object.fromEntries(cards.map((c) => [c.id, c.best()])) as Record<CardId, ExecutorId>;
  const revealed = $derived(cards.every((c) => picks[c.id]));
  const title = (id: CardId) => fill(t.cards[id], { n: fmtCount(scenario.key_codes) });
  const ruleRef = (card: (typeof cards)[number]) => fill(t.ruleRef, { name: ruleChapter(card.rule) });

  function pick(id: CardId, who: ExecutorId) {
    picks[id] = who;
    open = null;
    update((p) => recordBet(p, { chapter: "ch10", id: `card-${id}`, correct: who === best[id] }));
    if (!cards.every((c) => picks[c.id])) return;
    const right = cards.filter((c) => picks[c.id] === best[c.id]).length;
    onDone(right, picks.key !== best.key);
  }
</script>

<ul class="cards">
  {#each cards as card (card.id)}
    {@const chosen = picks[card.id]}
    <li class:flip={revealed}>
      {#if !chosen}
        <button class="card" aria-expanded={open === card.id} onclick={() => (open = open === card.id ? null : card.id)}>
          {title(card.id)}
        </button>
        {#if open === card.id}
          <div class="actions" role="group" aria-label={fill(t.dispatchUi.pick, { card: title(card.id) })}>
            {#each executorIds as who (who)}
              <button class="ex-{who}" onclick={() => pick(card.id, who)}>{exName(who)}</button>
            {/each}
          </div>
        {/if}
      {:else}
        <p class="card done">
          <span>{title(card.id)}</span>
          {#if !revealed}
            <span class="verdict">{fill(t.dispatchUi.chosen, { name: exName(chosen) })}</span>
          {:else if chosen === best[card.id]}
            <span class="verdict ok ex-{chosen}">
              {fill(t.dispatchUi.right, { name: exName(chosen), rule: ruleRef(card) })}
            </span>
          {:else}
            <span class="verdict ex-{best[card.id]}">
              {fill(t.dispatchUi.wrong, { name: exName(best[card.id]), rule: ruleRef(card), chosen: exName(chosen) })}
            </span>
          {/if}
        </p>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cards { list-style: none; padding: 0; margin: 0.75rem 0; display: grid; gap: 0.5rem; }
  .card { width: 100%; text-align: left; }
  .card.done { margin: 0; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 6px; min-height: 44px; }
  .verdict { display: block; color: var(--muted); font-size: 0.875rem; }
  .verdict.ok, .flip .verdict { color: var(--ex, var(--ink)); font-weight: 600; }
  .flip { animation: flip 400ms ease-out both; }
  @keyframes flip { from { transform: rotateX(90deg); } }
  @media (prefers-reduced-motion: reduce) { .flip { animation: none; } }
  .actions { margin: 0.5rem 0; }
  @media (min-width: 700px) {
    .cards { grid-template-columns: 1fr 1fr; align-items: start; }
    .actions { gap: 0.5rem; }
  }
</style>
