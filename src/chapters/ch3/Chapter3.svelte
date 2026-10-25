<script lang="ts">
  import { onDestroy } from "svelte";
  import { recordBet } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill, fmtCount, fmtPercent } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { mark, measure, probabilities, reflect, uniform, type Amps } from "../../model/statevector";
  import { groverOptimal, groverSuccess, scenario } from "../../model/tick";
  import Avatar from "../../ui/Avatar.svelte";
  import Bet from "../../ui/Bet.svelte";
  import Curious from "../../ui/Curious.svelte";
  import Line from "../../ui/Line.svelte";
  import { reducedMotion, screenFocus } from "../../ui/motion";
  import Pinball from "./Pinball.svelte";

  let { onDone }: { onDone: () => void } = $props();
  const t = ru.ch3;
  const QUBITS = Math.log2(scenario.pinball_doors);
  const OPTIMAL = groverOptimal(scenario.pinball_doors);
  const STEP_MS = 700;
  const target = Math.floor(Math.random() * scenario.pinball_doors);

  let screen = $state(1);
  let amps = $state<Amps>(uniform(QUBITS));
  let opened = $state<number | null>(null);
  let looks = $state(0);
  let hits = $state(0);
  let hint = $state(false);

  // Экран 4: ставка и проигрыш повторов
  let attempt = $state(0);
  let failures = $state(0);
  let chosen = $state<number | null>(null);
  let chain = $state<string[]>([]);
  let playing = $state(false);
  let shown = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];
  onDestroy(() => timers.forEach(clearTimeout));

  const chance = $derived(probabilities(amps)[target]);
  const ready = $derived(
    screen === 2
      ? looks >= 3
      : screen === 3
        ? chance >= groverSuccess(scenario.pinball_doors, 1) - 1e-9
        : screen === 4
          ? !playing && (chosen === OPTIMAL || shown)
          : true,
  );

  function look() {
    opened = measure(amps, Math.random);
    looks += 1;
    if (opened === target) hits += 1;
  }

  function isUniform(a: Amps): boolean {
    const u = uniform(QUBITS);
    return a.every((x, i) => Math.abs(x - u[i]) < 1e-12);
  }

  function onReflect() {
    hint = isUniform(amps);
    amps = reflect(amps);
  }

  function reset() {
    amps = uniform(QUBITS);
    opened = null;
    hint = false;
  }

  function next() {
    if (screen === 6) return onDone();
    reset();
    screen += 1;
  }

  /** Проигрывает k пар «Метка → Отражение» от равной суперпозиции, по шагу на операцию. */
  function play(k: number, done: () => void) {
    reset();
    playing = true;
    chain = [fmtPercent(probabilities(amps)[target])];
    const ops = Array.from({ length: 2 * k }, (_, i) => i);
    const delay = reducedMotion() ? 0 : STEP_MS;
    ops.forEach((i) => {
      timers.push(
        setTimeout(() => {
          amps = i % 2 === 0 ? mark(amps, target) : reflect(amps);
          if (i % 2 === 1) chain = [...chain, fmtPercent(probabilities(amps)[target])];
        }, delay * (i + 1)),
      );
    });
    timers.push(
      setTimeout(() => {
        playing = false;
        done();
      }, delay * (ops.length + 1)),
    );
  }

  function bet(id: string) {
    const k = Number(id);
    if (attempt === 0) update((p) => recordBet(p, { chapter: "ch3", id: "repeats", correct: k === OPTIMAL }));
    chosen = k;
    play(k, () => {
      if (k !== OPTIMAL) failures += 1;
      if (failures >= 3 && k !== OPTIMAL) showOptimal();
    });
  }

  function showOptimal() {
    chosen = null;
    play(OPTIMAL, () => (shown = true));
  }

  function retry() {
    chosen = null;
    chain = [];
    attempt += 1;
    reset();
  }

  const verdict = $derived(
    chosen === null ? null : chosen < OPTIMAL ? t.screen4.oracleUnder : chosen > OPTIMAL ? t.screen4.oracleOver : t.screen4.oracleRight,
  );
  const repeatOptions = Array.from({ length: 4 }, (_, i) => ({ id: String(i + 1), label: String(i + 1) }));
  const bigN = scenario.pinball_big_n;
  const bigK = groverOptimal(bigN);
</script>

