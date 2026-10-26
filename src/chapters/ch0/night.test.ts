// «Ночь диспетчера»: исход игры и числа на экране — из модели. Если тест упал после правки params.json,
// поменялся сюжет первой игры: обнови story/05_draft/chapter_00.md.
import { describe, expect, it } from "vitest";
import { fmtCount, fmtDuration } from "../../i18n/format";
import { memoryPlace, scenario, stateVectorSize } from "../../model/tick";
import { always, bestMachine, byScore, emojiGrid, MACHINES, MAIL_VARIANTS, MOLECULE_PLACES, NIGHT, orderSeconds, ORDERS, score, verdict, type Picks } from "./night";

describe("ночь диспетчера: время заказов", () => {
  it("рекламное видео: 1 ядро 2,6 мин, 64 ядра 2,7 с, видеокарта 40 мс, квантовый 27 лет", () => {
    expect(MACHINES.map((id) => fmtDuration(orderSeconds("video", id)!))).toEqual(["2,6 мин", "2,7 с", "40 мс", "27 лет"]);
  });
  it("банк, миллион платежей по одному счёту: 78 мкс / 87 мкс / 2,2 мс / 7,1 мин", () => {
    expect(MACHINES.map((id) => fmtDuration(orderSeconds("bank", id)!))).toEqual(["78 мкс", "87 мкс", "2,2 мс", "7,1 мин"]);
  });
  it("архив, пароль из 12 цифр: 1,3 мин / 1,4 с / 20 мс / 7,1 мин", () => {
    expect(MACHINES.map((id) => fmtDuration(orderSeconds("archive", id)!))).toEqual(["1,3 мин", "1,4 с", "20 мс", "7,1 мин"]);
  });
  it("почта, 9 символов из 62: 14 квадриллионов вариантов; 12 дней / 5,1 ч / 4,5 мин / 14 ч", () => {
    expect(fmtCount(MAIL_VARIANTS)).toBe("14 квадриллионов");
    expect(MACHINES.map((id) => fmtDuration(orderSeconds("mail", id)!))).toEqual(["12 дней", "5,1 ч", "4,5 мин", "14 ч"]);
  });
  it("фермент: обычным машинам не хватит памяти Земли, квантовому по силам", () => {
    expect(MACHINES.map((id) => orderSeconds("fertilizer", id))).toEqual([Infinity, Infinity, Infinity, null]);
  });
});

describe("ночь диспетчера: исход", () => {
  it("лучшие машины: видеокарта, видеокарта, одно ядро, видеокарта, квантовый", () => {
    expect(ORDERS.map(bestMachine)).toEqual(["gpu", "core", "gpu", "gpu", "qc"]);
  });
  it("ночь — 8 ч: не успели до утра квантовый на видео и почте, одно ядро на почте; 64 ядра на почте успели", () => {
    expect(fmtDuration(NIGHT)).toBe("8 ч");
    expect(verdict("video", "qc")).toBe("fail");
    expect(verdict("mail", "core")).toBe("fail");
    expect(verdict("mail", "qc")).toBe("fail");
    expect(verdict("mail", "cores")).toBe("done");
    expect(verdict("fertilizer", "gpu")).toBe("fail");
  });
  it("простые стратегии: «всё видеокарте» — 3 лучших, «всё квантовому» — 1, «всё одному ядру» — 1, «всё 64 ядрам» — 0", () => {
    const [core, cores, gpu, qc] = MACHINES.map((id) => score(always(id)));
    expect([core.best, cores.best, gpu.best, qc.best]).toEqual([1, 0, 3, 1]);
    expect(verdict("bank", "cores")).toBe("done");
    expect(emojiGrid(gpu)).toBe("🟩🟨🟩🟩🟥");
    expect(emojiGrid(qc)).toBe("🟥🟨🟨🟥🟩");
  });
  it("идеальный диспетчер выигрывает у любой стратегии «всё одной машине»", () => {
    const perfect = Object.fromEntries(ORDERS.map((o) => [o, bestMachine(o)])) as Picks;
    const top = score(perfect);
    expect(top).toEqual({ best: 5, fail: 0, grid: ["best", "best", "best", "best", "best"] });
    for (const id of MACHINES) expect(byScore(top, score(always(id)))).toBeLessThan(0);
  });
  it("при равных лучших выше тот, кто меньше сорвал; незаконченная ночь считает только сделанное", () => {
    expect(byScore({ best: 1, fail: 0, grid: [] }, { best: 1, fail: 2, grid: [] })).toBeLessThan(0);
    expect(score({ archive: "qc" })).toEqual({ best: 0, fail: 0, grid: ["done"] });
  });
});

describe("ночь диспетчера: подписи заказов", () => {
  it("архив — 12 цифр, триллион вариантов; почта — 9 символов из 62", () => {
    expect(fmtCount(Math.log10(scenario.key_codes))).toBe("12");
    expect(fmtCount(scenario.key_codes)).toBe("1 триллион");
    expect([scenario.mail_password_chars, scenario.password_alphabet]).toEqual([9, 62]);
  });
  it("фермент: 80 квантовых мест — 1,2·10²⁴ чисел, памяти Земли не хватает", () => {
    expect(MOLECULE_PLACES).toBe(80);
    expect(fmtCount(stateVectorSize(MOLECULE_PLACES))).toBe("1,2·10²⁴");
    expect(memoryPlace(MOLECULE_PLACES).fits).toBe(false);
  });
});
