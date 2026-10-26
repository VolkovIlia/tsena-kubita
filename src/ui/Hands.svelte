<script lang="ts">
  /**
   * «Руки исполнителя»: как одну работу делят 1 ядро, 64 ядра, потоки видеокарты и квантовый компьютер.
   * Только отображение: progress (0…1) ведёт сцена через race()/animate() из motion.ts.
   * split — работа делится поровну; chain — цепочка, работает одна рука; search — поиск среди items.
   */
  import { fill, fmtCount, fmtSci } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { executors, groverOptimal, handSteps, hands, scenario, type ExecutorId } from "../model/tick";
  import { mark, reflect, uniform, type Amps } from "../model/statevector";
  import ExecutorIcon from "./ExecutorIcon.svelte";
  import { exName } from "./names";

  type Mode = "split" | "chain" | "search";
  let {
    ex,
    mode,
    progress,
    items = scenario.compare_items,
    target = 0,
    divergent = false,
    warp = false,
    showSteps = true,
  }: {
    ex: ExecutorId;
    mode: Mode;
    progress: number;
    items?: number;
    target?: number;
    /** Видеокарта: половина каждой группы ждёт, пока работает другая половина. */
    divergent?: boolean;
    /** Видеокарта: подсветить одну группу из 32 потоков. */
    warp?: boolean;
    /** Подпись «шагов: x из y»; на вводных слайдах без задачи её прячут. */
    showSteps?: boolean;
  } = $props();


  const p = $derived(Math.min(1, Math.max(0, progress)));
  const total = $derived.by(() => {
    if (ex === "qc" && mode !== "search") throw new Error(`Hands: квантовому компьютеру нет режима ${mode}`);
    if (ex === "qc" && items > 1024) throw new Error("Hands: столбики амплитуд рисуются для items ≤ 1024");
    return mode === "chain" ? items : handSteps(ex, items);
  });
  const rounds = $derived(ex === "qc" ? Math.round(p * groverOptimal(items)) : 0);
  const done = $derived(ex === "qc" ? rounds : Math.round(p * total));

  /* 1 ядро и 64 ядра: решётка клеток. */
  const side = $derived(Math.round(Math.sqrt(hands(ex === "qc" ? "core" : ex))));
  /** Клетка-эстафета в цепочке: работает одна, остальные ждут. */
  const relay = $derived(Math.min(63, Math.floor(p * 64)));

  /* Квантовый: столбики амплитуд после rounds раундов «метка + отражение». */
  const amps = $derived.by((): Amps => {
    if (ex !== "qc") return [];
    let a = uniform(Math.round(Math.log2(items)));
    for (let r = 0; r < rounds; r++) a = reflect(mark(a, target));
    return a;
  });

  /* Видеокарта: 12×9 блоков по 8×8 потоков, группа (варп) — полблока. */
  const lane = executors.gpu.lane;
  const BLOCK = Math.sqrt(lane.lanes_per_sm);
  const COLS = 12;
  const ROWS = lane.sm / COLS;
  const CELL = 3;
  const GAP = 2;
  const W = COLS * (BLOCK * CELL + GAP) - GAP;
  const H = ROWS * (BLOCK * CELL + GAP) - GAP;
  let canvas: HTMLCanvasElement | undefined = $state();

  /** Яркость ждущего потока: видна в обеих темах. */
  const DIM = 0.3;
  /** Яркость потока i (0 — погашен, 1 — работает). */
  function level(i: number): number {
    const inWarp = i % lane.warp;
    if (mode === "chain") return i === Math.min(lane.lanes - 1, Math.floor(p * lane.lanes)) ? 1 : DIM;
    if (mode === "search" && i >= items) return 0.08;
    if (warp) return Math.floor(i / lane.warp) === 0 ? 1 : DIM;
    if (divergent) {
      const firstHalf = inWarp < lane.warp / 2;
      const active = p < 0.5 ? firstHalf : !firstHalf;
      return p > 0 && p < 1 && active ? 1 : p >= 1 ? 0.8 : DIM;
    }
    return DIM + (1 - DIM) * p;
  }

  $effect(() => {
    if (ex !== "gpu" || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const g = canvas.getContext("2d");
    if (!g) return;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, W, H);
    g.fillStyle = getComputedStyle(canvas).getPropertyValue("--ex").trim() || "currentColor";
    for (let i = 0; i < lane.lanes; i++) {
      const sm = Math.floor(i / lane.lanes_per_sm);
      const t = i % lane.lanes_per_sm;
      const x = (sm % COLS) * (BLOCK * CELL + GAP) + (t % BLOCK) * CELL;
      const y = Math.floor(sm / COLS) * (BLOCK * CELL + GAP) + Math.floor(t / BLOCK) * CELL;
      g.globalAlpha = level(i);
      g.fillRect(x, y, CELL - 0.6, CELL - 0.6);
    }
  });

  /** «из N» — родительный падеж: большие N степенью десяти, у fmtCount там именительный (как в Lanes). */
  const of = (n: number) => (n < 1e6 ? fmtCount(n) : fmtSci(n));
  const BAR_H = 60;
  const maxAmp = $derived(Math.max(...amps.map(Math.abs), 1e-9));
