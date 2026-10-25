<script lang="ts">
  import { onDestroy } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { executors } from "../../model/tick";
  import { animate, reducedMotion } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import { wrap } from "../../ui/wrap";
  import { slides } from "./slides";

  let { slide, done }: SceneProps = $props();
  const t = ru.ch0.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);
  /** Один тик: два бита и логическое И. */
  const A = 1;
  const B = 0;
  const CELLS = [String(A), `${t.and} ${B}`, `→ ${A & B}`];
  const headline = wrap(t.headline, 22);

  let shown = $state(0);
  let ticks = $state(0);
  let cancel = () => {};
  let timers: ReturnType<typeof setTimeout>[] = [];
  onDestroy(() => (cancel(), timers.forEach(clearTimeout)));

  function press() {
    if (shown > 0) return;
    ticks = 1;
    const step = reducedMotion() ? 0 : 200;
    CELLS.forEach((_, i) => timers.push(setTimeout(() => (shown = i + 1), step * (i + 1))));
    timers.push(setTimeout(done, step * (CELLS.length + 1)));
  }

  $effect(() => {
    if (slide !== "second") return;
    cancel = animate(1000, (f) => (ticks = Math.max(1, executors.master.ops_per_s * f)));
  });

  const margoMood = $derived(slide === "margo" || slide === "question" ? "happy" : "calm");
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={t.label}>
    <text class="sign" x="320" y="44" text-anchor="middle">{t.sign}</text>
    <line class="floor" x1="0" y1="316" x2="640" y2="316" />
    <line class="desk" x1="400" y1="286" x2="620" y2="286" />
    <line class="desk" x1="420" y1="286" x2="420" y2="316" />
    <line class="desk" x1="600" y1="286" x2="600" y2="316" />
    <g class="actor" class:dim={slide === "master" || slide === "tick"} class:enter={slide === "bureau"}>
      <Peep who="margo" mood={margoMood} size={150} x={16} y={166} />
    </g>
    {#if from("margo") && !from("master")}
      <g class="tablet">
        <rect x="180" y="70" width="250" height={headline.length * 30 + 24} rx="6" />
        {#each headline as line, i}<text x="196" y={102 + i * 30}>{line}</text>{/each}
      </g>
    {/if}
    <g class="actor" class:dim={slide === "margo"}>
      <Peep who="master" size={150} x={440} y={150} />
    </g>
    {#if from("tick") && slide !== "notebook"}
      <text class="counter num" x="630" y="92" text-anchor="end">{fill(t.counter, { n: fmtExact(ticks) })}</text>
    {/if}
    {#each CELLS as cell, i}
      {#if i < shown && from("tick") && !from("second")}
        <g class="cell">
          <rect x={392 + i * 82} y="108" width="74" height="44" rx="4" />
          <text class="num" x={429 + i * 82} y="139" text-anchor="middle">{cell}</text>
        </g>
      {/if}
    {/each}
    {#if slide === "notebook"}
      <g class="notebook">
        <rect x="190" y="70" width="260" height="236" rx="6" />
        {#each Array.from({ length: 6 }, (_, i) => i) as i}<line x1="214" y1={116 + i * 32} x2="426" y2={116 + i * 32} />{/each}
      </g>
    {/if}
    {#if slide === "bureau"}<rect class="dusk" width="640" height="360" />{/if}
  </svg>
  {#if slide === "tick"}
    <button class="hit who-master" class:waiting={shown === 0} aria-label={t.press} onclick={press}></button>
  {/if}
  {#if slide === "notebook"}<p class="vh">{t.notebook}</p>{/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  .sign { font-size: 30px; font-weight: 600; }
  .floor { stroke: var(--ink); stroke-width: 2; }
  .desk { stroke: var(--master); stroke-width: 4; }
  .actor { transition: opacity 300ms; }
  .actor.dim { opacity: 0.3; }
  .actor.enter { animation: enter 800ms ease-out both; }
  @keyframes enter { from { transform: translateX(-160px); } }
  .tablet rect { fill: var(--paper); stroke: var(--margo); stroke-width: 3; }
  .tablet text { font-size: 22px; font-weight: 600; }
  .counter { font-size: 24px; font-weight: 600; fill: var(--master); }
  .cell rect { fill: var(--paper); stroke: var(--master); stroke-width: 2; }
  .cell text { font-size: 26px; font-weight: 600; }
  .cell { animation: pop 200ms ease-out both; }
  @keyframes pop { from { opacity: 0; } }
  .notebook rect { fill: var(--paper); stroke: var(--ink); stroke-width: 2.5; }
  .notebook line { stroke: var(--line); stroke-width: 2; }
  .notebook { animation: pop 400ms ease-out both; }
  .dusk { fill: var(--ink); opacity: 0.18; pointer-events: none; }
  .hit {
    position: absolute;
    left: 68.75%;
    top: 41.7%;
    width: 23.4%;
    height: 41.7%;
    background: transparent;
    border: 3px dashed var(--who);
    border-radius: 12px;
  }
  .hit.waiting { animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { border-color: transparent; } }
</style>
