<script lang="ts">
  import { onMount } from "svelte";
  import { decks } from "./chapters/index";
  import Deck from "./deck/Deck.svelte";
  import { chapterIndex, chapters, type ChapterId, type RuleId } from "./game/chapters";
  import { hashOf, parseHash } from "./game/hash";
  import { enter, finish, initial } from "./game/progress";
  import { game, update } from "./game/store.svelte";
  import { ru } from "./i18n/ru";
  import DateCard from "./ui/DateCard.svelte";
  import Header from "./ui/Header.svelte";
  import KnownCard from "./ui/KnownCard.svelte";

  let current = $state<ChapterId | null>(null);
  let known = $state<RuleId[]>([]);
  let visit = $state(0);
  let heading: HTMLHeadingElement | undefined = $state();

  function route() {
    const id = parseHash(location.hash);
    if (!id) {
      location.replace("#prologue");
      return;
    }
    const { progress, granted } = enter(game.p, id);
    update(() => progress);
    current = id;
    known = granted;
    visit += 1;
    window.scrollTo(0, 0);
    queueMicrotask(() => heading?.focus());
  }

  /** Конец главы: следующая глава, а после финала — новая партия с чистого листа. */
  function done() {
    if (!current) return;
    const id = current;
    update((p) => finish(p, id));
    const next = chapters[chapterIndex(id) + 1];
    if (next) {
      location.hash = hashOf(next.id);
      return;
    }
    update(() => initial());
    location.hash = hashOf("ch0");
  }

  onMount(() => {
    route();
    window.addEventListener("hashchange", route);
    return () => window.removeEventListener("hashchange", route);
  });

</script>

<div class="page">
  <Header {current} />
  {#if current}
    <main>
      <DateCard event={chapters[chapterIndex(current)].event} />
      <h1 tabindex="-1" bind:this={heading}>{ru.chapters[current]}</h1>
      {#key visit}
        {#if known.length}
          <KnownCard rules={known} onStart={() => (known = [])} />
        {:else}
          <Deck chapter={current} deck={decks[current]} onDone={done} />
        {/if}
      {/key}
    </main>
  {/if}
</div>
