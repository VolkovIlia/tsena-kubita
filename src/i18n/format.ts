/**
 * Форматирование чисел модели для русского текста. Словарь хранит только плейсхолдеры {key},
 * значения подставляет fill() из этих функций.
 */
const LOCALE = "ru-RU";
const plural = new Intl.PluralRules("ru");
const sig2 = new Intl.NumberFormat(LOCALE, { maximumSignificantDigits: 2 });
const int = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const half = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

type Forms = { one: string; few: string; many: string; other: string };
const SCALES: Forms[] = [
  { one: "миллион", few: "миллиона", many: "миллионов", other: "миллиона" },
  { one: "миллиард", few: "миллиарда", many: "миллиардов", other: "миллиарда" },
  { one: "триллион", few: "триллиона", many: "триллионов", other: "триллиона" },
  { one: "квадриллион", few: "квадриллиона", many: "квадриллионов", other: "квадриллиона" },
  { one: "квинтиллион", few: "квинтиллиона", many: "квинтиллионов", other: "квинтиллиона" },
];
const DAYS: Forms = { one: "день", few: "дня", many: "дней", other: "дня" };
const YEARS: Forms = { one: "год", few: "года", many: "лет", other: "года" };
const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

/** Подставляет значения вместо {key}; отсутствующий ключ — ошибка программиста. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`fill: нет значения {${key}}`);
    return values[key];
  });
}

/** Число без лишней точности: целое, если ≥ 10, иначе две значащие цифры. */
function rounded(x: number): number {
  return x >= 10 ? Math.round(x) : Number(x.toPrecision(2));
}

/** Две значащие цифры (целое при ≥ 10), десятичная запятая. */
export function fmtNum(x: number): string {
  return x >= 10 ? int.format(x) : sig2.format(x);
}

/** Точное целое с разрядами: для бегущих счётчиков тиков. */
export function fmtExact(n: number): string {
  return int.format(Math.floor(n));
}

function form(value: number, forms: Forms): string {
  return forms[plural.select(value) as keyof Forms] ?? forms.other;
}

/** «785», «1 458», «3,5 миллиона», «10 квадриллионов», «4,5·10²⁰». */
export function fmtCount(n: number): string {
  if (n < 1e6) return int.format(n);
  if (n >= 1e18) return fmtSci(n);
  let scale = Math.floor(Math.log10(n) / 3) * 3;
  let mantissa = rounded(n / 10 ** scale);
  if (mantissa >= 1000) {
    scale += 3;
    mantissa = rounded(mantissa / 1000);
  }
  if (scale >= 18) return fmtSci(n);
  return `${fmtNum(mantissa)} ${form(mantissa, SCALES[scale / 3 - 2])}`;
}

/** «4,5·10²⁰». */
export function fmtSci(n: number): string {
  let exp = Math.floor(Math.log10(n));
  let mantissa = Number((n / 10 ** exp).toPrecision(2));
  if (mantissa >= 10) {
    exp += 1;
    mantissa /= 10;
  }
  const power = `10${[...String(exp)].map((d) => SUPERSCRIPT[Number(d)]).join("")}`;
  return mantissa === 1 ? power : `${sig2.format(mantissa)}·${power}`;
}

/** Секунды в человеческих единицах: «0,71 нс», «122 мс», «3,3 мин», «9 дней», «29 лет». */
export function fmtDuration(s: number): string {
  if (s < 1e-6) return `${fmtNum(s * 1e9)} нс`;
  if (s < 1e-3) return `${fmtNum(s * 1e6)} мкс`;
  if (s < 1) return `${fmtNum(s * 1e3)} мс`;
  if (s < 60) return `${fmtNum(s)} с`;
  if (s < 3600) return `${fmtNum(s / 60)} мин`;
  if (s < 86400) return `${fmtNum(s / 3600)} ч`;
  if (s < 365 * 86400) {
    const days = rounded(s / 86400);
    return `${fmtNum(days)} ${form(days, DAYS)}`;
  }
  const years = rounded(s / (365 * 86400));
  return `${fmtNum(years)} ${form(years, YEARS)}`;
}

/** Доля → проценты с шагом 0,5 п. п.: «12,5%», «78%», «0,5%». */
export function fmtPercent(p: number): string {
  return `${half.format(Math.round(p * 200) / 2)}%`;
}
