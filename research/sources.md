# Источники

Статус: ✅ — страница открыта и проверена (25.10.2026, если в строке не указана другая дата); ⚠ — указано по памяти, **агент обязан открыть и проверить ссылку/номер перед использованием**. Добавляя источник, пишите: что, ссылка, для какой главы, статус, дата.

## Ядро проекта: экономика квантовых вычислений

| # | Источник | Ссылка | Глава / зачем | Статус |
| --- | --- | --- | --- | --- |
| 1 | Hoefler, Häner, Troyer. Disentangling Hype from Practicality: On Realistically Achieving Quantum Advantage. CACM 66(5), 2023. DOI 10.1145/3571725 | https://arxiv.org/abs/2307.00523 | Все гонки; Table 1: binary 4 992 Top/s (A100) против 235 kop/s, логический гейт 10 мкс; «more than a factor of 10¹⁰». Table 1, I/O bandwidth: GPU 10,000 Gbit/s (10 Тбит/с), ASIC 10,000 Gbit/s, Future Quantum 1 Gbit/s. Допущение: «a hypothetical quantum computer that may be available in the next decades with 10,000 error-corrected logical qubits, 10 μs gate time for logical operations». Methods: «Using all 10,000 qubits for reading/writing, this yields an estimate of the I/O bandwidth B ≈ 10,000/10⁻⁵ = 1 Gbit/s»; для GPU — «the I/O bandwidth specified in NVIDIA's A100 datasheet» | ✅ (I/O и 10 000 логических кубитов — проверено 25.10.2026) |
| 2 | Babbush, McClean, Newman, Gidney, Boixo, Neven. Focus beyond quadratic speedups for error-corrected quantum advantage. PRX Quantum 2, 010103 (2021) | https://arxiv.org/abs/2011.04149 | Гл. 4: квадратичных ускорений мало на ранних отказоустойчивых машинах; Toffoli ≈170 мкс. «~10 порядков» в статье нет — это Hoefler. Финал, песочница (вид «корень четвёртой степени»): аннотация — «we also repeat this analysis for speedups by other polynomial degrees and find that quartic speedups look significantly more practical»; после Table I — «While the viability of quantum advantage with cubic speedups is still a bit ambiguous, the prospects of achieving quantum advantage given a quartic speedup are promising» | ✅ (квартичные ускорения — проверено 25.10.2026) |
| 3 | Beverland et al. Assessing requirements to scale to practical quantum advantage (2022) | https://arxiv.org/abs/2211.07629 | Гл. 4, интерлюдия: Table III, 2d² физических на логический (d=13 → 338, d=27 → 1458); логический шаг 400 нс·d | ✅ |
| 4 | D. J. Bernstein. Big computations on small data (о приоритете идеи) | https://cr.yp.to/credits/big-computations-small-data.html | Гл. 5: узкое горлышко | ✅ |

## Алгоритмы и пределы

