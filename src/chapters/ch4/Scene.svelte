<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { executors, laneRate, laneRatio, scenario, type ExecutorId } from "../../model/tick";
  import Board from "../../ui/Board.svelte";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import Frame from "../../ui/Frame.svelte";
  import Hands from "../../ui/Hands.svelte";
  import Lanes from "../../ui/Lanes.svelte";
  import { animate, race } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import { CARTOON_ITEMS, cartoon, chain, CREW } from "./times";

  let { slide, done }: SceneProps = $props();
  const t = ru.ch4.scene;
  const lane = executors.gpu.lane;

  const VIEWS: Record<string, "screen" | "gpu" | "weak" | "cartoon" | "chain" | "board" | "machines"> = {
    pixels: "screen",
    howGpu: "gpu",
    weak: "weak",
    warp: "gpu",
    diverge: "gpu",
    same: "gpu",
    cartoonBet: "cartoon",
    cartoonRace: "cartoon",
    cartoonDone: "cartoon",
    chainBet: "chain",
    chainRace: "chain",
    chainDone: "chain",
    board: "board",
    bridge: "machines",
    rule: "machines",
  };
  const view = $derived(VIEWS[slide]);

  /** Экран 32×18 точек: каждая загорается в своё (псевдослучайное) время, независимо от соседей. */
  const COLS = 32;
  const ROWS = 18;
  const CELL = 20;
  const PIXELS = Array.from({ length: COLS * ROWS }, (_, i) => {
    const x = i % COLS;
    const y = Math.floor(i / COLS);
    const sun = (x - 23) ** 2 + (y - 5) ** 2 <= 12;
    const hill = y >= 12 + 2 * Math.sin(x / 4);
    const at = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
    return { x: x * CELL, y: y * CELL, tone: sun ? 1 : hill ? 0.7 : 0.3, at };
  });
  /** Ширина полосы одного ядра; полоса ядра видеокарты — в laneRatio() раз короче. */
  const BAR = 480;
  const MACHINES: ExecutorId[] = ["core", "cores", "gpu", "qc"];

  let p = $state(0);
  let clock = $state(0);
  let started = $state(false);
  let cancel = () => {};
  onDestroy(() => cancel());

  /** Смена слайда: прошлые анимации отменяются, каждый вид начинает со своего кадра. */
  $effect(() => {
    const id = slide;
    untrack(() => {
      cancel();
      cancel = () => {};
      started = false;
      p = id === "same" ? 1 : 0;
      clock = id === "cartoonDone" || id === "chainDone" ? Infinity : 0;
      if (id === "pixels") cancel = animate(1500, (f) => (p = f));
      if (id === "howGpu") cancel = animate(1200, (f) => (p = f));
    });
  });

  const times = $derived(view === "chain" ? chain : cartoon);
  const lanes = $derived(CREW.map((id) => ({ id, seconds: times[id] })));
  const half = $derived(p >= 1 ? t.halfDone : p >= 0.5 ? t.halfB : t.halfA);
  const card = $derived(
    view === "chain"
      ? { ...t.chain, size: fill(t.chain.size, { payments: fmtCount(scenario.payments) }) }
      : {
          ...t.cartoon,
          size: fill(t.cartoon.size, {
            frames: fmtCount(scenario.cartoon_frames),
            pixels: fmtCount(scenario.cartoon_pixels),
          }),
        },
  );

  function start() {
    started = true;
    cancel = race(Math.max(...Object.values(times)), (v) => (clock = v), done);
  }

  function runGroup() {
    started = true;
    cancel = animate(3000, (f) => (p = f), done);
  }
</script>

