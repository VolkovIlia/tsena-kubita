# Источники

Статус: ✅ — страница открыта и проверена 25.10.2026; ⚠ — указано по памяти, **агент обязан открыть и проверить ссылку/номер перед использованием**. Добавляя источник, пишите: что, ссылка, для какой главы, статус, дата.

## Ядро проекта: экономика квантовых вычислений

| # | Источник | Ссылка | Глава / зачем | Статус |
| --- | --- | --- | --- | --- |
| 1 | Hoefler, Häner, Troyer. Disentangling Hype from Practicality: On Realistically Achieving Quantum Advantage. CACM 66(5), 2023. DOI 10.1145/3571725 | https://arxiv.org/abs/2307.00523 | Все гонки; Table 1: binary 4 992 Top/s (A100) против 235 kop/s, логический гейт 10 мкс; «more than a factor of 10¹⁰»; I/O 1 Гбит/с | ✅ |
| 2 | Babbush, McClean, Newman, Gidney, Boixo, Neven. Focus beyond quadratic speedups for error-corrected quantum advantage. PRX Quantum 2, 010103 (2021) | https://arxiv.org/abs/2011.04149 | Гл. 4: квадратичных ускорений мало на ранних отказоустойчивых машинах; Toffoli ≈170 мкс. «~10 порядков» в статье нет — это Hoefler | ✅ |
| 3 | Beverland et al. Assessing requirements to scale to practical quantum advantage (2022) | https://arxiv.org/abs/2211.07629 | Гл. 4, интерлюдия: Table III, 2d² физических на логический (d=13 → 338, d=27 → 1458); логический шаг 400 нс·d | ✅ |
| 4 | D. J. Bernstein. Big computations on small data (о приоритете идеи) | https://cr.yp.to/credits/big-computations-small-data.html | Гл. 5: узкое горлышко | ✅ |

## Алгоритмы и пределы

| # | Источник | Ссылка | Глава | Статус |
| --- | --- | --- | --- | --- |
| 5 | Grover. A fast quantum mechanical algorithm for database search. STOC 1996, pp. 212–219 | https://arxiv.org/abs/quant-ph/9605043 | Гл. 3–4 | ✅ |
| 6 | Bennett, Bernstein, Brassard, Vazirani. Strengths and weaknesses of quantum computing. SIAM J. Comput. 26(5):1510–1523, 1997. DOI 10.1137/S0097539796300933 | https://arxiv.org/abs/quant-ph/9701001 | Гл. 3: потолок √N (оракульная граница) | ✅ |
| 7 | Shor. Polynomial-time algorithms for prime factorization and discrete logarithms (1994/1997) | https://arxiv.org/abs/quant-ph/9508027 | Гл. 6: ритм числа | ⚠ |
| 8 | Harrow, Hassidim, Lloyd. Quantum algorithm for linear systems of equations (2009) | https://arxiv.org/abs/0811.3171 | Гл. 5: откуда «экспоненциальный квантовый ML» | ⚠ |
| 9 | Aaronson. Read the fine print. Nature Physics 11, 291 (2015) | искать по названию | Гл. 5: оговорки к HHL и QML — сильная популярная статья | ⚠ |
| 10 | Giovannetti, Lloyd, Maccone. Quantum random access memory (2008) | https://arxiv.org/abs/0708.1879 | Гл. 5: QRAM | ⚠ |
| 11 | Amdahl. Validity of the single processor approach… AFIPS 1967 | искать по названию | Гл. 2 | ⚠ |
| 12 | Dijkstra. A note on two problems in connexion with graphs. Numerische Mathematik 1(1):269–271, 1959. DOI 10.1007/BF01386390 | https://doi.org/10.1007/BF01386390 | Гл. 4: ловушка «маршрут» | ✅ |

## Деквантизация

| # | Источник | Ссылка | Глава | Статус |
| --- | --- | --- | --- | --- |
| 13 | Tang. A quantum-inspired classical algorithm for recommendation systems (STOC 2019) | https://arxiv.org/abs/1807.04271 | Гл. 5: поворот | ⚠ |
| 14 | Tang. Quantum-inspired classical algorithms for PCA and supervised clustering | https://arxiv.org/abs/1811.00414v1 | Гл. 5 | ✅ |
| 15 | Chia, Gilyén, Li, Lin, Tang, Wang. Sampling-based sublinear low-rank matrix arithmetic framework for dequantizing QML. JACM | https://arxiv.org/abs/1910.06151 | Гл. 5 | ✅ |
| 16 | Quanta Magazine, The Joy of Why: What Is the True Promise of Quantum Computing? (интервью с Тан, 2025) | https://www.quantamagazine.org/what-is-the-true-promise-of-quantum-computing-20250403/ | Гл. 5, популярный источник | ✅ |

