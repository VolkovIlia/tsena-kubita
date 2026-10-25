<script lang="ts">
  import params from "../../../data/params.json";
  import { fill, fmtCount } from "../../i18n/format";
  import { ru } from "../../i18n/ru";

  let { onDone }: { onDone: () => void } = $props();

  type Verdict = keyof typeof ru.ch7.verdicts;
  type Id = keyof typeof ru.ch7.headlineItems;
  const t = ru.ch7;
  const ITEMS: { id: Id; answer: Verdict }[] = [
    { id: "echo", answer: "half" },
    { id: "ai", answer: "myth" },
    { id: "crypto", answer: "half" },
  ];
  const VERDICTS = Object.keys(t.verdicts) as Verdict[];
  let answers = $state<Partial<Record<Id, Verdict>>>({});

  function choose(id: Id, v: Verdict) {
    if (answers[id]) return;
    answers[id] = v;
    if (ITEMS.every((h) => answers[h.id])) onDone();
  }
</script>

<ol class="news">
  {#each ITEMS as h (h.id)}
    {@const picked = answers[h.id]}
    <li>
      <p class="headline" id="hl-{h.id}">
        «{fill(t.headlineItems[h.id].text, { x: fmtCount(params.quantum_echoes.speedup_claim) })}»
      </p>
      <div class="actions" role="group" aria-labelledby="hl-{h.id}">
        {#each VERDICTS as v (v)}
          <button aria-pressed={picked === v} disabled={!!picked && picked !== v} onclick={() => choose(h.id, v)}>
            {t.verdicts[v]}
          </button>
        {/each}
      </div>
      {#if picked}
        <p class="why" role="status">
          <strong>{picked === h.answer ? t.headlineUi.right : t.headlineUi.wrong}</strong>
          {t.headlineItems[h.id].why}
        </p>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .news { list-style: none; padding: 0; margin: 1rem 0; }
  .news li { border-top: 1px solid var(--line); padding-top: 0.75rem; }
  .headline { font-size: 1.25rem; font-weight: 600; margin: 0; }
  .actions { margin: 0.75rem 0; }
  .why { animation: appear 300ms both; }
  @keyframes appear { from { opacity: 0; } }
</style>
