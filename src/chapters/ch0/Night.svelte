<script lang="ts">
  /** Игра «Ночь диспетчера»: заказ за заказом игрок выбирает машину и сразу видит, успела ли она до конца суток. */
  import { onDestroy } from "svelte";
  import { recordBet, setNight } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill, fmtCount, fmtDuration } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { DAY, scenario, stateVectorSize, type ExecutorId } from "../../model/tick";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import { animate } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import { MACHINES, MAIL_VARIANTS, MOLECULE_PLACES, NIGHT, orderSeconds, ORDERS, verdict, type Picks } from "./night";

  let { onDone }: { onDone: (picks: Picks) => void } = $props();
  const t = ru.ch0.game;

  let i = $state(0);
  let picks = $state<Picks>({});
  let shown = $state(0);
  let cancel = () => {};
  onDestroy(() => cancel());

  const order = $derived(ORDERS[i]);
  const chosen = $derived(picks[order]);
  const seconds = $derived(chosen ? orderSeconds(order, chosen) : null);
  const last = $derived(i === ORDERS.length - 1);

  const ORDER_VALUES = {
    video: { frames: fmtCount(scenario.cartoon_frames), pixels: fmtCount(scenario.cartoon_pixels) },
    bank: { n: fmtCount(scenario.payments) },
    archive: { n: fmtCount(scenario.key_codes), digits: fmtCount(Math.log10(scenario.key_codes)) },
    mail: { n: fmtCount(MAIL_VARIANTS), chars: fmtCount(scenario.mail_password_chars), alphabet: fmtCount(scenario.password_alphabet) },
    fertilizer: { states: fmtCount(stateVectorSize(MOLECULE_PLACES)) },
  };

  /** Шкала полосы: от микросекунды до тысячи лет, логарифмически; отметка — утро (конец ночи). */
  const LO = -6;
  const HI = Math.log10(1000 * 365.25 * DAY);
  const at = (s: number) => Math.min(1, Math.max(0, (Math.log10(s) - LO) / (HI - LO)));

  const result = $derived.by(() => {
    if (!chosen) return "";
    if (seconds === null) return t.feasible;
    if (seconds === Infinity) return t.noMemory;
    return fill(seconds > NIGHT ? t.late : t.ok, { t: fmtDuration(seconds) });
  });

  function pick(id: ExecutorId) {
    if (chosen) return;
    picks[order] = id;
    const night = { ...picks } as Record<string, string>;
    update((p) => recordBet(setNight(p, night), { chapter: "ch0", id: `night-${order}`, correct: verdict(order, id) === "best" }));
    shown = 0;
    cancel = animate(
      900,
      (f) => (shown = f),
      () => last && onDone({ ...picks }),
    );
  }

  function next() {
    i += 1;
    shown = 0;
  }
</script>

<div class="night" role="group" aria-label={t.label}>
  <ol class="pips" aria-hidden="true">
    {#each ORDERS as o, k (o)}
      <li class:now={k === i} class:past={k < i}></li>
    {/each}
  </ol>
  <p class="count">{fill(t.order, { i: String(i + 1), n: String(ORDERS.length) })}</p>
  <div class="order">
    <p class="what">{fill(ru.ch0.orders[order], ORDER_VALUES[order])}</p>
    <p class="how">{fill(ru.ch0.hints[order], ORDER_VALUES[order])}</p>
  </div>
  <p class="ask">{t.pick}</p>

  <div class="machines" role="group" aria-label={t.pick}>
    {#each MACHINES as id (id)}
      <button class="ex-{id}" disabled={!!chosen && chosen !== id} aria-pressed={chosen === id} onclick={() => pick(id)}>
        <ExecutorIcon ex={id} size={32} />
        <span>{exName(id)}</span>
      </button>
    {/each}
  </div>

  <div class="outcome" aria-live="polite">
    {#if chosen}
      {@const late = seconds === Infinity || (seconds !== null && seconds > NIGHT)}
      <div class="track ex-{chosen}" aria-hidden="true">
        <div class="fill" class:late style:width="{(seconds === null ? 0 : seconds === Infinity ? 1 : at(seconds)) * shown * 100}%"></div>
        <span class="day" style:left="{at(NIGHT) * 100}%">{t.deadline}</span>
      </div>
      <p class="result" class:late>{shown < 1 ? t.counting : result}</p>
      {#if shown >= 1 && !last}
        <div class="actions"><button class="primary" onclick={next}>{t.next}</button></div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .night { display: grid; gap: 0.5rem; }
  .pips { list-style: none; display: flex; gap: 0.375rem; padding: 0; margin: 0; }
  .pips li { width: 2rem; height: 6px; border-radius: 3px; background: var(--line); }
  .pips li.past { background: var(--muted); }
  .pips li.now { background: var(--ink); }
  p { margin: 0; }
  .count { color: var(--muted); font-size: 0.875rem; }
  .order { border: 2px solid var(--ink); border-radius: 6px; padding: 0.75rem 1rem; }
  .what { font-size: 1.125rem; font-weight: 600; line-height: 1.35; }
  .how { color: var(--muted); margin-top: 0.25rem; }
  .ask { font-weight: 600; }
  .machines { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; }
  .machines button { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.5rem; color: var(--ink); }
  .machines button :global(svg) { color: var(--ex); }
  .machines button[aria-pressed="true"] :global(svg) { color: var(--paper); }
  .outcome { min-height: 5.5rem; }
  .track { position: relative; height: 14px; border: 1px solid var(--line); border-radius: 7px; margin: 1.125rem 0 0.375rem; }
  .fill { height: 100%; border-radius: 7px; background: var(--ex); }
  .fill.late { background: var(--muted); }
  .day { position: absolute; top: -1.25rem; transform: translateX(-50%); font-size: 0.75rem; color: var(--muted); border-left: 2px solid var(--ink); padding-left: 0.25rem; height: 2.5rem; }
  .result { font-size: 1.125rem; font-weight: 700; }
  .result.late { color: var(--muted); }
  .actions { margin: 0.5rem 0 0; }
  @media (max-width: 520px) {
    .machines { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
