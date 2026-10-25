<script lang="ts">
  import { fill, fmtCount } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { executors, type ExecutorId } from "../model/tick";

  let { ids }: { ids: ExecutorId[] } = $props();
</script>

<details>
  <summary>{ru.ui.basis}</summary>
  <p>{ru.ui.basisFormula}</p>
  <p>{ru.ui.basisUnit}</p>
  <ul>
    {#each ids as id}
      {@const e = executors[id]}
      <li>
        <strong>{e.name_ru}</strong>:
        <span class="num">{fill(ru.ui.rate, { rate: fmtCount(e.ops_per_s) })}</span>{#if !e.verified}
          ({ru.ui.estimate}){/if}.
        <a href={e.source_url} target="_blank" rel="noopener">{e.source}</a>
      </li>
    {/each}
  </ul>
</details>
