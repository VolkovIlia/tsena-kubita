<script lang="ts">
  import { onDestroy } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtDuration, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { DAY } from "../../model/tick";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import Frame from "../../ui/Frame.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import { ADD_TICKS, BITS, CYCLE, GATES, RATE, TPC, coreSeconds } from "./numbers";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch1.scene;

  type Phase = "gate" | "adder" | "clock" | "second" | "price";
  const PHASE: Record<string, Phase> = {
    lamp: "gate",
    xor: "gate",
    adder: "adder",
    clock: "clock",
    rateBet: "clock",
    second: "second",
    price: "price",
    rule: "price",
  };
  const phase = $derived(PHASE[slide] ?? "gate");

  let cancel = () => {};
  let beatTimer: ReturnType<typeof setInterval> | undefined;
  onDestroy(() => (cancel(), clearInterval(beatTimer)));

  /* Переключатели и вентиль. */
  let a = $state(0);
  let b = $state(0);
  let ops = $state(0);
  const isXor = $derived(slide === "xor");
  let xorDone = $state(false);
  const lamp = $derived(isXor ? a ^ b : a & b);
  function toggle(which: "a" | "b") {
    if (which === "a") a ^= 1;
    else b ^= 1;
    ops += 1;
    if (!(a & b)) return;
    if (slide === "lamp") set("lamp", 1);
    if (slide === "xor") {
      xorDone = true;
      set("xor", 1);
    }
    done();
  }

  /* Сумматор: два числа выбирает сцена, младший разряд справа. */
  const X = 91;
  const Y = 55;
  const bit = (v: number, j: number) => (v >> j) & 1;
  /** carries[j] — перенос в разряд j. */
  const carries = Array.from({ length: BITS + 1 }, () => 0);
  for (let j = 0; j < BITS; j++) carries[j + 1] = (bit(X, j) + bit(Y, j) + carries[j]) >> 1;
  const SUM = (X + Y) % 2 ** BITS;
  const COLS = Array.from({ length: BITS }, (_, j) => j);
  const colX = (j: number) => 602 - j * 58;
  let addAnim = $state(0);
  let started = $state(false);
  const addTicks = $derived(slide === "adder" ? addAnim : ADD_TICKS);
  const lit = (j: number) => Math.max(0, Math.min(GATES, addTicks - j * GATES));
  function add() {
    if (started) return;
    started = true;
    cancel();
    cancel = animate(
      ADD_TICKS * 120,
      (f) => (addAnim = Math.floor(ADD_TICKS * f)),
      () => {
        set("added", 1);
        done();
      },
    );
  }

  /* Такт: метроном и сетка «команды × биты». */
  let beat = $state(0);
  $effect(() => {
    clearInterval(beatTimer);
    if (phase !== "clock" || reducedMotion()) return;
    beatTimer = setInterval(() => (beat += 1), 900);
  });
  const ROWS = Array.from({ length: CYCLE.ops_per_cycle }, (_, i) => i);
  const CELLS = Array.from({ length: CYCLE.bits_per_op }, (_, i) => i);
  const cellW = 360 / CYCLE.bits_per_op;

  /* Секунда одного ядра. */
  let ticks = $state(RATE);
  $effect(() => {
    if (slide === "lamp" || slide === "xor") {
      a = 0;
      b = 0;
      ops = 0;
    }
    if (slide !== "second") return;
    cancel();
    cancel = animate(1000, (f) => (ticks = Math.max(1, RATE * f)));
  });

  /* Цена задачи: ползунок по степени десяти. */
  let exp = $state(1);
  const need = $derived(10 ** exp);
  const seconds = $derived(coreSeconds(need));
  $effect(() => {
    if (slide === "price" && seconds >= DAY) {
      set("day", 1);
      done();
    }
  });
  const formula = $derived([
    { label: t.ticks, value: fmtCount(need), key: "ticks" },
    { label: t.rate, value: fmtCount(RATE), key: "rate" },
    { label: t.time, value: fmtDuration(seconds), key: "time" },
  ]);
</script>

