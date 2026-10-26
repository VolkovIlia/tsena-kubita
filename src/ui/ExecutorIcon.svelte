<script lang="ts">
  import type { ExecutorId } from "../model/tick";

  /** Значок исполнителя без лица: кристалл, решётка ядер, блоки видеокарты, ступени криостата. */
  let { ex, size = 40, x, y }: { ex: ExecutorId; size?: number; x?: number; y?: number } = $props();

  const grid = (n: number, step: number, start: number) =>
    Array.from({ length: n * n }, (_, i) => [start + (i % n) * step, start + Math.floor(i / n) * step]);
  /** Видеокарта: 4×3 блока, в каждом 4×4 точки. */
  const blocks = Array.from({ length: 12 }, (_, i) => [3 + (i % 4) * 11, 8 + Math.floor(i / 4) * 11]);
  /** Криостат-«люстра»: ступени сужаются книзу. */
  const stages = [
    [8, 6, 32],
    [11, 15, 26],
    [14, 24, 20],
    [17, 33, 14],
  ];
</script>

<svg class="ex-{ex}" {x} {y} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
  {#if ex === "core"}
    <rect x="12" y="12" width="24" height="24" rx="2" fill="none" stroke="var(--ex)" stroke-width="3" />
    <rect x="19" y="19" width="10" height="10" fill="var(--ex)" />
    {#each [17, 24, 31] as p}
      <line x1={p} y1="6" x2={p} y2="12" stroke="var(--ex)" stroke-width="2" />
      <line x1={p} y1="36" x2={p} y2="42" stroke="var(--ex)" stroke-width="2" />
      <line x1="6" y1={p} x2="12" y2={p} stroke="var(--ex)" stroke-width="2" />
      <line x1="36" y1={p} x2="42" y2={p} stroke="var(--ex)" stroke-width="2" />
    {/each}
  {:else if ex === "cores"}
    {#each grid(8, 5, 5) as [rx, ry]}<rect x={rx} y={ry} width="3.4" height="3.4" fill="var(--ex)" />{/each}
  {:else if ex === "gpu"}
    {#each blocks as [bx, by]}
      {#each grid(4, 2.4, 0) as [dx, dy]}<rect x={bx + dx} y={by + dy} width="1.7" height="1.7" fill="var(--ex)" />{/each}
    {/each}
  {:else}
    <line x1="24" y1="2" x2="24" y2="6" stroke="var(--ex)" stroke-width="2" />
    {#each stages as [sx, sy, w]}
      <rect x={sx} y={sy} width={w} height="5" rx="1" fill="none" stroke="var(--ex)" stroke-width="2" />
    {/each}
    {#each [[13, 11], [35, 11], [16, 20], [32, 20], [19, 29], [29, 29]] as [lx, ly]}
      <line x1={lx} y1={ly} x2={lx} y2={ly + 4} stroke="var(--ex)" stroke-width="1.5" />
    {/each}
    <rect x="20" y="40" width="8" height="5" fill="var(--ex)" />
  {/if}
</svg>
