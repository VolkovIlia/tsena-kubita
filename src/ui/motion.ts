/** Общие помощники движения: уважаем prefers-reduced-motion. */
export function reducedMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Покадровая анимация на ms миллисекунд: onFrame(доля 0…1). Возвращает отмену. */
export function animate(ms: number, onFrame: (f: number) => void, onDone?: () => void): () => void {
  if (reducedMotion()) {
    onFrame(1);
    onDone?.();
    return () => {};
  }
  let id = 0;
  const start = performance.now();
  const step = (now: number) => {
    const f = Math.min(1, (now - start) / ms);
    onFrame(f);
    if (f < 1) id = requestAnimationFrame(step);
    else onDone?.();
  };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}

/** Гонка: симулируемые часы от 0 до tEnd за 6 с, ускоряясь (время растёт как квадрат реального). */
export function race(tEnd: number, onFrame: (t: number) => void, onDone: () => void): () => void {
  return animate(6000, (f) => onFrame(tEnd * f * f), onDone);
}

/** Svelte-действие: новый экран получает фокус и прокрутку наверх. */
export function screenFocus(node: HTMLElement): void {
  window.scrollTo(0, 0);
  node.focus({ preventScroll: true });
}
