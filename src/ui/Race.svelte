<script lang="ts">
  import { onDestroy } from "svelte";
  import { fill, fmtCount, fmtDuration } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import type { ExecutorId } from "../model/tick";
  import Avatar from "./Avatar.svelte";
  import { animate } from "./motion";

  type Lane = { id: ExecutorId; checks: number; seconds: number };
  let { lanes, stopAt, onFinish }: { lanes: Lane[]; stopAt: "all" | number; onFinish: () => void } = $props();

  const REAL_MS = 6000;
  const tEnd = $derived(stopAt === "all" ? Math.max(...lanes.map((l) => l.seconds)) : stopAt);
  let t = $state(0);
  let started = $state(false);
  let cancel = () => {};
  onDestroy(() => cancel());

  function start() {
    started = true;
    // Часы ускоряются: симулируемое время растёт как квадрат реального.
    cancel = animate(REAL_MS, (f) => (t = tEnd * f * f), onFinish);
  }
</script>

<div class="race">
  {#each lanes as lane (lane.id)}
    {@const share = Math.min(1, t / lane.seconds)}
    <div class="lane who-{lane.id}">
      <Avatar who={lane.id} size={40} />
      <div class="track">
        <div class="head">
          <span class="name">{ru.executors[lane.id]}</span>
          {#if share >= 1}<span class="num">{fill(ru.ui.finished, { t: fmtDuration(lane.seconds) })}</span>{/if}
        </div>
        <div class="bar"><div class="fill" style:width="{share * 100}%"></div></div>
        <p class="counter">
          {fill(ru.ui.checks, { done: fmtCount(Math.floor(lane.checks * share)), total: fmtCount(lane.checks) })}
        </p>
      </div>
    </div>
  {/each}
  {#if started}
    <p class="num clock" aria-live="off">{fill(ru.ui.clock, { t: fmtDuration(t) })}</p>
  {:else}
    <div class="actions"><button class="primary" onclick={start}>{ru.ui.startRace}</button></div>
  {/if}
</div>

<style>
  .race { margin: 1.5rem 0; }
  .lane { display: grid; grid-template-columns: 40px 1fr; gap: 0.75rem; margin-bottom: 1rem; }
  .head { display: flex; justify-content: space-between; gap: 0.5rem; font-weight: 600; }
  .name { color: var(--who); }
  .bar { height: 10px; border: 1px solid var(--who); border-radius: 5px; overflow: hidden; margin: 0.25rem 0; }
  .fill { height: 100%; background: var(--who); }
  .counter { font-size: 1.25rem; color: var(--who); margin: 0; }
  .clock { color: var(--muted); }
</style>
