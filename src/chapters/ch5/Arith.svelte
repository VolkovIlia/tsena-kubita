<script lang="ts">
  import { onDestroy } from "svelte";
  import type { SceneProps } from "../../deck/types";
  import { fill, fmtCount, fmtExact } from "../../i18n/format";
  import { ru } from "../../i18n/ru";
  import { basisIndex, decode, encode, states, wireValues, withTurns, type Circuit as Circ, type Reg } from "../../model/circuit";
  import { basis, measure, probabilities, type Amps } from "../../model/statevector";
  import { stateVectorSize } from "../../model/tick";
  import Frame from "../../ui/Frame.svelte";
  import { animate } from "../../ui/motion";
  import Circuit, { type Group } from "./Circuit.svelte";
  import { ADD, ALL_PAIRS, ALL_TICKS, BITS, MUL, Q_ADD, Q_MUL, RELAY_ADD, RELAY_MUL, RUNS, TURN, TURN_DEG, X, Y } from "./numbers";

  let { slide, set, done }: { slide: string; set: SceneProps["set"]; done: SceneProps["done"] } = $props();
  const t = ru.ch5.scene;

  /** Задержка на вентиль в анимации, мс: сложение медленно, умножение быстрее, все пары — быстрее всего. */
  const MS = { add: 300, mul: 100, all: 60 };
  const ADD_STATES = states(ADD, basis(ADD.wires.length, encode(ADD, { a: X, b: Y })));
  const bitsOf = (c: Circ, i: number | null) => c.wires.map((_, q) => (i === null ? null : (i >> q) & 1));
  /** Метки «вверх» и «обратно» над сумматором, сдвинутые на off вентилей спереди. */
  const marksOf = (off: number) => [
    { from: off, to: off + 3 * BITS, text: t.up },
    { from: off + 3 * BITS + 1, to: off + 6 * BITS, text: t.back },
  ];
  const MARKS = marksOf(0);
  const infoOf = (c: Circ) => fill(t.qubitsInfo, { q: String(c.wires.length), amps: fmtCount(stateVectorSize(c.wires.length)) });
  const INFO = infoOf(MUL);
  /** Разряды регистра на схеме — от старшего к младшему, сверху вниз. */
  const rowsOf = (c: Circ, reg: Reg) =>
    c.wires.flatMap((w, q) => (w.reg === reg ? [{ i: w.i, q }] : [])).sort((x, y) => y.i - x.i).map((x) => x.q);
  /**
   * Регистры схемы: a, b, перенос; у сложения ответ ложится в b со старшим разрядом z,
   * у умножения — в отдельный регистр ответа, рядом строка «И». «all» — число не задано, на входе повороты.
   */
  function groupsOf(c: Circ, a: number | "all", b: number | "all"): Group[] {
    const named = (name: string, v: number | "all") => fill(t.regIs, { name, n: v === "all" ? t.all : String(v) });
    const A = { label: named(t.regA, a), rows: rowsOf(c, "a") };
    const carry = { label: t.carryReg, rows: rowsOf(c, "c") };
    if (c.wires.some((w) => w.reg === "z"))
      return [A, { label: named(t.regB, b), rows: [...rowsOf(c, "z"), ...rowsOf(c, "b")], answer: true }, carry];
    return [
      A,
      { label: named(t.regB, b), rows: rowsOf(c, "b") },
      { label: t.answerReg, rows: rowsOf(c, "p"), answer: true },
      { label: t.andRow, rows: rowsOf(c, "s") },
      carry,
    ];
  }
  /** Биты на входе схемы: до поворотов каждый кубит «all»-числа — «0». */
  const inputsOf = (c: Circ, a: number | "all", b: number | "all") =>
    bitsOf(c, encode(c, { a: a === "all" ? 0 : a, b: b === "all" ? 0 : b }));
  const ADD_GROUPS = groupsOf(ADD, X, Y);
  const ADD_INPUTS = inputsOf(ADD, X, Y);

  let cancel = () => {};
  onDestroy(() => cancel());

  /* Сложение. */
  let addApplied = $state(0);
  let addStarted = $state(false);
  function add() {
    addStarted = true;
    cancel = animate(
      Q_ADD * MS.add,
      (f) => (addApplied = Math.floor(Q_ADD * f)),
      () => {
        set("qadded", 1);
        done();
      },
    );
  }

  /* Умножение: сначала 2 × 2, потом все пары сразу RUNS раз. Векторы состояний — заранее, по одному на вентиль. */
  const MUL_STATES = states(MUL, basis(MUL.wires.length, encode(MUL, { a: X, b: Y })));
  const ALL_STATES = states(ALL_PAIRS, basis(ALL_PAIRS.wires.length));
  let mode = $state<"mul" | "all">("mul");
  let applied = $state(0);
  let running = $state(false);
  let multiplied = $state(false);
  let runs = $state(0);
  let result = $state<number | null>(null);

  function multiply() {
    running = true;
    cancel = animate(
      Q_MUL * MS.mul,
      (f) => (applied = Math.floor(Q_MUL * f)),
      () => {
        running = false;
        multiplied = true;
        set("multiplied", 1);
      },
    );
  }

  function allPairs() {
    mode = "all";
    applied = 0;
    result = null;
    running = true;
    cancel = animate(
      ALL_TICKS * MS.all,
      (f) => (applied = Math.floor(ALL_TICKS * f)),
      () => {
        const k = runs;
        result = measure(ALL_STATES[ALL_TICKS], Math.random);
        running = false;
        runs = k + 1;
        set(`pair${k}`, result);
        set("runs", runs);
        if (runs === RUNS) {
          set("allDone", 1);
          done();
        }
      },
    );
  }

  const mulCircuit = $derived(mode === "all" ? ALL_PAIRS : MUL);
  const mulValues = $derived(
    mode === "mul"
      ? wireValues(MUL, MUL_STATES[applied])
      : running || result === null
        ? wireValues(ALL_PAIRS, ALL_STATES[applied])
        : bitsOf(ALL_PAIRS, result),
  );
  const product = $derived.by(() => {
    if (mode === "mul") return fill(t.product, { x: String(X), y: String(Y), p: applied === Q_MUL ? String(X * Y) : "?" });
    if (result === null || running) return fill(t.product, { x: "?", y: "?", p: "?" });
    const d = decode(ALL_PAIRS, result);
    return fill(t.product, { x: String(d.a), y: String(d.b), p: String(d.p) });
  });
  const ticks = $derived(mode === "mul" ? applied : runs * ALL_TICKS + (running ? applied : 0));

  const sum = $derived(fill(t.sum, { x: String(X), y: String(Y), s: addApplied === Q_ADD ? String(X + Y) : "?" }));

  /* Песочница: действие и числа выбирает игрок; «все» — оба кубита числа повёрнуты на угол вентиля главы. */
  type Op = "add" | "mul";
  type Operand = number | "all";
  const VALUES: Operand[] = [...Array.from({ length: 2 ** BITS }, (_, v) => v), "all"];
  const SANDBOX_MS: Record<Op, number> = { add: 150, mul: 60 };
  let op = $state<Op>("add");
  let pa = $state<Operand>(X);
  let pb = $state<Operand>(Y);
  let sApplied = $state(0);
  let sRunning = $state(false);
  let sStates = $state.raw<Amps[]>([]);
  let sResult = $state<number | null>(null);
  let sRuns = $state(0);
  let sTotal = $state(0);

  function sandboxCircuit(o: Op, a: Operand, b: Operand): Circ {
    const base = o === "add" ? ADD : MUL;
    const regs = (["a", "b"] as Reg[]).filter((_, i) => [a, b][i] === "all");
    return regs.length ? withTurns(base, regs, TURN) : base;
  }
  const circ = $derived(sandboxCircuit(op, pa, pb));
  const start0 = $derived(basis(circ.wires.length, encode(circ, { a: pa === "all" ? 0 : pa, b: pb === "all" ? 0 : pb })));

  /** Любой новый выбор — ответ снова «?». */
  function reset() {
    cancel();
    sApplied = 0;
    sStates = [];
    sResult = null;
    sRunning = false;
  }
  function pick(next: { op?: Op; a?: Operand; b?: Operand }) {
    reset();
    if (next.op) {
      op = next.op;
      pa = X;
      pb = Y;
    }
    if (next.a !== undefined) pa = next.a;
    if (next.b !== undefined) pb = next.b;
  }
  function run() {
    reset();
    sStates = states(circ, start0);
    const need = circ.gates.length;
    sRunning = true;
    cancel = animate(
      need * SANDBOX_MS[op],
      (f) => (sApplied = Math.floor(need * f)),
      () => {
        const last = sStates[need];
        sResult = basisIndex(last) ?? measure(last, Math.random);
        sRunning = false;
        sRuns += 1;
        sTotal += need;
        if (sRuns === 2) {
          set("qplayed", 1);
          done();
        }
      },
    );
  }

  const sValues = $derived(
    sResult !== null && !sRunning ? bitsOf(circ, sResult) : wireValues(circ, sStates[sApplied] ?? start0),
  );
  const sHead = $derived.by(() => {
    const shown = (v: Operand) => (v === "all" ? "?" : String(v));
    if (sResult === null || sRunning)
      return op === "add"
        ? fill(t.sum, { x: shown(pa), y: shown(pb), s: "?" })
        : fill(t.product, { x: shown(pa), y: shown(pb), p: "?" });
    const d = decode(circ, sResult);
    if (op === "mul") return fill(t.product, { x: String(d.a), y: String(d.b), p: String(d.p) });
    const s = d.b + d.z * 2 ** BITS;
    return fill(t.sum, { x: String(d.a), y: String(s - d.a), s: String(s) });
  });
  /** Сколько разных ответов может выпасть: ненулевые исходы итогового состояния. */
  const possible = $derived(
    sStates.length ? probabilities(sStates[sStates.length - 1]).filter((p) => p > 1e-9).length : 0,
  );
  const sStatus = $derived(
    [fill(t.runs, { runs: fmtExact(sRuns), n: fmtExact(sTotal) }), ...(possible > 1 ? [fill(t.possible, { k: String(possible) })] : [])].join(
      " · ",
    ),
  );

  const live = $derived(
    slide === "qadd"
      ? addApplied === Q_ADD
        ? `${sum}. ${fill(t.counter, { n: fmtExact(Q_ADD) })}`
        : ""
      : slide === "qmul" && !running && (multiplied || runs > 0)
        ? `${product}. ${fill(t.counter, { n: fmtExact(ticks) })}`
        : slide === "qsandbox" && sResult !== null && !sRunning
          ? `${sHead}. ${fill(t.counter, { n: fmtExact(sApplied) })}`
          : "",
  );
