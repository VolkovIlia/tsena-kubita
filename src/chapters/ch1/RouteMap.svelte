<script lang="ts">
  import { onDestroy } from "svelte";
  import { bfsLayers, pathBack } from "../../model/route";
  import { reducedMotion } from "../../ui/motion";

  /** run — запустить волну; по её окончании и показу пути — onDone. */
  let { run, onDone, x = 0, y = 0, cell = 34 }: { run: boolean; onDone: () => void; x?: number; y?: number; cell?: number } =
    $props();
  const W = 15;
  const H = 9;
  const LAYER_MS = 80;
  const WALLS: [number, number][] = [
    [3, 0], [3, 1], [3, 2], [3, 3],
    [7, 5], [7, 6], [7, 7], [7, 8],
    [11, 1], [11, 2], [11, 3], [11, 4],
  ];
  const START: [number, number] = [0, 4];
  const FINISH = 4 * W + 14;
  const blocked = new Set(WALLS.map(([cx, cy]) => cy * W + cx));
  const dist = bfsLayers(W, H, START, blocked);
  const path = new Set(pathBack(dist, W, FINISH));
  const layers = Math.max(...dist);

  let layer = $state(-1);
  let showPath = $state(false);
  let timer: ReturnType<typeof setInterval> | undefined;
  let started = false;

  function finish() {
    clearInterval(timer);
    layer = layers;
    showPath = true;
    onDone();
  }

  $effect(() => {
    if (!run || started) return;
    started = true;
    if (reducedMotion()) return finish();
    timer = setInterval(() => (layer < layers ? (layer += 1) : finish()), LAYER_MS);
  });
  onDestroy(() => clearInterval(timer));
</script>

<g class="map" transform="translate({x} {y})">
  {#each dist as d, i}
    <rect
      x={(i % W) * cell}
      y={Math.floor(i / W) * cell}
      width={cell - 2}
      height={cell - 2}
      class:wall={blocked.has(i)}
      class:reached={d >= 0 && d <= layer}
      class:path={showPath && path.has(i)}
    />
  {/each}
  <circle cx={START[0] * cell + cell / 2} cy={START[1] * cell + cell / 2} r={cell / 3.5} class="end" />
  <circle cx={(FINISH % W) * cell + cell / 2} cy={Math.floor(FINISH / W) * cell + cell / 2} r={cell / 3.5} class="end" />
</g>

<style>
  rect { fill: var(--grid); stroke: var(--line); }
  rect.reached { fill: color-mix(in srgb, var(--master) 30%, var(--paper)); }
  rect.path { fill: var(--master); }
  rect.wall { fill: var(--ink); }
  .end { fill: var(--margo); }
</style>
