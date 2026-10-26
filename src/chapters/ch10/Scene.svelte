<script lang="ts">
  import params from "../../../data/params.json";
  import type { SceneProps } from "../../deck/types";
  import type { EventId, RuleId } from "../../game/chapters";
  import { fill, fmtNum } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { coldRatio, type ExecutorId } from "../../model/tick";
  import ExecutorIcon from "../../ui/ExecutorIcon.svelte";
  import { exName } from "../../ui/names";
  import Timeline from "../../ui/Timeline.svelte";
  import { CARDS } from "../ch0/news";
  import Wall from "../ch0/Wall.svelte";
  import { executorIds, ruleChapter, type CardId } from "./cards";
  import Dispatch from "./Dispatch.svelte";
  import Headlines from "./Headlines.svelte";
  import Memo from "./Memo.svelte";
  import Sandbox from "./Sandbox.svelte";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch10;

  /** События, которые игрок видел на стене заголовков пролога; в ответе на вопрос к ним добавляется облачный доступ IBM. */
  const NEWS: EventId[] = ["sycamore", "hoefler", "willow", "echoes", "majorana2"];
  const PROMISES: EventId[] = ["starling", "majorana2"];
  /** Правила, по которым обычные задачи остаются обычным машинам. */
  const CLASSIC_RULES: RuleId[] = ["r2", "r3", "r4", "r7", "r8"];
  const TIMELINE: Record<string, { events: EventId[]; current: EventId | null; promise: EventId[] }> = {
    promise: { events: NEWS, current: "starling", promise: PROMISES },
    desk: { events: [...NEWS, "ibmCloud"], current: null, promise: PROMISES },
    deskTasks: { events: [...NEWS, "ibmCloud"], current: null, promise: PROMISES },
    deskCloud: { events: [...NEWS, "ibmCloud"], current: "ibmCloud", promise: PROMISES },
  };
  const line = $derived(TIMELINE[slide]);

  let picks = $state<Partial<Record<CardId, ExecutorId>>>({});
  const taken = (who: ExecutorId) => Object.values(picks).filter((p) => p === who).length;
  const crew = $derived(slide === "dispatch" || slide === "dispatchDone" || slide === "callback" || slide === "last");

  function dispatched(right: number, keyWrong: boolean) {
    set("right", right);
    set("keyWrong", keyWrong ? 1 : 0);
    done();
  }
</script>

<div class="scene" role="group" aria-label={t.scene.label}>
  {#if slide === "back"}
    <Wall shown={CARDS} />
  {:else if line}
    <Timeline events={line.events} current={line.current} promise={line.promise} />
  {/if}
  {#if slide === "desk"}
    <div class="cold">
      <div class="bar">
        <span>{fill(t.scene.space, { k: fmtNum(params.cryostat.cmb_kelvin) })}</span>
        <div class="track"><div class="fill" style:width="100%"></div></div>
      </div>
      <div class="bar ex-qc">
        <span>{fill(t.scene.cryostat, { k: fmtNum(params.cryostat.kelvin) })}</span>
        <div class="track"><div class="fill" style:width="{100 / coldRatio()}%"></div></div>
      </div>
    </div>
  {:else if slide === "deskTasks"}
    <ul class="rules">
      {#each CLASSIC_RULES as r (r)}
        <li><strong>«{ruleChapter(r)}»</strong> {ru.rules[r]}</li>
      {/each}
    </ul>
  {/if}
  {#if crew}
    <ul class="crew">
      {#each executorIds as who (who)}
        <li class="ex-{who}" class:lead={slide === "last" && who === "qc"}>
          <ExecutorIcon ex={who} size={56} />
          <span class="name">{exName(who)}</span>
          {#if slide === "dispatch" && taken(who) > 0}
            <span class="badge num" aria-label={fill(t.dispatchUi.taken, { k: String(taken(who)) })}>{taken(who)}</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
  {#if slide === "dispatch" || slide === "dispatchDone"}
    <Dispatch bind:picks onDone={dispatched} />
  {:else if slide === "headlines"}
    <Headlines onDone={done} />
  {:else if slide === "memo"}
    <Memo onDone={done} />
  {:else if slide === "sandbox"}
    <Sandbox />
  {/if}
</div>

<style>
  .crew { list-style: none; padding: 0; margin: 0.5rem 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
  .crew li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; text-align: center; }
  .crew .name { color: var(--ex); font-weight: 600; font-size: 0.875rem; line-height: 1.2; }
  .badge {
    position: absolute; top: -0.25rem; right: calc(50% - 2.25rem); min-width: 1.5rem; height: 1.5rem;
    border-radius: 0.75rem; background: var(--ex); color: var(--paper); font-weight: 600; font-size: 0.875rem;
    display: grid; place-items: center;
  }
  .lead { outline: 2px solid var(--ex); outline-offset: 4px; border-radius: 6px; }
  .cold { display: grid; gap: 0.75rem; margin: 0.5rem 0 1rem; }
  .bar { display: grid; gap: 0.25rem; font-weight: 600; }
  .track { height: 14px; border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
  .fill { height: 100%; min-width: 3px; background: var(--muted); }
  .ex-qc .fill { background: var(--ex); }
  .ex-qc span { color: var(--ex); }
  .rules { margin: 0.5rem 0 1rem; padding-left: 1.25rem; display: grid; gap: 0.375rem; }
</style>