{#key screen}
  <section class="screen" tabindex="-1" use:screenFocus>
    {#if screen === 1}
      <p class="stage">{t.screen1.stage}</p>
      <div class="cryostat"><Avatar who="oracle" size={120} /></div>
      <Line who="oracle" text={t.screen1.oracle1} />
      <Line who="oracle" text={t.screen1.oracle2} />
    {:else if screen === 2}
      <Line who="margo" text={fill(t.screen2.margo1, { doors: String(scenario.pinball_doors) })} />
      <Pinball {amps} target={null} showMean={false} {opened} />
      <div class="actions"><button onclick={look}>{t.screen2.look}</button></div>
      {#if opened !== null}
        <p aria-live="polite">
          <strong>{opened === target ? t.screen2.prize : t.screen2.empty}</strong>
          <span class="num">{fill(t.screen2.tally, { opened: String(looks), hits: String(hits) })}</span>
        </p>
      {/if}
      {#if looks >= 3}
        <Line who="oracle" text={t.screen2.oracle1} />
        <Line who="margo" text={t.screen2.margo2} />
      {/if}
    {:else if screen === 3}
      <Line who="oracle" text={t.screen3.oracle1} />
      <Pinball {amps} {target} showMean={true} {opened} />
      <p class="counter who-oracle" aria-live="polite">{fill(t.screen3.chance, { p: fmtPercent(chance) })}</p>
      <div class="actions">
        <button onclick={() => ((amps = mark(amps, target)), (hint = false))}>{t.screen3.mark}</button>
        <button onclick={onReflect}>{t.screen3.reflect}</button>
        <button onclick={reset}>{t.screen3.reset}</button>
      </div>
      {#if hint}<Line who="oracle" text={t.screen3.oracleHint} />{/if}
    {:else if screen === 4}
      {#key attempt}
        <Bet question={t.screen4.question} options={repeatOptions} onAnswer={bet} />
      {/key}
      <Pinball {amps} {target} showMean={true} {opened} />
      {#if chain.length}<p class="counter who-oracle" aria-live="polite">{chain.join(" → ")}</p>{/if}
      {#if !playing && shown}
        <Line who="oracle" text={fill(t.screen4.oracleShow, { k: String(OPTIMAL) })} />
      {:else if !playing && verdict}
        <Line who="oracle" text={verdict} />
        <div class="actions">
          {#if chosen === OPTIMAL}
            <button onclick={look}>{t.screen2.look}</button>
          {:else if failures < 3}
            <button onclick={retry}>{t.screen4.retry}</button>
          {/if}
        </div>
        {#if chosen === OPTIMAL && opened !== null}
          <p aria-live="polite"><strong>{opened === target ? t.screen2.prize : t.screen2.empty}</strong></p>
        {/if}
      {/if}
    {:else if screen === 5}
      <h2>{fill(t.screen5.title, { n: fmtCount(bigN) })}</h2>
      <div class="bars">
        <p>{fill(t.screen5.barMaster, { n: fmtCount(bigN) })}</p>
        <div class="bar who-master" style:width="100%"></div>
        <p>{fill(t.screen5.barOracle, { k: fmtCount(bigK) })}</p>
        <div class="bar who-oracle" style:width="max(2px, {(100 * bigK) / bigN}%)"></div>
      </div>
      <p>{fill(t.screen5.compare, { n: fmtCount(bigN), k: fmtCount(bigK) })}</p>
      <p class="plate">{t.screen5.plate}</p>
    {:else}
      <p class="plate">{t.razbor.text}</p>
      <Line who="master" text={t.razbor.master1} note={t.razbor.masterNote} />
      <Line who="margo" text={t.razbor.margo1} />
      <Curious cites={["grover", "bbbv", "threeBlue"]}>
        <p>{t.razbor.footnote1}</p>
        <p>{t.razbor.footnote2}</p>
      </Curious>
      <p class="rule"><span class="eyebrow">{ru.ui.rule}</span> {ru.rules.r3}</p>
    {/if}
    <div class="actions"><button class="primary" disabled={!ready} onclick={next}>{ru.ui.next}</button></div>
  </section>
{/key}

<style>
  .cryostat { display: flex; justify-content: center; margin: 1rem 0; }
  .bars p { margin: 0.75rem 0 0.25rem; }
  .bar { height: 14px; background: var(--who); }
</style>
