<script lang="ts" module>
  /** Регистр на схеме: подпись слева, провода сверху вниз от старшего разряда к младшему; answer — где лежит ответ. */
  export interface Group {
    label: string;
    rows: number[];
    answer?: boolean;
  }
</script>

<script lang="ts">
  import { ru } from "../../i18n/ru";
  import type { Circuit } from "../../model/circuit";

  /**
   * Схема на кубитах: провода по регистрам, вентили по столбцам; первые applied вентилей уже сработали.
   * Слева — каким был каждый кубит, справа — каким стал; у многоразрядного регистра справа ещё и число.
   * arrows — угол стрелки кубита в градусах (0 — «0», 90 — «1»), как на стрелке-поляризации. Рисует внутрь SVG 640 × 360.
   */
  let {
    circuit,
    applied,
    values,
    inputs,
    groups,
    marks = [],
    turnLabel = "",
    arrows = [],
    top = 60,
    maxGap = 40,
  }: {
    circuit: Circuit;
    applied: number;
    values: (number | null)[];
    inputs: (number | null)[];
    groups: Group[];
    marks?: { from: number; to: number; text: string }[];
    turnLabel?: string;
    arrows?: (number | null)[];
    top?: number;
    maxGap?: number;
  } = $props();
  const t = ru.ch5.scene;

  const IN_X = 72;
  const LEFT = 96;
  const RIGHT = 548;
  const OUT_X = 572;
  const ARROW_X = 608;
  const gap = $derived(Math.min(maxGap, 250 / Math.max(1, circuit.wires.length - 1)));
  const font = $derived(Math.min(22, gap * 0.7));
  const step = $derived((RIGHT - LEFT) / circuit.gates.length);
  /** Кружок ⊕ не шире столбца, чтобы соседние вентили не слипались. */
  const r = $derived(Math.min(9, step * 0.45));
  /** Строка провода на рисунке: порядок регистров и разрядов задают groups. */
  const rowOf = $derived.by(() => {
    const row: number[] = [];
    groups.flatMap((g) => g.rows).forEach((q, k) => (row[q] = k));
    return row;
  });
  const wy = (q: number) => top + rowOf[q] * gap;
  const gx = (k: number) => LEFT + (k + 0.5) * step;
  /** Число регистра из битов, старший сверху; «?», пока хоть один бит — смесь. */
  const number = (rows: number[], bits: (number | null)[]) =>
    rows.some((q) => bits[q] == null) ? "?" : String(rows.reduce((n, q) => 2 * n + (bits[q] ?? 0), 0));
  const answerRows = $derived(new Set(groups.filter((g) => g.answer).flatMap((g) => g.rows)));
  /** Провода вентиля: управляющие и целевой. */
  const parts = $derived(
    circuit.gates.map((g) =>
      g.kind === "cx" ? { ctrl: [g.c], t: g.t } : g.kind === "ccx" ? { ctrl: [g.c1, g.c2], t: g.t } : { ctrl: [], t: g.q },
    ),
  );
</script>

