/**
 * Все строки игры. Числа сюда не вписываются: только плейсхолдеры {key},
 * значения считает src/model и форматирует src/i18n/format.ts (страж — ru.test.ts).
 * Тексты глав — в ru/chN.ts, ключи по id слайдов; исключение для цифр — блок cite.
 */
import { ch0 } from "./ru/ch0";
import { ch1 } from "./ru/ch1";
import { ch2 } from "./ru/ch2";
import { ch3 } from "./ru/ch3";
import { ch4 } from "./ru/ch4";
import { ch5 } from "./ru/ch5";
import { ch6 } from "./ru/ch6";
import { ch7 } from "./ru/ch7";
import { cite } from "./ru/cite";
import { ui } from "./ru/ui";

export const ru = {
  title: "Цена кубита",
  ui,
  daysFull: {
    mon: "Понедельник",
    tue: "Вторник",
    wed: "Среда",
    thu: "Четверг",
    fri: "Пятница",
    sat: "Суббота",
    sun: "Воскресенье",
  },
  names: {
    master: "Мастер",
    brigade: "Бригада",
    factory: "Фабрика",
    oracle: "Оракул",
    margo: "Марго",
    nina: "Нина",
  },
  chapters: {
    ch0: "Объявление",
    ch1: "Телефонная книга",
    ch2: "Бригада и Фабрика",
    ch3: "Оракул",
    ch4: "Гонка",
    ch5: "Узкое горлышко",
    ch6: "Звёздный час Оракула",
    ch7: "Решение",
  },
  rules: {
    r1: "Хитрость бьёт силу: сначала ищи структуру задачи",
    r2: "Делить можно не всякую работу",
    r3: "Оракул не читает все ответы — он гасит неверные волнами",
    r4: "Шаг Оракула очень дорог: корень из N окупается нескоро",
    r5: "Данные льются в Оракула через соломинку",
    r6: "Оракул незаменим, где задача сама квантовая или прячет ритм",
  },
  ch0,
  ch1,
  ch2,
  ch3,
  ch4,
  ch5,
  ch6,
  ch7,
  cite,
} as const;

export type Dict = typeof ru;
export type Cite = keyof Dict["cite"];
