<script lang="ts">
  import { fill, fmtCount, fmtDuration, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { executors } from "../../model/tick";
  import Frame from "../../ui/Frame.svelte";
  import { exName } from "../../ui/names";
  import { Q_ADD, RELAY_ADD, X, Y } from "../ch5/numbers";
  import { CORE_ADD_S, QC_ADD_S } from "./numbers";

  /** Таблица цены сложения X + Y: тики, тики в секунду, время — у ядра и у квантового компьютера; на ставке время скрыто. */
  let { slide }: { slide: string } = $props();
  const t = ru.ch7.scene;

  const rows = $derived([
    { label: fill(t.ticksRow, { x: String(X), y: String(Y) }), core: fmtExact(RELAY_ADD), qc: fmtExact(Q_ADD) },
    { label: t.rateRow, core: fmtCount(executors.core.ops_per_s), qc: fmtCount(executors.qc.ops_per_s) },
    {
      label: t.timeRow,
      core: slide === "qprice" ? fmtDuration(CORE_ADD_S) : t.unknown,
      qc: slide === "qprice" ? fmtDuration(QC_ADD_S) : t.unknown,
    },
  ]);
</script>

<Frame>
  <svg viewBox="0 0 640 360" role="img" aria-label={t.priceLabel}>
    {#each [["core", 360], ["qc", 540]] as const as [who, x]}
      {@const name = exName(who)}
      {@const words = name.length > 10 ? name.split(" ") : [name]}
      <text class="name ex-{who}" {x} y={84 - 24 * words.length} text-anchor="middle">
        {#each words as w, i}<tspan {x} dy={i ? 24 : 0}>{w}</tspan>{/each}
      </text>
    {/each}
    {#each rows as row, i}
      <line class="rule" x1="20" y1={100 + i * 80} x2="630" y2={100 + i * 80} />
      <text class="rlabel" x="20" y={148 + i * 80}>{row.label}</text>
      <text class="rvalue num ex-core" x="360" y={148 + i * 80} text-anchor="middle">{row.core}</text>
      <text class="rvalue num ex-qc" x="540" y={148 + i * 80} text-anchor="middle">{row.qc}</text>
    {/each}
  </svg>
</Frame>

<style>
  .name { font-size: 24px; font-weight: 600; fill: var(--ex); }
  .rule { stroke: var(--line); stroke-width: 1.5; }
  .rlabel { font-size: 22px; fill: var(--muted); }
  .rvalue { font-size: 26px; font-weight: 600; }
</style>
