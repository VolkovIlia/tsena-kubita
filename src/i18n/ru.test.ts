// Страж правила «числа — только из модели»: в словаре нет ни цифр, ни слов шкалы.
// Исключения: блок cite (библиография) и подстроки из ALLOWED (формулы Гровера, среднего перебора и памяти).
import { describe, expect, it } from "vitest";
import { ru } from "./ru";

const NUMBERISH = /\d|миллион|миллиард|триллион|квадриллион|тысяч/i;
const ALLOWED = ["π/4", "N/2", "2ⁿ"];

function strings(node: unknown, path: string): [string, string][] {
  if (typeof node === "string") return [[path, node]];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
}

describe("словарь ru", () => {
  it("числа приходят из модели, а не вписаны в строки", () => {
    const { cite: _, ...texts } = ru;
    const offenders = strings(texts, "")
      .filter(([, s]) => NUMBERISH.test(ALLOWED.reduce((acc, a) => acc.replaceAll(a, ""), s)))
      .map(([key, s]) => `${key}: ${s}`);
    expect(offenders).toEqual([]);
  });
});
