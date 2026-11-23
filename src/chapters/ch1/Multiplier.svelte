<script lang="ts">
  import { ru } from "../../i18n/ru";
  import { GATES, MUL_BITS, MUL_TICKS, ROW_TICKS } from "./numbers";

  /**
   * Умножение столбиком на реле: внутренности SVG 640×360; младший разряд справа.
   * На каждый разряд второго числа — строка из MUL_BITS вентилей «И» и одно сложение со сдвигом.
   */
  let { a, b, ticks }: { a: number; b: number; ticks: number } = $props();
  const t = ru.ch1.scene;

  const n = MUL_BITS;
  const R = ROW_TICKS;
  const bit = (v: number, k: number) => (v >> k) & 1;
  const IN = Array.from({ length: n }, (_, i) => i);
  const OUT = Array.from({ length: 2 * n }, (_, c) => c);
  const CELLS = Array.from({ length: R }, (_, k) => k);
  const colX = (c: number) => 602 - c * 58;
  const rowY = (j: number) => 136 + j * 28;

  const finished = $derived(ticks >= MUL_TICKS);
  /** Сумма после k завершённых строк. */
  const acc = (k: number) => a * (b & ((1 << k) - 1));
  /** Биты накопленной суммы: в текущей строке сложение готово поразрядно, по GATES тиков на разряд. */
  const sumBits = $derived.by(() => {
    if (finished) return OUT.map((c) => bit(a * b, c));
    const j = Math.min(n - 1, Math.floor(ticks / R));
    const inRow = ticks - j * R;
    const before = acc(j);
    const after = acc(j + 1);
    return OUT.map((c) => {
      const i = c - j;
      const ready = inRow > n && i >= 0 && i < n && inRow >= n + GATES * (i + 1);
      return bit(ready ? after : before, c);
    });
  });
</script>

<text class="dec num" x="20" y="56">{a}</text>
<text class="dec num" x="20" y="92">{b}</text>
<text class="op" x="150" y="92">×</text>
<line class="bar" x1="170" y1="106" x2="632" y2="106" />
{#each IN as i}
  <text class="digit num" x={colX(i)} y="56" text-anchor="middle">{bit(a, i)}</text>
  <text class="digit num" x={colX(i)} y="92" text-anchor="middle">{bit(b, i)}</text>
{/each}
{#each IN as j}
  {#each CELLS as k}
    {@const and = k < n}
    <rect class="g" class:and class:on={ticks > j * R + k} x={20 + k * 6} y={rowY(j) - 12 + (and ? 0 : 6)} width="5" height={and ? 14 : 8} />
  {/each}
  {#each IN as i}
    {#if ticks > j * R + i}
      <text class="digit row num" x={colX(j + i)} y={rowY(j)} text-anchor="middle">{bit(a, i) & bit(b, j)}</text>
    {/if}
  {/each}
{/each}
<line class="bar" x1="170" y1="236" x2="632" y2="236" />
<text class="dec num" x="20" y="268">{finished ? a * b : "?"}</text>
{#each OUT as c}
  <text class="digit sum num" x={colX(c)} y="268" text-anchor="middle">{sumBits[c]}</text>
{/each}
<rect class="g and on" x="20" y="340" width="5" height="14" />
<text class="clabel" x="32" y="352">{t.andCells}</text>
<rect class="g on" x="110" y="346" width="5" height="8" />
<text class="clabel" x="122" y="352">{t.sumCells}</text>

<style>
  .dec { font-size: 26px; font-weight: 600; fill: var(--muted); }
  .op { font-size: 30px; font-weight: 600; }
  .clabel { font-size: 16px; fill: var(--muted); }
  .digit { font-size: 26px; font-weight: 600; }
  .digit.row { animation: pop 200ms ease-out both; }
  .digit.sum { fill: var(--core); }
  .bar { stroke: var(--ink); stroke-width: 2; }
  .g { fill: var(--line); }
  .g.on { fill: var(--core); }
  @keyframes pop { from { opacity: 0; } }
</style>
