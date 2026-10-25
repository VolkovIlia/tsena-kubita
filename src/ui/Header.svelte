<script lang="ts">
  import type { ChapterId } from "../game/chapters";
  import { ru } from "../i18n/ru";
  import ChapterMenu from "./ChapterMenu.svelte";

  let { current }: { current: ChapterId | null } = $props();
</script>

<header class="masthead">
  <a class="title" href="#prologue">{ru.title}</a>
  <ChapterMenu {current} />
</header>

<style>
  .masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--line);
  }
  .title { font-weight: 600; text-decoration: none; min-height: 44px; display: flex; align-items: center; }
</style>
