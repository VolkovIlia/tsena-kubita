<script lang="ts">
  /**
   * Карта города сверху, как в навигаторе: кварталы с домами, улицы, река с двумя мостами и пруд.
   * Перекрёстки — пересечения улиц. Волна Дейкстры расходится от старта по улицам (в ширину — для кварталов
   * равной длины), затем загорается кратчайший путь к финишу.
   */
  import { onDestroy } from "svelte";
  import { ru } from "../../i18n/ru";
  import { bfsLayers, pathBack } from "../../model/route";
  import { reducedMotion } from "../../ui/motion";

  /** run — запустить волну; по её окончании и показу пути — onDone. */
  let { run, onDone, x = 0, y = 0, cell = 34 }: { run: boolean; onDone: () => void; x?: number; y?: number; cell?: number } =
    $props();
  const t = ru.ch2.scene;
  /** Перекрёстков по горизонтали и вертикали. */
  const W = 10;
  const H = 6;
  const LAYER_MS = 160;
  const START: [number, number] = [0, 2];
  const FINISH = 3 * W + 9;
  /** Река течёт по линии перекрёстков RIVER; мосты — только в рядах BRIDGES. */
  const RIVER = 6;
  const BRIDGES = [0, 4];
  /** Пруд закрывает перекрёстки x 2…3, y 2…3 — прямо на прямой дороге от старта; вокруг него парк. */
  const POND = { x0: 2, x1: 3, y0: 2, y1: 3 };
  const inPark = (bx: number, by: number) => bx >= POND.x0 - 1 && bx <= POND.x1 && by >= POND.y0 - 1 && by <= POND.y1;
  /** Застройка квартала: доли участков (x, y, ширина, высота) — четыре рисунка, чтобы город не был вафлей. */
  const LOTS = [
    [[0, 0, 1, 1]],
    [[0, 0, 0.48, 1], [0.52, 0, 0.48, 1]],
    [[0, 0, 1, 0.45], [0, 0.55, 0.6, 0.45], [0.66, 0.55, 0.34, 0.45]],
    [[0, 0, 0.48, 0.48], [0.52, 0, 0.48, 0.48], [0, 0.52, 0.48, 0.48], [0.52, 0.52, 0.48, 0.48]],
  ];

  const inPond = (cx: number, cy: number) => cx >= POND.x0 && cx <= POND.x1 && cy >= POND.y0 && cy <= POND.y1;
  const blocked = new Set(
    Array.from({ length: W * H }, (_, i) => i).filter((i) => {
      const cx = i % W;
      const cy = Math.floor(i / W);
      return (cx === RIVER && !BRIDGES.includes(cy)) || inPond(cx, cy);
    }),
  );
  const dist = bfsLayers(W, H, START, blocked);
  const path = pathBack(dist, W, FINISH);
  const layers = Math.max(...dist);

  const px = (i: number) => (i % W) * cell + cell / 2;
  const py = (i: number) => Math.floor(i / W) * cell + cell / 2;
  /** Улицы — отрезки между соседними перекрёстками; через воду улиц нет, кроме мостов. */
  const streets = Array.from({ length: W * H }, (_, i) => i)
    .flatMap((i) => [...(i % W < W - 1 ? [[i, i + 1]] : []), ...(i + W < W * H ? [[i, i + W]] : [])])
    .filter(([a, b]) => !blocked.has(a) && !blocked.has(b));
  const bridges = streets.filter(([a, b]) => Math.floor(a / W) === Math.floor(b / W) && [a % W, b % W].includes(RIVER));
  const ROAD = $derived(cell * 0.32);
  const pathD = $derived(path.map((i, k) => `${k ? "L" : "M"} ${px(i)} ${py(i)}`).join(" "));
  /** Река — полоса с плавными берегами вдоль линии RIVER. */
  const riverD = $derived.by(() => {
    const cx = RIVER * cell + cell / 2;
    const half = cell * 0.42;
    const h = H * cell;
    const wob = cell * 0.18;
    return `M ${cx - half} 0 C ${cx - half - wob} ${h * 0.3}, ${cx - half + wob} ${h * 0.6}, ${cx - half} ${h}
            L ${cx + half} ${h} C ${cx + half + wob} ${h * 0.6}, ${cx + half - wob} ${h * 0.3}, ${cx + half} 0 Z`;
  });

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
  const reached = (i: number) => dist[i] >= 0 && dist[i] <= layer;
  const startI = START[1] * W + START[0];
</script>

