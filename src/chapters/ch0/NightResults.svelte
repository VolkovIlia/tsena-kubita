<script lang="ts">
  /**
   * Итоги «Ночи диспетчера»: игрок против стратегий «всё одной машине», по заказам — 🟩/🟨/🟥.
   * Время машин и лучшие машины здесь не показываются: это ответы на ставки следующих глав.
   */
  import { fill } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import { exName } from "../../ui/names";
  import { always, byScore, EMOJI, emojiGrid, MACHINES, ORDERS, score, verdict, type Picks } from "./night";

  let { picks }: { picks: Picks } = $props();
  const t = ru.ch0.game;

  const played = $derived(ORDERS.every((o) => picks[o]));
  const rows = $derived(
    [
      ...(played ? [{ key: "you", name: t.you, picks, you: true }] : []),
      ...MACHINES.map((id) => ({ key: id, name: fill(t.always, { name: exName(id) }), picks: always(id), you: false })),
    ].sort((a, b) => byScore(score(a.picks), score(b.picks))),
  );
  const shareText = $derived(
    `${fill(t.share, { grid: emojiGrid(score(picks)), best: String(score(picks).best), n: String(ORDERS.length) })}\n${location.origin}${location.pathname}`,
  );

  let copy = $state<"idle" | "ok" | "fail">("idle");
  async function share() {
    try {
      await navigator.clipboard.writeText(shareText);
      copy = "ok";
    } catch {
      copy = "fail";
    }
  }
</script>

<table class="board">
  <thead>
    <tr>
      <td></td>
      {#each ORDERS as o (o)}<th scope="col">{ru.ch0.short[o]}</th>{/each}
      <td></td>
    </tr>
  </thead>
  <tbody>
    {#each rows as r (r.key)}
      <tr class:you={r.you}>
        <th scope="row">{r.name}</th>
        {#each ORDERS as o (o)}
          {@const v = verdict(o, r.picks[o]!)}
          <td class="cell" aria-label={t.verdicts[v]}>
            <span aria-hidden="true">{EMOJI[v]}</span>
            {#if r.you}<span class="mine ex-{r.picks[o]}" title={exName(r.picks[o]!)}><ExecutorIcon ex={r.picks[o]!} size={16} /></span>{/if}
          </td>
        {/each}
        <td class="num total">{fill(t.best, { k: String(score(r.picks).best) })}</td>
      </tr>
    {/each}
  </tbody>
</table>
<p class="legend">{t.legend}</p>
{#if played}
  <div class="actions">
    <button onclick={share}>{t.copy}</button>
    {#if copy === "ok"}<span role="status">{t.copied}</span>{/if}
    {#if copy === "fail"}<span role="status">{t.copyFail}</span>{/if}
  </div>
  {#if copy === "fail"}<pre>{shareText}</pre>{/if}
{/if}

<style>
  .board { width: 100%; border-collapse: separate; border-spacing: 0 0.25rem; }
  thead th { font-size: 0.75rem; font-weight: 600; color: var(--muted); text-align: center; }
  tbody th { text-align: left; font-weight: 400; padding: 0.375rem 0.75rem; }
  tbody td, tbody th { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  tbody th { border-left: 1px solid var(--line); border-radius: 6px 0 0 6px; }
  tbody .total { border-right: 1px solid var(--line); border-radius: 0 6px 6px 0; padding: 0 0.75rem; white-space: nowrap; text-align: right; }
  tr.you th, tr.you td { border-color: var(--ink); border-width: 2px; font-weight: 700; }
  .cell { text-align: center; font-size: 1.125rem; line-height: 1; }
  .mine { display: block; color: var(--ex); margin-top: 0.125rem; }
  .legend { font-size: 0.8125rem; color: var(--muted); margin: 0.25rem 0 0; }
  .actions { margin: 0.5rem 0 0; display: flex; gap: 0.75rem; align-items: center; }
  pre { white-space: pre-wrap; font-size: 0.875rem; }
  @media (max-width: 520px) {
    tbody th { padding: 0.25rem 0.375rem; font-size: 0.8125rem; }
    thead th { font-size: 0.625rem; }
    .cell { font-size: 0.875rem; }
    tbody .total { padding: 0 0.375rem; font-size: 0.75rem; }
  }
</style>
