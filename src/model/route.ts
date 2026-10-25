/**
 * Волна по сетке кварталов (ловушка «маршрут», гл. 4): поиск в ширину — Дейкстра для равных рёбер.
 * Индекс клетки — y·w + x; −1 — клетка недостижима или занята стеной.
 */
export function bfsLayers(w: number, h: number, start: [number, number], blocked: ReadonlySet<number>): number[] {
  const dist = new Array(w * h).fill(-1);
  const first = start[1] * w + start[0];
  if (blocked.has(first)) return dist;
  dist[first] = 0;
  const queue = [first];
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    const x = i % w;
    const y = Math.floor(i / w);
    const near = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
    for (const j of near) {
      if (j < 0 || blocked.has(j) || dist[j] !== -1) continue;
      dist[j] = dist[i] + 1;
      queue.push(j);
    }
  }
  return dist;
}

/** Кратчайший путь назад от финиша по убыванию расстояния (пусто, если финиш недостижим). */
export function pathBack(dist: number[], w: number, finish: number): number[] {
  if (dist[finish] < 0) return [];
  const path = [finish];
  let i = finish;
  while (dist[i] > 0) {
    const x = i % w;
    const near = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
    i = near.find((j) => j >= 0 && j < dist.length && dist[j] === dist[i] - 1)!;
    path.push(i);
  }
  return path.reverse();
}