| # | Источник | Ссылка | Глава | Статус |
| --- | --- | --- | --- | --- |
| 5 | Grover. A fast quantum mechanical algorithm for database search. STOC 1996, pp. 212–219 | https://arxiv.org/abs/quant-ph/9605043 | Гл. 3–4 | ✅ |
| 6 | Bennett, Bernstein, Brassard, Vazirani. Strengths and weaknesses of quantum computing. SIAM J. Comput. 26(5):1510–1523, 1997. DOI 10.1137/S0097539796300933 | https://arxiv.org/abs/quant-ph/9701001 | Гл. 3: потолок √N (оракульная граница) | ✅ |
| 7 | Shor. Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer. SIAM Journal on Computing 26, 1484 (1997). DOI 10.1137/S0097539795293172. Предварительная версия — FOCS 1994, pp. 124–134 | https://arxiv.org/abs/quant-ph/9508027 | Гл. 6: ритм числа; финал, песочница. Аннотация: «These algorithms take a number of steps polynomial in the input size, e.g., the number of digits of the integer to be factored». Разд. 5: «Our quantum factoring algorithm takes asymptotically O((log n)^2 (log log n)(log log log n)) steps on a quantum computer, along with a polynomial (in log n) amount of post-processing time on a classical computer». Множители — через gcd(x^(r/2) − 1, n). Степени (log N)³ в статье нет: см. open-questions #8 | ✅ (проверено 25.10.2026) |
| 8 | Harrow, Hassidim, Lloyd. Quantum algorithm for linear systems of equations (2009) | https://arxiv.org/abs/0811.3171 | Гл. 5: откуда «экспоненциальный квантовый ML» | ⚠ |
| 9 | Aaronson. Read the fine print. Nature Physics 11, 291 (2015) | искать по названию | Гл. 5: оговорки к HHL и QML — сильная популярная статья | ⚠ |
| 10 | Giovannetti, Lloyd, Maccone. Quantum random access memory (2008) | https://arxiv.org/abs/0708.1879 | Гл. 5: QRAM | ⚠ |
| 11 | Amdahl. Validity of the single processor approach to achieving large scale computing capabilities. AFIPS '67 (Spring), AFIPS Conference Proceedings Vol. 30, pp. 483–485 (1967). DOI 10.1145/1465482.1465560. Перепечатка: IEEE Solid-State Circuits Society Newsletter (2007), DOI 10.1109/N-SSC.2007.4785615 | https://doi.org/10.1145/1465482.1465560 (полный текст: https://web.archive.org/web/2010/http://www-inst.eecs.berkeley.edu/~n252/paper/Amdahl.pdf) | Гл. 2, «закон Амдала»: «the effort expended on achieving high parallel processing rates is wasted unless it is accompanied by achievements in sequential processing rates of very nearly the same magnitude». Формулы в статье нет — её позже вывели из словесного описания (так сказано в примечании к копии курса Беркли) | ✅ (название и место публикации — по Crossref; текст — по архивной копии; 25.10.2026) |
| 12 | Dijkstra. A note on two problems in connexion with graphs. Numerische Mathematik 1(1):269–271, 1959. DOI 10.1007/BF01386390 | https://doi.org/10.1007/BF01386390 | Гл. 4: ловушка «маршрут» | ✅ |

## Деквантизация

| # | Источник | Ссылка | Глава | Статус |
| --- | --- | --- | --- | --- |
| 13 | Tang. A quantum-inspired classical algorithm for recommendation systems. Proceedings of the 51st Annual ACM SIGACT Symposium on Theory of Computing (STOC 2019). DOI 10.1145/3313276.3316310 | https://arxiv.org/abs/1807.04271 | Гл. 5: поворот. Аннотация: «As a consequence, Kerenidis and Prakash's algorithm does not in fact give an exponential speedup over classical algorithms». Что Тан была студенткой — см. #16 | ✅ (проверено 25.10.2026) |
| 14 | Tang. Quantum-inspired classical algorithms for PCA and supervised clustering | https://arxiv.org/abs/1811.00414v1 | Гл. 5 | ✅ |
| 15 | Chia, Gilyén, Li, Lin, Tang, Wang. Sampling-based sublinear low-rank matrix arithmetic framework for dequantizing QML. JACM | https://arxiv.org/abs/1910.06151 | Гл. 5 | ✅ |
| 16 | Quanta Magazine, The Joy of Why: What Is the True Promise of Quantum Computing? (интервью с Тан, 2025) | https://www.quantamagazine.org/what-is-the-true-promise-of-quantum-computing-20250403/ | Гл. 5, популярный источник. Тан была студенткой: Тан — «This is something I was spending a decent amount of time on in senior year of undergrad»; Левин — «So, you're an 18-year-old senior in college»; «in her undergraduate thesis showed that the recommendation problem…» | ✅ (студентка — проверено 25.10.2026) |

## Химия и материалы (глава 6)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 17 | Feynman. Simulating physics with computers. Int. J. Theor. Phys. 21 (1982) | искать по названию | История: моделировать природу квантово | ⚠ |
| 18 | Reiher, Wiebe, Svore, Wecker, Troyer. Elucidating reaction mechanisms on quantum computers. PNAS 114:7555–7560 (2017). DOI 10.1073/pnas.1619152114 | https://arxiv.org/abs/1605.03590 | Катализатор Нины. Вывод: квантовый компьютер с исправлением ошибок посчитает энергии промежуточных состояний FeMoco (активный центр нитрогеназы) за разумное время. Прил. H: FeMoco «consists of seven iron atoms and one molybdenum atom»; процесс Габера — Боша «requires high temperatures and pressures and is therefore energy intensive». Кубиты: прил. A — «Each spin orbital is assigned a qubit»; Table 1 — структура 1: «54 electrons in 54 spatial orbitals» (108 спин-орбиталей); Table 6 (структура 1): «Logical qubits 111» (последовательно), 110 (PAR), 109 (вложенно); текст — «the number of logical qubits in the main quantum processor is only of the order of a hundred» | ✅ (проверено 25.10.2026) |
| 19 | Lee et al. Evaluating the evidence for exponential quantum advantage in ground-state quantum chemistry. Nature Communications 14, 1952 (2023). DOI 10.1038/s41467-023-37587-6. Препринт: «Is there evidence for exponential quantum advantage in quantum chemistry?» | https://arxiv.org/abs/2208.02199 | **Обязательный контрапункт**. Вывод: «we conclude that evidence for such an exponential advantage across chemical space has yet to be found»; полиномиальные ускорения возможны. Про Fe–S и FeMoco (разд. 3.1): «the Fe-S clusters of nitrogenase have become a poster child problem for quantum chemistry on quantum devices»; вес простых стартовых состояний «show an exponential decrease in weight with the number of metal centers», то есть подготовка состояния на квантовом компьютере тоже трудна. Разд. 3.2: «Strongly correlated materials (e.g. bulk analogs of the Fe-S clusters) remain challenging to treat with ab initio quantum chemistry (although there has been considerable progress in recent years)»; «while there are many chemistry problems that cannot currently be addressed by classical methods …, the barrier to solution may be of polynomial (even if impractically large) rather than exponential cost». Что классические методы для FeMoco экспоненциально неразрешимы, статья НЕ утверждает | ✅ (проверено 25.10.2026) |

