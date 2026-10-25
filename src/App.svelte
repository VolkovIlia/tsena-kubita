<script lang="ts">
  import { onMount, type Component } from "svelte";
  import { chapterIndex, chapters, type ChapterId, type RuleId } from "./game/chapters";
  import { hashOf, parseHash } from "./game/hash";
  import { enter, finish } from "./game/progress";
  import { game, update } from "./game/store.svelte";
  import { ru } from "./i18n/ru";
  import Prologue from "./chapters/Prologue.svelte";
  import Chapter3 from "./chapters/ch3/Chapter3.svelte";
  import Chapter4 from "./chapters/ch4/Chapter4.svelte";
  import ChapterSoon from "./ui/ChapterSoon.svelte";
  import KnownCard from "./ui/KnownCard.svelte";
  import TopBar from "./ui/TopBar.svelte";

  type ChapterProps = { onDone: () => void };
  const playable: Partial<Record<ChapterId, Component<ChapterProps>>> = { ch0: Prologue, ch3: Chapter3, ch4: Chapter4 };

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

  function done() {
    if (!current) return;
    const id = current;
    update((p) => finish(p, id));
    const next = chapters[chapterIndex(id) + 1];
    if (next) location.hash = hashOf(next.id);
  }

  onMount(() => {
    route();
    window.addEventListener("hashchange", route);
    return () => window.removeEventListener("hashchange", route);
  });

  const Current = $derived(current ? playable[current] : undefined);
</script>

<div class="page">
  <TopBar />
  {#if current}
    <main>
      <p class="eyebrow">{ru.daysFull[chapters[chapterIndex(current)].day]}</p>
      <h1 tabindex="-1" bind:this={heading}>{ru.chapters[current]}</h1>
      {#key visit}
        {#if known.length}
          <KnownCard rules={known} onStart={() => (known = [])} />
        {:else if Current}
          <Current onDone={done} />
        {:else}
          <ChapterSoon />
        {/if}
      {/key}
    </main>
  {/if}
</div>
