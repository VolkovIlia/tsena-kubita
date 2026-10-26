<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { scenario } from "../../model/tick";
  import Hands from "../../ui/Hands.svelte";
  import Lanes from "../../ui/Lanes.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { race } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import { slides } from "./slides";
  import { amdahlSeconds, cartoon, chain, CREW, type Crew } from "./times";

  let { slide, set, done }: SceneProps = $props();
  const d = ru.ch3.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);
  const phase = $derived(
    !from("cartoonBet") || from("bridge") ? "intro" : !from("chainBet") ? "cartoon" : !from("amdahl") ? "chain" : "amdahl",
  );

  let clock = $state(0);
  let started = $state(false);
  let serial = $state(0);
  let moved = false;
  let cancel = () => {};
  onDestroy(() => cancel());

  /** Смена слайда: гонка задачи начинается с нуля, прошлые анимации отменяются. */
  $effect(() => {
    const id = slide;
    untrack(() => {
      cancel();
      cancel = () => {};
      if (id === "cartoonBet" || id === "chainBet") {
        clock = 0;
        started = false;
      }
    });
  });

  /** Ползунок Амдала: число уходит в колоду, первый сдвиг открывает «Дальше». */
  $effect(() => {
    const s = serial;
    untrack(() => {
      set("serial", s);
      if (moved && slide === "amdahl") done();
      moved = true;
    });
  });

  const times = $derived(phase === "chain" ? chain : cartoon);
  /** На слайде ставки сцена в покое: ни эстафеты, ни «остальные ждут» — иначе это подсказка. */
  const betting = $derived(slide === "cartoonBet" || slide === "chainBet");
  const raceId = $derived(phase === "chain" ? "chainRace" : "cartoonRace");
  /** Часы гонки; после слайда гонки (в том числе при входе по ссылке) — финиш. */
  const now = $derived(phase === "intro" ? 0 : at > order.indexOf(raceId) ? Infinity : clock);
  const card = $derived(phase === "chain" ? d.chain : d.cartoon);
  const size = $derived(
    phase === "chain"
      ? fill(d.chain.size, { payments: fmtCount(scenario.payments) })
      : fill(d.cartoon.size, { frames: fmtCount(scenario.cartoon_frames), pixels: fmtCount(scenario.cartoon_pixels) }),
  );
  const lanes = $derived(
    CREW.map((id) => ({ id, seconds: phase === "amdahl" ? amdahlSeconds(id, serial) : times[id] })),
  );

  function start() {
    started = true;
    const key = phase === "chain" ? "chain" : "cartoon";
    cancel = race(
      Math.max(...CREW.map((id) => times[id])),
      (v) => (clock = v),
      () => {
        set(key, 1);
        done();
      },
    );
  }

  /* Полосы Амдала: длина — время работы относительно одного ядра. */
  const BAR = 560;
  const W = scenario.amdahl_workers;
  const rows = [
    { label: exName("core"), split: 1 },
    { label: exName("cores"), split: amdahlSeconds("cores", 0) / amdahlSeconds("core", 0) },
    { label: fill(d.amdahl.hands, { w: fmtCount(W) }), split: 1 / W },
  ];
  const label = $derived({ intro: d.labelIntro, cartoon: d.labelCartoon, chain: d.labelChain, amdahl: d.labelAmdahl }[phase]);
</script>

<div class="scene" role="group" aria-label={label}>
  {#if phase === "amdahl"}
    <svg viewBox="0 0 640 300" aria-hidden="true">
      <text class="title" x="40" y="36">{d.amdahl.title}</text>
      <text class="muted" x="40" y="70">{d.amdahl.note}</text>
      {#each rows as row, i}
        {@const y = 118 + i * 66}
        <text x="40" y={y}>{row.label}</text>
        <rect class="serial" x="40" y={y + 10} width={BAR * serial} height="34" />
        <rect class="split" x={40 + BAR * serial} y={y + 10} width={Math.max(1, BAR * (1 - serial) * row.split)} height="34" />
      {/each}
    </svg>
    <div class="lanes"><Lanes {lanes} t={Infinity} /></div>
    {#if slide === "amdahl"}
      <LogSlider label={fill(d.slider, { s: fmtPercent(serial) })} min={0} max={scenario.amdahl_serial_max} step={0.01} bind:value={serial} />
    {/if}
  {:else}
    {#if phase !== "intro"}
      <div class="card">
        <p class="title">{card.title}</p>
        <p class="num">{size}</p>
        <p class="muted">{card.note}</p>
      </div>
    {/if}
    <div class="hands">
      {#each CREW as id (id)}
        {#if id === "core" || slide !== "freeLunch"}
          <Hands
            ex={id}
            mode={phase === "chain" && !betting ? "chain" : "split"}
            items={phase === "chain" ? scenario.payments : scenario.cartoon_frames * scenario.cartoon_pixels}
            progress={Math.min(1, now / times[id])}
            showSteps={phase !== "intro" && !betting}
          />
        {/if}
      {/each}
    </div>
    {#if phase !== "intro"}
      <div class="lanes"><Lanes {lanes} t={now} /></div>
    {/if}
    {#if slide === raceId}
      <div class="actions"><button class="primary" disabled={started} onclick={start}>{ru.ui.startRace}</button></div>
    {/if}
  {/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  text { font-size: 24px; fill: var(--ink); }
  .title { font-size: 28px; font-weight: 600; }
  .muted { fill: var(--muted); color: var(--muted); }
  .serial { fill: var(--ink); }
  .split { fill: var(--cores); opacity: 0.45; }
  .card { border: 2px solid var(--ink); border-radius: 6px; padding: 0.5rem 0.75rem; background: var(--paper); }
  .card p { margin: 0; }
  .card .title { font-size: 1.125rem; }
  /* Колонки фиксированы: меняющиеся числа в подписях не двигают картинку. */
  .hands { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: end; gap: 1rem 2.5rem; margin-top: 0.75rem; }
  .lanes { margin-top: 0.75rem; }
</style>