## Криптография (глава 6, финал)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 20 | Gidney. How to factor 2048 bit RSA integers with less than a million noisy qubits (2025) | https://arxiv.org/abs/2505.15917 | < 1 млн кубитов, < недели | ✅ |
| 21 | Gidney, Ekerå. How to factor 2048 bit RSA integers in 8 hours using 20 million noisy qubits (2019) | https://arxiv.org/abs/1905.09749 | Динамика оценок | ⚠ |
| 22 | The Quantum Insider. Q-Day Just Got Closer: Three Papers in Three Months (31.03.2026) | https://thequantuminsider.com/2026/03/31/q-day-just-got-closer-three-papers-in-three-months-are-rewriting-the-quantum-threat-timeline/ | Оценки 2026 (< 100 тыс. кубитов, заявка Iceberg) — перепроверить по первоисточникам | ✅ |
| 23 | NIST. FIPS 203 «Module-Lattice-Based Key-Encapsulation Mechanism Standard» (ML-KEM); FIPS 204 «Module-Lattice-Based Digital Signature Standard» (ML-DSA); FIPS 205 «Stateless Hash-Based Digital Signature Standard» (SLH-DSA). Все три опубликованы 13.08.2024 | https://csrc.nist.gov/pubs/fips/203/final · https://csrc.nist.gov/pubs/fips/204/final · https://csrc.nist.gov/pubs/fips/205/final | Реплика Оракула про новые шифры. FIPS 203: «At present, ML-KEM is believed to be secure, even against adversaries who possess a quantum computer» | ✅ (проверено 25.10.2026) |
| 55 | Boudot, Gaudry, Guillevic, Heninger, Thomé, Zimmermann. Factorization of RSA-250 (объявление, 28.02.2020) | https://caramba.loria.fr/rsa250.txt | Гл. 6, слайд `rsa1`: RSA-250 разложено 28.02.2020; «The total computation time was roughly 2700 core-years, using Intel Xeon Gold 6130 CPUs as a reference (2.1GHz)»: просеивание 2450, матрица 250 физических ядро-лет; CADO-NFS | ✅ (проверено 25.10.2026) |
| 56 | Boudot, Gaudry, Guillevic, Heninger, Thomé, Zimmermann. Comparing the difficulty of factorization and discrete logarithm: a 240-digit experiment (2020) | https://arxiv.org/abs/2006.06197 | Гл. 6: статья авторов рекорда; «The last page of this paper also reports on the factorization of RSA-250» | ✅ (аннотация, 25.10.2026) |
| 57 | P. Zimmermann. Integer Factoring Records | https://members.loria.fr/PZimmermann/records/factor.html | Гл. 6: «the largest integer factored with a general-purpose algorithm is RSA-250 (250 decimal digits), which was factored on February 28, 2020» — рекорд не побит на дату проверки | ✅ (проверено 25.10.2026) |

