<script lang="ts">
  import { fill, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { mean, probabilities, type Amps } from "../../model/statevector";

  /** Двери с призом и столбики амплитуд под ними; target — отмеченная дверь (null — ещё не показана). */
  let { amps, target, showMean }: { amps: Amps; target: number | null; showMean: boolean } = $props();

  const GUTTER = 84;
  const SLOT = 80;
  const W = $derived(GUTTER + amps.length * SLOT);
  // Амплитуда лежит в [−1, 1]: место и над осью, и под ней.
  const AXIS = 196;
  const SCALE = 130;

  const label = $derived(
    probabilities(amps)
      .map((p, i) => fill(ru.ch6.scene.door, { i: String(i + 1), p: fmtPercent(p) }))
      .join(", "),
  );
  const m = $derived(mean(amps));
</script>

<svg viewBox="0 0 {W} 330" role="img" aria-label={label}>
  {#each amps as a, i}
    {@const x = GUTTER + i * SLOT}
    <rect class="door" class:target={i === target} x={x + 12} y="4" width={SLOT - 24} height="56" rx="3" />
    <rect
      class="bar"
      class:target={i === target}
      x={x + 14}
      y={AXIS - SCALE}
      width={SLOT - 28}
      height={SCALE}
      style:transform="scaleY({a})"
    />
  {/each}
  <line class="axis" x1={GUTTER} y1={AXIS} x2={W} y2={AXIS} />
  {#if showMean}
    <g class="mean" style:transform="translateY({-m * SCALE}px)">
      <line x1="0" y1={AXIS} x2={W} y2={AXIS} />
      <text x="2" y={AXIS - 8}>{ru.ch6.scene.mean}</text>
    </g>
  {/if}
</svg>

<style>
  svg { width: 100%; height: auto; display: block; margin: 0.5rem 0; }
  .door { fill: none; stroke: var(--muted); stroke-width: 2; }
  .door.target { stroke: var(--ink); stroke-width: 3; }
  .bar {
    fill: var(--qc);
    transform-box: fill-box;
    transform-origin: center bottom;
    transition: transform 400ms ease;
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
  }
  .bar.target { stroke: var(--ink); }
  .axis { stroke: var(--ink); stroke-width: 1.5; }
  .mean { transition: transform 400ms ease; }
  .mean line { stroke: var(--ink); stroke-width: 1.5; stroke-dasharray: 6 5; }
  .mean text { font-size: 22px; fill: var(--ink); }
  @media (prefers-reduced-motion: reduce) {
    .bar, .mean { transition: none; }
  }
</style>
