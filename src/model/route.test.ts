import { describe, expect, it } from "vitest";
import { bfsLayers, pathBack } from "./route";

describe("волна по кварталам", () => {
  it("пустая сетка 3×3: манхэттенские расстояния", () => {
    expect(bfsLayers(3, 3, [0, 0], new Set())).toEqual([0, 1, 2, 1, 2, 3, 2, 3, 4]);
  });
  it("стена недостижима, обход удлиняет путь", () => {
    const d = bfsLayers(3, 3, [0, 0], new Set([1, 4]));
    expect(d[1]).toBe(-1);
    expect(d[4]).toBe(-1);
    expect(d[2]).toBe(6);
  });
  it("отрезанная стеной клетка недостижима, пути к ней нет", () => {
    const d = bfsLayers(3, 3, [0, 0], new Set([5, 7]));
    expect(d[8]).toBe(-1);
    expect(pathBack(d, 3, 8)).toEqual([]);
  });
  it("путь назад идёт по соседям и имеет длину расстояния", () => {
    const d = bfsLayers(3, 3, [0, 0], new Set([1, 4]));
    const path = pathBack(d, 3, 2);
    expect(path[0]).toBe(0);
    expect(path.at(-1)).toBe(2);
    expect(path.length).toBe(d[2] + 1);
  });
});
