<script lang="ts">
  import type { Snippet } from "svelte";
  import { ru, type Cite } from "../i18n/ru";

  let { cites = [], children }: { cites?: Cite[]; children?: Snippet } = $props();
</script>

<!-- Содержимое справки «Для любопытных»; кнопку-переключатель и панель рисует Deck. -->
{@render children?.()}
{#if cites.length}
  <p class="eyebrow">{ru.ui.sources}</p>
  <ul>
    {#each cites as c}<li><a href={ru.cite[c].url} target="_blank" rel="noopener">{ru.cite[c].text}</a></li>{/each}
  </ul>
{/if}

<style>
  li a { display: inline-flex; align-items: center; min-height: 44px; }
</style>
