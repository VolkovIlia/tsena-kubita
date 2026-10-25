<script lang="ts">
  import { answerPrologue, type PrologueAnswer } from "../game/progress";
  import { shell, update } from "../game/store.svelte";
  import { fill, fmtCount, fmtExact } from "../i18n/format";
  import { ru } from "../i18n/ru";
  import { executors } from "../model/tick";
  import Avatar from "../ui/Avatar.svelte";
  import Bet from "../ui/Bet.svelte";
  import Line from "../ui/Line.svelte";
  import { animate, screenFocus } from "../ui/motion";

  let { onDone }: { onDone: () => void } = $props();
  const t = ru.ch0;
  const rate = executors.master.ops_per_s;

  let screen = $state(1);
  let ticks = $state(0);
  let clicked = $state(false);
  let answered = $state(false);

  const ready = $derived(screen === 4 ? clicked : screen === 6 ? answered : true);

  function tick() {
    clicked = true;
    const from = ticks;
    animate(1000, (f) => (ticks = from + rate * f));
  }

  function next() {
    if (screen === 6) return onDone();
    screen += 1;
    if (screen === 5) shell.pulseNotebook = true;
  }

  function answer(id: string) {
    update((p) => answerPrologue(p, id as PrologueAnswer));
    answered = true;
  }
</script>

{#key screen}
  <section class="screen" tabindex="-1" use:screenFocus>
    {#if screen === 1}
      <p class="stage">{t.screen1.stage}</p>
      <p class="sign">{t.screen1.sign}</p>
      <Line who="margo" text={t.screen1.margo1} />
    {:else if screen === 2}
      <p class="headline">{t.screen2.headline}</p>
      <Line who="margo" text={t.screen2.margo1} />
    {:else if screen === 3}
      <p class="stage">{t.screen3.stage}</p>
      <Line who="master" text={t.screen3.master1} />
      <Line who="margo" text={t.screen3.margo1} />
    {:else if screen === 4}
      <button class="tap who-master" onclick={tick}>
        <Avatar who="master" size={64} />
        <span>{t.screen4.action}</span>
      </button>
      <p class="counter who-master" aria-live="polite">{fill(t.screen4.counter, { n: fmtExact(ticks) })}</p>
      {#if clicked}
        <Line who="master" text={t.screen4.master1} />
        <p class="plate">{fill(t.screen4.plate, { rate: fmtCount(rate) })}</p>
      {/if}
    {:else if screen === 5}
      <Line who="margo" text={t.screen5.margo1} />
      <p class="plate">{t.screen5.plate}</p>
    {:else}
      <Bet
        question={t.screen6.question}
        options={[
          { id: "all", label: t.screen6.all },
          { id: "none", label: t.screen6.none },
          { id: "unknown", label: t.screen6.unknown },
        ]}
        onAnswer={answer}
      />
      {#if answered}<p class="plate">{t.screen6.saved}</p>{/if}
    {/if}
    <div class="actions"><button class="primary" disabled={!ready} onclick={next}>{ru.ui.next}</button></div>
  </section>
{/key}

<style>
  .sign { font-size: 1.5rem; font-weight: 600; border: 2px solid var(--ink); padding: 0.75rem 1rem; display: inline-block; }
  .headline { font-size: 1.5rem; font-weight: 600; line-height: 1.3; border-left: 6px solid var(--margo); padding-left: 1rem; }
  .tap { display: flex; align-items: center; gap: 1rem; border-color: var(--who); }
  .counter { color: var(--who); overflow-wrap: anywhere; }
</style>