<g class="map" transform="translate({x} {y})">
  <rect class="land" x="0" y="0" width={W * cell} height={H * cell} rx="6" />
  {#each Array.from({ length: (W - 1) * (H - 1) }, (_, k) => k) as k}
    {@const bx = k % (W - 1)}
    {@const by = Math.floor(k / (W - 1))}
    {@const ox = bx * cell + cell / 2 + ROAD / 2 + 3}
    {@const oy = by * cell + cell / 2 + ROAD / 2 + 3}
    {@const side = cell - ROAD - 6}
    {#if bx === RIVER - 1 || bx === RIVER}
      <!-- вдоль реки — набережная без домов -->
    {:else if inPark(bx, by)}
      <!-- парк рисуется целиком ниже -->
    {:else}
      {#each LOTS[(bx * 7 + by * 3) % LOTS.length] as [lx, ly, lw, lh]}
        <rect class="house" x={ox + lx * side} y={oy + ly * side} width={lw * side} height={lh * side} rx="1.5" />
      {/each}
    {/if}
  {/each}
  <rect
    class="park"
    x={(POND.x0 - 1) * cell + cell / 2 + ROAD / 2}
    y={(POND.y0 - 1) * cell + cell / 2 + ROAD / 2}
    width={(POND.x1 - POND.x0 + 2) * cell - ROAD}
    height={(POND.y1 - POND.y0 + 2) * cell - ROAD}
    rx="4"
  />
  <path class="water" d={riverD} />
  <rect
    class="water"
    x={POND.x0 * cell + cell * 0.15}
    y={POND.y0 * cell + cell * 0.15}
    width={(POND.x1 - POND.x0 + 1) * cell - cell * 0.3}
    height={(POND.y1 - POND.y0 + 1) * cell - cell * 0.3}
    rx={cell * 0.7}
  />
  {#each streets as [a, b]}
    <line class="edge" x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} stroke-width={ROAD + 2} />
  {/each}
  {#each streets as [a, b]}
    <line class="road" class:lit={!showPath && reached(a) && reached(b)} x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} stroke-width={ROAD} />
  {/each}
  {#each bridges as [a, b]}
    {#each [-1, 1] as side}
      <line class="rail" x1={px(a)} y1={py(a) + (side * ROAD) / 2} x2={px(b)} y2={py(b) + (side * ROAD) / 2} />
    {/each}
  {/each}
  {#if showPath}<path class="route" d={pathD} stroke-width={ROAD * 0.75} />{/if}
  <text class="tag water-tag" x={RIVER * cell + cell / 2} y={H * cell - 8} text-anchor="middle">{t.river}</text>
  <text class="tag water-tag" x={((POND.x0 + POND.x1 + 1) / 2) * cell} y={((POND.y0 + POND.y1 + 1) / 2) * cell + 4} text-anchor="middle">{t.pond}</text>
  <!-- старт — «ты здесь», как в навигаторе; финиш — красная булавка -->
  <circle class="here-halo" cx={px(startI)} cy={py(startI)} r={cell * 0.32} />
  <circle class="here" cx={px(startI)} cy={py(startI)} r={cell * 0.14} />
  <text class="endlabel" x={px(startI) + 4} y={py(startI) + 24} text-anchor="start">{t.start}</text>
  <g transform="translate({px(FINISH)} {py(FINISH)})">
    <path class="pin" d="M 0 0 C -12 -14, -12 -30, 0 -30 C 12 -30, 12 -14, 0 0 Z" />
    <circle class="pin-dot" cx="0" cy="-20" r="4" />
  </g>
  <text class="endlabel" x={px(FINISH) - 4} y={py(FINISH) + 22} text-anchor="end">{t.finish}</text>
</g>

<style>
  .land { fill: var(--map-land); stroke: var(--map-edge); }
  .house { fill: var(--map-house); }
  .park { fill: var(--map-park); }
  .water { fill: var(--map-water); }
  .edge { stroke: var(--map-edge); stroke-linecap: round; }
  .road { stroke: var(--map-road); stroke-linecap: round; transition: stroke 150ms; }
  .road.lit { stroke: color-mix(in srgb, var(--map-route) 30%, var(--map-road)); }
  .rail { stroke: var(--map-edge); stroke-width: 2; }
  .route { fill: none; stroke: var(--map-route); stroke-linecap: round; stroke-linejoin: round; }
  .tag { font-size: 12px; font-style: italic; }
  .water-tag { fill: color-mix(in srgb, var(--map-water) 35%, var(--ink)); }
  .here-halo { fill: color-mix(in srgb, var(--map-route) 25%, transparent); }
  .here { fill: var(--map-route); stroke: #fff; stroke-width: 2.5; }
  .pin { fill: var(--map-pin); stroke: var(--paper); stroke-width: 1.5; }
  .pin-dot { fill: var(--paper); }
  .endlabel { font-size: 13px; font-weight: 700; paint-order: stroke; stroke: var(--map-land); stroke-width: 3px; }
</style>
