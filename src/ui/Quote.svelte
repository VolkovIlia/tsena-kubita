<script lang="ts">
  import type { PersonId } from "../deck/types";
  import { ru, type Cite } from "../i18n/ru";

  /** Дословная цитата реального человека в переводе: текст, автор и ссылка на открытый источник (все источники англоязычные). */
  let { who, text, cite }: { who: PersonId; text: string; cite: Cite } = $props();
</script>

<blockquote>
  <p class="speech">«{text}»</p>
  <footer>— {ru.people[who]} ({ru.ui.translation}), <a href={ru.cite[cite].url} target="_blank" rel="noopener">{ru.ui.source}</a></footer>
</blockquote>

<style>
  blockquote { margin: 0.75rem 0; padding: 0.25rem 0 0.25rem 0.75rem; border-left: 3px solid var(--muted); }
  p { margin: 0 0 0.25rem; }
  footer { font-size: 0.875rem; color: var(--muted); }
  a { display: inline-flex; align-items: center; min-height: 44px; }
</style>
