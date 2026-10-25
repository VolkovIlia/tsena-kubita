<script lang="ts">
  import type { RuleId } from "../game/chapters";
  import { ru } from "../i18n/ru";

  let { rule }: { rule: RuleId } = $props();
</script>

<p class="rule"><span class="eyebrow">{ru.ui.rule}</span> <span class="write">{ru.rules[rule]}</span></p>

<style>
  .write { display: inline-block; animation: write 800ms ease-out both; }
  @keyframes write {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
</style>
