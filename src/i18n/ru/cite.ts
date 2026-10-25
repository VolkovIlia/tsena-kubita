/** Библиография: единственное место в словаре, где разрешены цифры (страж — ru.test.ts). */
export const cite = {
  hoefler: {
    text: "Hoefler, Häner, Troyer. Disentangling Hype from Practicality. CACM 66(5), 2023",
    url: "https://arxiv.org/abs/2307.00523",
  },
  grover: { text: "Grover. STOC 1996", url: "https://arxiv.org/abs/quant-ph/9605043" },
  bbbv: {
    text: "Bennett, Bernstein, Brassard, Vazirani. SIAM J. Comput. 26(5), 1997",
    url: "https://arxiv.org/abs/quant-ph/9701001",
  },
  threeBlue: {
    text: "3Blue1Brown. But what is quantum computing? (Grover's Algorithm), 2025",
    url: "https://www.youtube.com/watch?v=RQWpF2Gb-gU",
  },
  beverland: { text: "Beverland et al. arXiv:2211.07629, 2022", url: "https://arxiv.org/abs/2211.07629" },
  dijkstra: { text: "Dijkstra. Numerische Mathematik 1, 1959", url: "https://doi.org/10.1007/BF01386390" },
  bast: { text: "Bast et al. Route Planning in Transportation Networks, 2015", url: "https://arxiv.org/abs/1504.05140" },
  concorde: {
    text: "Concorde TSP benchmarks, 1999",
    url: "https://www.math.uwaterloo.ca/tsp/concorde/benchmarks/bench99.html",
  },
  ambainis: { text: "Ambainis et al. arXiv:1807.05209, 2018", url: "https://arxiv.org/abs/1807.05209" },
  uops: { text: "uops.info: AND r64, r64", url: "https://uops.info/html-instr/AND_21_R64_R64.html" },
  amd: {
    text: "AMD EPYC 9575F",
    url: "https://www.amd.com/en/products/processors/server/epyc/9005-series/amd-epyc-9575f.html",
  },
  nvidia: {
    text: "NVIDIA A100 Tensor Core GPU Architecture",
    url: "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/nvidia-ampere-architecture-whitepaper.pdf",
  },
  amdahl: {
    text: "Amdahl. Validity of the single processor approach to achieving large scale computing capabilities. AFIPS 1967",
    url: "https://doi.org/10.1145/1465482.1465560",
  },
  tang: {
    text: "Tang. A quantum-inspired classical algorithm for recommendation systems. STOC 2019",
    url: "https://arxiv.org/abs/1807.04271",
  },
  chia: {
    text: "Chia, Gilyén, Li, Lin, Tang, Wang. Sampling-based sublinear low-rank matrix arithmetic framework for dequantizing quantum machine learning. JACM",
    url: "https://arxiv.org/abs/1910.06151",
  },
  quanta: {
    text: "Quanta Magazine. The Joy of Why: What Is the True Promise of Quantum Computing? 2025",
    url: "https://www.quantamagazine.org/what-is-the-true-promise-of-quantum-computing-20250403/",
  },
  bernstein: {
    text: "D. J. Bernstein. Big computations on small data",
    url: "https://cr.yp.to/credits/big-computations-small-data.html",
  },
  reiher: {
    text: "Reiher, Wiebe, Svore, Wecker, Troyer. Elucidating reaction mechanisms on quantum computers. PNAS 114, 2017",
    url: "https://arxiv.org/abs/1605.03590",
  },
  lee: {
    text: "Lee et al. Evaluating the evidence for exponential quantum advantage in ground-state quantum chemistry. Nat. Commun. 14, 2023",
    url: "https://arxiv.org/abs/2208.02199",
  },
  shor: {
    text: "Shor. Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer. SIAM J. Comput. 26, 1997",
    url: "https://arxiv.org/abs/quant-ph/9508027",
  },
  rsa250: {
    text: "Boudot, Gaudry, Guillevic, Heninger, Thomé, Zimmermann. Factorization of RSA-250, 2020",
    url: "https://caramba.loria.fr/rsa250.txt",
  },
  gidney: {
    text: "Gidney. How to factor 2048 bit RSA integers with less than a million noisy qubits, 2025",
    url: "https://arxiv.org/abs/2505.15917",
  },
  nist: {
    text: "NIST. FIPS 203, 204, 205 — стандарты постквантовой криптографии, 2024",
    url: "https://csrc.nist.gov/pubs/fips/203/final",
  },
  apple: { text: "Apple. MacBook Air — Tech Specs", url: "https://www.apple.com/macbook-air/specs/" },
  llnl: { text: "LLNL HPC. El Capitan", url: "https://hpc.llnl.gov/hardware/compute-platforms/el-capitan" },
  idc: {
    text: "IDC. Global DataSphere and StorageSphere Forecasts, 2021",
    url: "https://web.archive.org/web/20211231044751/https://www.idc.com/getdoc.jsp?containerId=prUS47560321",
  },
  babbush: {
    text: "Babbush et al. Focus beyond quadratic speedups for error-corrected quantum advantage. PRX Quantum 2, 2021",
    url: "https://arxiv.org/abs/2011.04149",
  },
  googleEcho: {
    text: "Google Quantum AI. A verifiable quantum advantage, 2025",
    url: "https://research.google/blog/a-verifiable-quantum-advantage/",
  },
  ieeeEcho: { text: "IEEE Spectrum. Quantum Echoes, 2025", url: "https://spectrum.ieee.org/quantum-echoes" },
} as const;
