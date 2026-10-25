import type { Deck } from "../deck/types";
import type { ChapterId } from "../game/chapters";
import Scene0 from "./ch0/Scene.svelte";
import { slides as slides0 } from "./ch0/slides";
import Scene1 from "./ch1/Scene.svelte";
import { slides as slides1 } from "./ch1/slides";
import Scene2 from "./ch2/Scene.svelte";
import { slides as slides2 } from "./ch2/slides";
import Scene3 from "./ch3/Scene.svelte";
import { slides as slides3 } from "./ch3/slides";
import Scene4 from "./ch4/Scene.svelte";
import { slides as slides4 } from "./ch4/slides";
import Scene5 from "./ch5/Scene.svelte";
import { slides as slides5 } from "./ch5/slides";
import Scene6 from "./ch6/Scene.svelte";
import { slides as slides6 } from "./ch6/slides";
import Scene7 from "./ch7/Scene.svelte";
import { slides as slides7 } from "./ch7/slides";

export const decks: Record<ChapterId, Deck> = {
  ch0: { slides: slides0, Scene: Scene0 },
  ch1: { slides: slides1, Scene: Scene1 },
  ch2: { slides: slides2, Scene: Scene2 },
  ch3: { slides: slides3, Scene: Scene3 },
  ch4: { slides: slides4, Scene: Scene4 },
  ch5: { slides: slides5, Scene: Scene5 },
  ch6: { slides: slides6, Scene: Scene6 },
  ch7: { slides: slides7, Scene: Scene7 },
};
