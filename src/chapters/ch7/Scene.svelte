<script lang="ts">
  import type { SceneProps } from "../../deck/types";
  import { ru } from "../../i18n/ru";
  import type { ExecutorId } from "../../model/tick";
  import Peep from "../../ui/Peep.svelte";
  import { executorIds, type CardId } from "./cards";
  import Dispatch from "./Dispatch.svelte";
  import Headlines from "./Headlines.svelte";
  import Memo from "./Memo.svelte";
  import Sandbox from "./Sandbox.svelte";

  let { slide, set, done }: SceneProps = $props();
  const t = ru.ch7.scene;

  type Phase = keyof typeof t.sign;
  const PHASE: Record<string, Phase> = {
    sunday: "intro",
    dispatch: "dispatch",
    dispatchDone: "dispatch",
    headlines: "headlines",
    memo: "memo",
    verdict: "end",
    callback: "end",
    last: "end",
    sandbox: "sandbox",
  };
  const phase = $derived(PHASE[slide] ?? "intro");

  let picks = $state<Partial<Record<CardId, ExecutorId>>>({});
  let memoWrong = $state(false);
  let best = $state<ExecutorId>("factory");
  const taken = (who: ExecutorId) => Object.values(picks).filter((p) => p === who).length;

  function mood(who: ExecutorId) {
    if (phase === "sandbox") return best === who ? "happy" : "calm";
    if (who === "oracle" && (slide === "callback" || slide === "verdict")) return "happy";
    return "calm";
  }
  const margoMood = $derived(memoWrong && slide === "memo" ? "shock" : slide === "verdict" ? "happy" : "calm");

  function dispatched(right: number, keyWrong: boolean) {
    set("right", right);
    set("keyWrong", keyWrong ? 1 : 0);
    done();
  }
</script>

<div class="scene">
  <svg viewBox="0 0 640 360" role="img" aria-label={t.label}>
    <text class="sign" x="320" y="48" text-anchor="middle">{t.sign[phase]}</text>
    <line class="floor" x1="0" y1="300" x2="640" y2="300" />
    <g class="actor"><Peep who="margo" mood={margoMood} size={120} x={10} y={180} /></g>
    {#each executorIds as who, i (who)}
      {@const x = 150 + i * 122}
      <g class="actor" class:dim={phase === "memo" || phase === "headlines"}>
        <Peep {who} mood={mood(who)} size={100} {x} y={196} />
        <text class="name who-{who}" x={x + 50} y="336" text-anchor="middle">{ru.names[who]}</text>
        {#if phase === "dispatch" && taken(who) > 0}
          <g class="badge who-{who}">
            <circle cx={x + 50} cy="168" r="20" />
            <text class="num" x={x + 50} y="176" text-anchor="middle">{taken(who)}</text>
          </g>
        {/if}
      </g>
    {/each}
  </svg>
  {#if slide === "dispatch" || slide === "dispatchDone"}
    <Dispatch bind:picks onDone={dispatched} />
  {:else if slide === "headlines"}
    <Headlines onDone={done} />
  {:else if slide === "memo"}
    <Memo onWrong={(w) => (memoWrong = w)} onDone={done} />
  {:else if slide === "sandbox"}
    <Sandbox bind:best />
  {/if}
</div>

<style>
  svg { width: 100%; height: auto; display: block; }
  .sign { font-size: 30px; font-weight: 600; }
  .floor { stroke: var(--ink); stroke-width: 2; }
  .name { font-size: 22px; font-weight: 600; fill: var(--who); }
  .badge circle { fill: var(--who); }
  .badge text { font-size: 22px; font-weight: 600; fill: var(--paper); }
  .actor { transition: opacity 300ms; }
  .actor.dim { opacity: 0.35; }
</style>
