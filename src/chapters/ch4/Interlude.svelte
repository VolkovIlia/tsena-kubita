<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import params from "../../../data/params.json";
  import { fill, fmtCount, fmtDuration } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { cycleSeconds, opsPerCycle, physicalPerLogical, powerOfTenBelow, rateRatio } from "../../model/tick";
  import Curious from "../../ui/Curious.svelte";
  import Line from "../../ui/Line.svelte";
  import { reducedMotion } from "../../ui/motion";

  let { onDone }: { onDone: () => void } = $props();
  const t = ru.ch4.screen4;
  const FRAME_MS = 10_000;
  const FLICKER_MS = 300;
  const [dMin, dMax] = params.surface_code.distances;
  const qubits = physicalPerLogical(dMin);
  const COLS = 2 * dMin;
  const ROWS = qubits / COLS;

  let frame = $state(0);
  let lit = $state(new Set<number>());
  const auto = !reducedMotion();
  let timers: ReturnType<typeof setInterval>[] = [];

  onMount(() => {
    if (!auto) return;
    timers.push(setInterval(() => (frame = Math.min(3, frame + 1)), FRAME_MS));
    timers.push(
      setInterval(() => {
        lit = new Set(Array.from({ length: Math.round(qubits / 20) }, () => Math.floor(Math.random() * qubits)));
      }, FLICKER_MS),
    );
  });
  onDestroy(() => timers.forEach(clearInterval));

  const lines = [
    fill(t.oracle1, { oq: fmtDuration(cycleSeconds("oracle")), fq: fmtDuration(cycleSeconds("factory")) }),
    fill(t.oracle2, { fo: fmtCount(opsPerCycle("factory")), oo: String(Math.round(opsPerCycle("oracle"))) }),
    fill(t.oracle3, { ratio: fmtCount(powerOfTenBelow(rateRatio("factory", "oracle"))) }),
  ];
</script>

<h2>{t.title}</h2>
{#if frame < 2}
  <svg viewBox="0 0 {COLS * 12} {ROWS * 12}" class="lattice" class:wave={frame === 1} aria-hidden="true">
    {#each Array.from({ length: qubits }, (_, i) => i) as i}
      <circle
        cx={(i % COLS) * 12 + 6}
        cy={Math.floor(i / COLS) * 12 + 6}
        r="3.2"
        class:lit={frame === 0 && lit.has(i)}
        style:animation-delay="{(i % COLS) * 60}ms"
      />
    {/each}
  </svg>
  <p class="plate">
    {frame === 0 ? fill(t.cap1, { min: fmtCount(physicalPerLogical(dMin)), max: fmtCount(physicalPerLogical(dMax)) }) : t.cap2}
  </p>
{:else if frame === 2}
  <div class="beats">
    <div class="beat who-oracle"><span class="lamp slow"></span>{ru.executors.oracle}</div>
    <div class="beat who-factory"><span class="lamp blur"></span>{ru.executors.factory}</div>
  </div>
  <Line who="oracle" text={lines[0]} />
{:else}
  <div class="width">
    <div class="who-factory"><svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" class="dense" /></svg></div>
    <div class="who-oracle"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="20" width="8" height="8" /><rect x="16" y="20" width="8" height="8" /></svg></div>
  </div>
  <Line who="oracle" text={lines[1]} />
  <Line who="oracle" text={lines[2]} />
{/if}
<div class="actions">
  {#if frame < 3}
    {#if !auto}<button onclick={() => (frame += 1)}>{ru.ui.next}</button>{/if}
    <button onclick={onDone}>{ru.ui.skip}</button>
  {:else}
    <button class="primary" onclick={onDone}>{ru.ui.next}</button>
  {/if}
</div>
<Curious cites={["beverland", "hoefler", "nvidia"]} />

<style>
  .lattice { width: 100%; height: auto; display: block; }
  .lattice circle { fill: var(--oracle); opacity: 0.35; transition: opacity 200ms; }
  .lattice circle.lit { opacity: 1; fill: var(--margo); }
  .lattice.wave circle { animation: wave 1.6s ease-in-out infinite; }
  @keyframes wave {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 1; }
  }
  .beats { display: grid; gap: 1rem; margin: 1rem 0; }
  .beat { display: flex; align-items: center; gap: 1rem; font-weight: 600; color: var(--who); }
  .lamp { width: 32px; height: 32px; border-radius: 50%; background: var(--who); }
  .lamp.slow { animation: blink 1s steps(1) infinite; }
  .lamp.blur { opacity: 0.6; }
  @keyframes blink { 50% { opacity: 0.15; } }
  .width { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
  .width svg { width: 100%; max-width: 10rem; }
  .width rect { fill: var(--who); }
  .dense { opacity: 0.85; }
</style>