## Масштабы памяти (глава 6, доска памяти)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 58 | TOP500, November 2025 (66-й список) | https://top500.org/lists/top500/2025/11/ | Масштаб `super`: №1 — El Capitan (HPE Cray EX255a, LLNL), Rmax 1 809 PFlop/s. Карточка системы https://top500.org/system/180307 объёма памяти не содержит | ✅ (проверено 25.10.2026) |
| 59 | LLNL HPC. El Capitan (страница системы) | https://hpc.llnl.gov/hardware/compute-platforms/el-capitan | Масштаб `super`: «Memory Total (GiB) 5,898,240» (≈ 6,33·10¹⁵ байт); узлов 11 520, «512 GB memory/node» | ✅ (проверено 25.10.2026) |
| 60 | TOP500, June 2026 (67-й список) | https://top500.org/lists/top500/2026/06/ | Контекст: текущий №1 — LineShine (NSCS, Китай), El Capitan — №2. Карточка https://top500.org/system/180490 объёма памяти не содержит. См. open-questions #10 | ✅ (проверено 25.10.2026) |
| 61 | IDC. Data Creation and Replication Will Grow at a Faster Rate than Installed Storage Capacity, According to the IDC Global DataSphere and StorageSphere Forecasts (пресс-релиз, 24.03.2021) | https://web.archive.org/web/20211231044751/https://www.idc.com/getdoc.jsp?containerId=prUS47560321 | Масштаб `world`: «The Global StorageSphere installed base of storage capacity reached 6.7ZB in 2020»; прогноз роста 19,2% в год. Живой URL idc.com отдаёт 404 — открыт через Wayback Machine. См. open-questions #11 | ✅ (проверено 25.10.2026; данные 2020 г.) |
| 62 | Apple. MacBook Air – Tech Specs (13- и 15-inch, M5) | https://www.apple.com/macbook-air/specs/ | Масштаб `laptop`: базовая модель — «16GB unified memory», «Configurable to: 24GB or 32GB» | ✅ (проверено 25.10.2026) |
| 63 | Live Science. «How many atoms are in the observable universe?» (обновлено 12.07.2021) | https://www.livescience.com/how-many-atoms-in-universe.html | Масштаб `atoms`: статья даёт «10^82 atoms in the observable universe», а не 10⁸⁰; научная журналистика. Источник NASA/ESA/университета на 10⁸⁰ не найден — см. open-questions #9 | ⚠ (открыт 25.10.2026; для 10⁸⁰ не подходит) |
| 64 | NumPy documentation. Scalars (numpy.cdouble / numpy.complex128) | https://numpy.org/doc/stable/reference/arrays.scalars.html | `bytes_per_amplitude: 16`: cdouble — «Complex number type composed of two double-precision floating-point numbers»; на Linux x86_64 это `numpy.complex128`: «Complex number type composed of 2 64-bit-precision floating-point numbers» (2 × 8 байт = 16 байт) | ✅ (проверено 25.10.2026) |
| 65 | cppreference. std::complex | https://en.cppreference.com/w/cpp/numeric/complex | `bytes_per_amplitude: 16`, второй источник. «Array-oriented access»: «reinterpret_cast<T(&)[2]>(z)[0] is the real part of z and reinterpret_cast<T(&)[2]>(z)[1] is the imaginary part of z»; «an implementation is constrained to store the real and imaginary parts … in separate and adjacent memory locations». Значит, std::complex<double> — это два double подряд | ✅ (проверено 25.10.2026) |

## Дорожная карта: когда появится Оракул (глава 3)

