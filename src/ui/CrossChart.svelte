<script lang="ts">
  import { fmtDuration, fmtSci } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { crossover, DAY, scenario, solveSeconds } from "../model/tick";

  let { speedup, checkTicks, logN }: { speedup: number; checkTicks: number; logN: number } = $props();

  const W = 640;
  const H = 360;
  const PAD = { left: 16, right: 16, top: 16, bottom: 40 };
  const X0 = scenario.slider_log_n_min;
  const X1 = scenario.slider_log_n_max;
  // Шкала времени фиксирована по крайним положениям ползунков, чтобы линии двигались, а не оси.
  const Y0 = Math.floor(Math.log10(solveSeconds("factory", 10 ** X0, scenario.check_ticks)));
  const Y1 = Math.ceil(Math.log10(solveSeconds("oracle", 10 ** X1, scenario.check_ticks_realistic)));
  const t = ru.ch4.screen5;
  const marks = [
    { s: 60, label: t.minute },
    { s: DAY, label: t.day },
    { s: 365 * DAY, label: t.year },
  ];

  const px = (logN: number) => PAD.left + ((logN - X0) / (X1 - X0)) * (W - PAD.left - PAD.right);
  const py = (seconds: number) =>
    H - PAD.bottom - ((Math.log10(seconds) - Y0) / (Y1 - Y0)) * (H - PAD.top - PAD.bottom);
  const line = (f: (n: number) => number) => `M${px(X0)},${py(f(10 ** X0))} L${px(X1)},${py(f(10 ** X1))}`;

  const cross = $derived(crossover("factory", checkTicks, speedup));
  const cx = $derived(px(Math.min(X1, Math.max(X0, Math.log10(cross.n)))));
  const cy = $derived(py(cross.seconds));
</script>

<svg viewBox="0 0 {W} {H}" role="img" aria-label="{t.question} N ≈ {fmtSci(cross.n)}, ≈ {fmtDuration(cross.seconds)}">
  {#each marks as m}
    <line class="ref" x1={PAD.left} x2={W - PAD.right} y1={py(m.s)} y2={py(m.s)} />
    <text class="ref-label" x={W - PAD.right} y={py(m.s) - 4} text-anchor="end">{m.label}</text>
  {/each}
  <line class="axis" x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} />
  <line class="axis" x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={H - PAD.bottom} />
  <path class="series who-factory" d={line((n) => solveSeconds("factory", n, checkTicks))} />
  <text class="series-label who-factory" x={PAD.left + 8} y={py(solveSeconds("factory", 10 ** X0, checkTicks)) - 10}>
    {ru.executors.factory}
  </text>
  <text class="series-label who-oracle" x={PAD.left + 8} y={py(solveSeconds("oracle", 10 ** X0, checkTicks, speedup)) - 10}>
    {ru.executors.oracle}
  </text>
  <path class="series who-oracle" d={line((n) => solveSeconds("oracle", n, checkTicks, speedup))} />
  <line class="now" x1={px(logN)} x2={px(logN)} y1={PAD.top} y2={H - PAD.bottom} />
  <line class="guide" x1={cx} x2={cx} y1={cy} y2={H - PAD.bottom} />
  <line class="guide" x1={PAD.left} x2={cx} y1={cy} y2={cy} />
  <circle class="cross" cx={cx} cy={cy} r="6" />
  <text class="tag" x={Math.min(cx, W - 120)} y={H - PAD.bottom + 24} text-anchor="middle">N ≈ {fmtSci(cross.n)}</text>
  <text class="tag" x={PAD.left + 6} y={cy - 8}>≈ {fmtDuration(cross.seconds)}</text>
  <text class="axis-label" x={PAD.left + 4} y={PAD.top + 14}>{t.axisT}</text>
  <text class="axis-label" x={W - PAD.right} y={H - 6} text-anchor="end">{t.axisN}</text>
</svg>

<style>
  svg { width: 100%; height: auto; display: block; margin: 1rem 0; font-size: 18px; }
  .axis { stroke: var(--ink); stroke-width: 1.5; }
  .ref { stroke: var(--line); stroke-dasharray: 4 6; }
  .ref-label, .axis-label { fill: var(--muted); font-size: 15px; }
  .series { fill: none; stroke: var(--who); stroke-width: 4; transition: d 300ms ease; }
  .now { stroke: var(--ink); stroke-width: 1; stroke-dasharray: 2 4; }
  .series-label { fill: var(--who); font-weight: 600; }
  .guide { stroke: var(--ink); stroke-width: 1; }
  .cross { fill: var(--margo); }
  .tag { font-weight: 600; }
</style>
