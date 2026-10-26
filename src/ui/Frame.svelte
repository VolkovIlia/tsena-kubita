<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<!-- Рамка с пропорцией рисунка 16:9: кнопки поверх SVG в процентах попадают в цель, как бы ни сжималась сцена. -->
<div class="frame"><div class="box">{@render children()}</div></div>

<style>
  .frame { flex: 0 1 auto; min-height: 6rem; width: 100%; aspect-ratio: 16 / 9; container-type: size; }
  .box { position: relative; width: min(100cqw, 100cqh * 16 / 9); aspect-ratio: 16 / 9; margin-inline: auto; }
  .box > :global(svg) { display: block; width: 100%; height: 100%; }
</style>
