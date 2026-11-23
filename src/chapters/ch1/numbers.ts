/** Числа главы «Тик»: только комбинации функций модели (src/model/tick.ts). */
import { adderTicks, DAY, executors, multiplierTicks, powerOfTenBelow, solveSeconds, ticksPerCycle } from "../../model/tick";

/** Разрядность сумматора на сцене; tick.test.ts: adderTicks(8) = 40. */
export const BITS = 8;
/** Вентилей в одном полном сумматоре (params.adder.gates_per_bit). */
export const GATES = adderTicks(1);
/** Тиков на сложение двух BITS-битных чисел. */
export const ADD_TICKS = adderTicks(BITS);
/** Разрядность умножения на сцене: 4 × 4 бита; tick.test.ts: multiplierTicks(4) = 96. */
export const MUL_BITS = 4;
export const MUL_TICKS = multiplierTicks(MUL_BITS);
/** Тиков на одну строку умножения: MUL_BITS вентилей «И» и одно сложение MUL_BITS-битных чисел. */
export const ROW_TICKS = MUL_TICKS / MUL_BITS;
/** Операнды умножения на сцене — выбор сцены, как 91 + 55. */
export const MX = 11;
export const MY = 13;
/** Операций за такт и бит в операции: строки и клетки сетки такта. */
export const CYCLE = executors.core.derivation;
export const TPC = ticksPerCycle("core");
export const RATE = executors.core.ops_per_s;
/** Время задачи на одном ядре, если ей нужно ticks тиков. */
export const coreSeconds = (ticks: number) => solveSeconds("core", ticks, 1);
/** Столько тиков одно ядро делает за сутки. */
export const DAY_TICKS = RATE * DAY;
/** Образ: досчитать вслух до RATE по числу в секунду — столько же секунд. */
export const COUNT_ALOUD_S = RATE;
/** Варианты ставки «сколько тиков в секунду»: за такт, по тику за такт, больше ближайшей степени десяти. */
export const RATE_FLOOR = powerOfTenBelow(RATE);
