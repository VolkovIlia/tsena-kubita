<script lang="ts">
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { states, wireValues } from "../../model/circuit";
  import { basis, type Amps } from "../../model/statevector";
  import Frame from "../../ui/Frame.svelte";
  import Circuit from "./Circuit.svelte";
  import { BRIDGE, TURN_DEG } from "./numbers";

  /** Мост от стрелки к схемам: двойной поворот кубита A, записанный схемой, и CNOT с A на B. Игрок применяет вентили по одному. */
  let { set, done }: { set: SceneProps["set"]; done: SceneProps["done"] } = $props();
  const t = ru.ch5.scene;

  const STATES = states(BRIDGE, basis(BRIDGE.wires.length));
  const GATES = BRIDGE.gates.length;
  const GROUPS = [
    { label: t.qubitA, rows: [0] },
    { label: t.qubitB, rows: [1] },
  ];
  const INPUTS = BRIDGE.wires.map(() => 0);
  /** Угол стрелки кубита q, градусы (0 — «0», 90 — «1»); кубиты здесь не запутаны, у каждого своя стрелка. */
  function angle(s: Amps, q: number): number {
    const j = s.reduce((best, a, i) => (Math.abs(a) > Math.abs(s[best]) ? i : best), 0);
    return Math.round((Math.atan2(s[j | (1 << q)], s[j & ~(1 << q)]) * 180) / Math.PI);
  }

  let applied = $state(0);
  const now = $derived(STATES[applied]);
  const values = $derived(wireValues(BRIDGE, now));
  const arrows = $derived(BRIDGE.wires.map((_, q) => angle(now, q)));
  function apply() {
    if (applied >= GATES) return;
    applied += 1;
    if (applied === GATES) {
      set("wired", 1);
      done();
    }
  }
</script>

<Frame>
  <svg viewBox="0 0 640 360" role="img" aria-label={t.wiresLabel}>
    <g class="ex-qc">
      <Circuit circuit={BRIDGE} {applied} {values} inputs={INPUTS} groups={GROUPS} {arrows} turnLabel={`${TURN_DEG}°`} top={90} maxGap={130} />
      <text class="legend" x="320" y="280" text-anchor="middle">{t.legend}</text>
      <text class="tick num" x="20" y="345">{fill(t.counter, { n: fmtExact(applied) })}</text>
    </g>
  </svg>
</Frame>
<p class="vh" aria-live="polite">{values.map((v, q) => `${GROUPS[q].label}: ${v ?? "·"}`).join(", ")}</p>
<div class="controls"><button class="primary" disabled={applied >= GATES} onclick={apply}>{t.apply}</button></div>

<style>
  .legend { font-size: 18px; fill: var(--muted); }
  .tick { font-size: 26px; font-weight: 600; fill: var(--ex); }
  .controls { display: flex; justify-content: center; margin-top: 0.5rem; }
</style>
