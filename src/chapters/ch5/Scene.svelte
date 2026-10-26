<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { basis, filterPass, measure, probabilities, rotate, uniform, type Amps } from "../../model/statevector";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import Frame from "../../ui/Frame.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import Arrow from "./Arrow.svelte";
  import Bars from "./Bars.svelte";
  import { BIT, LATTICE, LOOKS, MAX_QUBITS, MEASURES, MIXED, QUBITS, TARGET, TURN, WILLOW } from "./slides";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch5.scene;
  const BITS = [BIT.zero, BIT.one];
  const binary = (i: number, q: number) => i.toString(2).padStart(q, "0");

  /** Панель сцены по слайду: каждая — одна картинка в рамке 16:9. */
  const PANELS: Record<string, string> = {
    arrow: "arrow",
    gate: "arrow",
    twiceBet: "arrow",
    interference: "arrow",
    lotteryBet: "doors",
    lottery: "doors",
    twoN: "grow",
    noisy: "lattice",
    today: "lattice",
  };
  /** Сколько фотонов подряд пустить, когда стрелка стоит на «1», чтобы увидеть «всегда «1»». */
  const INTERFERE_MEASURES = 3;
  const SNAP_MS = 700;
  const TURN_MS = 700;
  let interfered = $state(false);
  const panel = $derived(slide === "interference" && interfered ? "paths" : (PANELS[slide] ?? "icon"));

  // Кубит-стрелка: угол от «0» к «1»; амплитуды — тени стрелки на оси.
  // Фильтр: ось под углом fdeg от «0» к «1» (фильтр «1» — четверть оборота); прошёл фотон — бит «1», поглощён — «0».
  const RAD = Math.PI / 180;
  const FILTER_ONE = 90;
  let deg = $state(0);
  let fdeg = $state(FILTER_ONE);
  let gdeg = $state(0);
  let amps = $state<Amps>(basis(1));
  let outcomes = $state<number[]>([]);
  let snap = $state<number | null>(null);
  let turning = $state(false);
  let tuned = $state(false);
  let measured = $state(false);
  let gated = $state(false);
  const last = $derived(outcomes.length ? outcomes[outcomes.length - 1] : null);
  const filterOpen = $derived(slide === "arrow" && measured);
  const pass = $derived(filterPass(amps, fdeg * RAD));
  /** Куда вентиль поставит стрелку: пунктир-подсказка на слайдах с вентилем. */
  const ghost = $derived<[number, number] | null>(
    (slide === "gate" || (slide === "interference" && !interfered)) && gdeg !== 0 ? (rotate(amps, 0, gdeg * RAD) as [number, number]) : null,
  );
  /** На миг после измерения стрелка ложится на ось фильтра (прошёл) или поперёк неё (поглощён). */
  const shown = $derived<Amps>(snap === null ? amps : [Math.cos(snap), Math.sin(snap)]);
  /** Тень стрелки на ось фильтра — рисуется, когда фильтр можно крутить. */
  const shadow = $derived(amps[0] * Math.cos(fdeg * RAD) + amps[1] * Math.sin(fdeg * RAD));
  let snapTimer: ReturnType<typeof setTimeout> | undefined;
  let cancelTurn = () => {};

  // Слайд «стрелка»: игрок крутит стрелку и фильтр; любая перестановка начинает серию фотонов заново
  $effect(() => {
    if (slide !== "arrow") return;
    amps = [Math.cos(deg * RAD), Math.sin(deg * RAD)];
    const f = fdeg;
    untrack(() => {
      outcomes = [];
      const p = filterPass(amps, f * RAD);
      if (f === FILTER_ONE) set("po", p);
      if (!tuned && f === FILTER_ONE && Math.abs(p - TARGET.p) <= TARGET.tolerance) {
        tuned = true;
        set("tuned", 1);
      }
      if (measured && f !== FILTER_ONE) set("filtered", 1);
      if (measured) set("pf", p);
    });
  });

  /** Вентиль: стрелка плавно поворачивается на выбранный угол. */
  function applyTurn() {
    const theta = gdeg * RAD;
    const from = Math.atan2(amps[1], amps[0]);
    const target = rotate(amps, 0, theta);
    turning = true;
    outcomes = [];
    cancelTurn = animate(
      TURN_MS,
      (f) => (amps = [Math.cos(from + theta * f), Math.sin(from + theta * f)]),
      () => {
        amps = target;
        turning = false;
        if (slide !== "gate" || gated || Math.abs(filterPass(amps, FILTER_ONE * RAD) - TARGET.half) > 0.01) return;
        gated = true;
        set("gated", 1);
        done();
      },
    );
  }

  function measureOnce() {
    const axis = fdeg * RAD;
    const k = Math.random() < pass ? 1 : 0;
    outcomes = [...outcomes, k];
    clearTimeout(snapTimer);
    // поглощённый — поперёк фильтра, с той стороны, куда смотрела стрелка
    const across = axis - Math.PI / 2;
    const side = amps[0] * Math.cos(across) + amps[1] * Math.sin(across);
    snap = k === 1 ? (shadow >= 0 ? axis : axis + Math.PI) : side >= 0 ? across : across + Math.PI;
    snapTimer = setTimeout(() => (snap = null), reducedMotion() ? 0 : SNAP_MS);
    if (slide === "interference" && Math.abs(amps[1]) > 0.99 && outcomes.length >= INTERFERE_MEASURES) {
      interfered = true;
      set("interfered", 1);
      return done();
    }
    if (slide !== "arrow" || measured || outcomes.length < MEASURES) return;
    measured = true;
    set("ones", outcomes.filter((b) => b === 1).length);
    set("runP", pass);
    set("pf", pass);
    set("measured", 1);
    done();
  }
  onDestroy(() => (clearTimeout(snapTimer), cancelTurn()));

  /** Второе смешивание: вклады каждого исхода из «0» и «1» до сложения. */
  const paths = [0, 1].map((k) => ({
    parts: [0, 1].map((j) => MIXED[j] * rotate(basis(1, j), 0, TURN)[k]),
    total: rotate(MIXED, 0, TURN)[k],
  }));

  // Двери: равная смесь QUBITS кубитов
  const DOOR_AMPS = uniform(QUBITS);
  let looks = $state<number[]>([]);
  const opened = $derived(looks.length ? looks[looks.length - 1] : null);

  function look() {
    const door = measure(DOOR_AMPS, Math.random);
    set(`look${looks.length}`, door);
    looks = [...looks, door];
    if (looks.length < LOOKS) return;
    set("looked", 1);
    done();
  }

  // Рост ряда: 2ⁿ амплитуд
  let q = $state(QUBITS);
  function addQubit() {
    q += 1;
    if (q < MAX_QUBITS) return;
    set("grown", 1);
    done();
  }

  // Решётка одного надёжного кубита: 2d² шумных, ряды по 2d
  const COLS = Math.round(Math.sqrt(2 * LATTICE));
  const ROWS = Math.ceil(LATTICE / COLS);
  const CELL = 20;
  const LX = (640 - COLS * CELL) / 2;
  const FLICKER_MS = 300;
  let noise = $state(new Set<number>());
  $effect(() => {
    if (panel !== "lattice" || reducedMotion()) return;
    const id = setInterval(() => {
      noise = new Set(Array.from({ length: Math.round(LATTICE / 12) }, () => Math.floor(Math.random() * LATTICE)));
    }, FLICKER_MS);
    return () => clearInterval(id);
  });

  // Вход в слайд: сброс того, что игрок делает руками
  $effect(() => {
    const s = slide;
    untrack(() => {
      cancelTurn();
      snap = null;
      outcomes = [];
      fdeg = FILTER_ONE;
      if (s === "arrow") {
        deg = 0;
        tuned = false;
        measured = false;
      } else if (s === "gate") {
        amps = basis(1);
        gdeg = 0;
        gated = false;
      } else if (s === "twiceBet" || s === "interference") {
        amps = MIXED;
        gdeg = Math.round(TURN / RAD);
        interfered = false;
      } else if (s === "lotteryBet" || s === "lottery") looks = [];
      else if (s === "twoN") q = QUBITS;
    });
  });

  const label = $derived(
    panel === "arrow"
      ? fill(t.amps, { list: probabilities(shown).map(fmtPercent).join(", ") })
      : panel === "doors"
        ? fill(t.amps, { list: probabilities(DOOR_AMPS).map(fmtPercent).join(", ") })
        : panel === "grow"
          ? fill(t.grow, { q: String(q), a: fmtCount(2 ** q) })
          : panel === "lattice"
            ? fill(t.lattice, { n: fmtCount(LATTICE) })
            : t.label,
  );
