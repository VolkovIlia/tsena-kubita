<script lang="ts">
  import type { Speaker } from "./types";

  type Mood = "calm" | "happy" | "sad" | "shock";
  let {
    who,
    mood = "calm",
    size = 48,
    x,
    y,
  }: { who: Speaker; mood?: Mood; size?: number; x?: number; y?: number } = $props();

  const grid = (n: number, step: number, start: number) =>
    Array.from({ length: n * n }, (_, i) => [start + (i % n) * step, start + Math.floor(i / n) * step]);
  /** Где лицо у каждого персонажа: центр и радиус подложки. */
  const FACE: Record<Speaker, [number, number, number]> = {
    master: [20, 20, 9],
    brigade: [24, 24, 10],
    factory: [24, 24, 10],
    oracle: [24, 24, 8],
    margo: [24, 28, 8],
    nina: [24, 12, 7],
  };
  const [cx, cy, r] = $derived(FACE[who]);
  const eye = $derived(Math.max(1.6, r * 0.25));
  const my = $derived(cy + r * 0.45);
  const bend = $derived(mood === "happy" ? 2.5 : mood === "sad" ? -2.5 : 0);
</script>

<svg class="who-{who}" {x} {y} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
  {#if who === "master"}
    <circle cx="20" cy="20" r="12" fill="none" stroke="var(--who)" stroke-width="3" />
    <line x1="29" y1="29" x2="42" y2="42" stroke="var(--who)" stroke-width="5" stroke-linecap="round" />
  {:else if who === "brigade"}
    {#each grid(8, 5, 6.5) as [cx, cy]}<circle {cx} {cy} r="1.7" fill="var(--who)" />{/each}
  {:else if who === "factory"}
    {#each grid(16, 2.6, 3) as [rx, ry]}<rect x={rx} y={ry} width="2" height="2" fill="var(--who)" />{/each}
  {:else if who === "oracle"}
    <rect x="13" y="5" width="22" height="38" rx="5" fill="none" stroke="var(--who)" stroke-width="2.5" />
    {#each [11, 37] as ly}
      <line x1="10" y1={ly} x2="38" y2={ly} stroke="var(--who)" stroke-width="2" stroke-dasharray="2 2" />
    {/each}
  {:else if who === "margo"}
    <rect x="11" y="5" width="26" height="38" rx="3" fill="none" stroke="var(--who)" stroke-width="2.5" />
    <line x1="16" y1="11" x2="32" y2="11" stroke="var(--who)" stroke-width="2" />
    <line x1="16" y1="16" x2="28" y2="16" stroke="var(--who)" stroke-width="2" />
  {:else}
    <path d="M20 20 L28 20 L28 26 L38 44 L10 44 L20 26 Z" fill="none" stroke="var(--who)" stroke-width="2.5" stroke-linejoin="round" />
  {/if}
  <circle {cx} {cy} {r} fill="var(--paper)" stroke={who === "nina" ? "var(--who)" : "none"} stroke-width="2.5" />
  <circle cx={cx - r * 0.4} cy={cy - r * 0.2} r={eye} fill="var(--ink)" />
  <circle cx={cx + r * 0.4} cy={cy - r * 0.2} r={eye} fill="var(--ink)" />
  {#if mood === "shock"}
    <circle {cx} cy={my} r="1.8" fill="none" stroke="var(--ink)" stroke-width="1.4" />
  {:else}
    <path
      d="M{cx - r * 0.4} {my - bend / 2} Q{cx} {my + bend} {cx + r * 0.4} {my - bend / 2}"
      fill="none"
      stroke="var(--ink)"
      stroke-width="1.4"
      stroke-linecap="round"
    />
  {/if}
</svg>
