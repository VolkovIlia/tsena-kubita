<script lang="ts">
  import type { Snippet } from "svelte";
  import { ru, type Cite } from "../i18n/ru";

  let { cites = [], children }: { cites?: Cite[]; children?: Snippet } = $props();
</script>

<details>
  <summary>{ru.ui.curious}</summary>
  {@render children?.()}
  {#if cites.length}
    <p class="eyebrow">{ru.ui.sources}</p>
    <ul>
      {#each cites as c}<li><a href={ru.cite[c].url} target="_blank" rel="noopener">{ru.cite[c].text}</a></li>{/each}
    </ul>
  {/if}
</details>

<style>
  details :global(p), li { font-size: 0.875rem; line-height: 1.45; }
  li a { display: inline-flex; align-items: center; min-height: 44px; }
</style>
