<script lang="ts">
  import type { RuleId } from "../game/chapters";
  import { shell } from "../game/store.svelte";
  import { ru } from "../i18n/ru";

  let { notebook }: { notebook: RuleId[] } = $props();
  let dialog: HTMLDialogElement;
  const all: RuleId[] = ["r1", "r2", "r3", "r4", "r5", "r6"];
</script>

<button
  class:pulse={shell.pulseNotebook}
  onclick={() => dialog.showModal()}
  onanimationend={() => (shell.pulseNotebook = false)}>{ru.ui.notebook}</button
>
<dialog bind:this={dialog} aria-labelledby="notebook-title">
  <h2 id="notebook-title">{ru.ui.notebookTitle}</h2>
  <ol>
    {#each all as r}
      <li>
        {#if notebook.includes(r)}{ru.rules[r]}{:else}<span class="blank"><span class="vh">{ru.ui.ruleBlank}</span></span>{/if}
      </li>
    {/each}
  </ol>
  <button onclick={() => dialog.close()}>{ru.ui.close}</button>
</dialog>

<style>
  dialog {
    max-width: min(32rem, calc(100vw - 2rem));
    color: var(--ink);
    background: var(--paper);
    border: 2px solid var(--ink);
    border-radius: 6px;
    padding: 1.5rem;
  }
  dialog::backdrop { background: color-mix(in srgb, var(--ink) 40%, transparent); }
  li { min-height: 2rem; margin-bottom: 0.5rem; }
  .blank { display: inline-block; width: 100%; border-bottom: 1px solid var(--line); height: 1.25rem; }
  .pulse { animation: pulse 0.9s ease-in-out 2; }
  @keyframes pulse {
    50% { background: var(--ink); color: var(--paper); }
  }
</style>
