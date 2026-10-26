<script lang="ts">
  /**
   * Кубит стрелкой внутри чужого <svg>: вверх — «0», вправо — «1». Тень стрелки на каждую ось — амплитуда
   * (для действительных амплитуд это точно). mirror — линия вентиля H: отражение относительно прямой под 22,5°
   * от «0» к «1» переводит (a0, a1) в ((a0+a1)/√2, (a0−a1)/√2).
   */
  let {
    a0,
    a1,
    cx,
    cy,
    r,
    labels,
    mirror = false,
  }: { a0: number; a1: number; cx: number; cy: number; r: number; labels: [string, string]; mirror?: boolean } = $props();

  const tipX = $derived(cx + a1 * r);
  const tipY = $derived(cy - a0 * r);
  const M = Math.PI / 8;
</script>

<g class="arrow ex-qc">
  <circle class="ring" {cx} {cy} {r} />
  <line class="axis" x1={cx} y1={cy + r + 10} x2={cx} y2={cy - r - 10} />
  <line class="axis" x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} />
  <text x={cx} y={cy - r - 18} text-anchor="middle">{labels[0]}</text>
  <text x={cx + r + 16} y={cy + 8} text-anchor="start">{labels[1]}</text>
  {#if mirror}
    <line class="mirror" x1={cx - Math.sin(M) * r * 1.15} y1={cy + Math.cos(M) * r * 1.15} x2={cx + Math.sin(M) * r * 1.15} y2={cy - Math.cos(M) * r * 1.15} />
    <text class="mtag" x={cx + Math.sin(M) * r * 1.2 + 4} y={cy - Math.cos(M) * r * 1.2} text-anchor="start">H</text>
  {/if}
  <!-- тени стрелки на оси: это и есть амплитуды «0» и «1» -->
  <line class="shadow" x1={cx} y1={cy} x2={cx} y2={tipY} />
  <line class="shadow" x1={cx} y1={cy} x2={tipX} y2={cy} />
  <line class="guide" x1={tipX} y1={tipY} x2={cx} y2={tipY} />
  <line class="guide" x1={tipX} y1={tipY} x2={tipX} y2={cy} />
  <line class="shaft" x1={cx} y1={cy} x2={tipX} y2={tipY} />
  <circle class="tip" cx={tipX} cy={tipY} r="7" />
</g>

<style>
  .ring { fill: none; stroke: var(--line); stroke-width: 2; }
  .axis { stroke: var(--muted); stroke-width: 1.5; }
  .mirror { stroke: var(--ink); stroke-width: 2.5; stroke-dasharray: 8 5; }
  .mtag { font-size: 20px; font-weight: 700; }
  .shadow { stroke: var(--ex); stroke-width: 10; stroke-linecap: round; opacity: 0.55; }
  .guide { stroke: var(--ex); stroke-width: 1.5; stroke-dasharray: 4 4; }
  .shaft { stroke: var(--ex); stroke-width: 5; stroke-linecap: round; }
  .tip { fill: var(--ex); }
  text { font-size: 22px; font-weight: 600; }
</style>
