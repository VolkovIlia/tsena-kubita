<script lang="ts">
  import { onDestroy } from "svelte";
  import type { ChapterId } from "../game/chapters";
  import { recordBet } from "../game/progress";
  import { game, update } from "../game/store.svelte";
  import { ru } from "../i18n/ru";
  import Basis from "../ui/Basis.svelte";
  import Bet from "../ui/Bet.svelte";
  import Curious from "../ui/Curious.svelte";
  import { reducedMotion, screenFocus } from "../ui/motion";
  import Quote from "../ui/Quote.svelte";
  import RuleCard from "../ui/RuleCard.svelte";
  import { answer, canAdvance, isCorrect } from "./flow";
  import type { Ctx, Deck } from "./types";

  let { chapter, deck, onDone }: { chapter: ChapterId; deck: Deck; onDone: () => void } = $props();

  const BET_PAUSE_MS = 400;
  /** Только для разработки: `?slide=<id>` открывает слайд сразу — для проверки раскладки. В игре ставки не пропустить. */
  function startIndex(): number {
    if (!import.meta.env.DEV) return 0;
    const id = new URLSearchParams(location.search).get("slide");
    return Math.max(0, deck.slides.findIndex((s) => s.id === id));
  }
  let index = $state(startIndex());
  let sceneDone = $state(false);
  let ctx = $state<Ctx>({ answers: { prologue: game.p.prologueAnswer ?? "skipped" }, scene: {} });
  let timer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => clearTimeout(timer));

  const slide = $derived(deck.slides[index]);
  /** done() сцены засчитывается только для слайда, на котором её вызвали: поздняя анимация не откроет следующий. */
  const done = $derived.by(() => {
    const id = slide.id;
    return () => {
      if (slide.id === id) sceneDone = true;
    };
  });

  function go() {
    clearTimeout(timer);
    if (index === deck.slides.length - 1) return onDone();
    index += 1;
    sceneDone = false;
  }

  function bet(optionId: string) {
    const act = slide.act;
    if (act.kind !== "bet") return;
    const correct = isCorrect(slide, ctx, optionId);
    update((p) => recordBet(p, { chapter, id: act.id, correct }));
    ctx = answer(ctx, act.id, optionId);
    slide.onAnswer?.(optionId);
    timer = setTimeout(go, reducedMotion() ? 0 : BET_PAUSE_MS);
  }

  function focusIf(node: HTMLElement, on: boolean) {
    if (on) screenFocus(node);
  }
</script>

<div class="deck">
  <div class="progress" aria-hidden="true"><div style:width="{((index + 1) / deck.slides.length) * 100}%"></div></div>
  {#key slide.id}
    {#if slide.top}<p class="top" tabindex="-1" aria-live="polite" use:screenFocus>{slide.top(ctx)}</p>{/if}
  {/key}
  <div class="stage">
    <deck.Scene slide={slide.id} {ctx} set={(k, v) => (ctx.scene[k] = v)} {done} />
  </div>
  {#key slide.id}
    <div class="below" tabindex="-1" use:focusIf={!slide.top}>
      {#if slide.quote}
        <div class="say"><Quote who={slide.quote.who} text={slide.quote.text(ctx)} cite={slide.quote.cite} /></div>
      {/if}
      {#if slide.act.kind !== "bet" && slide.bottom}<p class="bottom" aria-live="polite">{slide.bottom(ctx)}</p>{/if}
      {#if slide.rule}<div class="bottom"><RuleCard rule={slide.rule} /></div>{/if}
      {#if slide.basis}<div class="bottom"><Basis ids={slide.basis} /></div>{/if}
      {#if slide.curious || slide.cites}
        <div class="bottom">
          <Curious cites={slide.cites ?? []}>
            {#each slide.curious ?? [] as c}<p>{c(ctx)}</p>{/each}
          </Curious>
        </div>
      {/if}
      <div class="act">
        {#if slide.act.kind === "bet"}
          <Bet
            question={slide.bottom?.(ctx) ?? ""}
            options={slide.act.options.map((o) => ({ id: o.id, label: o.label(ctx) }))}
            onAnswer={bet}
          />
        {:else}
          <div class="actions">
            <button class="primary" disabled={!canAdvance(slide, sceneDone)} onclick={go}>
              {slide.act.label?.(ctx) ?? ru.ui.next}
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/key}
</div>

<style>
  .progress { height: 4px; background: var(--line); border-radius: 2px; margin-bottom: 0.75rem; }
  .progress div { height: 100%; background: var(--ink); border-radius: 2px; transition: width 300ms ease; }
  .top { font-size: 1.25rem; line-height: 1.4; margin: 0 0 0.75rem; animation: appear 300ms both; }
  .top:focus, .below:focus { outline: none; }
  .stage { width: 100%; margin: 0 0 0.5rem; }
  /*
   * Столбик на высоту окна (app.css): сжимается только картинка сцены, слова и кнопки — нет.
   * Если сцена с её кнопками всё равно не влезла, прокручивается только она, а кнопка «Дальше» на экране.
   */
  @media (min-width: 600px) and (min-height: 560px) {
    .deck { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
    .progress, .top, .below { flex: none; }
    .stage { flex: 0 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
    .stage > :global(.scene) { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; }
    .stage > :global(.scene) > :global(svg) { flex: 0 1 auto; min-height: 6rem; width: 100%; height: auto; }
  }
  .say { animation: appear 300ms 300ms both; }
  .bottom { animation: appear 300ms 600ms both; }
  p.bottom { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
  .act { animation: appear 300ms 900ms both; }
  .act :global(.actions) { margin: 0.5rem 0; }
  .act :global(.question) { margin-top: 0.5rem; }
  @keyframes appear {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }
</style>
