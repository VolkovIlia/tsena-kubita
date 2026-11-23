<script lang="ts">
  /** Стена заголовков пролога: её же финал показывает на слайде «Вернёмся к заголовкам». */
  import { fill } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { news as n, type CardId } from "./news";

  let {
    shown,
    lit = [],
    fresh = [],
    quiet = false,
  }: { shown: readonly CardId[]; lit?: CardId[]; fresh?: CardId[]; quiet?: boolean } = $props();
  /** Новые карточки появляются по очереди, чтобы их успели прочитать. */
  const STAGGER_MS = 700;
  const t = ru.ch0.scene;

  const YEAR: Record<CardId, string> = { ...n.year, ibm: n.year.supremacy };
  const BADGE: Record<CardId, Record<string, string>> = {
    supremacy: { seconds: n.seconds, years: n.years },
    ibm: { days: n.days, years: n.years },
    willow: { qubits: n.qubits },
    echoes: { x: n.echoes },
    majorana: { target: n.target },
    hoefler: { x: n.stepPrice },
  };

  let selected = $state<CardId | null>(null);
  let dialog: HTMLDialogElement | undefined = $state();
  const title = (id: CardId) => fill(t.cards[id].title, { name: n.name });
  const article = $derived.by(() => {
    if (!selected) return null;
    const a = ru.newsArticles[selected];
    const { year: _years, ...values } = n;
    return {
      rubric: a.rubric,
      title: title(selected),
      sourceName: t.cards[selected].source,
      year: YEAR[selected],
      deck: fill(a.deck, values),
      body: a.body.map((p) => fill(p, values)),
      fact: fill(a.fact, values),
      source: fill(a.source, { year: YEAR[selected] }),
    };
  });

  function open(id: CardId) {
    selected = id;
    dialog?.showModal();
  }
  function close() {
    dialog?.close();
  }
  function onclose() {
    selected = null;
  }
  function backdrop(event: MouseEvent) {
    if (event.target === dialog) close();
  }
</script>