</script>

<figure class="hands ex-{ex}">
  <div class="draw">
    {#if ex === "core" && mode === "search"}
      <svg viewBox="0 0 {Math.min(items, 64) * 5} 12" class="row" aria-hidden="true">
        {#each { length: Math.min(items, 64) } as _, i}
          <rect x={i * 5} y="1" width="4" height="10" class:on={i < Math.round(p * Math.min(items, 64))} class:cursor={i === Math.round(p * Math.min(items, 64)) - 1} />
        {/each}
      </svg>
    {:else if ex === "core"}
      <svg viewBox="0 0 40 40" class="one" aria-hidden="true">
        <rect x="2" y="2" width="36" height="36" class="cell" />
        <rect x="2" y={2 + 36 * (1 - p)} width="36" height={36 * p} class="on" />
      </svg>
    {:else if ex === "cores"}
      <svg viewBox="0 0 {side * 6} {side * 6}" class="grid" aria-hidden="true">
        {#each { length: side * side } as _, i}
          {@const x = (i % side) * 6}
          {@const y = Math.floor(i / side) * 6}
          {#if mode === "chain"}
            <rect {x} {y} width="5" height="5" class="cell" class:on={i === relay} class:dim={i !== relay} />
          {:else}
            <rect {x} {y} width="5" height="5" class="cell" />
            <rect {x} y={y + 5 * (1 - p)} width="5" height={5 * p} class="on" />
          {/if}
        {/each}
      </svg>
    {:else if ex === "gpu"}
      <canvas bind:this={canvas} style:width="{W}px" style:aspect-ratio="{W} / {H}" aria-hidden="true"></canvas>
    {:else}
      {#key rounds}
        <svg viewBox="0 0 {amps.length * 5} {BAR_H * 2}" class="amps pulse" aria-hidden="true">
          <line x1="0" y1={BAR_H} x2={amps.length * 5} y2={BAR_H} class="axis" />
          {#each amps as a, i}
            {@const h = (Math.abs(a) / maxAmp) * (BAR_H - 2)}
            <rect x={i * 5} y={a >= 0 ? BAR_H - h : BAR_H} width="4" height={Math.max(0.5, h)} class="on" class:target={i === target} />
          {/each}
        </svg>
      {/key}
    {/if}
  </div>
  <figcaption>
    <ExecutorIcon {ex} size={24} />
    <span class="name">{exName(ex)}</span>
    {#if showSteps}<span class="num steps">{fill(ru.ui.steps, { done: fmtCount(done), total: of(ex === "qc" ? groverOptimal(items) : total) })}</span>{/if}
    {#if mode === "chain" && ex !== "core"}<span class="wait">{ru.ui.waitingOthers}</span>{/if}
  </figcaption>
</figure>

<style>
  .hands { margin: 0; display: grid; gap: 0.25rem; justify-items: start; min-width: 0; }
  .draw { max-width: 100%; overflow: hidden; }
  svg { display: block; height: auto; }
  .one { width: 40px; }
  .grid { width: 96px; }
  .row { width: min(320px, 100%); }
  .amps { width: min(320px, 100%); }
  canvas { display: block; max-width: 100%; height: auto; }
  .cell { fill: none; stroke: var(--ex); stroke-width: 0.6; }
  .on { fill: var(--ex); }
  .dim { opacity: 0.3; }
  .row rect:not(.on) { fill: none; stroke: var(--ex); stroke-width: 0.5; }
  .cursor { stroke: var(--ink); stroke-width: 1; }
  .axis { stroke: var(--line); stroke-width: 1; }
  .target { fill: var(--ink); }
  .pulse { animation: pulse 700ms ease-out; }
  @keyframes pulse {
    from { opacity: 0.4; }
    to { opacity: 1; }
  }
  figcaption { display: flex; flex-wrap: wrap; align-items: center; gap: 0 0.5rem; font-size: 0.875rem; line-height: 1.3; }
  .steps, .wait { flex-basis: 100%; }
  .name { font-weight: 600; color: var(--ex); }
  .steps { color: var(--muted); font-variant-numeric: tabular-nums; }
  .wait { color: var(--muted); font-style: italic; }
</style>