</script>

  <Frame>
    {#if slide === "qsandbox"}
      <svg viewBox="0 0 640 360" role="img" aria-label={t.sandboxLabel}>
        <g class="ex-qc">
          <text class="head num" x="20" y="28">{sHead}</text>
          <!-- У сложения верх занят метками «вверх» и «обратно»: число кубитов — под схемой. -->
          <text class="info num" x="630" y={op === "add" ? 300 : 28} text-anchor="end">{infoOf(circ)}</text>
          <Circuit
            circuit={circ}
            applied={sApplied}
            values={sValues}
            marks={op === "add" ? marksOf(circ.gates.length - ADD.gates.length) : []}
            inputs={inputsOf(circ, pa, pb)}
            groups={groupsOf(circ, pa, pb)}
            turnLabel={`${TURN_DEG}°`}
          />
          <text class="tick num" x="20" y="350">{fill(t.counter, { n: fmtExact(sApplied) })}</text>
          <text class="relay num" x="630" y="350" text-anchor="end">{fill(t.relay, { n: fmtExact(op === "add" ? RELAY_ADD : RELAY_MUL) })}</text>
        </g>
      </svg>
    {:else}
      <svg viewBox="0 0 640 360" role="img" aria-label={t.arith}>
        <g class="ex-qc">
          {#if slide === "qadd"}
            <text class="head num" x="20" y="28">{sum}</text>
            <Circuit
              circuit={ADD}
              applied={addApplied}
              values={wireValues(ADD, ADD_STATES[addApplied])}
              inputs={ADD_INPUTS}
              groups={ADD_GROUPS}
              marks={MARKS}
            />
            <text class="tick num" x="320" y="312" text-anchor="middle">{fill(t.counter, { n: fmtExact(addApplied) })}</text>
            <text class="relay num" x="630" y="312" text-anchor="end">{fill(t.relay, { n: fmtExact(RELAY_ADD) })}</text>
            <text class="legend" x="320" y="350" text-anchor="middle">{t.legend}</text>
          {:else}
            <text class="head num" x="20" y="28">{product}</text>
            <text class="info num" x="630" y="28" text-anchor="end">{INFO}</text>
            <Circuit
              circuit={mulCircuit}
              {applied}
              values={mulValues}
              inputs={inputsOf(mulCircuit, mode === "all" ? "all" : X, mode === "all" ? "all" : Y)}
              groups={groupsOf(mulCircuit, mode === "all" ? "all" : X, mode === "all" ? "all" : Y)}
              turnLabel={`${TURN_DEG}°`}
            />
            <text class="tick num" x="20" y="350">{fill(t.counter, { n: fmtExact(ticks) })}</text>
            {#if mode === "mul"}
              <text class="relay num" x="630" y="350" text-anchor="end">{fill(t.relay, { n: fmtExact(RELAY_MUL) })}</text>
            {/if}
          {/if}
        </g>
      </svg>
    {/if}
  </Frame>
  <p class="vh" aria-live="polite">{live}</p>
  {#if slide === "qadd"}
    <div class="controls"><button class="primary" disabled={addStarted} onclick={add}>{t.add}</button></div>
  {:else if slide === "qmul"}
    <div class="controls">
      {#if !multiplied}
        <button class="primary" disabled={running} onclick={multiply}>{t.mul}</button>
      {:else if runs === 0}
        <button class="primary" disabled={running} onclick={allPairs}>{t.allPairs}</button>
      {:else if runs < RUNS}
        <button class="primary" disabled={running} onclick={allPairs}>{t.again}</button>
      {/if}
    </div>
  {:else if slide === "qsandbox"}
    <div class="controls sandbox">
      <div class="group" role="group" aria-label={t.op}>
        <span class="glabel">{t.op}</span>
        <button aria-pressed={op === "add"} onclick={() => pick({ op: "add" })}>{t.opAdd}</button>
        <button aria-pressed={op === "mul"} onclick={() => pick({ op: "mul" })}>{t.opMul}</button>
      </div>
      {#each [{ label: t.operandA, value: pa, key: "a" }, { label: t.operandB, value: pb, key: "b" }] as g}
        <div class="group" role="group" aria-label={g.label}>
          <span class="glabel">{g.label}</span>
          {#each VALUES as v}
            <button class="num" aria-pressed={g.value === v} onclick={() => pick(g.key === "a" ? { a: v } : { b: v })}>{v === "all" ? t.all : String(v)}</button>
          {/each}
        </div>
      {/each}
      <button class="primary" disabled={sRunning} onclick={run}>{t.run}</button>
    </div>
    <p class="num status" aria-live="polite">{sStatus}</p>
  {/if}

<style>
  .head { font-size: 28px; font-weight: 600; }
  .info { font-size: 20px; fill: var(--muted); }
  .tick { font-size: 26px; font-weight: 600; fill: var(--ex); }
  .relay { font-size: 22px; fill: var(--muted); }
  .legend { font-size: 18px; fill: var(--muted); }
  .controls { display: flex; justify-content: center; margin-top: 0.5rem; }
  .controls.sandbox { flex-wrap: wrap; gap: 0.5rem 1rem; align-items: center; }
  .group { display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center; }
  .glabel { color: var(--muted); margin-right: 0.25rem; }
  .status { font-weight: 600; margin: 0.25rem 0 0; text-align: center; }
</style>
