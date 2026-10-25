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
  import { executorIds } from "./cards";

  let { best = $bindable() }: { best: ExecutorId } = $props();

  const t = ru.ch7.sandbox;
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
  const lanes = $derived(executorIds.map((id) => ({ id, seconds: times[id], mood: best === id ? ("happy" as const) : undefined })));
  const rulesText = $derived(
    [
      t.rulesTitle,
      ...game.p.notebook.map((r) => `— ${ru.rules[r]}`),
      ...(game.p.memo.length ? [t.memoTitle] : []),
      ...game.p.memo.map((m) => `— ${ru.ch7.memoChips[m as keyof typeof ru.ch7.memoChips] ?? m}`),
    ].join("\n"),
  );

  let cancel = () => {};
  onDestroy(() => cancel());
  $effect(() => {
    const all = times;
    best = bestExecutor(all);
    cancel();
    clock = 0;
    cancel = race(Math.max(...Object.values(all)), (v) => (clock = v), () => {});
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
  <LogSlider label={fill(t.n, { n: fmtCount(n) })} min={scenario.sandbox_log_n_min} max={scenario.sandbox_log_n_max} step={1} bind:value={logN} />
  <LogSlider label={fill(t.check, { c: fmtCount(check) })} min={0} max={Math.log10(scenario.check_ticks_realistic)} step={1} bind:value={logCheck} />
  <p class="kind" id="sandbox-kind">{t.kind}</p>
  <div class="actions" role="group" aria-labelledby="sandbox-kind">
    {#each KINDS as k (k)}
      <button aria-pressed={kind === k} onclick={() => (kind = k)}>{t.kinds[k]}</button>
    {/each}
  </div>
  <Lanes {lanes} t={clock} />
  <p class="best" aria-live="polite">{fill(t.best, { name: ru.names[best] })}</p>
  {#if kind === "poly" && !params.poly_speedup.verified}
    <p class="note">{fill(t.oracleTime, { t: fmtDuration(times.oracle), note: ru.ui.estimate })}</p>
  {/if}
  <div class="actions">
    <button onclick={copyRules}>{t.copy}</button>
    {#if copy === "ok"}<span role="status">{t.copied}</span>{/if}
  </div>
  {#if copy === "fail"}
    <p role="status">{t.copyFail}</p>
    <pre>{rulesText}</pre>
  {/if}
</div>

<style>
  .kind { font-weight: 600; margin: 0; }
  .actions { margin: 0.75rem 0 1.25rem; align-items: center; }
  .best { font-weight: 600; margin-top: 1rem; }
  .note { color: var(--muted); }
  pre { white-space: pre-wrap; font-family: inherit; border: 1px solid var(--line); padding: 0.75rem; }
</style>
