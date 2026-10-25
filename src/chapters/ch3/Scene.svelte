<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { mark, measure, probabilities, reflect, uniform, type Amps } from "../../model/statevector";
  import { groverOptimal, groverSuccess, scenario } from "../../model/tick";
  import { reducedMotion } from "../../ui/motion";
  import Peep from "../../ui/Peep.svelte";
  import Pinball from "./Pinball.svelte";
  import { OPTIMAL, slides } from "./slides";

  let { slide, ctx, set, done }: SceneProps = $props();
  const t = ru.ch3.scene;
  const DOORS = scenario.pinball_doors;
  const QUBITS = Math.log2(DOORS);
  const STEP_MS = 700;
  const LOOKS = 3;
  const target = Math.floor(Math.random() * DOORS);
  const bigN = scenario.pinball_big_n;
  const bigK = groverOptimal(bigN);
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);

  let amps = $state<Amps>(uniform(QUBITS));
  let opened = $state<number | null>(null);
  let looks = 0;
  let hits = 0;
  let hint = $state(false);
  let chainShown = $state<string[]>([]);
  // Тексты markDone/reflectDone цитируют первый успешный ход; лишние нажатия их не переписывают.
  let markRecorded = $state(false);
  let reflectRecorded = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];
  onDestroy(() => timers.forEach(clearTimeout));

  const chance = $derived(probabilities(amps)[target]);

  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    amps = uniform(QUBITS);
    opened = null;
    hint = false;
    chainShown = [];
  }

  function look() {
    opened = measure(amps, Math.random);
    looks += 1;
    if (opened === target) hits += 1;
    set("looks", looks);
    set("hits", hits);
    if (looks >= LOOKS) done();
  }

  function onMark() {
    amps = mark(amps, target);
    hint = false;
    if (slide !== "mark" || markRecorded) return;
    markRecorded = true;
    set("p", probabilities(amps)[target]);
    done();
  }

  function onReflect() {
    const u = uniform(QUBITS);
    hint = amps.every((x, i) => Math.abs(x - u[i]) < 1e-12);
    const p0 = probabilities(amps)[target];
    amps = reflect(amps);
    const p1 = probabilities(amps)[target];
    if (slide !== "reflect" || reflectRecorded || p1 < groverSuccess(DOORS, 1) - 1e-9) return;
    reflectRecorded = true;
    set("p0", p0);
    set("p1", p1);
    done();
  }

  /** Проигрывает k пар «Метка → Отражение» от равной суперпозиции, по шагу на операцию. */
  function play(k: number) {
    reset();
    set("k", k);
    chainShown = [fmtPercent(chance)];
    const delay = reducedMotion() ? 0 : STEP_MS;
    for (let i = 0; i < 2 * k; i++) {
      timers.push(
        setTimeout(() => {
          amps = i % 2 === 0 ? mark(amps, target) : reflect(amps);
          if (i % 2 === 1) chainShown = [...chainShown, fmtPercent(probabilities(amps)[target])];
        }, delay * (i + 1)),
      );
    }
    timers.push(setTimeout(done, delay * (2 * k + 1)));
  }

  // Вход в слайд: сброс или проигрыш. Состояние сцены сохраняется между слайдами без действий.
  $effect(() => {
    const s = slide;
    untrack(() => {
      if (s === "mark" || s === "bet") reset();
      else if (s === "play") play(Number(ctx.answers.repeats ?? OPTIMAL));
      else if (s === "optimum") play(OPTIMAL + 1);
    });
  });

  const buttons = $derived(slide === "doors" ? ["look"] : slide === "mark" ? ["mark"] : slide === "reflect" ? ["mark", "reflect", "reset"] : []);
  const locked = $derived((slide === "mark" && markRecorded) || (slide === "reflect" && reflectRecorded));
  const showChance = $derived(from("mark") && !from("million"));
</script>

<div class="scene">
  <div class="cryostat"><Peep who="oracle" size={96} mood={slide === "reflectDone" ? "happy" : "calm"} /></div>
  {#if from("million")}
    <div class="bars">
      <p>{fill(t.barMaster, { n: fmtCount(bigN) })}</p>
      <div class="bar who-master" style:width="100%"></div>
      <p>{fill(t.barOracle, { k: fmtCount(bigK) })}</p>
      <div class="bar who-oracle" style:width="max(2px, {(100 * bigK) / bigN}%)"></div>
    </div>
  {:else}
    <Pinball {amps} target={from("mark") ? target : null} showMean={from("bars")} {opened} />
  {/if}
  {#if slide === "doors" && opened !== null}
    <p aria-live="polite"><strong>{opened === target ? t.prize : t.empty}</strong></p>
  {/if}
  {#if showChance && chainShown.length === 0}
    <p class="counter who-oracle" aria-live="polite">{fill(t.chance, { p: fmtPercent(chance) })}</p>
  {/if}
  {#if chainShown.length && (slide === "play" || slide === "verdict" || slide === "optimum")}
    <p class="counter who-oracle num" aria-live="polite">{chainShown.join(" → ")}</p>
  {/if}
  {#if buttons.length}
    <div class="actions">
      {#if buttons.includes("look")}<button onclick={look}>{t.look}</button>{/if}
      {#if buttons.includes("mark")}<button disabled={locked} onclick={onMark}>{t.mark}</button>{/if}
      {#if buttons.includes("reflect")}<button disabled={locked} onclick={onReflect}>{t.reflect}</button>{/if}
      {#if buttons.includes("reset")}<button disabled={locked} onclick={reset}>{t.reset}</button>{/if}
    </div>
  {/if}
  {#if hint && slide === "reflect"}<p class="hint who-oracle" aria-live="polite">{t.hint}</p>{/if}
</div>

<style>
  .scene { position: relative; }
  .cryostat { display: flex; justify-content: flex-end; }
  .bars p { margin: 0.75rem 0 0.25rem; }
  .bar { height: 14px; background: var(--who); }
  .counter { font-size: 1.15rem; font-weight: 600; color: var(--who); }
  .hint { font-style: italic; color: var(--who); }
</style>
