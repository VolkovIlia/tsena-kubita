<script lang="ts">
  import { chapters, eventYear, type ChapterId, type RuleId } from "../game/chapters";
  import { hashOf } from "../game/hash";
  import { game } from "../game/store.svelte";
  import { ru } from "../i18n/ru";

  let { current }: { current: ChapterId | null } = $props();
  let dialog: HTMLDialogElement;
  const all = chapters.map((c) => c.rule).filter((r): r is RuleId => r !== null);
</script>

<button onclick={() => dialog.showModal()}>{ru.ui.menu}</button>
<dialog bind:this={dialog} aria-labelledby="menu-chapters">
  <h2 id="menu-chapters">{ru.ui.chaptersTitle}</h2>
  <ol class="chapters">
    {#each chapters as c (c.id)}
      <li>
        <a href={hashOf(c.id)} aria-current={current === c.id ? "page" : undefined} onclick={() => dialog.close()}>
          <span class="num">{eventYear(c.event)}</span> · {ru.chapters[c.id]}</a
        >{#if game.p.done.includes(c.id)}<span class="passed">, {ru.ui.passed}</span>{/if}
      </li>
    {/each}
  </ol>
  <h2>{ru.ui.notebookTitle}</h2>
  <ol>
    {#each all as r}
      <li>
        {#if game.p.notebook.includes(r)}{ru.rules[r]}{:else}<span class="blank"><span class="vh">{ru.ui.ruleBlank}</span></span>{/if}
      </li>
    {/each}
  </ol>
  <button onclick={() => dialog.close()}>{ru.ui.close}</button>
</dialog>

<style>
  dialog {
    max-width: min(32rem, calc(100vw - 2rem));
    max-height: calc(100dvh - 2rem);
    color: var(--ink);
    background: var(--paper);
    border: 2px solid var(--ink);
    border-radius: 6px;
    padding: 1.5rem;
  }
  dialog::backdrop { background: color-mix(in srgb, var(--ink) 40%, transparent); }
  h2:first-child { margin-top: 0; }
  li { min-height: 2rem; margin-bottom: 0.5rem; }
  .chapters a { display: inline-block; min-height: 44px; padding: 0.6rem 0; }
  .chapters a[aria-current="page"] { font-weight: 600; }
  .passed { color: var(--muted); }
  .blank { display: inline-block; width: 100%; border-bottom: 1px solid var(--line); height: 1.25rem; }
</style>
