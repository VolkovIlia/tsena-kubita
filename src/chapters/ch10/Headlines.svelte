<script lang="ts">
  import params from "../../../data/params.json";
  import { fill, fmtCount } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { chapterNames } from "./cards";

  let { onDone }: { onDone: () => void } = $props();

  type Verdict = keyof typeof ru.ch10.verdicts;
  type Id = keyof typeof ru.ch10.headlineItems;
  const t = ru.ch10;
  /** Число в заголовке и пояснении: ускорение Quantum Echoes и заявление Microsoft о времени жизни кубита. */
  const ITEMS: { id: Id; answer: Verdict; x?: number }[] = [
    { id: "echo", answer: "half", x: params.quantum_echoes.speedup_claim },
    { id: "ai", answer: "myth" },
    { id: "crypto", answer: "half" },
    { id: "majorana", answer: "half", x: params.timeline.majorana2.reliability_claim },
  ];
  const VERDICTS = Object.keys(t.verdicts) as Verdict[];
  let answers = $state<Partial<Record<Id, Verdict>>>({});
  const text = (s: string, x?: number) => fill(s, { ...chapterNames, x: x === undefined ? "" : fmtCount(x) });

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
      <p class="headline" id="hl-{h.id}">«{text(t.headlineItems[h.id].text, h.x)}»</p>
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
          {text(t.headlineItems[h.id].why, h.x)}
        </p>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .news { list-style: none; padding: 0; margin: 0.75rem 0; }
  .news li { border-top: 1px solid var(--line); padding-top: 0.5rem; }
  .headline { font-size: 1.125rem; font-weight: 600; margin: 0; }
  .actions { margin: 0.5rem 0; }
  .why { margin: 0 0 0.75rem; animation: appear 300ms both; }
  @media (min-width: 700px) {
    .news li { display: grid; grid-template-columns: 1fr auto; column-gap: 1rem; align-items: center; }
    .actions { gap: 0.5rem; }
    .why { grid-column: 1 / -1; }
  }
  @keyframes appear { from { opacity: 0; } }
</style>