</script>

<div class="scene">
  <Frame>
    <svg viewBox="0 0 640 360" role="img" aria-label={label}>
      {#if panel === "arrow"}
        <Arrow a0={shown[0]} a1={shown[1]} cx={170} cy={175} r={115} labels={[BIT.zero, BIT.one]} {ghost} />
        {#if filterOpen}
          {@const dx = Math.sin(fdeg * RAD)}
          {@const dy = -Math.cos(fdeg * RAD)}
          <line class="axis" x1={170 - dx * 135} y1={175 - dy * 135} x2={170 + dx * 135} y2={175 + dy * 135} />
          <line class="drop" x1={170 + shown[1] * 115} y1={175 - shown[0] * 115} x2={170 + dx * shadow * 115} y2={175 + dy * shadow * 115} />
          <line class="fshadow" x1="170" y1="175" x2={170 + dx * shadow * 115} y2={175 + dy * shadow * 115} />
        {/if}
        <text x="170" y="345" text-anchor="middle" class="muted num">{fill(t.chance, { po: fmtPercent(snap === null ? pass : filterPass(shown, fdeg * RAD)) })}</text>
        <!-- фильтр: щели вдоль его оси; пропускает фотон с шансом квадрата тени стрелки на эту ось, за ним лампа -->
        <g class="filter" transform="rotate({fdeg - FILTER_ONE} 417 175)">
          <circle cx="417" cy="175" r="62" />
          {#each [-40, -24, -8, 8, 24, 40] as y}<line x1={417 - Math.sqrt(62 ** 2 - y ** 2) + 6} y1={175 + y} x2={417 + Math.sqrt(62 ** 2 - y ** 2) - 6} y2={175 + y} />{/each}
        </g>
        <text x="417" y="275" text-anchor="middle" class="muted">{fdeg === FILTER_ONE ? fill(t.filterOne, BIT) : t.filter}</text>
        {#key outcomes.length}
          <circle class="lamp flash" class:on={last === 1} cx="555" cy="175" r="52" />
        {/key}
        <text x="555" y="185" text-anchor="middle" class="name">{last === null ? "?" : BITS[last]}</text>
        <text x="555" y="265" text-anchor="middle" class="name">{t.bit}</text>
        <text x="555" y="295" text-anchor="middle" class="muted">{t.result}</text>
      {:else if panel === "paths"}
        {#each paths as p, k}
          {@const gx = 20 + k * 320}
          <text x={gx + 140} y="36" text-anchor="middle" class="name">{fill(t.outcome, { k: BITS[k] })}</text>
          <Bars amps={p.parts} x={gx} y={200} w={150} scale={130} />
          <text x={gx + 168} y="190" text-anchor="middle" class="sign">=</text>
          <Bars amps={[p.total]} x={gx + 180} y={200} w={110} scale={130} />
          <text x={gx + 37} y="300" text-anchor="middle" class="muted">{fill(t.fromZero, BIT)}</text>
          <text x={gx + 112} y="300" text-anchor="middle" class="muted">{fill(t.fromOne, BIT)}</text>
          <text x={gx + 235} y="300" text-anchor="middle" class="muted">{t.total}</text>
        {/each}
      {:else if panel === "doors"}
        {#each DOOR_AMPS as _, i}
          {@const dx = 40 + (560 / DOOR_AMPS.length) * i}
          <rect class="door" class:open={opened === i} x={dx + 10} y="16" width={560 / DOOR_AMPS.length - 20} height="56" rx="3" />
          <text x={dx + 280 / DOOR_AMPS.length} y="54" text-anchor="middle" class:muted={opened !== i}>{String(i + 1)}</text>
        {/each}
        <Bars amps={DOOR_AMPS} x={40} y={260} w={560} scale={160} lit={opened} labels={DOOR_AMPS.map((_, i) => binary(i, QUBITS))} />
      {:else if panel === "grow"}
        <Bars amps={uniform(q)} x={40} y={240} w={560} scale={200} labels={q <= QUBITS ? uniform(q).map((_, i) => binary(i, q)) : []} />
        <text x="320" y="310" text-anchor="middle" class="name">{fill(t.grow, { q: String(q), a: fmtCount(2 ** q) })}</text>
        <text x="320" y="344" text-anchor="middle" class="muted">{t.growRule}</text>
      {:else if panel === "lattice"}
        <g class="lattice ex-qc">
          {#each Array.from({ length: LATTICE }, (_, i) => i) as i}
            <circle
              cx={LX + (i % COLS) * CELL + CELL / 2}
              cy={14 + Math.floor(i / COLS) * CELL + CELL / 2}
              r="6.5"
              class:noise={noise.has(i)}
              class:willow={slide === "today" && i < WILLOW}
              class:dim={slide === "today" && i >= WILLOW}
            />
          {/each}
        </g>
        <text x="320" y={14 + ROWS * CELL + 40} text-anchor="middle">
          {#if slide === "today"}{fill(t.willow, { n: fmtCount(WILLOW) })} · {/if}{fill(t.lattice, { n: fmtCount(LATTICE) })}
        </text>
      {:else}
        <ExecutorIcon ex="qc" size={200} x={220} y={40} />
        <text x="320" y="300" text-anchor="middle" class="name ex-qc">{exName("qc")}</text>
      {/if}
    </svg>
  </Frame>

  {#if slide === "arrow"}
    <div class="controls">
      <label class="turn">{t.turn}<input type="range" min="0" max="180" step="1" bind:value={deg} /></label>
      {#if filterOpen}<label class="turn">{t.turnFilter}<input type="range" min="0" max="180" step="1" bind:value={fdeg} /></label>{/if}
      <button class="primary" onclick={measureOnce} disabled={!tuned || snap !== null}>{t.measure}</button>
    </div>
  {:else if slide === "gate" || (slide === "interference" && !interfered)}
    <div class="controls">
      <label class="turn"><span class="num">{fill(t.gateAngle, { deg: String(gdeg).replace("-", "−") })}</span><input type="range" min="-90" max="90" step="15" bind:value={gdeg} disabled={turning} /></label>
      <button class:primary={!gated || slide === "interference"} onclick={applyTurn} disabled={turning || gdeg === 0}>{t.apply}</button>
      <button class:primary={gated} onclick={measureOnce} disabled={turning || snap !== null}>{t.measure}</button>
    </div>
  {:else if slide === "lottery"}
    <div class="actions"><button onclick={look} disabled={looks.length >= LOOKS}>{t.look}</button></div>
  {:else if slide === "twoN"}
    <div class="actions"><button onclick={addQubit} disabled={q >= MAX_QUBITS}>{t.addQubit}</button></div>
  {/if}

  {#if panel === "arrow" && outcomes.length}
    <p class="num status" aria-live="polite">
      {fill(t.photons, { n: String(outcomes.length), k: String(outcomes.filter((b) => b === 1).length) })} ·
      {fill(t.outcomes, { list: outcomes.slice(-12).map(String).join(" ") })}
    </p>
  {:else if panel === "doors" && opened !== null}
    <p class="num status" aria-live="polite">
      {fill(t.looked, { n: String(looks.length), max: String(LOOKS) })} · {fill(t.door, { i: String(opened + 1) })}
    </p>
  {/if}
</div>

<style>
  text { font-size: 24px; fill: var(--ink); }
  text.muted { fill: var(--muted); font-size: 20px; }
  text.name { font-weight: 600; }
  text.sign { font-size: 40px; }
  .lamp { fill: var(--paper); stroke: var(--ink); stroke-width: 4; transition: fill 200ms; }
  .lamp.on { fill: var(--core); }
  .filter circle { fill: none; stroke: var(--ink); stroke-width: 3; }
  .axis { stroke: var(--muted); stroke-width: 2; stroke-dasharray: 6 5; }
  .drop { stroke: var(--core); stroke-width: 2; stroke-dasharray: 3 4; }
  .fshadow { stroke: var(--core); stroke-width: 10; stroke-linecap: round; opacity: 0.7; }
  .filter line { stroke: var(--muted); stroke-width: 2; }
  .flash { animation: flash 300ms ease-out; }
  @keyframes flash { from { opacity: 0.3; } to { opacity: 1; } }
  .door { fill: none; stroke: var(--muted); stroke-width: 2; }
  .door.open { fill: color-mix(in srgb, var(--qc) 25%, transparent); stroke: var(--ink); stroke-width: 3; }
  .lattice circle { fill: var(--ex); opacity: 0.85; transition: opacity 200ms; }
  .lattice circle.noise { opacity: 0.2; }
  .lattice circle.dim { fill: none; stroke: var(--ex); stroke-width: 1.5; opacity: 0.5; }
  .lattice circle.willow { opacity: 1; }
  .status { font-size: 1.125rem; font-weight: 600; margin: 0.25rem 0 0; }
  .actions { margin: 0.5rem 0 0; }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; margin: 0.5rem 0 0; }
  .turn { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; flex: 1 1 16rem; }
  .turn input { flex: 1; min-height: 44px; accent-color: var(--qc); }
</style>
