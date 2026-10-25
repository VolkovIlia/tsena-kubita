<script lang="ts">
  import { ru } from "../i18n/ru";
  import { hashOf } from "../game/hash";
  import type { ChapterId } from "../game/chapters";
  import { screenFocus } from "./motion";

  const ready: ChapterId[] = ["ch0", "ch3", "ch4"];
</script>

<section class="screen" tabindex="-1" use:screenFocus>
  <h2>{ru.ui.soonTitle}</h2>
  <p>{ru.ui.soonText}</p>
  <ul>
    {#each ready as id}<li><a href={hashOf(id)}>{ru.chapters[id]}</a></li>{/each}
  </ul>
</section>