<!-- Заголовки колонок прижаты наружу: над вентилями висят метки «вверх» и «обратно». -->
<text class="colhead" x={IN_X + 12} y={top - 14} text-anchor="end">{t.was}</text>
<text class="colhead" x={OUT_X - 12} y={top - 14}>{t.now}</text>
{#each groups as g}
  {@const y1 = wy(g.rows[0])}
  {@const y2 = wy(g.rows[g.rows.length - 1])}
  <!-- Имя из одной-двух букв — размером с бит; слово вроде «перенос» мельче, чтобы влезть в колонку подписей. -->
  <text class="glabel" class:answer={g.answer} x="4" y={(y1 + y2) / 2} dy="0.35em" font-size={g.label.length > 2 ? 14 : font}>{g.label}</text>
  {#if g.rows.length > 1}
    <path class="brace" d="M 64 {y1 - gap * 0.35} L 60 {y1 - gap * 0.35} L 60 {y2 + gap * 0.35} L 64 {y2 + gap * 0.35}" />
    <path class="brace" d="M 582 {y1 - gap * 0.35} L 586 {y1 - gap * 0.35} L 586 {y2 + gap * 0.35} L 582 {y2 + gap * 0.35}" />
    <text class="gnum num" class:answer={g.answer} x="594" y={(y1 + y2) / 2} dy="0.35em" font-size={font}>{number(g.rows, values)}</text>
  {/if}
{/each}
{#each circuit.wires as _, q}
  <line class="wire" x1="84" y1={wy(q)} x2="558" y2={wy(q)} />
  <text class="bit in num" x={IN_X} y={wy(q)} dy="0.35em" text-anchor="middle" font-size={font}>{inputs[q] ?? "·"}</text>
  <text class="bit num" class:answer={answerRows.has(q)} x={OUT_X} y={wy(q)} dy="0.35em" text-anchor="middle" font-size={font}>{values[q] ?? "·"}</text>
  {#if arrows[q] != null}
    <g class="arrow" style:transform="translate({ARROW_X}px, {wy(q)}px) rotate({arrows[q]}deg)">
      <line x1="0" y1="14" x2="0" y2="-8" />
      <polygon points="0,-17 -6,-6 6,-6" />
    </g>
  {/if}
{/each}
{#each circuit.gates as g, k}
  {@const p = parts[k]}
  {@const x = gx(k)}
  <g class="gate" class:on={k < applied}>
    {#if g.kind === "turn"}
      <rect x={x - 11} y={wy(p.t) - 11} width="22" height="22" />
      <text class="turn" x={x} y={wy(p.t)} dy="0.35em" text-anchor="middle">{turnLabel}</text>
    {:else}
      {@const ys = [...p.ctrl, p.t].map(wy)}
      <line x1={x} y1={Math.min(...ys)} x2={x} y2={Math.max(...ys)} />
      {#each p.ctrl as c}<circle class="dot" cx={x} cy={wy(c)} r={Math.min(5, r * 0.6)} />{/each}
      <circle class="target" cx={x} cy={wy(p.t)} {r} />
      <line x1={x - r} y1={wy(p.t)} x2={x + r} y2={wy(p.t)} />
      <line x1={x} y1={wy(p.t) - r} x2={x} y2={wy(p.t) + r} />
    {/if}
  </g>
{/each}
{#each marks as m}
  {@const x1 = gx(m.from) - step / 2 + 2}
  {@const x2 = gx(m.to) + step / 2 - 2}
  <path class="mark" d="M {x1} 46 L {x1} 40 L {x2} 40 L {x2} 46" />
  <text class="mtext" x={(x1 + x2) / 2} y="34" text-anchor="middle">{m.text}</text>
{/each}

<style>
  .arrow { transition: transform 300ms; }
  .wire { stroke: var(--line); stroke-width: 2; }
  .colhead { font-size: 14px; fill: var(--muted); }
  .glabel { fill: var(--muted); font-style: italic; }
  .glabel.answer { fill: var(--ex); font-weight: 600; }
  .brace { fill: none; stroke: var(--muted); stroke-width: 1.5; }
  .gnum { font-weight: 600; fill: var(--muted); }
  .gnum.answer { fill: var(--ex); }
  .bit { font-weight: 600; }
  .bit.in { fill: var(--muted); font-weight: 400; }
  .bit.answer { fill: var(--ex); }
  .arrow line { stroke: var(--ex); stroke-width: 3; }
  .arrow polygon { fill: var(--ex); }
  .gate line, .gate rect, .gate .target { stroke: var(--line); stroke-width: 2; fill: var(--paper); transition: stroke 120ms; }
  .gate .dot { fill: var(--line); }
  .gate.on line, .gate.on rect, .gate.on .target { stroke: var(--ex); }
  .gate.on .dot { fill: var(--ex); }
  .turn { font-size: 10px; }
  .mark { fill: none; stroke: var(--muted); stroke-width: 1.5; }
  .mtext { font-size: 20px; fill: var(--muted); }
</style>
