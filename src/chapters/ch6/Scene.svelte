<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import params from "../../../data/params.json";
  import type { SceneProps } from "../../deck/types";
  import { fill } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { memoryPlace, memoryScales, powersMod, scenario, shorFactors } from "../../model/tick";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import { slides } from "./slides";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch6.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);

  type Phase = keyof typeof t.label;
  const PHASES: [string, Phase][] = [
    ["nina", "night"],
    ["board", "board"],
    ["bank", "number"],
  ];
  const phase = $derived(PHASES.filter(([id]) => from(id)).at(-1)?.[1] ?? "night");

  /* Кластер железа и молибдена: схема, не модель молекулы. */
  const ATOMS: [number, number, "fe" | "mo"][] = [
    [380, 110, "fe"], [470, 90, "fe"], [540, 150, "fe"], [400, 200, "fe"],
    [490, 190, "fe"], [420, 280, "fe"], [510, 270, "fe"], [590, 250, "mo"],
  ];
  const BONDS = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 4], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7], [2, 7]];

  /* Доска памяти: вертикальная шкала log10, верх — самое большое хранилище. */
  const BASE = 330;
  const TOP = 56;
  const K = (BASE - TOP) / Math.log10(memoryScales[memoryScales.length - 1].capacity_numbers);
  const yOf = (log: number) => BASE - log * K;
  const NS = scenario.memory_n;
  let idx = $state(0);
  let shownLog = $state(NS[0] * Math.log10(2));
  const n = $derived(NS[idx]);
  const over = $derived(!memoryPlace(n).fits);
  const colTop = $derived(Math.max(6, yOf(shownLog)));
  const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
  const sup = (k: number) => [...String(k)].map((d) => SUP[Number(d)]).join("");

  let cancel = () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => (cancel(), clearTimeout(timer)));

  $effect(() => {
    if (slide !== "board") return;
    const target = n * Math.log10(2);
    set("n", n);
    const start = untrack(() => shownLog);
    cancel();
    cancel = animate(400, (f) => (shownLog = start + (target - start) * f));
    if (idx === NS.length - 1) done();
  });

  /* Ритм: остатки a¹ … a⁸ по модулю n; ряд повторяется с индекса r. */
  const A = scenario.shor_a;
  const MOD = scenario.shor_n;
  const { r, p, q } = shorFactors(A, MOD);
  const ROW = powersMod(A, MOD, 8);
  const cx = (i: number) => 40 + i * 80;
  const cy = (v: number) => 250 - (v / (MOD - 1)) * 150;
  let found = $state(false);
  let shake = $state(-1);

  function tap(i: number) {
    if (slide !== "rhythm" || found) return;
    if (i !== r) {
      shake = i;
      clearTimeout(timer);
      timer = setTimeout(() => (shake = -1), reducedMotion() ? 0 : 300);
      return;
    }
    found = true;
    done();
  }

  /* Длина шифра: рекорд обычных компьютеров и шифр банка. */
  const { rsa250, rsa2048 } = params;
  const barW = (digits: number) => (digits / rsa2048.digits) * 430;
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={t.label[phase]}>
    {#if phase === "night"}
      <Peep who="nina" size={150} x={30} y={150} />
      <g class="cluster">
        {#each BONDS as [a, b]}<line x1={ATOMS[a][0]} y1={ATOMS[a][1]} x2={ATOMS[b][0]} y2={ATOMS[b][1]} />{/each}
        {#each ATOMS as [x, y, el]}
          <circle class={el} cx={x} cy={y} r="24" />
          <text x={x} y={y + 8} text-anchor="middle">{t[el]}</text>
        {/each}
      </g>
    {:else if phase === "board"}
      <line class="axis" x1="60" y1={BASE} x2="60" y2="4" />
      <line class="axis" x1="60" y1={BASE} x2="470" y2={BASE} />
      {#each memoryScales as s}
        <g class="mark">
          <line x1="60" y1={yOf(Math.log10(s.capacity_numbers))} x2="470" y2={yOf(Math.log10(s.capacity_numbers))} />
          <text x="214" y={yOf(Math.log10(s.capacity_numbers)) - 8}>{ru.ch6.scales[s.id as keyof typeof ru.ch6.scales].short}</text>
        </g>
      {/each}
      <rect class="col" class:over x="110" y={colTop} width="80" height={BASE - colTop} />
      {#if over}<path class="arrow" d="M150 0 L176 22 L124 22 Z" />{/if}
      <text class="num pow" x="150" y="356" text-anchor="middle">2{sup(n)}</text>
      {#if slide === "become"}
        <Peep who="oracle" mood="happy" size={130} x={490} y={170} />
      {:else if slide === "thanks"}
        <Peep who="nina" size={130} x={490} y={170} />
      {:else}
        <Peep who="factory" mood={from("wall") ? "shock" : "calm"} size={130} x={490} y={170} />
      {/if}
    {:else}
      <g class="formula" class:docked={from("rhythm")}>
        <text class="big num" text-anchor="middle">{from("fifteen") ? `${MOD} = ${p} × ${q}` : t.formula}</text>
      </g>
      {#if from("rhythm")}
        {#if found}
          {#each [0, r] as s}
            <path class="bracket" d="M{cx(s) - 28} 78 V60 H{cx(s + r - 1) + 28} V78" />
          {/each}
          <text class="per" x={(cx(0) + cx(r - 1)) / 2} y="50" text-anchor="middle">{fill(t.period, { r: String(r) })}</text>
        {/if}
        {#each ROW as v, i}
          <g class="dot" class:shake={shake === i} class:hit={found && i >= r}>
            <circle cx={cx(i)} cy={cy(v)} r="24" />
            <text class="num" x={cx(i)} y={cy(v) + 8} text-anchor="middle">{v}</text>
            <text class="num exp" x={cx(i)} y="286" text-anchor="middle">{A}{sup(i + 1)}</text>
          </g>
        {/each}
      {/if}
      {#if from("rsa1")}
        <g class="bars">
          <text x="10" y="317">{fill(t.record, { year: String(rsa250.year) })}</text>
          <rect class="who-master" x="190" y="296" width={barW(rsa250.digits)} height="26" />
          <text class="num" x={200 + barW(rsa250.digits)} y="317">{fill(t.digits, { n: String(rsa250.digits) })}</text>
          <text x="10" y="349">{t.cipher}</text>
          <rect class="who-oracle" x="190" y="328" width={barW(rsa2048.digits)} height="26" />
          <text class="num inside" x="610" y="349" text-anchor="end">{fill(t.digits, { n: String(rsa2048.digits) })}</text>
        </g>
      {/if}
    {/if}
  </svg>
  {#if slide === "rhythm"}
    {#each ROW as v, i}
      <button
        class="tap"
        style="left: {(cx(i) / 640) * 100}%"
        aria-label={fill(t.circle, { i: String(i + 1), v: String(v) })}
        onclick={() => tap(i)}
      ></button>
    {/each}
  {/if}
  {#if slide === "board"}
    <LogSlider label={fill(t.slider, { n: String(n) })} min={0} max={NS.length - 1} step={1} bind:value={idx} />
  {/if}
</div>

<style>
  .scene { position: relative; }
  svg { width: 100%; height: auto; display: block; }
  text { font-size: 22px; fill: var(--ink); }
  .cluster line { stroke: var(--line); stroke-width: 4; }
  .cluster circle { stroke-width: 3; fill: var(--paper); }
  .cluster .fe { stroke: var(--nina); }
  .cluster .mo { stroke: var(--oracle); }
  .cluster text { font-weight: 600; }
  .axis { stroke: var(--ink); stroke-width: 2; }
  .mark line { stroke: var(--muted); stroke-width: 2; stroke-dasharray: 6 5; }
  .mark text { fill: var(--muted); }
  .col { fill: var(--factory); opacity: 0.85; }
  .col.over { fill: var(--muted); }
  .arrow { fill: var(--muted); }
  .pow { font-weight: 600; }
  .big { font-size: 48px; font-weight: 600; }
  .formula { transform: translate(320px, 196px); transition: transform 400ms ease-in-out; }
  .formula.docked { transform: translate(530px, 44px) scale(0.7); }
  .dot circle { fill: var(--paper); stroke: var(--oracle); stroke-width: 3; }
  .dot text { font-weight: 600; }
  .dot .exp { font-weight: 400; fill: var(--muted); }
  .dot.hit circle { fill: var(--oracle); }
  .dot.hit text:not(.exp) { fill: var(--paper); }
  .dot.shake { animation: shake 300ms ease-in-out; }
  @keyframes shake { 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
  .bracket { fill: none; stroke: var(--oracle); stroke-width: 3; }
  .per { font-weight: 600; fill: var(--oracle); }
  .bars rect { fill: var(--who); }
  .bars .inside { fill: var(--paper); font-weight: 600; }
  .bars .num:not(.inside) { font-weight: 600; }
  .tap {
    position: absolute;
    top: 21%;
    height: 54%;
    width: max(12.5%, 44px);
    transform: translateX(-50%);
    background: transparent;
    border: none;
    border-radius: 12px;
  }
</style>
