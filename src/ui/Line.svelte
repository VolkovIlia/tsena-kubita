<script lang="ts">
  import { ru } from "../i18n/ru";
  import Avatar from "./Avatar.svelte";
  import type { Speaker } from "./types";

  let { who, text, note }: { who: Speaker; text: string; note?: string } = $props();
</script>

<div class="line who-{who}">
  <Avatar {who} />
  <p>
    <span class="name">{ru.executors[who]}{#if note}<em class="note">, {note}</em>{/if}</span>
    <span class="speech">{text}</span>
  </p>
</div>

<style>
  .line { display: grid; grid-template-columns: 48px 1fr; gap: 0.75rem; align-items: start; margin: 1rem 0; }
  p { margin: 0; }
  .name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--who); }
  .note { font-weight: 400; }
  .speech { display: block; }
</style>
