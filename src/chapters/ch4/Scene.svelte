<script lang="ts">
  import { onDestroy } from "svelte";
  import params from "../../../data/params.json";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtDuration, fmtNum, fmtSci } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { cycleSeconds, DEFAULT_CHECK, opsPerCycle, physicalPerLogical, scenario, solveSeconds, steps } from "../../model/tick";
  import Lanes from "../../ui/Lanes.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { race, reducedMotion } from "../../ui/motion";
  import { slides } from "./slides";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch4.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);
  const N = scenario.safe_codes;
  const time = { master: solveSeconds("master", N), oracle: solveSeconds("oracle", N), factory: solveSeconds("factory", N) };
  /** Сколько тиков Оракул делает за такт: столько клеток в плитке ширины. */
  const ORACLE_OPS = Math.round(opsPerCycle("oracle"));

  /** Решётка одного логического кубита: 2d² шумных, d — нижняя дистанция поверхностного кода. */
  const QUBITS = physicalPerLogical(params.surface_code.distances[0]);
  const COLS = 2 * params.surface_code.distances[0];
  const ROWS = QUBITS / COLS;
  const CELL = 14;
  const LX = (640 - COLS * CELL) / 2;
  const FLICKER_MS = 300;

  /** Панель под гонкой: сейф, метрономы такта, ширина такта, решётка кубитов. */
  const panel = $derived(
    slide === "price" ? "beat" : slide === "width" ? "width" : slide === "qubits" || slide === "ratio" ? "lattice" : "safe",
  );
  const sliders = $derived(from("slider"));

  // Гонки на сейфе 10¹⁶ кодов
  let clock = $state(0);
  let started = $state(false);
  let cancel = () => {};
  onDestroy(() => cancel());

  function start() {
    started = true;
    const tEnd = slide === "race1" ? Math.max(time.master, time.oracle) : time.factory;
    cancel = race(tEnd, (v) => (clock = v), done);
  }

  $effect(() => {
    const id = slide;
    cancel();
    started = false;
    if (id === "factory") clock = 0;
  });

  // Ползунки: значения — log10
  let logN = $state(scenario.slider_log_n_min);
  let logSpeed = $state(0);
  let logCheck = $state(Math.log10(DEFAULT_CHECK));
  const speedMax = Math.log10(scenario.oracle_speedup_slider);
  const checkMin = Math.log10(DEFAULT_CHECK);
  const checkMax = Math.log10(scenario.check_ticks_realistic);
  const n = $derived(10 ** logN);
  const speed = $derived(10 ** logSpeed);
  const check = $derived(Math.round(10 ** logCheck));
  const tF = $derived(solveSeconds("factory", n, check));
  const tO = $derived(solveSeconds("oracle", n, check, speed));

  $effect(() => set("logN", logN));
  $effect(() => set("logSpeed", logSpeed));
  $effect(() => set("logCheck", logCheck));
  $effect(() => {
    if ((slide === "slider" && tO <= tF) || (slide === "speed" && logSpeed >= speedMax)) done();
    if (slide === "check" && logCheck >= checkMax) done();
  });

  const lanes = $derived.by(() => {
    if (sliders)
      return [
        { id: "factory" as const, seconds: tF },
        { id: "oracle" as const, seconds: tO },
      ];
    if (!from("race1") || from("price")) return [];
    const list = [
      { id: "master" as const, seconds: time.master, checks: N },
      { id: "oracle" as const, seconds: time.oracle, checks: steps("oracle", N), mood: slide === "race2Done" ? ("sad" as const) : undefined },
    ];
    return from("factory") ? [...list, { id: "factory" as const, seconds: time.factory, checks: N }] : list;
  });
  const laneT = $derived(sliders ? Math.min(tF, tO) : clock);

  let lit = $state(new Set<number>());
  $effect(() => {
    if (panel !== "lattice" || reducedMotion()) return;
    const id = setInterval(() => {
      lit = new Set(Array.from({ length: Math.round(QUBITS / 20) }, () => Math.floor(Math.random() * QUBITS)));
    }, FLICKER_MS);
    return () => clearInterval(id);
  });
</script>

