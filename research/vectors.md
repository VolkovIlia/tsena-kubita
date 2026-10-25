# Векторы поиска

Для каждой главы — что найти, запросы (EN работает лучше для первоисточников, RU — для контекста аудитории) и красные флаги. Найденное заносить в `sources.md`.

## Общие правила поиска

- Первоисточник: arXiv, журнал, блог лаборатории-автора. Новость — только как указатель на первоисточник.
- Для любого заявления о «преимуществе» ищите классический ответ: `"<название эксперимента>" classical simulation`, `spoofing`, `tensor network`.
- Числа ресурсов (кубиты, время) быстро устаревают — ищите с годом: `2026`.
- Красный флаг: «перебирает все варианты», «в миллион раз быстрее» без названия задачи, ссылки только на пресс-релиз компании.

## Глава 1–2: структура и параллельность

- Найти: наглядные примеры бинарного поиска и закона Амдала; реальное соотношение производительности одного ядра, многоядерного CPU и GPU на простых операциях (для калибровки `params.json`).
- Запросы: `Amdahl's law interactive visualization`, `CPU single core integer operations per second 2026 benchmark`, `GPU vs CPU throughput simple operations`, `закон Амдала простыми словами`.

## Глава 3: интерференция и Гровер

- Найти: лучшие визуализации «inversion about the mean»; формулировку BBBV для неспециалиста; проверенные приёмы объяснения амплитуд со знаком.
- Запросы: `Grover algorithm inversion about the mean visualization`, `amplitude amplification geometric picture`, `BBBV lower bound explained`, `3Blue1Brown Grover`, `why quantum computers don't try all answers at once Aaronson`.
- Красный флаг: объяснения через «параллельные вселенные пробуют все варианты».

## Глава 4: цена тика

- Найти: актуальное (2025–2026) время логического цикла и логического гейта для поверхностных кодов и qLDPC; свежие оценки ресурсов отказоустойчивых машин; сравнение с GPU последнего поколения (обновить Фабрику с A100?).
- Запросы: `logical clock speed surface code 2026`, `logical qubit cycle time microseconds`, `magic state cultivation`, `qLDPC codes resource estimate 2026`, `quadratic speedup not enough quantum advantage`, `Hoefler quantum practicality follow-up`.
- Для ловушки «маршрут»: `Dijkstra 1 million nodes runtime`, `TSP heuristics LKH near optimal large instances`, `quantum speedup traveling salesman known results`.

## Глава 5: узкое горлышко

- Найти: состояние QRAM на 2026; свежие результаты деквантизации; честные обзоры квантового ML.
- Запросы: `QRAM feasibility 2025 2026`, `dequantization survey Tang`, `quantum machine learning data loading bottleneck`, `Aaronson read the fine print`, `квантовое машинное обучение критика`.

## Глава 6: химия и Шор

- Найти: актуальные оценки ресурсов для FeMoco и подобных катализаторов; где классические методы химии (DMRG, CCSD(T)) справляются, а где нет; самые свежие оценки для RSA-2048 и ECC; состояние миграции на постквантовую криптографию, в том числе в России.
- Запросы: `FeMoco resource estimate 2025 2026`, `strongly correlated molecules classical methods fail`, `exponential quantum advantage chemistry evidence Lee 2023`, `RSA-2048 resource estimate 2026`, `Iceberg Quantum Pinnacle architecture`, `NIST post-quantum standards FIPS 203`, `постквантовая криптография Россия стандарт`.
- Красный флаг: «квантовый компьютер найдёт лекарство от рака» без конкретной молекулы и метода.

## Финал: новости

- Найти: 3–5 актуальных на момент релиза громких заголовков и для каждого — первоисточник и экспертный разбор.
- Запросы: `quantum advantage claim 2026`, `quantum supremacy claim classical rebuttal 2026`, `Scott Aaronson blog quantum` (разборы новостей), `квантовое превосходство новости 2026`.

## Российский контекст (для аудитории и рецензентов)

- Найти: государственную дорожную карту по квантовым вычислениям, ведущие группы, популяризаторов, возможных научных рецензентов; русскоязычную терминологию (устоявшиеся переводы терминов).
- Запросы: `дорожная карта квантовые вычисления Россия 2030`, `Российский квантовый центр популяризация`, `квантовые лаборатории НИТУ МИСИС`, `терминология квантовых вычислений русский перевод logical qubit`.

## Формат explorable explanations

- Найти: эссе Кейса о процессе, исходники Trust (архитектура слайдов, звук, персонажи), разборы того, почему Trust работает; доступность интерактивов.
- Запросы: `ncase trust github source structure`, `Nicky Case explorable explanations process`, `explorabl.es`, `Bret Victor explorable explanations`, `accessible interactive explainers WCAG sliders`.