<section class="wall" class:quiet aria-label={t.label}>
  {#each shown as id (id)}
    <button
      type="button"
      class="card"
      class:lit={lit.includes(id)}
      class:rebuttal={id === "hoefler"}
      style:animation-delay="{Math.max(0, fresh.indexOf(id)) * STAGGER_MS}ms"
      aria-haspopup="dialog"
      aria-label={fill(t.article.open, { title: title(id) })}
      onclick={() => open(id)}
    >
      <span class="meta num">{t.cards[id].source} · {YEAR[id]}</span>
      <span class="title">«{title(id)}»</span>
      <span class="badge num">{fill(t.badges[id], BADGE[id])}</span>
      <span class="read">{t.article.read}</span>
    </button>
  {/each}
</section>
<p class="note">{t.translated}</p>

<dialog bind:this={dialog} class="paper" aria-labelledby="article-title" onclose={onclose} onclick={backdrop}>
  {#if article}
    <div class="bar">
      <button class="close" type="button" onclick={close}>{t.article.close}</button>
    </div>
    <!-- Область статьи прокручивается; фокус нужен, чтобы её можно было читать стрелками. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="scroll" tabindex="0" role="region" aria-label={article.title}>
      <article>
        <header>
          <p class="masthead">{t.article.local}</p>
          <p class="kicker num">{article.sourceName} · {article.year} · {article.rubric}</p>
          <h2 id="article-title">{article.title}</h2>
          <p class="deck">{article.deck}</p>
        </header>
        <div class="fact" role="note">
          <span>{t.article.fact}</span>
          <strong class="num">{article.fact}</strong>
        </div>
        <div class="body">
          {#each article.body as paragraph, i (i)}
            <p>{paragraph}</p>
          {/each}
        </div>
        <footer>{article.source}</footer>
      </article>
    </div>
  {/if}
</dialog>

<style>
  .wall { display: grid; gap: 0.5rem; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); transition: opacity 300ms; }
  .wall.quiet { opacity: 0.45; }
  .card {
    display: block;
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    background: var(--paper);
    color: var(--muted);
    text-align: left;
    cursor: pointer;
    animation: drop 350ms ease-out both;
  }
  .card:hover { border-color: var(--ink); }
  .card.lit { border: 2px solid var(--ink); color: var(--ink); }
  .card.rebuttal { border-style: dashed; }
  .card.rebuttal.lit { border-style: solid; border-color: var(--qc); }
  .card span { display: block; }
  .meta { font-size: 0.8125rem; }
  .title { font-weight: 600; line-height: 1.3; margin: 0.125rem 0 0.25rem; }
  .badge { font-size: 0.9375rem; font-weight: 700; }
  .lit .badge { color: var(--ink); }
  .read {
    margin-top: 0.5rem;
    padding-top: 0.375rem;
    border-top: 1px solid var(--line);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--ink);
  }
  .card:hover .read { text-decoration: underline; }
  .note { font-size: 0.8125rem; color: var(--muted); margin: 0.25rem 0 0; }

  .paper {
    display: flex;
    flex-direction: column;
    width: min(58rem, calc(100vw - 2rem));
    max-height: min(52rem, calc(100vh - 2rem));
    margin: auto;
    padding: 0;
    border: 1px solid var(--ink);
    border-radius: 4px;
    background: var(--paper);
    color: var(--ink);
    box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 35%);
    overflow: hidden;
  }
  .paper::backdrop { background: rgb(0 0 0 / 65%); backdrop-filter: blur(2px); }
  .bar {
    flex: none;
    display: flex;
    justify-content: flex-end;
    padding: 0.5rem clamp(1.25rem, 4vw, 3rem);
    border-bottom: 1px solid var(--line);
    background: var(--paper);
  }
  .scroll { min-height: 0; overflow: auto; }
  .scroll:focus-visible { outline: 2px solid var(--ink); outline-offset: -2px; }
  article {
    padding: clamp(1.25rem, 4vw, 3rem);
    font-family: Georgia, "Times New Roman", serif;
  }
  .close {
    min-height: 44px;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--ink);
    border-radius: 999px;
    background: var(--paper);
    color: var(--ink);
    font: 600 0.875rem/1.2 "Golos Text Variable", sans-serif;
    cursor: pointer;
  }
  .close:hover { background: var(--ink); color: var(--paper); }
  header { border-bottom: 4px double var(--ink); padding-bottom: 1rem; }
  .masthead {
    margin: 0 0 0.75rem;
    font: 600 0.75rem/1.2 "Golos Text Variable", sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .kicker { margin: 0; font: 600 0.875rem/1.3 "Golos Text Variable", sans-serif; color: var(--muted); }
  h2 {
    max-width: 30ch;
    margin: 0.5rem 0 0.75rem;
    font-size: clamp(2rem, 4.5vw, 3.25rem);
    line-height: 1.02;
    letter-spacing: -0.035em;
  }
  .deck { max-width: 52ch; margin: 0; font-size: clamp(1.125rem, 2vw, 1.375rem); line-height: 1.4; }
  .fact {
    display: grid;
    gap: 0.25rem;
    margin: 1rem 0;
    padding: 0.75rem 0;
    border-block: 1px solid var(--ink);
  }
  .fact span { font: 600 0.75rem/1.2 "Golos Text Variable", sans-serif; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
  .fact strong { font-size: clamp(1.25rem, 2.5vw, 1.75rem); line-height: 1.2; }
  .body { font-size: 1.0625rem; line-height: 1.62; }
  .body p { margin: 0 0 0.9em; }
  .body p:first-child { font-size: 1.1em; }
  footer { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--line); font: 400 0.8125rem/1.4 "Golos Text Variable", sans-serif; color: var(--muted); }

  @media (min-width: 760px) {
    .body { columns: 2; column-gap: 2.5rem; column-rule: 1px solid var(--line); }
    .body p { break-inside: avoid-column; }
  }
  @media (max-width: 520px) {
    .paper { width: calc(100vw - 1rem); max-height: calc(100vh - 1rem); }
    article { padding: 1rem; }
  }
  @keyframes drop {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: none; }
  }
</style>
