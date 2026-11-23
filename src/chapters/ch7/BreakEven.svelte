<script lang="ts">
  import { fill, fmtCount, fmtDuration, fmtSci } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { DAY, DEFAULT_CHECK, executors, qcTicksFor, solveSeconds, workSeconds, type QTask } from "../../model/tick";
  import Frame from "../../ui/Frame.svelte";
  import { exName } from "../../ui/names";
  import { BITS, RELAY_ADD } from "../ch5/numbers";
  import { BREAK } from "./numbers";

  /** График безубыточности: время задачи у ядра и у квантового от её сложности в тиках ядра; обе оси логарифмические. */
  let { lines, find, onfound }: { lines: QTask[]; find: boolean; onfound?: () => void } = $props();
  const t = ru.ch7.scene;

  const core = (c: number) => solveSeconds("core", c, 1);
  const qc = (task: QTask, c: number) => workSeconds("qc", 1, qcTicksFor(task, c, BITS));

  /**
   * Рисунок 640×300, а не 16:9: на невысоком экране высоту картинки задаёт окно, и плоский рисунок при той же высоте
   * крупнее. Область графика и диапазоны: log10 тиков ядра по X, log10 секунд по Y.
   */
  const VB_H = 300;
  const [X0, X1, Y0, Y1] = [90, 610, 24, 240];
  const [LX0, LX1] = [1, 20];
  const LY0 = Math.floor(Math.log10(RELAY_ADD / executors.core.ops_per_s));
  const LY1 = Math.ceil(Math.log10(qc("mul", 10 ** LX1)));
  const px = (lx: number) => X0 + ((lx - LX0) / (LX1 - LX0)) * (X1 - X0);
  const py = (s: number) => Y1 - ((Math.log10(s) - LY0) / (LY1 - LY0)) * (Y1 - Y0);

  const POINTS = 60;
  const path = (from: number, sec: (c: number) => number) =>
    Array.from({ length: POINTS }, (_, i) => from + ((LX1 - from) * i) / (POINTS - 1))
      .map((lx, i) => `${i ? "L" : "M"} ${px(lx).toFixed(1)} ${py(sec(10 ** lx)).toFixed(1)}`)
      .join(" ");
  /** Поиск начинается с одного варианта: сложность не меньше цены одной проверки. */
  const FROM: Record<QTask, number> = { add: LX0, mul: LX0, search: Math.log10(DEFAULT_CHECK) };
  /** Легенда слева сверху: линии сложения и умножения почти сливаются, подписи у их концов наложились бы. */
  const legend = $derived([
    { ex: "core", line: "line", label: exName("core") },
    ...lines.map((task) => ({ ex: "qc", line: `line ${task}`, label: { add: t.lineAdd, mul: t.lineMul, search: t.lineSearch }[task] })),
  ]);

  const X_TICKS = [1, 5, 10, 15, 20];
  const Y_TICKS = [1e-9, 1e-3, 1, 365.25 * DAY];
  const BREAK_LX = Math.log10(BREAK.coreTicks);

  /** Курсор — с одного варианта поиска: меньше одной проверки задача поиска не бывает. */
  let x = $state(FROM.search);
  let found = false;
  const c = $derived(10 ** x);

  /**
   * Перетаскивание сами: Safari на iPhone не двигает range по касанию дорожки, только за бегунок, а он невидим.
   * Pointer-события одинаковы для мыши, пальца и пера; клавиатура и чтец экрана остаются на родном range.
   * Поле ввода стоит ровно над участком оси от FROM.search до LX1, поэтому курсор встаёт точно под палец.
   */
  let dragging = false;
  function dragTo(e: PointerEvent) {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const v = FROM.search + ((e.clientX - r.left) / r.width) * (LX1 - FROM.search);
    x = Math.min(LX1, Math.max(FROM.search, Math.round(v * 10) / 10));
  }
  function down(e: PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    (e.currentTarget as HTMLElement).focus();
    dragging = true;
    dragTo(e);
  }
  const move = (e: PointerEvent) => dragging && dragTo(e);
  const up = () => (dragging = false);
  $effect(() => {
    if (!find || found || x < BREAK_LX) return;
    found = true;
    onfound?.();
  });
</script>

