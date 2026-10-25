<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ru } from "../../i18n/ru";
  import { bfsLayers, pathBack } from "../../model/route";
  import { reducedMotion } from "../../ui/motion";

  let { onDone }: { onDone: () => void } = $props();
  const W = 15;
  const H = 9;
  const CELL = 40;
  const LAYER_MS = 80;
  const WALLS: [number, number][] = [
    [3, 0], [3, 1], [3, 2], [3, 3],
    [7, 5], [7, 6], [7, 7], [7, 8],
    [11, 1], [11, 2], [11, 3], [11, 4],
  ];
  const START: [number, number] = [0, 4];
  const FINISH = 4 * W + 14;
  const blocked = new Set(WALLS.map(([x, y]) => y * W + x));
  const dist = bfsLayers(W, H, START, blocked);
  const path = new Set(pathBack(dist, W, FINISH));
  const layers = Math.max(...dist);

  let layer = $state(-1);
  let showPath = $state(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    const finish = () => {
      clearInterval(timer);
      layer = layers;
      showPath = true;
      onDone();
    };
    if (reducedMotion()) return finish();
    timer = setInterval(() => (layer < layers ? (layer += 1) : finish()), LAYER_MS);
  });
  onDestroy(() => clearInterval(timer));
</script>

<svg viewBox="0 0 {W * CELL} {H * CELL}" role="img" aria-label={ru.ch4.screen6.map}>
  {#each dist as d, i}
    {@const x = (i % W) * CELL}
    {@const y = Math.floor(i / W) * CELL}
    <rect
      {x}
      {y}
      width={CELL - 2}
      height={CELL - 2}
      class:wall={blocked.has(i)}
      class:reached={d >= 0 && d <= layer}
      class:path={showPath && path.has(i)}
    />
  {/each}
  <circle cx={START[0] * CELL + CELL / 2} cy={START[1] * CELL + CELL / 2} r="10" class="end" />
  <circle cx={(FINISH % W) * CELL + CELL / 2} cy={Math.floor(FINISH / W) * CELL + CELL / 2} r="10" class="end" />
</svg>

<style>
  svg { width: 100%; height: auto; display: block; margin: 1rem 0; }
  rect { fill: var(--grid); stroke: var(--line); }
  rect.reached { fill: color-mix(in srgb, var(--master) 30%, var(--paper)); }
  rect.path { fill: var(--master); }
  rect.wall { fill: var(--ink); }
  .end { fill: var(--margo); }
</style>
