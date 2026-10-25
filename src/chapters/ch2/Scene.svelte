<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { scenario, type Classical } from "../../model/tick";
  import Lanes from "../../ui/Lanes.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { race } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import { slides } from "./slides";
  import { amdahlSeconds, cartoon, chain, CREW } from "./times";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch2.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);
  const phase = $derived(
    !from("orderA") || from("rule") ? "intro" : !from("orderB") ? "A" : !from("amdahl") ? "B" : "C",
  );

  const FRAMES = [30, 230, 430];
  const PIXELS = Array.from({ length: 48 }, (_, i) => [12 + (i % 8) * 20, 14 + Math.floor(i / 8) * 20]);
  const LINKS = Array.from({ length: 6 }, (_, i) => 30 + i * 100);
  const BAR = 560;
  const W = scenario.amdahl_workers;

  let clock = $state(0);
  let started = $state(false);
  let serial = $state(0);
  let moved = false;
  let cancel = () => {};
  onDestroy(() => cancel());

  /** Смена слайда: гонка заказа начинается с нуля, прошлые анимации отменяются. */
  $effect(() => {
    const id = slide;
    untrack(() => {
      cancel();
      cancel = () => {};
      if (id === "orderA" || id === "orderB") {
        clock = 0;
        started = false;
      }
    });
  });

  $effect(() => {
    const s = serial;
    untrack(() => {
      set("serial", s);
      if (moved && slide === "amdahl") done();
      moved = true;
    });
  });

  const times = $derived(
    phase === "A" ? cartoon : phase === "B" ? chain : (Object.fromEntries(CREW.map((id) => [id, amdahlSeconds(id, serial)])) as Record<Classical, number>),
  );
  const fastest = $derived(Math.min(...Object.values(times)));
  const share = $derived(Math.min(1, clock / fastest));

  function start() {
    started = true;
    cancel = race(Math.max(...Object.values(times)), (v) => (clock = v), done);
  }

  const mood = (id: Classical): "calm" | "happy" | "sad" =>
    slide === "raceADone" && id === "factory"
      ? "happy"
      : slide === "raceBDone" && id !== "master"
        ? "sad"
        : "calm";
  const lanes = $derived(CREW.map((id) => ({ id, seconds: times[id], mood: mood(id) })));
  const label = $derived({ intro: t.labelIntro, A: t.labelA, B: t.labelB, C: t.labelC }[phase]);
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={label}>
    {#if phase === "intro"}
      <text class="title" x="320" y="50" text-anchor="middle">{t.sign}</text>
      <line class="floor" x1="0" y1="316" x2="640" y2="316" />
      <g><Peep who="master" size={150} x={30} y={156} /></g>
      <g class:enter={slide === "arrive"}><Peep who="brigade" size={150} x={245} y={156} /></g>
      {#if from("factory")}<g class:enter={slide === "factory"}><Peep who="factory" size={150} x={460} y={156} /></g>{/if}
      {#each CREW as id, i}
        {#if id !== "factory" || from("factory")}
          <text class="name who-{id}" x={105 + i * 215} y="346" text-anchor="middle">{ru.names[id]}</text>
        {/if}
      {/each}
    {:else if phase === "A"}
      <text class="title" x="30" y="48">{t.cardA.title}</text>
      <text x="30" y="88">
        {fill(t.cardA.size, { frames: fmtCount(scenario.cartoon_frames), pixels: fmtCount(scenario.cartoon_pixels) })}
      </text>
      <text class="muted" x="30" y="122">{t.cardA.note}</text>
      {#each FRAMES as fx}
        <rect class="frame" x={fx} y="160" width="180" height="146" rx="6" />
        {#each PIXELS as [px, py], i}
          <rect class="pixel" class:on={i < share * PIXELS.length} x={fx + px} y={160 + py} width="16" height="16" />
        {/each}
      {/each}
    {:else if phase === "B"}
      <text class="title" x="30" y="48">{t.cardB.title}</text>
      <text x="30" y="88">{fill(t.cardB.size, { payments: fmtCount(scenario.payments) })}</text>
      <text class="muted" x="30" y="122">{t.cardB.note}</text>
      {#each LINKS as lx, i}
        <rect class="link" class:on={i < share * LINKS.length} x={lx} y="200" width="70" height="70" rx="6" />
        {#if i > 0}<path class="arrow" d="M {lx - 28} 235 h 24 m -8 -7 l 8 7 l -8 7" />{/if}
      {/each}
    {:else}
      <text class="title" x="30" y="48">{t.cardC.title}</text>
      <text class="muted" x="30" y="88">{t.cardC.note}</text>
      <text x="40" y="158">{t.cardC.one}</text>
      <rect class="split" x="40" y="172" width={BAR} height="44" />
      <rect class="serial" x="40" y="172" width={BAR * serial} height="44" />
      <text x="40" y="268">{fill(t.cardC.many, { w: fmtCount(W) })}</text>
      <rect class="split" x={40 + BAR * serial} y="282" width={(BAR * (1 - serial)) / W} height="44" />
      <rect class="serial" x="40" y="282" width={BAR * serial} height="44" />
    {/if}
  </svg>
  {#if phase !== "intro"}
    <div class="lanes"><Lanes {lanes} t={phase === "C" ? Infinity : clock} /></div>
  {/if}
  {#if slide === "raceA" || slide === "raceB"}
    <div class="actions"><button class="primary" disabled={started} onclick={start}>{ru.ui.startRace}</button></div>
  {/if}
  {#if slide === "amdahl"}
    <LogSlider label={fill(t.slider, { s: fmtPercent(serial) })} min={0} max={scenario.amdahl_serial_max} step={0.01} bind:value={serial} />
  {/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  text { font-size: 24px; fill: var(--ink); }
  .title { font-size: 30px; font-weight: 600; }
  .muted { fill: var(--muted); }
  .name { font-weight: 600; fill: var(--who); }
  .floor { stroke: var(--ink); stroke-width: 2; }
  .enter { animation: enter 600ms ease-out both; }
  @keyframes enter { from { transform: translateX(-300px); opacity: 0; } }
  .frame { fill: var(--paper); stroke: var(--ink); stroke-width: 2.5; }
  .pixel { fill: var(--grid); }
  .pixel.on { fill: var(--factory); }
  .link { fill: var(--paper); stroke: var(--ink); stroke-width: 2.5; }
  .link.on { fill: var(--master); }
  .arrow { fill: none; stroke: var(--ink); stroke-width: 2.5; }
  .split { fill: var(--factory); opacity: 0.35; }
  .serial { fill: var(--ink); }
  .lanes { margin-top: 0.75rem; }
</style>
