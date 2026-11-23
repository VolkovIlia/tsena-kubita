<script lang="ts">
  import { ru } from "../../i18n/ru";
  import { ADD_TICKS, BITS, GATES } from "./numbers";

  /** Сумматор на реле: внутренности SVG 640×360; младший разряд справа. ticks — сколько вентилей уже сработало. */
  let { a, b, ticks }: { a: number; b: number; ticks: number } = $props();
  const t = ru.ch1.scene;

  const bit = (v: number, j: number) => (v >> j) & 1;
  const COLS = Array.from({ length: BITS }, (_, j) => j);
  const colX = (j: number) => 602 - j * 58;
  /** carries[j] — перенос в разряд j. */
  const carries = $derived.by(() => {
    const c = Array.from({ length: BITS + 1 }, () => 0);
    for (let j = 0; j < BITS; j++) c[j + 1] = (bit(a, j) + bit(b, j) + c[j]) >> 1;
    return c;
  });
  const sum = $derived(a + b);
  const finished = $derived(ticks >= ADD_TICKS);
  const lit = (j: number) => Math.max(0, Math.min(GATES, ticks - j * GATES));
</script>

<text class="dec num" x="20" y="112">{a}</text>
<text class="dec num" x="20" y="152">{b}</text>
<text class="dec num" x="20" y="200">{finished ? sum : "?"}</text>
<text class="plus" x="120" y="152">+</text>
<text class="clabel" x="20" y="72">{t.carry}</text>
<line class="bar" x1="140" y1="166" x2="632" y2="166" />
{#each COLS as j}
  {@const n = lit(j)}
  <g>
    {#if j > 0 && lit(j - 1) === GATES}<text class="carry num" x={colX(j)} y="72" text-anchor="middle">{carries[j]}</text>{/if}
    <text class="digit num" x={colX(j)} y="112" text-anchor="middle">{bit(a, j)}</text>
    <text class="digit num" x={colX(j)} y="152" text-anchor="middle">{bit(b, j)}</text>
    {#if n === GATES}<text class="digit sum num" x={colX(j)} y="200" text-anchor="middle">{bit(sum, j)}</text>{/if}
    <rect class="adderbox" x={colX(j) - 26} y="218" width="52" height="40" rx="4" />
    {#each Array.from({ length: GATES }, (_, k) => k) as k}
      <rect class="g" class:on={k < n} x={colX(j) - 24 + k * 10} y="234" width="8" height="8" />
    {/each}
  </g>
{/each}
{#if finished && carries[BITS]}<text class="digit sum num" x={colX(BITS)} y="200" text-anchor="middle">1</text>{/if}

<style>
  .dec { font-size: 26px; font-weight: 600; fill: var(--muted); }
  .plus { font-size: 30px; font-weight: 600; }
  .clabel { font-size: 16px; fill: var(--muted); }
  .digit { font-size: 30px; font-weight: 600; }
  .digit.sum { fill: var(--core); animation: pop 200ms ease-out both; }
  .carry { font-size: 18px; fill: var(--core); }
  .adderbox { fill: var(--paper); stroke: var(--line); stroke-width: 2; }
  .bar { stroke: var(--ink); stroke-width: 2; }
  .g { fill: var(--line); }
  .g.on { fill: var(--core); }
  @keyframes pop { from { opacity: 0; } }
</style>
