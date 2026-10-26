import { initial, isProgress, type Progress } from "./progress";

const KEY = "tsena-kubita/v2";

function load(): Progress {
  try {
    const x: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    return isProgress(x) ? x : initial();
  } catch {
    return initial();
  }
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // приватный режим или переполнение: прогресс живёт в памяти вкладки
  }
}

export const game = $state<{ p: Progress }>({ p: load() });

export function update(fn: (p: Progress) => Progress): void {
  game.p = fn(game.p);
  save(game.p);
}
