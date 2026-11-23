<script lang="ts">
  import type { Snippet } from "svelte";

  /** w × h — размер рисунка (viewBox): по нему пропорция рамки и порог сжатия (--pic-scale из Deck). */
  let { children, w = 640, h = 360 }: { children: Snippet; w?: number; h?: number } = $props();
</script>

<!-- Рамка с пропорцией рисунка: кнопки поверх SVG в процентах попадают в цель, как бы ни сжималась сцена. -->
<div class="frame" style="--w: {w}; --h: {h}"><div class="box">{@render children()}</div></div>

<style>
  .frame { flex: 0 1 auto; min-height: calc(var(--pic-scale, 0.27) * var(--h) * 1px); width: 100%; aspect-ratio: var(--w) / var(--h); container-type: size; }
  .box { position: relative; width: min(100cqw, 100cqh * var(--w) / var(--h)); aspect-ratio: var(--w) / var(--h); margin-inline: auto; }
  .box > :global(svg) { display: block; width: 100%; height: 100%; }
</style>
