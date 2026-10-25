<script lang="ts">
  import { fill, fmtCount, fmtDuration, fmtSci } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import Peep from "./Peep.svelte";
  import type { Speaker } from "./types";

  /** Дорожки гонки: только отображение. seconds = null — исполнитель ждёт и не участвует. */
  // «из N проверок» — родительный падеж: большие N степенью десяти, у fmtCount там именительный.
  type Lane = { id: Speaker; seconds: number | null; checks?: number; mood?: "calm" | "happy" | "sad" | "shock" };
  let { lanes, t }: { lanes: Lane[]; t: number } = $props();
</script>

<div class="lanes">
  {#each lanes as lane (lane.id)}
    {@const share = lane.seconds === null ? 0 : Math.min(1, t / lane.seconds)}
    <div class="lane who-{lane.id}">
      <Peep who={lane.id} mood={lane.mood} size={40} />
      <div class="track">
        <div class="head">
          <span class="name">{ru.names[lane.id]}</span>
          {#if lane.seconds === null}
            <span class="wait">{ru.ui.waiting}</span>
          {:else if share >= 1}
            <span class="num">{fill(ru.ui.finished, { t: fmtDuration(lane.seconds) })}</span>
          {/if}
        </div>
        <div class="bar"><div class="fill" style:width="{share * 100}%"></div></div>
        {#if lane.checks !== undefined}
          <p class="count num">
            {fill(ru.ui.checks, { done: fmtCount(Math.floor(lane.checks * share)), total: lane.checks < 1e6 ? fmtCount(lane.checks) : fmtSci(lane.checks) })}
          </p>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .lanes { display: grid; gap: 0.75rem; }
  .lane { display: grid; grid-template-columns: 40px 1fr; gap: 0.75rem; align-items: center; }
  .head { display: flex; justify-content: space-between; gap: 0.5rem; font-weight: 600; }
  .name { color: var(--who); }
  .wait { color: var(--muted); font-weight: 400; }
  .bar { height: 10px; border: 1px solid var(--who); border-radius: 5px; overflow: hidden; margin: 0.25rem 0; }
  .fill { height: 100%; background: var(--who); }
  .count { font-size: 0.875rem; color: var(--who); margin: 0; }
</style>
