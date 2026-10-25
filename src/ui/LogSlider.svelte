<script lang="ts">
  let {
    label,
    min,
    max,
    step,
    value = $bindable(),
  }: { label: string; min: number; max: number; step: number; value: number } = $props();
  const id = `slider-${Math.random().toString(36).slice(2)}`;
</script>

<div class="slider">
  <label for={id} class="num">{label}</label>
  <input {id} type="range" {min} {max} {step} bind:value aria-valuetext={label} />
</div>

<style>
  .slider { display: grid; gap: 0.25rem; margin: 1rem 0; }
  label { font-weight: 600; }
  input { width: 100%; min-height: 44px; accent-color: var(--ink); }
</style>
