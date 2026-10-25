<script lang="ts">
  import { dayLink, days } from "../game/chapters";
  import { hashOf } from "../game/hash";
  import { game } from "../game/store.svelte";
  import { ru } from "../i18n/ru";
  import HypeMeter from "./HypeMeter.svelte";
  import Notebook from "./Notebook.svelte";
</script>

<header class="top">
  <nav aria-label={ru.ui.week}>
    {#each days as d}
      <a href={hashOf(dayLink[d])} aria-current={game.p.day === d ? "page" : undefined}>{ru.days[d]}</a>
    {/each}
  </nav>
  <HypeMeter hype={game.p.hype} informed={game.p.informed} />
  <Notebook notebook={game.p.notebook} />
</header>

<style>
  .top { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--line); }
  nav { display: flex; flex-basis: 100%; }
  nav a {
    flex: 1;
    min-height: 44px;
    display: grid;
    place-items: center;
    text-decoration: none;
    color: var(--muted);
    border-bottom: 3px solid transparent;
  }
  nav a[aria-current="page"] { color: var(--ink); font-weight: 600; border-bottom-color: var(--ink); }
  @media (min-width: 768px) { nav { flex-basis: auto; flex: 1 1 18rem; } }
</style>
