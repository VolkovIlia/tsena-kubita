<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtDuration, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import {
    complexitySteps,
    DAY,
    halvingSteps,
    ladderSeconds,
    scenario,
    universeAgeSeconds,
    type Complexity,
  } from "../../model/tick";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import RouteMap from "./RouteMap.svelte";
  import { LADDER_LOCK } from "./slides";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch2.scene;
  const BOOK = ["book", "flip", "flipDone", "halve", "halveDone"];
  const BARS = ["growBet", "scale"];
  const MAP = ["intro", "wave", "waveDone"];
  /** Слайды после лестницы, где подсвечена нижняя строка — все комбинации. */
  const HOT = ["hard", "bridge", "rule"];
  const phase = $derived(
    BOOK.includes(slide) ? "book" : BARS.includes(slide) ? "bars" : MAP.includes(slide) ? "map" : "ladder",
  );

  // Телефонная книга.
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
    if (slide === "scale" && logPages >= MAX - 1e-9) done();
  });

  function spineClass(i: number): string {
    const first = i * per + 1;
    const last = (i + 1) * per;
    if (steps > 0) return found && i === spineOf(target) ? "hit" : last < lo || first > hi ? "gone" : "open";
    if (opened >= target && i === spineOf(target)) return "hit";
    return i < Math.ceil(opened / per) ? "open" : "";
  }

  // Лестница сложности: время каждой строки на одном ядре, логарифмическая шкала.
  const LADDER = scenario.ladder_n;
  const TOP = LADDER.length - 1;
  const KINDS: Complexity[] = ["log", "linear", "square", "exp"];
  const BAR_X = 200;
  const BAR_W = 420;
  const ROW_Y = 66;
  const ROW_H = 66;
  /** Края шкалы — по самой быстрой и самой медленной ступени лестницы, с запасом в порядок. */
  const LOG_MIN = Math.floor(Math.log10(ladderSeconds("log", LADDER[0])));
  const LOG_MAX = Math.ceil(Math.log10(ladderSeconds("exp", LADDER[TOP]))) + 1;
  const universe = universeAgeSeconds();
  const xOf = (s: number) =>
    BAR_X + BAR_W * Math.min(1, Math.max(0, (Math.log10(s) - LOG_MIN) / (LOG_MAX - LOG_MIN)));
  const MARKS = [
    { label: t.marks.second, s: 1, anchor: "middle" },
    { label: t.marks.year, s: 365.25 * DAY, anchor: "middle" },
    { label: t.marks.universe, s: universe, anchor: "end" },
  ];

  let rung = $state(0);
  const n = $derived(LADDER[rung]);
  const rows = $derived(
    KINDS.map((kind) => {
      const s = ladderSeconds(kind, n);
      const time = fmtDuration(s);
      return {
        kind,
        width: Math.max(2, xOf(s) - BAR_X),
        steps: fill(t.steps, { k: fmtCount(complexitySteps(kind, n)) }),
        time: s > universe ? fill(t.longer, { t: time }) : time,
      };
    }),
  );

  $effect(() => {
    if (slide === "expBet") rung = LADDER_LOCK;
    if (HOT.includes(slide)) rung = TOP;
  });
  $effect(() => {
    if ((slide === "ladder" && rung >= LADDER_LOCK) || (slide === "ladderAll" && rung >= TOP)) done();
  });

  const label = $derived(
    phase === "map" ? t.map : phase === "bars" ? t.barsLabel : phase === "ladder" ? t.ladderLabel : t.label,
  );
  const status = $derived(
    phase === "book" && page > 0
      ? `${fill(t.page, { n: fmtExact(page) })}: ${surname(page)}`
      : phase === "ladder"
        ? `${fill(t.n, { n: String(n) })}. ${rows.map((r) => `${t.rows[r.kind]}: ${r.time}`).join("; ")}`
        : "",
  );
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={label}>
    {#if phase === "book"}
      <text class="seek" x="20" y="40">{t.seek}</text>
      {#if slide !== "book"}
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
      <ExecutorIcon ex="core" size={100} x={10} y={200} />
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
    {:else if phase === "ladder"}
      <g in:fade={{ duration: reducedMotion() ? 0 : 300 }}>
        <text class="head num" x="20" y="40">{fill(t.n, { n: String(n) })}</text>
        <text class="who" x="574" y="40" text-anchor="end">{exName("core")}</text>
        <ExecutorIcon ex="core" size={36} x={584} y={12} />
        {#each MARKS as m}
          <line class="mark" x1={xOf(m.s)} y1={ROW_Y} x2={xOf(m.s)} y2={ROW_Y + ROW_H * KINDS.length} />
          <text class="markLabel" x={m.anchor === "end" ? 636 : xOf(m.s)} y="352" text-anchor={m.anchor}>{m.label}</text>
        {/each}
        {#each rows as r, i}
          {@const y = ROW_Y + i * ROW_H}
          <g class="rung" class:hot={HOT.includes(slide) && r.kind === "exp"} class:dim={HOT.includes(slide) && r.kind !== "exp"}>
            <text class="kind" x="20" y={y + 24}>{t.rows[r.kind]}</text>
            <text class="steps num" x="20" y={y + 48}>{r.steps}</text>
            <rect class="bar" x={BAR_X} y={y + 8} width={r.width} height="22" rx="3" />
            <text class="time num" x={BAR_X} y={y + 52}>{r.time}</text>
          </g>
        {/each}
      </g>
    {:else}
      <g in:fade={{ duration: reducedMotion() ? 0 : 300 }}>
        <ExecutorIcon ex="core" size={90} x={8} y={240} />
        <RouteMap run={slide === "wave" || slide === "waveDone"} onDone={done} x={115} y={30} cell={52} />
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
  {:else if slide === "ladder"}
    <LogSlider label={fill(t.n, { n: String(n) })} min={0} max={LADDER_LOCK} step={1} bind:value={rung} />
  {:else if slide === "ladderAll"}
    <LogSlider label={fill(t.n, { n: String(n) })} min={0} max={TOP} step={1} bind:value={rung} />
  {/if}
  <p class="vh" aria-live="polite">{status}</p>
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  .seek { font-size: 24px; font-weight: 600; fill: var(--ink); }
  .counter { font-size: 24px; font-weight: 600; fill: var(--core); }
  .card rect { fill: var(--paper); stroke: var(--core); stroke-width: 2.5; }
  .card.hit rect { stroke: var(--ink); stroke-width: 4; }
  .card text { font-size: 24px; fill: var(--ink); }
  .card .name { font-weight: 600; }
  .pointer { fill: var(--core); }
  .book rect { fill: var(--grid); stroke: var(--line); transition: opacity 300ms, fill 200ms; }
  .book rect.open { fill: color-mix(in srgb, var(--core) 45%, var(--paper)); }
  .book rect.gone { opacity: 0.15; }
  .book rect.hit { fill: var(--ink); }
  .book.shake { animation: shake 200ms ease-in-out; }
  @keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .range { font-size: 22px; fill: var(--muted); }
  .row { font-size: 24px; font-weight: 600; fill: var(--ink); }
  .bar { fill: var(--core); }
  .head { font-size: 26px; font-weight: 600; fill: var(--ink); }
  .who { font-size: 18px; fill: var(--muted); }
  .mark { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 4; }
  .markLabel { font-size: 16px; fill: var(--muted); }
  .kind { font-size: 22px; font-weight: 600; fill: var(--ink); }
  .steps { font-size: 16px; fill: var(--muted); }
  .time { font-size: 18px; fill: var(--ink); }
  .rung { transition: opacity 300ms; }
  .rung .bar { transition: width 400ms ease-out; }
  .rung.dim { opacity: 0.3; }
  .rung.hot .kind, .rung.hot .time { font-weight: 700; }
  @media (prefers-reduced-motion: reduce) {
    .rung, .rung .bar, .book rect { transition: none; }
    .book.shake { animation: none; }
  }
  .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 0.75rem; }
  .actions button { min-height: 44px; }
</style>
