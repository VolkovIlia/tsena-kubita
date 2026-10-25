<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtBytes, fmtCount, fmtDuration } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { ioRatio, loadSeconds, scenario } from "../../model/tick";
  import { animate } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import { slides } from "./slides";

  let { slide, done }: SceneProps = $props();
  const t = ru.ch5.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);

  const bytes = scenario.dataset_bytes;
  const once = { factory: loadSeconds("factory", bytes), oracle: loadSeconds("oracle", bytes) };
  /** Геометрия труб: широкая — 40, соломинка во столько же раз тоньше, во сколько уже вход Оракула. */
  const PIPE = 40;
  const STRAW = Math.max(1, PIPE / ioRatio());
  const X0 = 150;
  const LEN = 320;

  let now = $state(0); // симулируемые секунды
  let mult = $state(1); // сколько проходов по данным
  let started = $state(false);
  let cancel = () => {};
  onDestroy(() => cancel());

  /** Краны открыты: часы бегут до конца загрузки Оракулом за 4 с, ускоряясь. */
  function run(passes: number) {
    cancel();
    mult = passes;
    now = 0;
    started = true;
    const end = once.oracle * passes;
    cancel = animate(4000, (f) => (now = end * f * f), done);
  }

  $effect(() => {
    if (slide !== "epochs") return;
    untrack(() => run(scenario.epochs));
    return () => cancel();
  });

  const share = (who: keyof typeof once) => Math.min(1, now / (once[who] * mult));
  const clock = (who: keyof typeof once) => fmtDuration(Math.min(now, once[who] * mult));
  const passes = (who: keyof typeof once) =>
    fill(t.pass, { n: fmtCount(Math.min(mult, Math.floor(now / once[who]))), e: fmtCount(mult) });

  const lanes = [
    { who: "factory", y: 120, width: PIPE, peepY: 70 },
    { who: "oracle", y: 280, width: STRAW, peepY: 230 },
  ] as const;
  const mood = (who: keyof typeof once) =>
    who === "factory" ? (from("once") ? "happy" : "calm") : from("return") ? "sad" : "calm";
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={t.label}>
    <g class="tank">
      <text class="cap" x="85" y="56" text-anchor="middle">{t.tank}</text>
      <rect x="20" y="70" width="130" height="250" rx="10" />
      <rect class="level" x="26" y="96" width="118" height="218" rx="6" />
      <text class="num big" x="85" y="214" text-anchor="middle">{fmtBytes(bytes)}</text>
    </g>
    {#each lanes as lane (lane.who)}
      <g class="who-{lane.who}">
        <line class="pipe" class:hair={lane.width < PIPE} x1={X0} y1={lane.y} x2={X0 + LEN} y2={lane.y} stroke-width={lane.width} />
        {#if started}
          <line
            class="flow"
            class:hair={lane.width < PIPE}
            x1={X0}
            y1={lane.y}
            x2={X0 + LEN * share(lane.who)}
            y2={lane.y}
            stroke-width={lane.width}
          />
          <text class="clock num" x={X0 + LEN / 2} y={lane.y - PIPE / 2 - 12} text-anchor="middle">
            {clock(lane.who)}
          </text>
          {#if mult > 1}
            <text class="pass num" x={X0 + LEN / 2} y={lane.y - PIPE / 2 - 44} text-anchor="middle">
              {passes(lane.who)}
            </text>
          {/if}
        {/if}
        <Peep who={lane.who} mood={mood(lane.who)} size={100} x={500} y={lane.peepY} />
      </g>
    {/each}
  </svg>
  {#if slide === "pipes"}
    <div class="actions">
      <button class="primary" disabled={started} onclick={() => run(1)}>{t.open}</button>
    </div>
  {/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  .tank > rect:first-of-type { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
  .level { fill: var(--grid); }
  .cap { font-size: 24px; font-weight: 600; }
  .big { font-size: 26px; font-weight: 700; }
  .pipe { stroke: var(--line); }
  .pipe.hair { stroke: var(--muted); }
  .flow { stroke: var(--who); }
  .hair { vector-effect: non-scaling-stroke; }
  .clock { font-size: 28px; font-weight: 700; fill: var(--who); }
  .pass { font-size: 22px; fill: var(--who); }
  .actions { margin-top: 0.75rem; }
</style>
