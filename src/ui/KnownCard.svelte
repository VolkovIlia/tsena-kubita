<script lang="ts">
  import type { RuleId } from "../game/chapters";
  import { ru } from "../i18n/ru";
  import { screenFocus } from "./motion";

  let { rules, onStart }: { rules: RuleId[]; onStart: () => void } = $props();
</script>

<section class="screen" tabindex="-1" use:screenFocus>
  <h2>{ru.ui.known}</h2>
  <ol>
    {#each rules as r}<li value={Number(r.slice(1))}>{ru.rules[r]}</li>{/each}
  </ol>
  <div class="actions"><button class="primary" onclick={onStart}>{ru.ui.start}</button></div>
</section>
