<script lang="ts">
  /**
   * Кубит стрелкой внутри чужого <svg>: вверх — «0», вправо — «1». Тень стрелки на каждую ось — амплитуда
   * (для действительных амплитуд это точно). ghost — пунктирная стрелка: куда её поставит вентиль-поворот.
   */
  let {
    a0,
    a1,
    cx,
    cy,
    r,
    labels,
    ghost = null,
  }: { a0: number; a1: number; cx: number; cy: number; r: number; labels: [string, string]; ghost?: [number, number] | null } = $props();

  const tipX = $derived(cx + a1 * r);
  const tipY = $derived(cy - a0 * r);
</script>

<g class="arrow ex-qc">
  <circle class="ring" {cx} {cy} {r} />
  <line class="axis" x1={cx} y1={cy + r + 10} x2={cx} y2={cy - r - 10} />
  <line class="axis" x1={cx - r - 10} y1={cy} x2={cx + r + 10} y2={cy} />
  <text x={cx} y={cy - r - 18} text-anchor="middle">{labels[0]}</text>
  <text x={cx + r + 16} y={cy + 8} text-anchor="start">{labels[1]}</text>
  {#if ghost}
    <line class="ghost" x1={cx} y1={cy} x2={cx + ghost[1] * r} y2={cy - ghost[0] * r} />
    <circle class="ghost-tip" cx={cx + ghost[1] * r} cy={cy - ghost[0] * r} r="6" />
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
  .ghost { stroke: var(--ink); stroke-width: 2.5; stroke-dasharray: 8 5; stroke-linecap: round; }
  .ghost-tip { fill: none; stroke: var(--ink); stroke-width: 2.5; stroke-dasharray: 4 3; }
  .shadow { stroke: var(--ex); stroke-width: 10; stroke-linecap: round; opacity: 0.55; }
  .guide { stroke: var(--ex); stroke-width: 1.5; stroke-dasharray: 4 4; }
  .shaft { stroke: var(--ex); stroke-width: 5; stroke-linecap: round; }
  .tip { fill: var(--ex); }
  text { font-size: 22px; font-weight: 600; }
</style>