<div class="scene">
  <Frame>
    <svg viewBox="0 0 640 360" role="img" aria-label={t.label[phase]}>
      {#if phase === "gate"}
        {#each [{ v: a, y: 130, name: "A" }, { v: b, y: 250, name: "B" }] as s}
          <g class="switch" class:on={s.v === 1}>
            <rect class="track" x="40" y={s.y - 28} width="120" height="56" rx="28" />
            <circle class="knob" cx={s.v ? 132 : 68} cy={s.y} r="20" />
            <text class="bitv num" x="200" y={s.y + 12} text-anchor="middle">{s.v}</text>
            <text class="sname" x="100" y={s.y - 40} text-anchor="middle">{s.name}</text>
          </g>
        {/each}
        <path class="wire" class:live={a === 1} d="M 222 130 C 270 130 260 170 300 170" />
        <path class="wire" class:live={b === 1} d="M 222 250 C 270 250 260 210 300 210" />
        <rect class="gatebox" x="300" y="150" width="140" height="80" rx="8" />
        <text class="gname" x="370" y={isXor ? 186 : 200} text-anchor="middle">
          {#if isXor}
            {#each t.xor.split(" ") as w, i}<tspan x="370" dy={i ? 22 : 0}>{w}</tspan>{/each}
          {:else}{t.and}{/if}
        </text>
        <line class="wire" class:live={lamp === 1} x1="440" y1="190" x2="516" y2="190" />
        <circle class="lamp" class:on={lamp === 1} cx="556" cy="190" r="36" />
        <text class="bitv num" x="556" y="202" text-anchor="middle">{lamp}</text>
        {#if xorDone}
          <text class="counter num" x="630" y="60" text-anchor="end">{fill(t.counter, { n: fmtExact(Math.max(1, ops)) })}</text>
        {/if}
      {:else if phase === "adder"}
        <text class="dec num" x="20" y="112">{X}</text>
        <text class="dec num" x="20" y="152">{Y}</text>
        <text class="dec num" x="20" y="200">{addTicks >= ADD_TICKS ? SUM : "?"}</text>
        <text class="plus" x="120" y="152">+</text>
        <text class="clabel" x="20" y="72">{t.carry}</text>
        <line class="bar" x1="140" y1="166" x2="632" y2="166" />
        {#each COLS as j}
          {@const n = lit(j)}
          <g>
            {#if j > 0 && lit(j - 1) === GATES}<text class="carry num" x={colX(j)} y="72" text-anchor="middle">{carries[j]}</text>{/if}
            <text class="digit num" x={colX(j)} y="112" text-anchor="middle">{bit(X, j)}</text>
            <text class="digit num" x={colX(j)} y="152" text-anchor="middle">{bit(Y, j)}</text>
            {#if n === GATES}<text class="digit sum num" x={colX(j)} y="200" text-anchor="middle">{bit(SUM, j)}</text>{/if}
            <rect class="adderbox" x={colX(j) - 26} y="218" width="52" height="40" rx="4" />
            {#each Array.from({ length: GATES }, (_, k) => k) as k}
              <rect class="g" class:on={k < n} x={colX(j) - 24 + k * 10} y="234" width="8" height="8" />
            {/each}
          </g>
        {/each}
        <text class="counter num" x="320" y="330" text-anchor="middle">{fill(t.counter, { n: fmtExact(addTicks) })}</text>
      {:else if phase === "clock"}
        <text class="caption" x="320" y="36" text-anchor="middle">{fill(t.hz, { hz: fmtCount(CYCLE.clock_hz) })}</text>
        <path class="base" d="M 80 330 L 180 330 L 160 300 L 100 300 Z" />
        <g class="pendulum" style:transform="rotate({beat % 2 ? 22 : -22}deg)">
          <line x1="130" y1="300" x2="130" y2="100" />
          <rect x="116" y="150" width="28" height="20" rx="3" />
        </g>
        <text class="clabel" x="130" y="352" text-anchor="middle">{t.tact}</text>
        <text class="caption" x="440" y="100" text-anchor="middle">{fill(t.tpc, { tpc: fmtCount(TPC) })}</text>
        {#key beat}
          <g class="grid">
            {#each ROWS as r}
              {#each CELLS as c}
                <rect x={260 + c * cellW} y={124 + r * 40} width={cellW - 1} height="28" />
              {/each}
            {/each}
          </g>
        {/key}
      {:else if phase === "second"}
        <ExecutorIcon ex="core" size={120} x={30} y={120} />
        <text class="clabel" x="610" y="130" text-anchor="end">{t.perSecond}</text>
        <text class="big num" x="610" y="196" text-anchor="end">{fmtExact(ticks)}</text>
      {:else}
        {#each formula as row, i}
          <g class="frow" class:fewer={row.key === "ticks" && slide === "rule"}>
            <rect x="40" y={40 + i * 104} width="560" height="64" rx="6" />
            <text class="flabel" x="60" y={80 + i * 104}>{row.label}</text>
            <text class="fvalue num" x="580" y={82 + i * 104} text-anchor="end">{row.value}</text>
          </g>
          {#if i < 2}<text class="op" x="320" y={128 + i * 104} text-anchor="middle">{i === 0 ? "÷" : "="}</text>{/if}
        {/each}
        {#if slide === "rule"}
          <text class="fewertag" x="320" y="26" text-anchor="middle">{t.fewer}</text>
        {/if}
      {/if}
    </svg>
    {#if phase === "gate"}
      <button class="sw a" aria-pressed={a === 1} aria-label={t.switchA} onclick={() => toggle("a")}></button>
      <button class="sw b" aria-pressed={b === 1} aria-label={t.switchB} onclick={() => toggle("b")}></button>
    {/if}
  </Frame>
  {#if phase === "gate"}<p class="vh" aria-live="polite">{lamp ? t.lampOn : t.lampOff}</p>{/if}
  {#if slide === "adder"}
    <div class="controls"><button class="primary" disabled={started} onclick={add}>{t.add}</button></div>
  {/if}
  {#if slide === "price"}
    <div class="controls slider">
      <LogSlider label={fill(t.slider, { n: fmtCount(need) })} min={1} max={20} step={0.1} bind:value={exp} />
    </div>
  {/if}
</div>

<style>
  .track { fill: var(--paper); stroke: var(--ink); stroke-width: 3; transition: fill 200ms; }
  .switch.on .track { fill: var(--core); }
  .knob { fill: var(--ink); transition: cx 200ms; }
  .switch.on .knob { fill: var(--paper); }
  .bitv { font-size: 34px; font-weight: 600; }
  .sname { font-size: 18px; fill: var(--muted); }
  .wire { fill: none; stroke: var(--line); stroke-width: 4; }
  .wire.live { stroke: var(--core); }
  .gname { font-size: 18px; font-weight: 600; }
  .bar { stroke: var(--ink); stroke-width: 2; }
  .gatebox { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
  .lamp { fill: var(--paper); stroke: var(--ink); stroke-width: 3; transition: fill 200ms; }
  .lamp.on { fill: var(--core); }
  .counter { font-size: 26px; font-weight: 600; fill: var(--core); }
  .dec { font-size: 26px; font-weight: 600; fill: var(--muted); }
  .plus { font-size: 30px; font-weight: 600; }
  .clabel { font-size: 16px; fill: var(--muted); }
  .digit { font-size: 30px; font-weight: 600; }
  .digit.sum { fill: var(--core); animation: pop 200ms ease-out both; }
  .carry { font-size: 18px; fill: var(--core); }
  .adderbox { fill: var(--paper); stroke: var(--line); stroke-width: 2; }
  .g { fill: var(--line); }
  .g.on { fill: var(--core); }
  .caption { font-size: 20px; font-weight: 600; }
  .base { fill: var(--line); stroke: var(--ink); stroke-width: 2; }
  .pendulum { transform-origin: 130px 300px; transition: transform 900ms ease-in-out; }
  .pendulum line { stroke: var(--ink); stroke-width: 4; }
  .pendulum rect { fill: var(--core); }
  .grid rect { fill: var(--core); animation: flash 900ms ease-out both; }
  @keyframes flash { from { opacity: 1; } to { opacity: 0.25; } }
  .big { font-size: 44px; font-weight: 600; fill: var(--core); }
  .frow rect { fill: var(--paper); stroke: var(--line); stroke-width: 2; }
  .frow.fewer rect { stroke: var(--core); stroke-width: 4; }
  .flabel { font-size: 20px; fill: var(--muted); }
  .fvalue { font-size: 28px; font-weight: 600; }
  .op { font-size: 30px; font-weight: 600; }
  .fewertag { font-size: 20px; font-weight: 600; fill: var(--core); }
  @keyframes pop { from { opacity: 0; } }
  .sw {
    position: absolute;
    left: 6.25%;
    width: 18.75%;
    height: 15.6%;
    min-height: 44px;
    min-width: 44px;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    border-radius: 999px;
    padding: 0;
  }
  .sw[aria-pressed="true"] { background: transparent; }
  .sw.a { top: 36.1%; }
  .sw.b { top: 69.4%; }
  .controls { display: flex; justify-content: center; margin-top: 0.5rem; }
  .controls.slider { display: block; }
</style>
