<script lang="ts">
  import { fill, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { mean, probabilities, type Amps } from "../../model/statevector";

  let {
    amps,
    target,
    showMean,
    opened = null,
  }: { amps: Amps; target: number | null; showMean: boolean; opened?: number | null } = $props();

  const GUTTER = 84;
  const SLOT = 80;
  const W = $derived(GUTTER + amps.length * SLOT);
  // Амплитуда лежит в [−1, 1]: место и над осью, и под ней.
  const AXIS = 196;
  const SCALE = 130;

  const label = $derived(
    probabilities(amps)
      .map((p, i) => fill(ru.ch3.scene.door, { i: String(i + 1), p: fmtPercent(p) }))
      .join(", "),
  );
  const m = $derived(mean(amps));
</script>

<svg viewBox="0 0 {W} 330" role="img" aria-label={label}>
  {#each amps as a, i}
    {@const x = GUTTER + i * SLOT}
    <rect class="door" class:open={opened === i} x={x + 12} y="4" width={SLOT - 24} height="56" rx="3" />
    {#if opened === i}
      {#if i === target}
        <circle class="prize" cx={x + SLOT / 2} cy="32" r="13" />
      {:else}
        <line class="empty" x1={x + SLOT / 2 - 10} y1="32" x2={x + SLOT / 2 + 10} y2="32" />
      {/if}
    {/if}
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
      <text x="2" y={AXIS - 8}>{ru.ch3.scene.mean}</text>
    </g>
  {/if}
</svg>

<style>
  svg { width: 100%; height: auto; display: block; margin: 1rem 0; }
  .door { fill: none; stroke: var(--muted); stroke-width: 2; }
  .door.open { stroke: var(--ink); }
  .prize { fill: var(--margo); }
  .empty { stroke: var(--muted); stroke-width: 3; }
  .bar {
    fill: var(--oracle);
    transform-box: fill-box;
    transform-origin: center bottom;
    transition: transform 400ms ease;
    stroke-width: 3;
    vector-effect: non-scaling-stroke;
  }
  .bar.target { stroke: var(--margo); }
  .axis { stroke: var(--ink); stroke-width: 1.5; }
  .mean { transition: transform 400ms ease; }
  .mean line { stroke: var(--ink); stroke-width: 1.5; stroke-dasharray: 6 5; }
  .mean text { font-size: 22px; }
</style>
