/**
 * Lima modul materi (PRD 7.2). DRAF: isi belum ditelaah ahli materi dan belum
 * diverifikasi terhadap kurikulum yang berlaku. Jangan diklaim sesuai kurikulum.
 */

export interface QuizItem {
  prompt: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface LearningModule {
  slug: string;
  order: number;
  version: number;
  title: string;
  indicators: string[]; // I1-I5
  objectives: string[];
  hook: string;
  sections: { heading: string; body: string[] }[];
  keyTerms: string[];
  summary: string;
  quiz: QuizItem[];
}

export const MODULES: LearningModule[] = [
  {
    slug: "cuaca-iklim-pemanasan-global",
    order: 1,
    version: 1,
    title: "Cuaca, Iklim, dan Pemanasan Global",
    indicators: ["I1"],
    objectives: [
      "Membedakan cuaca, iklim, dan pemanasan global.",
      "Memberi contoh fenomena untuk masing-masing istilah.",
    ],
    hook: "Hari ini hujan deras di kotamu. Apakah itu berarti iklim kotamu berubah?",
    sections: [
      {
        heading: "Cuaca",
        body: [
          "Cuaca adalah keadaan atmosfer pada suatu tempat dalam waktu singkat, misalnya jam atau hari: hujan sore ini, suhu pagi ini, angin hari ini.",
        ],
      },
      {
        heading: "Iklim",
        body: [
          "Iklim adalah pola rata-rata cuaca pada suatu wilayah dalam jangka panjang, umumnya puluhan tahun. Satu hari yang dingin tidak mengubah iklim.",
        ],
      },
      {
        heading: "Pemanasan global",
        body: [
          "Pemanasan global adalah kenaikan rata-rata temperatur permukaan Bumi dalam jangka panjang. Ini berbeda dari cuaca panas pada satu hari tertentu.",
        ],
      },
    ],
    keyTerms: ["Cuaca", "Iklim", "Pemanasan global"],
    summary:
      "Cuaca bersifat jangka pendek, iklim adalah pola jangka panjang, dan pemanasan global adalah kenaikan rata-rata temperatur Bumi dalam jangka panjang.",
    quiz: [
      {
        prompt: "Pernyataan manakah yang menggambarkan iklim?",
        options: [
          "Hari ini hujan lebat sejak pagi.",
          "Wilayah ini rata-rata memiliki musim hujan Oktober–Maret selama puluhan tahun.",
          "Besok diperkirakan berangin kencang.",
        ],
        correct: 1,
        explanation:
          "Iklim merupakan pola rata-rata dalam waktu panjang, bukan kejadian satu hari.",
      },
      {
        prompt: "Satu hari yang sangat dingin membuktikan bahwa pemanasan global tidak terjadi.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation:
          "Itu cuaca satu hari. Pemanasan global dilihat dari rata-rata temperatur jangka panjang.",
      },
    ],
  },
  {
    slug: "energi-matahari-dan-bumi",
    order: 2,
    version: 1,
    title: "Energi Matahari dan Bumi",
    indicators: ["I2"],
    objectives: [
      "Menjelaskan bahwa Bumi menerima energi Matahari dan memancarkan energi kembali ke angkasa.",
      "Menjelaskan konsep keseimbangan energi.",
    ],
    hook: "Mengapa Bumi tidak terus memanas padahal Matahari terus menyinarinya?",
    sections: [
      {
        heading: "Energi yang masuk",
        body: [
          "Matahari memancarkan radiasi, terutama gelombang pendek seperti cahaya tampak. Sebagian dipantulkan oleh awan dan permukaan (albedo), sebagian diserap oleh permukaan dan atmosfer.",
        ],
      },
      {
        heading: "Energi yang keluar",
        body: [
          "Bumi yang hangat memancarkan radiasi inframerah (gelombang panjang) ke angkasa. Pada keadaan seimbang, energi yang diserap sama dengan energi yang dilepas.",
        ],
      },
    ],
    keyTerms: ["Radiasi", "Albedo", "Inframerah", "Keseimbangan energi"],
    summary:
      "Bumi menerima radiasi Matahari dan melepas inframerah ke angkasa. Temperatur stabil ketika energi masuk dan keluar seimbang.",
    quiz: [
      {
        prompt: "Apa yang dimaksud albedo?",
        options: [
          "Banyaknya gas rumah kaca di atmosfer",
          "Bagian radiasi Matahari yang dipantulkan",
          "Kecepatan angin di permukaan",
        ],
        correct: 1,
        explanation: "Albedo adalah fraksi radiasi Matahari yang dipantulkan kembali.",
      },
      {
        prompt: "Radiasi yang dipancarkan permukaan Bumi ke angkasa terutama berupa…",
        options: ["Inframerah", "Sinar-X", "Cahaya tampak"],
        correct: 0,
        explanation: "Permukaan Bumi yang hangat memancarkan inframerah.",
      },
    ],
  },
  {
    slug: "mekanisme-efek-rumah-kaca",
    order: 3,
    version: 1,
    title: "Mekanisme Efek Rumah Kaca",
    indicators: ["I2", "I3"],
    objectives: [
      "Menjelaskan mekanisme efek rumah kaca melalui penyerapan dan pemancaran ulang inframerah.",
      "Membedakan efek rumah kaca dan penipisan ozon.",
    ],
    hook: "Gas rumah kaca sering dibayangkan seperti selimut atau cermin. Apakah gambaran itu tepat?",
    sections: [
      {
        heading: "Peran atmosfer",
        body: [
          "Gas rumah kaca di atmosfer menyerap sebagian inframerah dari permukaan, lalu memancarkannya kembali ke segala arah, termasuk ke bawah menuju permukaan.",
          "Gas rumah kaca bukan cermin yang memantulkan seluruh radiasi; yang terjadi adalah penyerapan dan pemancaran ulang.",
        ],
      },
      {
        heading: "Efek rumah kaca alami",
        body: [
          "Efek rumah kaca alami membuat Bumi cukup hangat untuk kehidupan. Masalah muncul ketika penguatannya berlebihan akibat aktivitas manusia.",
        ],
      },
      {
        heading: "Bukan penipisan ozon",
        body: [
          "Penipisan ozon berkaitan dengan berkurangnya ozon di stratosfer yang menyerap sinar ultraviolet. Mekanismenya berbeda dari efek rumah kaca.",
        ],
      },
    ],
    keyTerms: ["Gas rumah kaca", "Efek rumah kaca", "Penipisan ozon"],
    summary:
      "Efek rumah kaca terjadi karena atmosfer menyerap dan memancarkan ulang inframerah. Ini berbeda dari penipisan ozon.",
    quiz: [
      {
        prompt: "Efek rumah kaca terjadi karena lubang pada lapisan ozon.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation:
          "Efek rumah kaca berkaitan dengan inframerah; lapisan ozon berkaitan dengan sinar ultraviolet.",
      },
      {
        prompt: "Bagaimana gas rumah kaca memengaruhi temperatur permukaan?",
        options: [
          "Memantulkan seluruh radiasi Matahari ke angkasa",
          "Menyerap inframerah dan memancarkannya kembali, termasuk ke permukaan",
          "Menghentikan seluruh radiasi dari permukaan",
        ],
        correct: 1,
        explanation: "Penyerapan dan pemancaran ulang inframerah menambah energi di permukaan.",
      },
      {
        prompt: "Efek rumah kaca alami selalu merugikan kehidupan.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation: "Efek alami menjaga Bumi tetap hangat sehingga layak huni.",
      },
    ],
  },
  {
    slug: "gas-rumah-kaca-dan-aktivitas-manusia",
    order: 4,
    version: 1,
    title: "Gas Rumah Kaca dan Aktivitas Manusia",
    indicators: ["I4"],
    objectives: [
      "Menyebutkan contoh gas rumah kaca dan sumbernya.",
      "Menghubungkan peningkatan gas rumah kaca dengan keseimbangan energi.",
    ],
    hook: "Dari mana datangnya tambahan gas rumah kaca di atmosfer?",
    sections: [
      {
        heading: "Contoh gas rumah kaca",
        body: [
          "Contoh: uap air, karbon dioksida (CO₂), metana (CH₄), dan dinitrogen oksida (N₂O).",
        ],
      },
      {
        heading: "Sumber dari aktivitas manusia",
        body: [
          "CO₂ meningkat antara lain dari pembakaran bahan bakar fosil dan alih fungsi hutan. Metana berkaitan dengan peternakan, sawah, dan pengelolaan limbah.",
        ],
      },
      {
        heading: "Menghubungkan dengan simulasi",
        body: [
          "Pada simulasi, parameter ε menggambarkan efektivitas atmosfer menyerap inframerah. Itu adalah parameter model, bukan konsentrasi CO₂ dalam ppm, sehingga hasilnya tidak boleh dibaca sebagai prediksi temperatur Bumi.",
        ],
      },
    ],
    keyTerms: ["Karbon dioksida", "Metana", "Bahan bakar fosil", "Parameter model"],
    summary:
      "Aktivitas manusia menambah gas rumah kaca, sehingga keseimbangan energi Bumi berubah. Simulasi hanya memodelkan gagasan ini secara sederhana.",
    quiz: [
      {
        prompt: "Manakah yang termasuk gas rumah kaca?",
        options: ["Karbon dioksida", "Argon murni", "Helium"],
        correct: 0,
        explanation: "CO₂ menyerap dan memancarkan ulang inframerah.",
      },
      {
        prompt: "Nilai ε pada simulasi sama dengan konsentrasi CO₂ dalam ppm.",
        options: ["Benar", "Salah"],
        correct: 1,
        explanation: "ε adalah parameter efektif model, bukan ppm.",
      },
    ],
  },
  {
    slug: "dampak-dan-mitigasi",
    order: 5,
    version: 1,
    title: "Dampak dan Mitigasi Pemanasan Global",
    indicators: ["I5"],
    objectives: [
      "Menganalisis contoh dampak pemanasan global.",
      "Memilih tindakan mitigasi yang relevan dan memberi alasan.",
    ],
    hook: "Tindakan apa yang bisa mengurangi tambahan gas rumah kaca di sekitarmu?",
    sections: [
      {
        heading: "Contoh dampak",
        body: [
          "Dampak yang dikaji dalam ilmu iklim antara lain kenaikan permukaan laut, perubahan pola curah hujan, dan peningkatan frekuensi gelombang panas. Tingkat dan sebaran dampak berbeda antarwilayah.",
        ],
      },
      {
        heading: "Mitigasi",
        body: [
          "Mitigasi berarti mengurangi penyebab, misalnya hemat energi, energi terbarukan, transportasi efisien, dan menjaga hutan. Adaptasi berarti menyesuaikan diri terhadap dampak.",
        ],
      },
    ],
    keyTerms: ["Mitigasi", "Adaptasi", "Energi terbarukan"],
    summary:
      "Mitigasi mengurangi penyebab pemanasan global, adaptasi menyesuaikan diri terhadap dampaknya. Keduanya saling melengkapi.",
    quiz: [
      {
        prompt: "Manakah yang merupakan mitigasi?",
        options: [
          "Membangun tanggul untuk menahan banjir rob",
          "Beralih ke energi terbarukan untuk mengurangi emisi",
          "Mengganti jenis tanaman agar tahan kekeringan",
        ],
        correct: 1,
        explanation:
          "Mitigasi menekan penyebab (emisi). Tanggul dan ganti tanaman termasuk adaptasi.",
      },
    ],
  },
];

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug);
