<script lang="ts">
  import { ru } from "../i18n/ru";

  let { hype, informed }: { hype: number; informed: boolean } = $props();
</script>

<div class="hype">
  <div class="bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hype} aria-label={ru.ui.hype}>
    <div class="fill" style:width="{hype}%"></div>
  </div>
  <span class="label">{informed ? ru.ui.informed : ru.ui.hype}</span>
</div>

<style>
  .hype { display: grid; gap: 0.25rem; min-width: 9rem; flex: 1; }
  .bar { height: 8px; border: 1px solid var(--margo); border-radius: 4px; overflow: hidden; }
  .fill { height: 100%; background: var(--margo); transition: width 600ms ease; }
  .label { font-size: 0.875rem; color: var(--muted); }
</style>
