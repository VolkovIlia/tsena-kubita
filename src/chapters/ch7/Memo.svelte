<script lang="ts">
  import { setMemo } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import Line from "../../ui/Line.svelte";

  let { onWrong, onDone }: { onWrong: (wrong: boolean) => void; onDone: () => void } = $props();

  type Chip = keyof typeof ru.ch7.memoChips;
  type Wrong = keyof typeof ru.ch7.memoUi.wrong;
  const t = ru.ch7;
  const CHIPS = Object.keys(t.memoChips) as Chip[];
  const RIGHT: Chip[] = ["small_in", "small_out", "structure"];
  let chosen = $state<Chip[]>([]);
  let complaint = $state<Wrong | null>(null);
  let signed = $state(false);

  function toggle(c: Chip) {
    chosen = chosen.includes(c) ? chosen.filter((x) => x !== c) : [...chosen, c];
    complaint = null;
    onWrong(false);
  }

  function sign() {
    const extra = CHIPS.find((c) => chosen.includes(c) && !RIGHT.includes(c)) as Wrong | undefined;
    if (extra) {
      complaint = extra;
      onWrong(true);
      return;
    }
    signed = true;
    update((p) => setMemo(p, chosen));
    onDone();
  }
</script>

<div class="memo">
  <div class="actions" role="group" aria-label={t.memo.top}>
    {#each CHIPS as c (c)}
      <button aria-pressed={chosen.includes(c)} disabled={signed} onclick={() => toggle(c)}>{t.memoChips[c]}</button>
    {/each}
  </div>
  <p class="num" aria-live="polite">{fill(t.memoUi.picked, { k: String(chosen.length), total: String(RIGHT.length) })}</p>
  {#if complaint}<div role="status"><Line who="margo" text={t.memoUi.wrong[complaint]} /></div>{/if}
  {#if signed}
    <p class="signed" role="status">{t.memoUi.signed}</p>
  {:else}
    <button class="primary" disabled={chosen.length !== RIGHT.length} onclick={sign}>{t.memoUi.sign}</button>
  {/if}
</div>

<style>
  .memo { margin: 1rem 0; }
  .signed { font-weight: 600; }
</style>
