<script lang="ts">
  import { onDestroy } from "svelte";
  import params from "../../../data/params.json";
  import { game } from "../../game/store.svelte";
  import { fill, fmtCount, fmtDuration } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { bestExecutor, sandboxSeconds, scenario, type ExecutorId, type Speedup } from "../../model/tick";
  import Lanes from "../../ui/Lanes.svelte";
  import LogSlider from "../../ui/LogSlider.svelte";
  import { race } from "../../ui/motion";
  import { exName } from "../../ui/names";
  import { executorIds } from "./cards";

  const t = ru.ch10.sandbox;
  const KINDS = Object.keys(t.kinds) as Speedup[];
  let logN = $state(Math.round(Math.log10(scenario.key_codes)));
  let logCheck = $state(Math.round(Math.log10(scenario.check_ticks)));
  let kind = $state<Speedup>("sqrt");
  let clock = $state(0);
  let copy = $state<"idle" | "ok" | "fail">("idle");

  const n = $derived(10 ** logN);
  const check = $derived(Math.round(10 ** logCheck));
  const times = $derived(
    Object.fromEntries(executorIds.map((id) => [id, sandboxSeconds(id, n, check, kind)])) as Record<ExecutorId, number>,
  );
  const best = $derived(bestExecutor(times));
  const lanes = $derived(executorIds.map((id) => ({ id, seconds: times[id] })));
  const rulesText = $derived(
    [
      t.rulesTitle,
      ...game.p.notebook.map((r) => `— ${ru.rules[r]}`),
      ...(game.p.memo.length ? [t.memoTitle] : []),
      ...game.p.memo.map((m) => `— ${ru.ch10.memoChips[m as keyof typeof ru.ch10.memoChips] ?? m}`),
    ].join("\n"),
  );

  let cancel = () => {};
  onDestroy(() => cancel());
  $effect(() => {
    const all = Object.values(times);
    cancel();
    clock = 0;
    cancel = race(Math.max(...all), (v) => (clock = v), () => {});
  });

  async function copyRules() {
    try {
      await navigator.clipboard.writeText(rulesText);
      copy = "ok";
    } catch {
      copy = "fail";
    }
  }
</script>

<div class="sandbox">
  <div class="controls">
    <LogSlider label={fill(t.n, { n: fmtCount(n) })} min={scenario.sandbox_log_n_min} max={scenario.sandbox_log_n_max} step={1} bind:value={logN} />
    <LogSlider label={fill(t.check, { c: fmtCount(check) })} min={0} max={Math.log10(scenario.check_ticks_realistic)} step={1} bind:value={logCheck} />
    <p class="kind" id="sandbox-kind">{t.kind}</p>
    <div class="actions" role="group" aria-labelledby="sandbox-kind">
      {#each KINDS as k (k)}
        <button aria-pressed={kind === k} onclick={() => (kind = k)}>{t.kinds[k]}</button>
      {/each}
    </div>
  </div>
  <div class="result">
    <Lanes {lanes} t={clock} />
    <p class="best ex-{best}" aria-live="polite">{fill(t.best, { name: exName(best) })}</p>
    {#if kind === "poly" && !params.poly_speedup.verified}
      <p class="note">{fill(t.qcTime, { t: fmtDuration(times.qc), note: ru.ui.estimate })}</p>
    {/if}
    <div class="actions copy">
      <button onclick={copyRules}>{t.copy}</button>
      {#if copy === "ok"}<span role="status">{t.copied}</span>{/if}
      {#if copy === "fail"}<span role="status">{t.copyFail}</span>{/if}
    </div>
  </div>
  {#if copy === "fail"}<pre>{rulesText}</pre>{/if}
</div>

<style>
  .kind { font-weight: 600; margin: 0; }
  .actions { margin: 0.75rem 0 1.25rem; align-items: center; }
  .best { font-weight: 600; margin-top: 1rem; color: var(--ex); }
  .note { color: var(--muted); }
  pre { white-space: pre-wrap; font-family: inherit; border: 1px solid var(--line); padding: 0.75rem; }
  @media (min-width: 700px) {
    .sandbox { display: grid; grid-template-columns: 1fr 1fr; column-gap: 1.5rem; align-items: start; }
    .sandbox :global(.slider) { margin: 0.5rem 0; }
    .actions { margin: 0.5rem 0; gap: 0.5rem; }
    .result { padding-top: 0.5rem; }
    .best { margin: 0.75rem 0 0.25rem; }
    .note { margin: 0; }
    pre { grid-column: 1 / -1; columns: 2; column-gap: 1.5rem; margin: 0; font-size: 0.875rem; line-height: 1.35; padding: 0.5rem 0.75rem; }
  }
</style>
