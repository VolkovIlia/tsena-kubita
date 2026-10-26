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
  shannon: { text: "Shannon. A Symbolic Analysis of Relay and Switching Circuits. Trans. AIEE 57(12), 1938", url: "https://doi.org/10.1109/T-AIEE.1938.5057767" },
  feynman: { text: "Feynman. Simulating Physics with Computers. Int. J. Theor. Phys. 21, 1982", url: "https://doi.org/10.1007/BF02650179" },
  sutter: { text: "Sutter. The Free Lunch Is Over. Dr. Dobb's Journal 30(3), 2005", url: "http://www.gotw.ca/publications/concurrency-ddj.htm" },
  cuda: { text: "NVIDIA. CUDA Toolkit Archive: CUDA Toolkit 1.0 (June 2007)", url: "https://developer.nvidia.com/cuda-toolkit-archive" },
  cudaGuide: {
    text: "NVIDIA. CUDA C++ Programming Guide v12.4, SIMT Architecture",
    url: "https://docs.nvidia.com/cuda/archive/12.4.0/cuda-c-programming-guide/index.html#simt-architecture",
  },
  kuphaldt: { text: "Kuphaldt. Lessons In Electric Circuits, Vol. IV, ch. 9: Full-Adder", url: "https://www.ibiblio.org/kuphaldt/electricCircuits/Digital/DIGI_9.html" },
  planck: { text: "Planck Collaboration. Planck 2018 results. VI. Cosmological parameters", url: "https://arxiv.org/abs/1807.06209" },
  dijkstraInterview: {
    text: "An Interview with Edsger W. Dijkstra. CACM 53(8), 2010",
    url: "https://cacm.acm.org/research/an-interview-with-edsger-w-dijkstra/",
  },
  ibm2016: {
    text: "IBM. IBM Makes Quantum Computing Available on IBM Cloud, 04.05.2016 (Wayback Machine)",
    url: "https://web.archive.org/web/20161222051931/http://www-03.ibm.com/press/us/en/pressrelease/49661.wss",
  },
  arute: { text: "Arute et al. Quantum supremacy using a programmable superconducting processor. Nature 574, 2019", url: "https://www.nature.com/articles/s41586-019-1666-5" },
  ibmSupremacy: { text: "Pednault et al. On “quantum supremacy”. IBM Quantum blog, 2019", url: "https://www.ibm.com/quantum/blog/on-quantum-supremacy" },
  willow: { text: "Google. Meet Willow, our state-of-the-art quantum chip, 2024", url: "https://blog.google/technology/research/google-willow-quantum-chip/" },
  willowNature: { text: "Google Quantum AI. Quantum error correction below the surface code threshold. Nature 638, 2025", url: "https://www.nature.com/articles/s41586-024-08449-y" },
  majorana2: { text: "Microsoft. Introducing Majorana 2, 02.06.2026", url: "https://news.microsoft.com/source/features/innovation/majorana-2-microsoft-discovery-agentic-ai/" },
  majoranaCritics: {
    text: "Science News. Microsoft’s quantum chip got an upgrade. Critics are still skeptical, 02.06.2026",
    url: "https://www.sciencenews.org/article/microsoft-quantum-chip-upgrade-majorana",
  },
  starling: { text: "IBM Quantum blog. How IBM will build the world's first large-scale, fault-tolerant quantum computer", url: "https://www.ibm.com/quantum/blog/large-scale-ftqc" },
  kerenidis: { text: "Kerenidis, Prakash. Quantum Recommendation Systems. arXiv:1603.08675, 2016", url: "https://arxiv.org/abs/1603.08675" },
  krinner: { text: "Krinner et al. Engineering cryogenic setups for 100-qubit scale superconducting circuit systems, 2019", url: "https://arxiv.org/abs/1806.07862" },
  fixsen: { text: "Fixsen. The temperature of the cosmic microwave background, 2009", url: "https://arxiv.org/abs/0911.1955" },
  preskill: { text: "Preskill. Quantum Computing in the NISQ era and beyond. Quantum 2, 79 (2018)", url: "https://arxiv.org/abs/1801.00862" },
  montanaro: { text: "Montanaro. Quantum algorithms: an overview. npj Quantum Information 2, 15023 (2016)", url: "https://arxiv.org/abs/1511.04206" },
  quillen: {
    text: "Quillen. PHY265 Lecture notes: Quantum Systems, Measurement and the Qubit. University of Rochester, 2026",
    url: "https://astro.pas.rochester.edu/~aquillen/phy265/lectures/QI_A.pdf",
  },
  qcvc: { text: "Matuschak, Nielsen. Quantum computing for the very curious. Quantum Country, 2019", url: "https://quantum.country/qcvc" },
  cudaGuide9: {
    text: "NVIDIA. CUDA C Programming Guide v9.0, Introduction",
    url: "https://docs.nvidia.com/cuda/archive/9.0/cuda-c-programming-guide/index.html",
  },
} as const;
