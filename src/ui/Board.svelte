<script lang="ts">
  /**
   * Табло сравнения: исполнители × показатели. Лучшее значение строки — в рамке,
   * мини-полоса — в логарифмическом масштабе. На узком экране исполнители идут строками.
   */
  import { fmtCount, fmtDuration } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { chainSeconds, DEFAULT_CHECK, executors, handSteps, hands, solveSeconds, type ExecutorId } from "../model/tick";
  import ExecutorIcon from "./ExecutorIcon.svelte";
  import { exName } from "./names";

  type Row = "hands" | "rate" | "steps" | "time";
  type Task = "split" | "chain" | "search";
  let {
    ids,
    rows,
    n = 1,
    ticks = DEFAULT_CHECK,
    task = "search",
    caption,
  }: { ids: ExecutorId[]; rows: Row[]; n?: number; ticks?: number; task?: Task; caption?: string } = $props();

  function value(row: Row, id: ExecutorId): number {
    if (row === "hands") return hands(id);
    if (row === "rate") return executors[id].ops_per_s;
    if (row === "steps") return task === "chain" ? n : handSteps(id, n);
    if (id === "qc" || task !== "chain") return solveSeconds(id, n, ticks);
    return chainSeconds(id, n, ticks);
  }

  function text(row: Row, v: number): string {
    if (row === "time") return fmtDuration(v);
    return fmtCount(v);
  }

  const table = $derived.by(() => {
    if (task !== "search" && ids.includes("qc")) throw new Error(`Board: квантовому компьютеру нет задачи ${task}`);
    return rows.map((row) => {
      const vs = ids.map((id) => value(row, id));
      const best = row === "hands" || row === "rate" ? Math.max(...vs) : Math.min(...vs);
      const lo = Math.log10(Math.min(...vs));
      const span = Math.log10(Math.max(...vs)) - lo || 1;
      return {
        row,
        cells: vs.map((v) => ({ v, best: v === best, w: 8 + (92 * (Math.log10(v) - lo)) / span })),
      };
    });
  });
</script>

<figure class="board">
  {#if caption}<figcaption>{caption}</figcaption>{/if}
  <table class="wide">
    <thead>
      <tr>
        <td></td>
        {#each ids as id (id)}
          <th scope="col" class="ex-{id}"><ExecutorIcon ex={id} size={20} /><span>{exName(id)}</span></th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each table as r (r.row)}
        <tr>
          <th scope="row">{ru.ui.board[r.row]}</th>
          {#each r.cells as c, i (ids[i])}
            <td class="ex-{ids[i]}" class:best={c.best}>
              <span class="num">{text(r.row, c.v)}</span>
              <span class="bar" style:width="{c.w}%"></span>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <table class="narrow">
    <thead>
      <tr>
        <td></td>
        {#each table as r (r.row)}<th scope="col">{ru.ui.board[r.row]}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each ids as id, i (id)}
        <tr class="ex-{id}">
          <th scope="row"><ExecutorIcon ex={id} size={20} /><span>{exName(id)}</span></th>
          {#each table as r (r.row)}
            {@const c = r.cells[i]}
            <td class:best={c.best}>
              <span class="num">{text(r.row, c.v)}</span>
              <span class="bar" style:width="{c.w}%"></span>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</figure>

<style>
  .board { margin: 0.25rem 0 0.5rem; max-width: 100%; }
  figcaption { font-weight: 600; font-size: 0.9375rem; margin-bottom: 0.125rem; }
  table { border-collapse: separate; border-spacing: 0.25rem 0.125rem; width: 100%; table-layout: fixed; }
  th { font-weight: 600; text-align: left; font-size: 0.875rem; vertical-align: middle; }
  thead th { color: var(--ex); }
  th :global(svg), th span { display: inline-block; vertical-align: middle; }
  th span { margin-left: 0.25rem; }
  td { padding: 0.125rem 0.375rem; border: 2px solid transparent; border-radius: 4px; vertical-align: top; font-size: 0.9375rem; line-height: 1.3; }
  td.best { border-color: var(--ex, var(--ink)); font-weight: 600; }
  .bar { display: block; height: 4px; margin-top: 0.125rem; background: var(--ex, var(--ink)); border-radius: 2px; }
  .narrow { display: none; }
  .narrow th[scope="row"] { color: var(--ex); vertical-align: top; }
  .narrow td { font-size: 0.8125rem; overflow-wrap: anywhere; }
  @media (max-width: 599px) {
    .wide { display: none; }
    .narrow { display: table; }
  }
</style>
