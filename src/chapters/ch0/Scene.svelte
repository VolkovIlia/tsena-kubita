<script lang="ts">
  import type { SceneProps } from "../../deck/types";
  import { game } from "../../game/store.svelte";
  import { ru } from "../../i18n/ru";
  import type { ExecutorId } from "../../model/tick";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import { exName } from "../../ui/names";
  import type { CardId } from "./news";
  import { score, type Picks } from "./night";
  import Night from "./Night.svelte";
  import NightResults from "./NightResults.svelte";
  import { slides } from "./slides";
  import Wall from "./Wall.svelte";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch0.scene;
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const MACHINES: ExecutorId[] = ["core", "cores", "gpu", "qc"];

  /** Стена растёт по слайдам; новые карточки появляются по очереди. */
  const WAVES: Record<string, CardId[]> = {
    news: ["supremacy", "ibm"],
    headlines: ["willow", "echoes", "majorana"],
    hoefler: ["hoefler"],
  };
  const shown = $derived(order.slice(0, at + 1).flatMap((id) => WAVES[id] ?? []));
  const fresh = $derived(WAVES[slide] ?? []);
  const wall = $derived(at <= order.indexOf("question"));

  /** Итог ночи; при прямом входе на слайд итогов — последняя сыгранная ночь из прогресса. */
  let picks = $state<Picks>(game.p.night as Picks);
  $effect(() => {
    const s = score(picks);
    set("best", s.best);
    set("fail", s.fail);
  });

  function played(p: Picks) {
    picks = p;
    done();
  }
</script>

<div class="scene">
  {#if wall}
    <Wall {shown} lit={fresh} {fresh} quiet={slide === "question"} />
  {:else if slide === "night"}
    <Night onDone={played} />
  {:else if slide === "results"}
    <NightResults {picks} />
  {:else}
    <ul class="machines" aria-label={t.machines}>
      {#each MACHINES as ex (ex)}
        <li class="ex-{ex}"><ExecutorIcon {ex} size={64} /><span>{exName(ex)}</span></li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .machines {
    list-style: none;
    margin: 0.5rem 0 1rem;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.75rem;
  }
  .machines li { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; text-align: center; color: var(--ex); }
  .machines span { color: var(--ink); font-weight: 600; font-size: 0.9375rem; }
  @media (max-width: 420px) {
    .machines { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
</style>
