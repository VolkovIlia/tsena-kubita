<script lang="ts">
  let {
    question,
    options,
    onAnswer,
  }: { question: string; options: { id: string; label: string }[]; onAnswer: (id: string) => void } = $props();

  let chosen = $state<string | null>(null);
  const qid = `bet-${Math.random().toString(36).slice(2)}`;

  function choose(id: string) {
    if (chosen !== null) return;
    chosen = id;
    onAnswer(id);
  }
</script>

<div class="bet">
  <p id={qid} class="question">{question}</p>
  <div class="actions" role="group" aria-labelledby={qid}>
    {#each options as o (o.id)}
      <button disabled={chosen !== null && chosen !== o.id} aria-pressed={chosen === o.id} onclick={() => choose(o.id)}>
        {o.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .question { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; }
</style>
