/** Числа цены тика главы «Гонка»: только комбинации функций модели; тики сложения — из главы «Кубит». */
import { breakEven, rateRatio, workSeconds } from "../../model/tick";
import { Q_ADD, RELAY_ADD } from "../ch5/numbers";

/** Сложение X + Y: время у ядра и у квантового, во сколько раз дольше и во сколько раз дороже тик. */
export const CORE_ADD_S = workSeconds("core", 1, RELAY_ADD);
export const QC_ADD_S = workSeconds("qc", 1, Q_ADD);
export const ADD_RATIO = QC_ADD_S / CORE_ADD_S;
export const TICK_RATIO = rateRatio("core", "qc");

export const BREAK = breakEven();