<Frame w={640} h={VB_H}>
  <svg viewBox="0 0 640 {VB_H}" role="img" aria-label={t.evenLabel}>
    <line class="axis" x1={X0} y1={Y1} x2={X1} y2={Y1} />
    <line class="axis" x1={X0} y1={Y0} x2={X0} y2={Y1} />
    {#each X_TICKS as lx}
      <line class="grid" x1={px(lx)} y1={Y0} x2={px(lx)} y2={Y1} />
      <text class="tlabel num" x={px(lx)} y={Y1 + 22} text-anchor="middle">{fmtSci(10 ** lx)}</text>
    {/each}
    {#each Y_TICKS as s}
      <line class="grid" x1={X0} y1={py(s)} x2={X1} y2={py(s)} />
      <text class="tlabel num" x={X0 - 6} y={py(s)} dy="0.35em" text-anchor="end">{fmtDuration(s)}</text>
    {/each}
    <text class="alabel" x={(X0 + X1) / 2} y={VB_H - 8} text-anchor="middle">{t.axisX}</text>
    <text class="alabel" x="14" y={(Y0 + Y1) / 2} text-anchor="middle" transform="rotate(-90 14 {(Y0 + Y1) / 2})">{t.axisY}</text>

    <g class="ex-core"><path class="line" d={path(LX0, core)} /></g>
    <g class="ex-qc">
      {#each lines as task}<path class="line {task}" d={path(FROM[task], (v) => qc(task, v))} />{/each}
    </g>
    {#each legend as row, i}
      <g class="ex-{row.ex}">
        <line class={row.line} x1={X0 + 12} y1={40 + i * 22} x2={X0 + 42} y2={40 + i * 22} />
        <text class="lname" x={X0 + 50} y={40 + i * 22} dy="0.35em">{row.label}</text>
      </g>
    {/each}
    {#if lines.includes("search")}
      <circle class="even" cx={px(BREAK_LX)} cy={py(BREAK.seconds)} r="6" />
      <text class="elabel" x={px(BREAK_LX) - 10} y={py(BREAK.seconds) - 12} text-anchor="end">{t.breakEven}</text>
    {/if}
    {#if find}
      <line class="cursor" x1={px(x)} y1={Y0} x2={px(x)} y2={Y1} />
      <circle class="dot ex-core" cx={px(x)} cy={py(core(c))} r="5" />
      <circle class="dot ex-qc" cx={px(x)} cy={py(qc("search", c))} r="5" />
      <circle class="grip" cx={px(x)} cy={Y1} r="8" />
    {/if}
  </svg>
  {#if find}
    <!-- Ползунок — сама область графика: тянешь мышью или пальцем, стрелки с клавиатуры. Отдельный ползунок под графиком съедал бы высоту картинки. -->
    <input
      class="drag"
      type="range"
      min={FROM.search}
      max={LX1}
      step={0.1}
      bind:value={x}
      aria-label={t.axisX}
      aria-valuetext={fill(t.sliderTask, { n: fmtCount(c) })}
      style="left: {(px(FROM.search) / 640) * 100}%; width: {((X1 - px(FROM.search)) / 640) * 100}%; top: {(Y0 / VB_H) * 100}%; height: {((Y1 - Y0) / VB_H) * 100}%"
      onpointerdown={down}
      onpointermove={move}
      onpointerup={up}
      onpointercancel={up}
    />
  {/if}
</Frame>
{#if find}
  <p class="num reads">
    <span class="ex-core">{fill(t.readout, { who: exName("core"), ticks: fmtCount(c), t: fmtDuration(core(c)) })}</span>
    <span class="ex-qc">
      {fill(t.readout, { who: exName("qc"), ticks: fmtCount(qcTicksFor("search", c, BITS)), t: fmtDuration(qc("search", c)) })}
    </span>
  </p>
{/if}

<style>
  .axis { stroke: var(--ink); stroke-width: 1.5; }
  .grid { stroke: var(--line); stroke-width: 1; }
  .tlabel { font-size: 18px; fill: var(--muted); }
  .alabel { font-size: 19px; fill: var(--muted); }
  .line { fill: none; stroke: var(--ex); stroke-width: 2.5; }
  .line.mul { stroke-dasharray: 8 6; }
  .line.search { stroke-width: 5; }
  .lname { font-size: 19px; font-weight: 600; fill: var(--ex); }
  .even { fill: var(--paper); stroke: var(--ink); stroke-width: 3; }
  /* Подпись поверх линий читается: обводка цветом фона под буквами. */
  .elabel { font-size: 19px; font-weight: 600; paint-order: stroke; stroke: var(--paper); stroke-width: 5px; stroke-linejoin: round; }
  .cursor { stroke: var(--ink); stroke-width: 1.5; stroke-dasharray: 3 3; }
  .dot { fill: var(--ex); stroke: var(--paper); stroke-width: 2; }
  /* Обе машины — в одну строку: на невысоком экране каждая строка под графиком отнимает высоту у картинки. */
  .reads { display: flex; flex-wrap: wrap; gap: 0.25rem 1.5rem; margin: 0.25rem 0; font-weight: 600; }
  .reads span { color: var(--ex); }
  .grip { fill: var(--ink); stroke: var(--paper); stroke-width: 2; }
  /* Невидимый ползунок поверх области графика: значение — под пальцем, курсор рисует SVG. Вертикальный жест прокручивает страницу. */
  .drag { position: absolute; margin: 0; padding: 0; min-height: 0; appearance: none; -webkit-appearance: none; background: transparent; cursor: ew-resize; touch-action: pan-y; }
  .drag::-webkit-slider-runnable-track { height: 100%; background: transparent; }
  .drag::-webkit-slider-thumb { -webkit-appearance: none; width: 2px; height: 100%; background: transparent; border: none; }
  .drag::-moz-range-track { height: 100%; background: transparent; }
  .drag::-moz-range-thumb { width: 2px; height: 100%; background: transparent; border: none; }
</style>
