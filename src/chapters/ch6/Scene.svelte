<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { mark, probabilities, reflect, uniform, type Amps } from "../../model/statevector";
  import { groverOptimal, groverSuccess, handSteps, scenario, stepCrossover } from "../../model/tick";
  import Board from "../../ui/Board.svelte";
  import Hands from "../../ui/Hands.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { animate, reducedMotion } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import Pinball from "./Pinball.svelte";
  import { ALL, BIG, ITEMS, OPTIMAL, slides } from "./slides";

  let { slide, ctx, set, done }: SceneProps = $props();
  const t = ru.ch6.scene;
  const DOORS = scenario.pinball_doors;
  const QUBITS = Math.log2(DOORS);
  const STEP_MS = 700;
  const target = Math.floor(Math.random() * DOORS);
  const bigK = groverOptimal(BIG);
  const order = slides.map((s) => s.id);
  const at = $derived(order.indexOf(slide));
  const from = (id: string) => at >= order.indexOf(id);

  /* Пинбол на восьми дверях: настоящий вектор состояния трёх кубитов. */
  let amps = $state<Amps>(uniform(QUBITS));
  let hint = $state(false);
  let chainShown = $state<string[]>([]);
  // Тексты markDone/reflectDone цитируют первый успешный ход; лишние нажатия их не переписывают.
  let markRecorded = $state(false);
  let reflectRecorded = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];

  /* Сравнение четырёх исполнителей: шаг у всех одной длины, сцена считает пройденные шаги. */
  const COMPARE_STEP_MS = 150;
  const maxSteps = Math.max(...ALL.map((id) => handSteps(id, ITEMS)));
  let stepsDone = $state(0);
  let running = $state(false);
  let cancel = () => {};

  /* Ползунок числа вариантов: 10^lg от pinball_big_n до compare_n_big. */
  const LG_MIN = Math.log10(BIG);
  const LG_MAX = Math.log10(scenario.compare_n_big);
  const CROSS = stepCrossover("gpu");
  let lg = $state(LG_MIN);
  let found = $state(false);
  const n = $derived(Math.round(10 ** lg));

  onDestroy(() => {
    timers.forEach(clearTimeout);
    cancel();
  });

  const chance = $derived(probabilities(amps)[target]);

  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    amps = uniform(QUBITS);
    hint = false;
    chainShown = [];
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

  function startCompare() {
    cancel();
    running = true;
    stepsDone = 0;
    cancel = animate(
      maxSteps * COMPARE_STEP_MS,
      (f) => (stepsDone = f * maxSteps),
      () => {
        running = false;
        done();
      },
    );
  }

  function skipCompare() {
    cancel();
    running = false;
    stepsDone = maxSteps;
    done();
  }

  // Вход в слайд: сброс или проигрыш. Состояние сцены сохраняется между слайдами без действий.
  $effect(() => {
    const s = slide;
    untrack(() => {
      if (s === "mark" || s === "bet") reset();
      else if (s === "play") play(Number(ctx.answers.repeats ?? OPTIMAL));
      else if (s === "optimum") play(OPTIMAL + 1);
      else if (s === "compare") stepsDone = 0;
      else if (from("compare") && !running) stepsDone = maxSteps;
    });
  });

  $effect(() => {
    if (slide !== "stepSlider" || found || n < CROSS) return;
    found = true;
    untrack(done);
  });

  const buttons = $derived(slide === "mark" ? ["mark"] : slide === "reflect" ? ["mark", "reflect", "reset"] : []);
  const locked = $derived((slide === "mark" && markRecorded) || (slide === "reflect" && reflectRecorded));
  const showChance = $derived(from("mark") && !from("million"));
  const showChain = $derived(chainShown.length > 0 && (slide === "play" || slide === "verdict" || slide === "optimum"));
</script>

<div class="scene">
  {#if slide === "rule"}
    <!-- Сцена пуста: правило в блокноте. -->
  {:else if from("stepSlider")}
    <Board ids={ALL} rows={["steps"]} {n} />
    {#if slide === "stepSlider"}
      <LogSlider label={fill(t.slider, { n: fmtCount(n) })} min={LG_MIN} max={LG_MAX} step={0.1} bind:value={lg} />
      {#if found}
        <p class="found ex-qc" aria-live="polite">{fill(t.found, { n: fmtCount(CROSS) })}</p>
      {/if}
    {/if}
  {:else if from("fewestDone")}
    <Board ids={ALL} rows={["hands", "steps"]} n={BIG} />
  {:else if from("compare")}
    <div class="hands">
      {#each ALL as id (id)}
        <Hands ex={id} mode="search" items={ITEMS} target={target} progress={Math.min(1, stepsDone / handSteps(id, ITEMS))} />
      {/each}
    </div>
    {#if slide === "compare"}
      <div class="actions">
        <button disabled={running} onclick={startCompare}>{ru.ui.startRace}</button>
        {#if running}<button onclick={skipCompare}>{ru.ui.skip}</button>{/if}
      </div>
    {/if}
  {:else if from("million")}
    <div class="bars">
      <p>{fill(t.barCore, { n: fmtCount(BIG) })}</p>
      <div class="bar ex-core" style:width="100%"></div>
      <p>{fill(t.barQc, { name: exName("qc"), k: fmtCount(bigK) })}</p>
      <div class="bar ex-qc" style:width="max(2px, {(100 * bigK) / BIG}%)"></div>
    </div>
  {:else}
    <Pinball {amps} target={from("mark") ? target : null} showMean={from("bars")} />
    {#if showChance && !showChain}
      <p class="counter ex-qc" aria-live="polite">{fill(t.chance, { p: fmtPercent(chance) })}</p>
    {/if}
    {#if showChain}
      <p class="counter ex-qc num" aria-live="polite">{chainShown.join(" → ")}</p>
    {/if}
    {#if buttons.length}
      <div class="actions">
        {#if buttons.includes("mark")}<button disabled={locked} onclick={onMark}>{t.mark}</button>{/if}
        {#if buttons.includes("reflect")}<button disabled={locked} onclick={onReflect}>{t.reflect}</button>{/if}
        {#if buttons.includes("reset")}<button disabled={locked} onclick={reset}>{t.reset}</button>{/if}
      </div>
    {/if}
    {#if hint && slide === "reflect"}<p class="hint ex-qc" aria-live="polite">{t.hint}</p>{/if}
  {/if}
</div>

<style>
  .hands {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 0.75rem 1.5rem;
    align-items: end;
    margin: 0.5rem 0;
  }
  .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0; }
  .bars p { margin: 0.75rem 0 0.25rem; }
  .bar { height: 14px; background: var(--ex); }
  .counter { font-size: 1.15rem; font-weight: 600; color: var(--ex); margin: 0.25rem 0; }
  .hint, .found { font-style: italic; color: var(--ex); }
</style>
