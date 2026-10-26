<script lang="ts">
  import type { Amps } from "../../model/statevector";

  /**
   * Ряд столбиков амплитуд внутри чужого <svg>: ось на высоте y, столбик единичной амплитуды — scale px.
   * Отрицательная амплитуда уходит под ось, подписи — под осью. lit — подсвеченный столбик (открытая дверь).
   */
  let {
    amps,
    x,
    y,
    w,
    scale,
    labels = [],
    lit = null,
  }: { amps: Amps; x: number; y: number; w: number; scale: number; labels?: string[]; lit?: number | null } = $props();

  const slot = $derived(w / amps.length);
  const bar = $derived(Math.max(2, slot * 0.6));
</script>

<g class="bars ex-qc">
  {#each amps as a, i}
    {@const cx = x + slot * (i + 0.5)}
    <rect class="bar" class:lit={lit === i} x={cx - bar / 2} y={y - scale} width={bar} height={scale} style:transform="scaleY({a})" />
    {#if labels[i]}<text x={cx} y={y + 30} text-anchor="middle" class:lit={lit === i}>{labels[i]}</text>{/if}
  {/each}
  <line class="axis" x1={x} y1={y} x2={x + w} y2={y} />
</g>

<style>
  .bar {
    fill: var(--ex);
    transform-box: fill-box;
    transform-origin: center bottom;
    transition: transform 400ms ease;
    stroke: var(--ink);
    stroke-width: 0;
    vector-effect: non-scaling-stroke;
  }
  .bar.lit { stroke-width: 4px; }
  .axis { stroke: var(--ink); stroke-width: 2; }
  text { font-size: 22px; }
  text.lit { font-weight: 700; }
</style>