## Химия и материалы (глава 6)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 17 | Feynman. Simulating physics with computers. Int. J. Theor. Phys. 21 (1982) | искать по названию | История: моделировать природу квантово | ⚠ |
| 18 | Reiher, Wiebe, Svore, Wecker, Troyer. Elucidating reaction mechanisms on quantum computers. PNAS 2017 (FeMoco) | https://arxiv.org/abs/1605.03590 | Катализатор Нины | ⚠ |
| 19 | Lee et al. Evaluating the evidence for exponential quantum advantage in ground-state quantum chemistry. Nat. Commun. 2023 | https://arxiv.org/abs/2208.02199 | **Обязательный контрапункт**: где классические методы химии справляются | ⚠ |

## Криптография (глава 6, финал)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 20 | Gidney. How to factor 2048 bit RSA integers with less than a million noisy qubits (2025) | https://arxiv.org/abs/2505.15917 | < 1 млн кубитов, < недели | ✅ |
| 21 | Gidney, Ekerå. How to factor 2048 bit RSA integers in 8 hours using 20 million noisy qubits (2019) | https://arxiv.org/abs/1905.09749 | Динамика оценок | ⚠ |
| 22 | The Quantum Insider. Q-Day Just Got Closer: Three Papers in Three Months (31.03.2026) | https://thequantuminsider.com/2026/03/31/q-day-just-got-closer-three-papers-in-three-months-are-rewriting-the-quantum-threat-timeline/ | Оценки 2026 (< 100 тыс. кубитов, заявка Iceberg) — перепроверить по первоисточникам | ✅ |
| 23 | NIST FIPS 203/204/205 — стандарты постквантовой криптографии (2024) | https://csrc.nist.gov | Реплика Оракула про новые шифры | ⚠ |

## «Превосходство» и его проверка (финал)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 24 | Google Quantum AI. A verifiable quantum advantage (22.10.2025) | https://research.google/blog/a-verifiable-quantum-advantage/ | Заголовок «13 000 раз» | ✅ |
| 25 | IEEE Spectrum. Quantum Echoes (2025) | https://spectrum.ieee.org/quantum-echoes | Оговорки: прикладная часть пока не за классической границей | ✅ |
| 26 | Quantum Advantage: a Tensor Network Perspective (2026) | https://arxiv.org/pdf/2603.18825 | Обзор классических опровержений, включая Quantum Echoes | ✅ (найдено, прочитать целиком) |
| 27 | Arute et al. Quantum supremacy using a programmable superconducting processor. Nature 574 (2019) | искать по названию | История «превосходства» | ⚠ |
| 28 | Pan, Chen, Zhang. Solving the sampling problem of the Sycamore quantum circuits (2021) | https://arxiv.org/abs/2111.03011 | Классический ответ на Sycamore | ⚠ |
| 29 | Preskill. Quantum Computing in the NISQ era and beyond. Quantum 2, 79 (2018). DOI 10.22331/q-2018-08-06-79 | https://arxiv.org/abs/1801.00862 | Термин NISQ, «младшие братья» Оракула | ✅ |