<div class="scene">
  {#if view === "screen"}
    <Frame>
      <svg viewBox="0 0 {COLS * CELL} {ROWS * CELL}" role="img" aria-label={t.screen}>
        {#each PIXELS as px}
          <rect
            class="px"
            class:on={px.at < p}
            x={px.x + 1}
            y={px.y + 1}
            width={CELL - 2}
            height={CELL - 2}
            style:opacity={px.at < p ? px.tone : 1}
          />
        {/each}
      </svg>
    </Frame>
  {:else if view === "weak"}
    <Frame>
      <svg viewBox="0 0 640 360" role="img" aria-label={t.weak}>
        <g class="ex-core">
          <ExecutorIcon ex="core" size={56} x={24} y={70} />
          <text class="name" x="100" y="92">{exName("core")}</text>
          <rect class="bar" x="100" y="104" width={BAR} height="28" />
          <text class="num" x="100" y="164">{fill(t.rate, { rate: fmtCount(executors.core.ops_per_s) })}</text>
        </g>
        <g class="ex-gpu">
          <ExecutorIcon ex="gpu" size={56} x={24} y={210} />
          <text class="name" x="100" y="232">{t.oneHand}</text>
          <rect class="bar" x="100" y="244" width={BAR / laneRatio()} height="28" />
          <text class="num" x="100" y="304">{fill(t.rate, { rate: fmtCount(laneRate("gpu")) })}</text>
        </g>
      </svg>
    </Frame>
  {:else if view === "gpu"}
    <div class="solo">
      <Hands
        ex="gpu"
        mode="split"
        items={lane.lanes}
        progress={p}
        warp={slide === "warp"}
        divergent={slide === "diverge"}
        showSteps={false}
      />
      <p class="muted">{t.gpu}</p>
      {#if slide === "diverge"}
        <p class="half" aria-live="polite">{started ? half : ""}</p>
        <div class="actions">
          <button class="primary" disabled={started} onclick={runGroup}>{t.runGroup}</button>
        </div>
      {/if}
    </div>
  {:else if view === "cartoon" || view === "chain"}
    <p class="card"><strong>{card.title}.</strong> {card.size}. <span class="muted">{card.note}.</span></p>
    <div class="crew">
      {#each CREW as id (id)}
        <Hands
          ex={id}
          mode={view === "chain" ? "chain" : "split"}
          items={view === "chain" ? scenario.payments : CARTOON_ITEMS}
          progress={clock / times[id]}
        />
      {/each}
    </div>
    <div class="lanes"><Lanes {lanes} t={clock} /></div>
    {#if slide === "cartoonRace" || slide === "chainRace"}
      <div class="actions"><button class="primary" disabled={started} onclick={start}>{ru.ui.startRace}</button></div>
    {/if}
  {:else if view === "board"}
    <div class="boards">
      <Board ids={CREW} rows={["hands", "rate"]} caption={t.boardHands} />
      <Board ids={CREW} rows={["time"]} task="split" n={CARTOON_ITEMS} ticks={scenario.pixel_ticks} caption={t.boardCartoon} />
      <Board ids={CREW} rows={["time"]} task="chain" n={scenario.payments} ticks={scenario.payment_ticks} caption={t.boardChain} />
    </div>
  {:else}
    <ul class="machines" aria-label={t.machines}>
      {#each MACHINES as id (id)}
        <li class="ex-{id}" class:later={id === "qc"}>
          <ExecutorIcon ex={id} size={64} />
          <span>{exName(id)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .scene { position: relative; }
  text { font-size: 22px; fill: var(--ink); }
  .name { font-weight: 600; fill: var(--ex); }
  .num { fill: var(--muted); font-variant-numeric: tabular-nums; }
  .bar { fill: var(--ex); }
  .px { fill: var(--grid); stroke: var(--line); stroke-width: 0.5; }
  .px.on { fill: var(--gpu); stroke: none; }
  .solo { display: grid; justify-items: center; gap: 0.25rem; }
  .muted { color: var(--muted); }
  p { margin: 0; }
  .half { min-height: 1.5em; font-weight: 600; }
  .card { margin-bottom: 0.5rem; }
  /* Колонки фиксированы: меняющиеся числа в подписях не двигают картинку. */
  .crew { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: end; gap: 0.75rem 1.5rem; }
  .crew > :global(:last-child) { grid-column: 1 / -1; }
  @media (min-width: 600px) {
    .crew { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr); }
    .crew > :global(:last-child) { grid-column: auto; }
  }
  .lanes { margin-top: 0.75rem; }
  .actions { margin: 0.75rem 0 0; }
  .boards { display: grid; gap: 0.25rem; }
  .machines { list-style: none; padding: 0; margin: 0.5rem 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem 2rem; }
  .machines li { display: grid; justify-items: center; gap: 0.25rem; font-weight: 600; color: var(--ex); }
  .later { opacity: 0.45; }
</style>
