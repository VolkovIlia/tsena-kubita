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
  /** Раскрытая справка под кнопками: «На чём основан расчёт» или «Для любопытных». */
  let open = $state<"basis" | "curious" | null>(null);
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
    open = null;
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

  /** Раскрытая справка висит под колодой и может оказаться ниже края окна — прокрутить к ней. */
  function reveal(node: HTMLElement) {
    const scroll = new ResizeObserver(() => node.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" }));
    scroll.observe(node.parentElement!);
    const stop = setTimeout(() => scroll.disconnect(), 500);
    return {
      destroy() {
        clearTimeout(stop);
        scroll.disconnect();
      },
    };
  }

  /**
   * Сцене тесно даже с картинкой на пороге (--pic-scale): её содержимое вылезает за её высоту.
   * Тогда колода вырастает ровно на нехватку — прокручивается страница, внутри сцены ничего не прячется.
   * Внутри слайда колода только растёт: сброс высоты на ходу (ползунок, часы гонки) отбросил бы прокрутку наверх.
   * Сброс и новый замер — на новом слайде и при изменении размера окна.
   */
  function fit(deckEl: HTMLElement, _slideId: string) {
    const stage = deckEl.querySelector<HTMLElement>(".stage")!;
    let raf = 0;
    const grow = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const deficit = stage.scrollHeight - stage.clientHeight;
        if (deficit > 0) deckEl.style.minHeight = `${deckEl.clientHeight + deficit}px`;
      });
    };
    const reset = () => {
      deckEl.style.minHeight = "";
      grow();
    };
    const resize = new ResizeObserver(grow);
    resize.observe(stage);
    const mutate = new MutationObserver(grow);
    mutate.observe(stage, { childList: true, subtree: true, characterData: true });
    addEventListener("resize", reset);
    grow();
    return {
      update: reset,
      destroy() {
        cancelAnimationFrame(raf);
        resize.disconnect();
        mutate.disconnect();
        removeEventListener("resize", reset);
      },
    };
  }
</script>

<div class="deck" use:fit={slide.id}>
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
      {#if slide.act.kind !== "bet" && slide.bottom?.(ctx)}<p class="bottom" aria-live="polite">{slide.bottom(ctx)}</p>{/if}
      {#if slide.rule}<div class="bottom"><RuleCard rule={slide.rule} /></div>{/if}
    </div>
    <div class="act">
      {#if slide.act.kind === "bet"}
        <Bet
          question={slide.bottom?.(ctx) ?? ""}
          options={slide.act.options.map((o) => ({ id: o.id, label: o.label(ctx) }))}
          onAnswer={bet}
        />
        {#if slide.basis || slide.curious || slide.cites}<div class="actions extras">{@render toggles()}</div>{/if}
      {:else}
        <div class="actions">
          <button class="primary" disabled={!canAdvance(slide, sceneDone)} onclick={go}>
            {slide.act.label?.(ctx) ?? ru.ui.next}
          </button>
          {@render toggles()}
        </div>
      {/if}
    </div>
    {#if open === "basis" && slide.basis}
      <div id="more-basis" class="more" use:reveal><Basis ids={slide.basis} /></div>
    {:else if open === "curious"}
      <div id="more-curious" class="more" use:reveal>
        <Curious cites={slide.cites ?? []}>
          {#each slide.curious ?? [] as c}<p>{c(ctx)}</p>{/each}
        </Curious>
      </div>
    {/if}
  {/key}
</div>

{#snippet toggles()}
  {#if slide.basis}
    <button class="toggle" aria-expanded={open === "basis"} aria-controls="more-basis" onclick={() => (open = open === "basis" ? null : "basis")}>
      {ru.ui.basis}
    </button>
  {/if}
  {#if slide.curious || slide.cites}
    <button class="toggle" aria-expanded={open === "curious"} aria-controls="more-curious" onclick={() => (open = open === "curious" ? null : "curious")}>
      {ru.ui.curious}
    </button>
  {/if}
{/snippet}

<style>
  .progress { height: 4px; background: var(--line); border-radius: 2px; margin-bottom: 0.75rem; }
  .progress div { height: 100%; background: var(--ink); border-radius: 2px; transition: width 300ms ease; }
  .top { font-size: 1.25rem; line-height: 1.4; margin: 0 0 0.75rem; animation: appear 300ms both; }
  .top:focus, .below:focus { outline: none; }
  .stage { width: 100%; margin: 0 0 0.5rem; }
  /*
   * Столбик на высоту окна (app.css): сжимается только картинка сцены, слова и кнопки — нет.
   * Картинка не мельче --pic-scale своего рисунка: Frame знает размер рисунка из своих w и h, у голого SVG сцены
   * высоту рисунка задаёт --vb-h (по умолчанию 360). Не влезло и так — fit() растягивает колоду,
   * прокручивается страница, а полоса действия («Дальше» или ставка) прилипает к нижнему краю окна.
   * Раскрытая справка висит под колодой и не отнимает место у картинки.
   */
  @media (min-width: 600px) and (min-height: 560px) {
    .deck { --pic-scale: 0.6; position: relative; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
    .progress, .top, .below, .act { flex: none; }
    .more { position: absolute; top: 100%; left: 0; right: 0; padding-bottom: 1rem; }
    .stage { flex: 0 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; }
    .stage > :global(.scene) { flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column; }
    .stage > :global(.scene) > :global(svg) { flex: 0 1 auto; min-height: calc(var(--pic-scale) * var(--vb-h, 360) * 1px); width: 100%; height: auto; }
    .act { position: sticky; bottom: 0; z-index: 1; background: var(--paper); container-type: scroll-state; }
    /* Прилипла — значит, под ней ещё есть слова: тонкая черта сверху (браузеры без scroll-state её просто не рисуют). */
    @container scroll-state(stuck: bottom) {
      .act > :global(:first-child) { box-shadow: 0 -1px 0 var(--line); }
    }
  }
  .say { animation: appear 300ms 300ms both; }
  .bottom { animation: appear 300ms 600ms both; }
  p.bottom { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; }
  .act { animation: appear 300ms 900ms both; }
  .act :global(.actions) { margin: 0.5rem 0; align-items: center; }
  .act :global(.question) { margin-top: 0.5rem; }
  .act .extras { margin-top: 0; }
  .toggle { border-color: var(--line); background: transparent; }
  .toggle::before { content: "▸ "; }
  .toggle[aria-expanded="true"] { border-color: var(--ink); }
  .toggle[aria-expanded="true"]::before { content: "▾ "; }
  .more { border-top: 1px solid var(--line); padding-top: 0.5rem; margin-bottom: 1rem; }
  .more :global(p), .more :global(li) { font-size: 0.875rem; line-height: 1.45; }
  .more :global(ul) { padding-left: 1.25rem; }
  @keyframes appear {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }
</style>
