/** Числа главы «Тик»: только комбинации функций модели (src/model/tick.ts). */
import { adderTicks, DAY, executors, powerOfTenBelow, solveSeconds, ticksPerCycle } from "../../model/tick";

/** Разрядность сумматора на сцене; tick.test.ts: adderTicks(8) = 40. */
export const BITS = 8;
/** Вентилей в одном полном сумматоре (params.adder.gates_per_bit). */
export const GATES = adderTicks(1);
/** Тиков на сложение двух BITS-битных чисел. */
export const ADD_TICKS = adderTicks(BITS);
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
