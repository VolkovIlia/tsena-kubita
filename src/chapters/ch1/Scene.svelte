<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { halvingSteps, scenario } from "../../model/tick";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import RouteMap from "./RouteMap.svelte";
  import { slides } from "./slides";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch1.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);
  const phase = $derived(from("route") ? "map" : from("scale") ? "bars" : "book");

  const pages = scenario.book_pages;
  const SPINES = 50;
  const per = pages / SPINES;
  /** Сидоров — в последних 5% книги: листание по одной близко к худшему случаю. */
  const target = Math.floor(pages * (0.95 + 0.05 * Math.random()));
  const SELF_FLIPS = 5;
  const MIN = Math.log10(pages);
  const MAX = Math.log10(scenario.book_pages_big);

  let opened = $state(0);
  let auto = $state(false);
  let lo = $state(1);
  let hi = $state(pages);
  let steps = $state(0);
  let shake = $state(false);
  let logPages = $state(MIN);
  let cancel = () => {};
  let shakeTimer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => (cancel(), clearTimeout(shakeTimer)));

  const mid = $derived(Math.floor((lo + hi) / 2));
  const found = $derived(steps > 0 && mid === target);
  const page = $derived(slide === "flip" || slide === "flipDone" ? opened : steps > 0 ? mid : 0);
  const spineOf = (p: number) => Math.floor((p - 1) / per);
  const book = $derived(Math.round(10 ** logPages));
  const halves = $derived(halvingSteps(book));

  /** Фамилия на странице p: алфавит монотонен по страницам, Сидоров — на target. */
  function surname(p: number): string {
    if (p === target) return t.target;
    if (p < target) return t.before[Math.min(t.before.length - 1, Math.floor(((p - 1) / (target - 1)) * t.before.length))];
    return t.after[Math.min(t.after.length - 1, Math.floor(((p - target - 1) / (pages - target)) * t.after.length))];
  }

  function flipPage() {
    if (auto || opened >= SELF_FLIPS) return;
    opened += 1;
    if (opened < SELF_FLIPS) return;
    auto = true;
    cancel = animate(
      4000,
      (f) => (opened = Math.max(SELF_FLIPS, Math.floor(target * f * f))),
      () => {
        opened = target;
        set("opened", target);
        done();
      },
    );
  }

  function choose(left: boolean) {
    if (found) return;
    if (left !== target < mid) {
      shake = true;
      clearTimeout(shakeTimer);
      shakeTimer = setTimeout(() => (shake = false), 200);
      return;
    }
    if (left) hi = mid - 1;
    else lo = mid + 1;
    steps += 1;
    set("steps", steps);
    if (mid === target) done();
  }

  $effect(() => {
    if (slide !== "halve" || steps > 0) return;
    steps = 1;
    set("steps", 1);
  });

  $effect(() => {
    if (slide !== "scale") return;
    set("logPages", logPages);
    if (logPages >= MAX - 1e-9) done();
  });

  function spineClass(i: number): string {
    const first = i * per + 1;
    const last = (i + 1) * per;
    if (steps > 0) return found && i === spineOf(target) ? "hit" : last < lo || first > hi ? "gone" : "open";
    if (opened >= target && i === spineOf(target)) return "hit";
    return i < Math.ceil(opened / per) ? "open" : "";
  }

  const label = $derived(phase === "map" ? t.map : phase === "bars" ? t.barsLabel : t.label);
  const status = $derived(page > 0 ? `${fill(t.page, { n: fmtExact(page) })}: ${surname(page)}` : "");
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={label}>
    {#if phase === "book"}
      <text class="seek" x="20" y="40">{t.seek}</text>
      {#if from("flip")}
        <text class="counter num" x="620" y="40" text-anchor="end">{fill(t.opened, { n: fmtExact(opened) })}</text>
      {/if}
      {#if page > 0}
        <g class="card" class:hit={page === target}>
          <rect x="290" y="62" width="330" height="76" rx="6" />
          <text class="num" x="306" y="92">{fill(t.page, { n: fmtExact(page) })}</text>
          <text class="name" x="306" y="124">{surname(page)}</text>
        </g>
        <path class="pointer" d="M {130 + spineOf(page) * 9.6 + 4} 166 l -7 -12 h 14 z" />
      {/if}
      <Peep who="master" mood={found || opened >= target ? "happy" : "calm"} size={100} x={10} y={200} />
      <g class="book" class:shake>
        {#each Array.from({ length: SPINES }, (_, i) => i) as i}
          <rect class={spineClass(i)} x={130 + i * 9.6} y="172" width="8" height="130" rx="1.5" />
        {/each}
      </g>
      {#if steps > 0}
        <text class="range num" x="370" y="340" text-anchor="middle">{fill(t.range, { lo: fmtExact(lo), hi: fmtExact(hi) })}</text>
      {/if}
    {:else if phase === "bars"}
      <text class="row num" x="40" y="120">{fill(t.one, { n: fmtCount(book) })}</text>
      <rect class="bar" x="40" y="136" width="560" height="44" rx="4" />
      <text class="row num" x="40" y="240">{fill(t.halves, { k: String(halves) })}</text>
      <rect class="bar" x="40" y="256" width={Math.max(2, (560 * halves) / book)} height="44" rx="4" />
    {:else}
      <g in:fade={{ duration: reducedMotion() ? 0 : 300 }}>
        <Peep who="master" size={90} x={8} y={240} />
        <RouteMap run={slide === "wave"} onDone={done} x={110} y={27} cell={34} />
      </g>
    {/if}
  </svg>
  {#if slide === "flip"}
    <div class="actions"><button class="primary" disabled={auto} onclick={flipPage}>{t.next}</button></div>
  {:else if slide === "halve"}
    <div class="actions">
      <button disabled={found} onclick={() => choose(true)}>{t.left}</button>
      <button disabled={found} onclick={() => choose(false)}>{t.right}</button>
    </div>
  {:else if slide === "scale"}
    <LogSlider label={fill(t.slider, { n: fmtCount(book) })} min={MIN} max={MAX} step={0.1} bind:value={logPages} />
  {/if}
  {#if phase === "book"}<p class="vh" aria-live="polite">{status}</p>{/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  .seek { font-size: 24px; font-weight: 600; fill: var(--margo); }
  .counter { font-size: 24px; font-weight: 600; fill: var(--master); }
  .card rect { fill: var(--paper); stroke: var(--master); stroke-width: 2.5; }
  .card.hit rect { stroke: var(--margo); stroke-width: 4; }
  .card text { font-size: 24px; }
  .card .name { font-weight: 600; }
  .pointer { fill: var(--master); }
  .book rect { fill: var(--grid); stroke: var(--line); transition: opacity 300ms, fill 200ms; }
  .book rect.open { fill: color-mix(in srgb, var(--master) 45%, var(--paper)); }
  .book rect.gone { opacity: 0.15; }
  .book rect.hit { fill: var(--margo); }
  .book.shake { animation: shake 200ms ease-in-out; }
  @keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .range { font-size: 22px; fill: var(--muted); }
  .row { font-size: 24px; font-weight: 600; }
  .bar { fill: var(--master); }
  .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.75rem; }
  .actions button { min-height: 44px; }
</style>