## Формат и педагогика

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 30 | Nicky Case. The Evolution of Trust (2017), русский перевод | https://notdotteam.github.io/trust/ | Эталон формата | ✅ |
| 31 | Исходники Trust: README, лицензия CC0 | https://gitlab.mister-muffin.de/josch/ncase.me-trust/commit/361fb0ed580cc3f0523578cfacca98951180bfb4.diff | Архитектура, можно переиспользовать | ✅ (основной репозиторий: github.com/ncase/trust — ⚠) |
| 32 | Bret Victor. Explorable Explanations (2011) | http://worrydream.com/ExplorableExplanations/ | Принципы жанра | ⚠ |
| 33 | Nicky Case. How I make explorable explanations | искать «ncase how I make explorable explanations» | Процесс Кейса | ⚠ |
| 34 | Quantum Country (Matuschak, Nielsen) | https://www.epiqc.cs.uchicago.edu/quantumcountrytutorials | Аналог: глубина и мнемонический медиум | ✅ |
| 35 | Matuschak, Nielsen. How can we develop transformative tools for thought? (2019) | https://numinous.productions/ttft/ | Философия медиума | ⚠ |
| 36 | Quantum Flytrap Virtual Lab | https://quantumflytrap.com/ | Аналог; визуализация состояний | ✅ |
| 37 | Migdał et al. Visualizing quantum mechanics in an interactive simulation | https://arxiv.org/abs/2203.13300v1 | Визуализация амплитуд | ✅ |
| 38 | Your first quantum game (quantum-tensors) | https://github.com/Quantum-Flytrap/your-first-quantum-game | Библиотека для симулятора | ✅ |
| 39 | Seskir, Migdał, Weidner, …, Case et al. Quantum games and interactive tools for quantum technologies outreach and education (2022) | https://scirate.com/piotr-migdal/papers | Обзор квантовых игр; Кейс — соавтор | ✅ (список авторов) |
| 40 | Aaronson. The Limits of Quantum Computers. Scientific American (2008) | искать по названию | Сильная популярная статья против «перебора всего» | ⚠ |
| 41 | SMBC × Aaronson, «The Talk» (комикс) | искать «SMBC The Talk Aaronson» | Тон и юмор | ⚠ |
| 42 | 3Blue1Brown. But what is quantum computing? (Grover's Algorithm), 30.04.2025 | https://www.youtube.com/watch?v=RQWpF2Gb-gU | Визуализация пинбола | ✅ |

## Калибровка тика и фактчек глав 3–4 (проверено 25.10.2026)

| # | Источник | Ссылка | Глава / зачем | Статус |
| --- | --- | --- | --- | --- |
| 43 | uops.info: AND r64, r64 — пропускная способность 0,25 такта на Zen 4 и Zen 5 | https://uops.info/html-instr/AND_21_R64_R64.html | Пролог, гл. 4: 4 логические 64-битные операции за такт у Мастера | ✅ |
| 44 | AMD EPYC 9575F: 64 ядра, max boost 5 ГГц, all-core boost 4,5 ГГц | https://www.amd.com/en/products/processors/server/epyc/9005-series/amd-epyc-9575f.html | Мастер и Бригада | ✅ |
| 45 | NVIDIA A100 Tensor Core GPU Architecture (whitepaper): GPU Boost Clock 1410 МГц | https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/nvidia-ampere-architecture-whitepaper.pdf | Гл. 4, интерлюдия: такт Фабрики 0,71 нс | ✅ |
| 46 | Fixsen. The temperature of the cosmic microwave background (2009): 2,72548 K | https://arxiv.org/abs/0911.1955 | Гл. 3: «в сотни раз холоднее космоса» | ✅ |
| 47 | Krinner et al. Engineering cryogenic setups for 100-qubit scale superconducting circuit systems (2019): ~14 мК | https://arxiv.org/abs/1806.07862 | Гл. 3: температура криостата | ✅ |
| 48 | Bast et al. Route Planning in Transportation Networks (2015), Table 1: Западная Европа, 18 млн вершин, Dijkstra 2 195 080 мкс на 1 ядре X5680 | https://arxiv.org/abs/1504.05140 | Гл. 4: Мастер прокладывает маршрут за доли секунды | ✅ |
| 49 | Concorde TSP benchmarks 1999: kroA200, оптимум за 6,59 с (500 МГц) | https://www.math.uwaterloo.ca/tsp/concorde/benchmarks/bench99.html | Гл. 4: коммивояжёр на 200 адресов | ✅ |
| 50 | Hougardy, Zhong. Hard to Solve Instances of the Euclidean Traveling Salesman Problem (2018) | https://arxiv.org/abs/1808.02859 | Гл. 4: контрапункт — бывают и трудные экземпляры коммивояжёра | ✅ |
| 51 | Ambainis et al. Quantum speedups for exponential-time dynamic programming algorithms (2018): O*(1,728ⁿ) с экспоненциальной памятью | https://arxiv.org/abs/1807.05209 | Гл. 4: «Оракулу известен выигрыш меньше корня» | ✅ |
| 52 | Montanaro. Quantum algorithms: an overview (2015) | https://arxiv.org/abs/1511.04206 | Гл. 4, справочно: для задач NP Гровер по сертификатам даёт почти квадратичное ускорение перебора, 2^(m/2) вместо 2^m; отдельно про коммивояжёра обзор не пишет | ✅ (заголовок и раздел «Search and optimisation» сверены 25.10.2026; прежняя строка с выдуманным названием исправлена) |
| 53 | Интервью Э. Дейкстры (Communications of the ACM 53(8), 2010): алгоритм придуман в 1956 году. DOI 10.1145/1787234.1787249 | https://doi.org/10.1145/1787234.1787249 | Гл. 4: «ему 70 лет» | ✅ |
| 54 | Gidney. Halving the cost of quantum addition (2017) | https://arxiv.org/abs/1709.06648 | Справочно: цена квантового сложения; для единицы тика не используется | ✅ (заголовок сверен по arXiv) |
