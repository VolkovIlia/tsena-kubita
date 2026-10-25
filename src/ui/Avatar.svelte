<script lang="ts">
  import type { Speaker } from "./types";

  let { who, size = 48 }: { who: Speaker; size?: number } = $props();
  const grid = (n: number, step: number, start: number) =>
    Array.from({ length: n * n }, (_, i) => [start + (i % n) * step, start + Math.floor(i / n) * step]);
</script>

<svg class="who-{who}" width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
  {#if who === "master"}
    <circle cx="20" cy="20" r="12" fill="none" stroke="var(--who)" stroke-width="3" />
    <line x1="29" y1="29" x2="42" y2="42" stroke="var(--who)" stroke-width="5" stroke-linecap="round" />
  {:else if who === "brigade"}
    {#each grid(8, 5, 6.5) as [x, y]}<circle cx={x} cy={y} r="1.7" fill="var(--who)" />{/each}
  {:else if who === "factory"}
    {#each grid(16, 2.6, 3) as [x, y]}<rect x={x} y={y} width="2" height="2" fill="var(--who)" />{/each}
  {:else if who === "oracle"}
    <rect x="13" y="5" width="22" height="38" rx="5" fill="none" stroke="var(--who)" stroke-width="2.5" />
    {#each [15, 24, 33] as y}
      <line x1="10" y1={y} x2="38" y2={y} stroke="var(--who)" stroke-width="2" stroke-dasharray="2 2" />
    {/each}
  {:else}
    <rect x="11" y="5" width="26" height="38" rx="3" fill="none" stroke="var(--who)" stroke-width="2.5" />
    <line x1="16" y1="13" x2="32" y2="13" stroke="var(--who)" stroke-width="2" />
    <line x1="16" y1="19" x2="28" y2="19" stroke="var(--who)" stroke-width="2" />
    <circle cx="24" cy="37" r="2" fill="var(--who)" />
  {/if}
</svg>