| # | Источник | Ссылка | Зачем | Статус |
| --- | --- | --- | --- | --- |
| 66 | IBM. IBM Quantum Roadmap (PDF, © 2025 IBM Corporation) | https://www.ibm.com/downloads/documents/us-en/1443d5cda24021e4 | «Оракул — машина из 2030-х»: «In 2033, we will debut IBM Quantum Blue Jay, a system capable of running circuits with a billion gates on 2,000 qubits. These large-scale fault-tolerant quantum computers will unlock a new era of algorithmic complexity». В фразе про Blue Jay сказано «qubits», без слова «logical». Это план одной компании, а не результат. См. open-questions #13 | ✅ (проверено 25.10.2026) |
| 67 | IBM Quantum blog. How IBM will build the world's first large-scale, fault-tolerant quantum computer (Mandelbaum, Gambetta, Chow, Mittal, Yoder) | https://www.ibm.com/quantum/blog/large-scale-ftqc | «By 2029, we will deliver IBM Quantum Starling — a large-scale, fault-tolerant quantum computer capable of running quantum circuits comprising 100 million quantum gates on 200 logical qubits»; «Recent revisions to that roadmap project a path to 2033 and beyond». То же про Starling — на https://www.ibm.com/quantum/technology | ✅ (проверено 25.10.2026) |

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
| 45 | NVIDIA A100 Tensor Core GPU Architecture (whitepaper). Table 4 «Comparison of NVIDIA Data Center GPUs», столбец NVIDIA A100: SMs 108; INT32 Cores / SM 64; INT32 Cores / GPU 6912; GPU Boost Clock 1410 MHz; Peak INT32 TOPS 19.5 (сноска 4: «TOPS = IMAD-based integer math»). Раздел «Simultaneous Execution of FP32 and INT32 Operations»: «separate FP32 and INT32 cores, allowing simultaneous execution of FP32 and INT32 operations at full throughput» | https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/nvidia-ampere-architecture-whitepaper.pdf | Гл. 4, интерлюдия: такт Фабрики 0,71 нс. Гл. 2, гонка «цепочка»: дорожка одного потока Фабрики. Фразы «одна операция за такт на поток» в документе нет; она выводится: 6912 × 1,41 ГГц × 2 (IMAD = 2 операции) = 19,5 TOPS, т. е. одна целочисленная инструкция на INT32-ядро за такт [вывод]. См. open-questions #12 | ✅ (SM, ядра, частота, TOPS — проверено 25.10.2026) |
| 46 | Fixsen. The temperature of the cosmic microwave background (2009): 2,72548 K | https://arxiv.org/abs/0911.1955 | Гл. 3: «в сотни раз холоднее космоса» | ✅ |
| 47 | Krinner et al. Engineering cryogenic setups for 100-qubit scale superconducting circuit systems (2019): ~14 мК | https://arxiv.org/abs/1806.07862 | Гл. 3: температура криостата | ✅ |
| 48 | Bast et al. Route Planning in Transportation Networks (2015), Table 1: Западная Европа, 18 млн вершин, Dijkstra 2 195 080 мкс на 1 ядре X5680 | https://arxiv.org/abs/1504.05140 | Гл. 4: Мастер прокладывает маршрут за доли секунды | ✅ |
| 49 | Concorde TSP benchmarks 1999: kroA200, оптимум за 6,59 с (500 МГц) | https://www.math.uwaterloo.ca/tsp/concorde/benchmarks/bench99.html | Гл. 4: коммивояжёр на 200 адресов | ✅ |
| 50 | Hougardy, Zhong. Hard to Solve Instances of the Euclidean Traveling Salesman Problem (2018) | https://arxiv.org/abs/1808.02859 | Гл. 4: контрапункт — бывают и трудные экземпляры коммивояжёра | ✅ |
| 51 | Ambainis et al. Quantum speedups for exponential-time dynamic programming algorithms (2018): O*(1,728ⁿ) с экспоненциальной памятью | https://arxiv.org/abs/1807.05209 | Гл. 4: «Оракулу известен выигрыш меньше корня» | ✅ |
| 52 | Montanaro. Quantum algorithms: an overview (2015) | https://arxiv.org/abs/1511.04206 | Гл. 4, справочно: для задач NP Гровер по сертификатам даёт почти квадратичное ускорение перебора, 2^(m/2) вместо 2^m; отдельно про коммивояжёра обзор не пишет | ✅ (заголовок и раздел «Search and optimisation» сверены 25.10.2026; прежняя строка с выдуманным названием исправлена) |
| 53 | Интервью Э. Дейкстры (Communications of the ACM 53(8), 2010): алгоритм придуман в 1956 году. DOI 10.1145/1787234.1787249 | https://doi.org/10.1145/1787234.1787249 | Гл. 4: «ему 70 лет» | ✅ |
| 54 | Gidney. Halving the cost of quantum addition (2017) | https://arxiv.org/abs/1709.06648 | Справочно: цена квантового сложения; для единицы тика не используется | ✅ (заголовок сверен по arXiv) |
| 68 | Visa. Visa Core Rules and Visa Product and Service Rules (18 April 2026) | https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf | Гл. 4, сейф «длиной с номер банковской карты»: в правилах замены карты — «Card data (16-digit Card number and expiration date)»; для банкоматов — «must accept all valid International Organization for Standardization numbers of 11-19 digits» | ✅ (проверено 25.10.2026) |
| 69 | ISO/IEC 7812-1:2017. Identification cards — Identification of issuers — Part 1: Numbering system (Edition 5, 2017-01; подтверждён в 2022) | https://www.iso.org/standard/70484.html | Гл. 4: стандарт, задающий формат номера карты (PAN). На открытой странице длины номера нет, текст стандарта платный — поэтому 16 цифр берём по Visa (#68) | ✅ (только название, 25.10.2026) |
