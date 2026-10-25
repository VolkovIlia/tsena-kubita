<script lang="ts">
  import { recordBet } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill, fmtCount } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { scenario, type ExecutorId } from "../../model/tick";
  import { cards, executorIds, type CardId } from "./cards";

  let {
    picks = $bindable(),
    onDone,
  }: { picks: Partial<Record<CardId, ExecutorId>>; onDone: (right: number, keyWrong: boolean) => void } = $props();

  const t = ru.ch7;
  let open = $state<CardId | null>(null);
  const best = Object.fromEntries(cards.map((c) => [c.id, c.best()])) as Record<CardId, ExecutorId>;
  const revealed = $derived(cards.every((c) => picks[c.id]));
  const title = (id: CardId) => fill(t.cards[id], { n: fmtCount(scenario.key_codes) });
  const ruleRef = (rule: string) => fill(t.ruleRef, { n: rule.slice(1) });

  function pick(id: CardId, who: ExecutorId) {
    picks[id] = who;
    open = null;
    update((p) => recordBet(p, { chapter: "ch7", id: `card-${id}`, correct: who === best[id] }));
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
              <button class="who-{who}" onclick={() => pick(card.id, who)}>{ru.names[who]}</button>
            {/each}
          </div>
        {/if}
      {:else}
        <p class="card done">
          <span>{title(card.id)}</span>
          {#if !revealed}
            <span class="verdict">{fill(t.dispatchUi.chosen, { name: ru.names[chosen] })}</span>
          {:else if chosen === best[card.id]}
            <span class="verdict ok who-{chosen}">
              {fill(t.dispatchUi.right, { name: ru.names[chosen], rule: ruleRef(card.rule) })}
            </span>
          {:else}
            <span class="verdict who-{best[card.id]}">
              {fill(t.dispatchUi.wrong, {
                name: ru.names[best[card.id]],
                rule: ruleRef(card.rule),
                chosen: ru.names[chosen],
              })}
            </span>
          {/if}
        </p>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cards { list-style: none; padding: 0; margin: 1rem 0; display: grid; gap: 0.5rem; }
  .card { width: 100%; text-align: left; }
  .card.done { margin: 0; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 6px; min-height: 44px; }
  .verdict { display: block; color: var(--muted); font-size: 0.875rem; }
  .verdict.ok, .flip .verdict { color: var(--who, var(--ink)); font-weight: 600; }
  .flip { animation: flip 400ms ease-out both; }
  @keyframes flip { from { transform: rotateX(90deg); } }
  .actions { margin: 0.5rem 0; }
</style>