<div class="scene">
  <svg viewBox="0 0 640 230" role="img" aria-label={t.label}>
    {#if panel === "safe"}
      <g class="safe">
        <rect x="40" y="20" width="190" height="190" rx="14" />
        <circle cx="135" cy="115" r="48" />
        <circle cx="135" cy="115" r="8" class="hub" />
        {#each Array.from({ length: 12 }, (_, i) => i) as i}
          <line x1="135" y1="71" x2="135" y2="81" transform="rotate({i * 30} 135 115)" />
        {/each}
      </g>
      <text x="260" y="95">{fill(t.codes, { n: sliders ? fmtSci(n) : fmtCount(N) })}</text>
      <text x="260" y="145" class="muted">{fill(t.check, { m: fmtCount(sliders ? check : DEFAULT_CHECK) })}</text>
    {:else if panel === "beat"}
      {#each [["oracle", 170, "slow"], ["factory", 470, "steady"]] as const as [who, x, kind]}
        <g class="who-{who}">
          <circle cx={x} cy="80" r="48" class="lamp {kind}" />
          <text x={x} y="170" text-anchor="middle" class="name">{ru.names[who]}</text>
          <text x={x} y="205" text-anchor="middle" class="muted">{fill(t.beat, { t: fmtDuration(cycleSeconds(who)) })}</text>
        </g>
      {/each}
    {:else if panel === "width"}
      <g class="who-factory">
        <rect x="110" y="20" width="120" height="120" class="tile dense" />
        <text x="170" y="175" text-anchor="middle" class="name">{ru.names.factory}</text>
        <text x="170" y="210" text-anchor="middle" class="muted">{fill(t.perCycle, { n: fmtCount(opsPerCycle("factory")) })}</text>
      </g>
      <g class="who-oracle">
        {#each Array.from({ length: ORACLE_OPS }, (_, i) => i) as i}
          <rect x={475 - 15 * ORACLE_OPS + 30 * i} y="70" width="20" height="20" class="tile" />
        {/each}
        <text x="470" y="175" text-anchor="middle" class="name">{ru.names.oracle}</text>
        <text x="470" y="210" text-anchor="middle" class="muted">{fill(t.perCycle, { n: String(ORACLE_OPS) })}</text>
      </g>
    {:else}
      <g class="lattice">
        {#each Array.from({ length: QUBITS }, (_, i) => i) as i}
          <circle cx={LX + (i % COLS) * CELL + CELL / 2} cy={Math.floor(i / COLS) * CELL + CELL / 2} r="4.5" class:lit={lit.has(i)} />
        {/each}
      </g>
      <text x="320" y={ROWS * CELL + 30} text-anchor="middle">{fill(t.lattice, { n: fmtCount(QUBITS) })}</text>
    {/if}
  </svg>

  {#if lanes.length}
    <div class="lanes"><Lanes {lanes} t={laneT} /></div>
  {/if}
  {#if sliders}
    <p class="num times">{fill(t.times, { f: fmtDuration(tF), o: fmtDuration(tO) })}</p>
    <LogSlider
      label={fill(t.sliderN, { n: fmtSci(n) })}
      min={scenario.slider_log_n_min}
      max={scenario.slider_log_n_max}
      step={0.1}
      bind:value={logN}
    />
    {#if from("speed")}
      <LogSlider label={fill(t.sliderSpeed, { x: fmtNum(speed) })} min={0} max={speedMax} step={1} bind:value={logSpeed} />
    {/if}
    {#if from("check")}
      <LogSlider label={fill(t.sliderCheck, { m: fmtCount(check) })} min={checkMin} max={checkMax} step={1} bind:value={logCheck} />
    {/if}
  {/if}
  {#if (slide === "race1" || slide === "race2") && !started}
    <div class="actions"><button class="primary" onclick={start}>{ru.ui.startRace}</button></div>
  {:else if started}
    <p class="num clock" aria-live="off">{fill(ru.ui.clock, { t: fmtDuration(clock) })}</p>
  {/if}
</div>

<style>
  svg { width: 100%; height: auto; display: block; }
  text { font-size: 26px; fill: var(--ink); }
  text.muted { fill: var(--muted); }
  text.name { fill: var(--who); font-weight: 600; }
  .safe rect { fill: var(--paper); stroke: var(--ink); stroke-width: 4; }
  .safe circle { fill: none; stroke: var(--ink); stroke-width: 4; }
  .safe .hub { fill: var(--ink); }
  .safe line { stroke: var(--ink); stroke-width: 3; }
  .lamp { fill: var(--who); }
  .lamp.slow { animation: blink 1s steps(1) infinite; }
  .lamp.steady { opacity: 0.85; }
  @keyframes blink { 50% { opacity: 0.15; } }
  .tile { fill: var(--who); }
  .lattice circle { fill: var(--oracle); opacity: 0.35; transition: opacity 200ms; }
  .lattice circle.lit { opacity: 1; fill: var(--margo); }
  .lanes { margin-top: 0.75rem; }
  .times { font-weight: 600; margin: 0.75rem 0 0; }
  .clock { color: var(--muted); margin: 0.5rem 0 0; }
</style>
