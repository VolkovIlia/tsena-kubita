<script lang="ts">
  import params from "../../../data/params.json";
  import { recordBet, setHype } from "../../game/progress";
  import { update } from "../../game/store.svelte";
  import { fill, fmtCount, fmtDuration, fmtNum, fmtPercent, fmtSci } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import {
    crossover,
    DEFAULT_CHECK,
    dijkstraAge,
    dijkstraSeconds,
    oracleShareDone,
    passwordLength,
    powerOfTenBelow,
    rateRatio,
    scenario,
    solveSeconds,
    steps,
  } from "../../model/tick";
  import Basis from "../../ui/Basis.svelte";
  import Bet from "../../ui/Bet.svelte";
  import CrossChart from "../../ui/CrossChart.svelte";
  import Curious from "../../ui/Curious.svelte";
  import Line from "../../ui/Line.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { screenFocus } from "../../ui/motion";
  import Race from "../../ui/Race.svelte";
  import Interlude from "./Interlude.svelte";
  import RouteTrap from "./RouteTrap.svelte";

  let { onDone }: { onDone: () => void } = $props();
  const t = ru.ch4;
  const N = scenario.safe_codes;
  const M = DEFAULT_CHECK;
  const winner = solveSeconds("oracle", N) < solveSeconds("master", N) ? "oracle" : "master";
  const factoryT = solveSeconds("factory", N);
  const ratio = fmtCount(powerOfTenBelow(rateRatio("factory", "oracle")));
  const firstCross = crossover("factory");
  const pwd = passwordLength(firstCross.n);

  let screen = $state(1);
  let betDone = $state(false);
  let raced = $state(false);
  let routed = $state(false);

  // Экран 5: три ползунка, открываются по очереди (значения — log10)
  let logN = $state(scenario.slider_log_n_min);
  let logSpeed = $state(0);
  let logCheck = $state(Math.log10(scenario.check_ticks));
  let found = $state(false);
  const speedMax = Math.log10(scenario.oracle_speedup_slider);
  const checkMax = Math.log10(scenario.check_ticks_realistic);
  const n = $derived(10 ** logN);
  const speed = $derived(10 ** logSpeed);
  const check = $derived(Math.round(10 ** logCheck));
  const tFactory = $derived(solveSeconds("factory", n, check));
  const tOracle = $derived(solveSeconds("oracle", n, check, speed));
  const cross = $derived(crossover("factory", check, speed));
  $effect(() => {
    if (tOracle <= tFactory) found = true;
  });

  const ready = $derived(
    ({ 1: betDone, 2: raced, 3: raced, 5: logCheck >= checkMax, 6: routed } as Record<number, boolean>)[screen] ?? true,
  );

  function next() {
    if (screen === 7) return onDone();
    screen += 1;
    betDone = false;
    raced = false;
  }

  function betSafe(id: string) {
    update((p) => recordBet(p, { chapter: "ch4", id: "safe", correct: id === winner }));
    betDone = true;
  }

  function betRoute(id: string) {
    update((p) => recordBet(p, { chapter: "ch4", id: "route", correct: id === "master" }));
    betDone = true;
  }
</script>

{#key screen}
  <section class="screen" tabindex="-1" use:screenFocus>
    {#if screen === 1}
      <p class="speech">{fill(t.screen1.order1, { n: fmtCount(N), digits: String(Math.log10(N)) })}</p>
      <p class="speech">{fill(t.screen1.order2, { m: fmtCount(M) })}</p>
      <Bet
        question={t.screen1.question}
        options={[
          { id: "master", label: t.screen1.master },
          { id: "oracle", label: t.screen1.oracle },
        ]}
        onAnswer={betSafe}
      />
    {:else if screen === 2}
      <Race
        lanes={[
          { id: "master", checks: N, seconds: solveSeconds("master", N) },
          { id: "oracle", checks: steps("oracle", N), seconds: solveSeconds("oracle", N) },
        ]}
        stopAt="all"
        onFinish={() => ((raced = true), update((p) => setHype(p, 100)))}
      />
      {#if raced}
        <Line who="margo" text={t.screen2.margo1} />
        <p class="stage">{t.screen2.stage}</p>
      {/if}
      <Basis ids={["master", "oracle"]} />
    {:else if screen === 3}
      <Line who="factory" text={t.screen3.factory1} />
      <Race
        lanes={[
          { id: "master", checks: N, seconds: solveSeconds("master", N) },
          { id: "oracle", checks: steps("oracle", N), seconds: solveSeconds("oracle", N) },
          { id: "factory", checks: N, seconds: factoryT },
        ]}
        stopAt={factoryT}
        onFinish={() => (raced = true)}
      />
      {#if raced}
        <p class="plate">
          {fill(t.screen3.caption, { f: fmtDuration(factoryT), pct: fmtPercent(oracleShareDone(N, factoryT)) })}
        </p>
        <Line who="oracle" text={t.screen3.oracle1} />
      {/if}
      <Basis ids={["factory", "oracle"]} />
    {:else if screen === 4}
      <Interlude onDone={() => (screen = 5)} />
    {:else if screen === 5}
      <p class="question">{t.screen5.question}</p>
      <CrossChart speedup={speed} checkTicks={check} {logN} />
      <p class="num">{fill(t.screen5.cross, { n: fmtSci(cross.n), t: fmtDuration(cross.seconds) })}</p>
      <LogSlider
        label={fill(t.screen5.sliderN, { n: fmtSci(n) })}
        min={scenario.slider_log_n_min}
        max={scenario.slider_log_n_max}
        step={0.1}
        bind:value={logN}
      />
      <p class="num readout">
        <span class="who-factory">{fill(t.screen5.timeFactory, { t: fmtDuration(tFactory) })}</span>
        <span class="who-oracle">{fill(t.screen5.timeOracle, { t: fmtDuration(tOracle) })}</span>
      </p>
      {#if found}
        <p class="plate">
          {fill(t.screen5.found, {
            n: fmtSci(firstCross.n),
            lo: String(Math.floor(pwd)),
            hi: String(Math.ceil(pwd)),
            t: fmtDuration(firstCross.seconds),
          })}
        </p>
        <LogSlider label={fill(t.screen5.sliderSpeed, { x: fmtNum(speed) })} min={0} max={speedMax} step={1} bind:value={logSpeed} />
      {/if}
      {#if found && logSpeed >= speedMax}
        <Line who="margo" text={t.screen5.margo1} />
        <LogSlider
          label={fill(t.screen5.sliderCheck, { m: fmtCount(check) })}
          min={Math.log10(scenario.check_ticks)}
          max={checkMax}
          step={1}
          bind:value={logCheck}
        />
      {/if}
    {:else if screen === 6}
      <Line who="margo" text={fill(t.screen6.margo1, { nodes: fmtCount(scenario.route_nodes) })} />
      <Line who="margo" text={t.screen6.margo2} />
      <Bet
        question={t.screen6.question}
        options={[
          { id: "oracle", label: t.screen6.oracle },
          { id: "master", label: t.screen6.master },
        ]}
        onAnswer={betRoute}
      />
      {#if betDone}
        <RouteTrap onDone={() => (routed = true)} />
      {/if}
      {#if routed}
        <p class="plate">{fill(t.screen6.caption, { t: fmtDuration(dijkstraSeconds(scenario.route_nodes)) })}</p>
        <Line who="master" text={t.screen6.master1} />
        <Line who="master" text={fill(t.screen6.master2, { age: String(dijkstraAge()) })} />
        <Line who="margo" text={fill(t.screen6.margo3, { stops: String(scenario.tsp_stops) })} />
        <Line who="master" text={t.screen6.master3} />
        <Line who="master" text={t.screen6.master4} />
        <Curious cites={["dijkstra", "bast", "concorde", "ambainis"]}>
          <p>
            {fill(t.screen6.footnote1, {
              nodes: fmtCount(params.road_network.nodes),
              t: fmtDuration(params.road_network.dijkstra_seconds),
              n: fmtCount(scenario.route_nodes),
            })}
          </p>
          <p>
            {fill(t.screen6.footnote2, {
              stops: String(params.tsp.instance_stops),
              t: fmtDuration(params.tsp.concorde_seconds),
              year: String(params.tsp.year),
            })}
          </p>
        </Curious>
      {/if}
    {:else}
      <p class="plate">{fill(t.razbor.text, { ratio })}</p>
      <Line who="oracle" text={t.razbor.oracle1} note={t.razbor.oracleNote} />
      <p class="rule"><span class="eyebrow">{ru.ui.rule}</span> {ru.rules.r4}</p>
    {/if}
    {#if screen !== 4}
      <div class="actions"><button class="primary" disabled={!ready} onclick={next}>{ru.ui.next}</button></div>
    {/if}
  </section>
{/key}

<style>
  .question { font-size: 1.25rem; font-weight: 600; }
  .readout { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; font-weight: 600; }
  .readout span { color: var(--who); }
</style>
