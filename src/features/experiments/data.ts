/** Definisi eksperimen POE (PRD 7.4). Teks bersifat draf dan perlu telaah ahli. */

export type OptionIcon = "up" | "down" | "flat" | "equal" | "shuffle";

export interface Option {
  id: string;
  text: string;
  icon?: OptionIcon;
}

export interface ExperimentDef {
  id: "exp1" | "exp2" | "exp3";
  version: number;
  title: string;
  goal: string;
  context: string;
  predictQuestion: string;
  options: Option[];
  correctOptionId: string;
  /** exp1: bandingkan ε=0 dan baseline; exp2: siswa mengubah ε; exp3: perbandingan konsep */
  observeType: "compare-baseline" | "adjust-epsilon" | "concept-table";
  observeInstruction: string;
  explainQuestion: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  keyIdea: string;
}

export const EXPERIMENTS: ExperimentDef[] = [
  {
    id: "exp1",
    version: 1,
    title: "Efek Rumah Kaca Alami",
    goal: "Memahami bahwa efek rumah kaca alami merupakan bagian dari sistem energi Bumi.",
    context:
      "Pada model, atmosfer dapat menyerap dan memancarkan kembali radiasi inframerah dari permukaan. Bandingkan kondisi tanpa interaksi inframerah atmosfer (ε = 0) dengan kondisi baseline (ε = 0,78).",
    predictQuestion:
      "Dibandingkan model tanpa interaksi inframerah atmosfer, bagaimana temperatur kesetimbangan permukaan pada model baseline?",
    options: [
      { id: "higher", icon: "up", text: "Lebih tinggi" },
      { id: "same", icon: "flat", text: "Sama" },
      { id: "lower", icon: "down", text: "Lebih rendah" },
    ],
    correctOptionId: "higher",
    observeType: "compare-baseline",
    observeInstruction:
      "Perhatikan tabel perbandingan. Energi Matahari yang diserap sama pada kedua kondisi; yang berbeda hanya interaksi inframerah atmosfer.",
    explainQuestion:
      "Jelaskan dengan bukti dari tabel: mengapa temperatur permukaan berbeda padahal energi Matahari yang diserap sama?",
    feedbackCorrect:
      "Tepat. Atmosfer menyerap sebagian inframerah dari permukaan dan memancarkannya kembali, termasuk ke bawah, sehingga permukaan menerima energi tambahan.",
    feedbackIncorrect:
      "Hasil observasi menunjukkan temperatur permukaan model lebih tinggi dengan atmosfer. Energi surya terserap sama, tetapi inframerah yang dipancarkan kembali ke bawah menambah energi di permukaan.",
    keyIdea:
      "Efek rumah kaca alami adalah bagian normal dari keseimbangan energi Bumi.",
  },
  {
    id: "exp2",
    version: 1,
    title: "Peningkatan Efektivitas Penyerapan Inframerah",
    goal: "Mengamati pengaruh perubahan parameter atmosfer terhadap neraca energi model.",
    context:
      "Parameter ε menggambarkan seberapa efektif atmosfer model menyerap dan memancarkan inframerah. Kamu akan menaikkan ε dan mengamati temperatur permukaan model.",
    predictQuestion:
      "Jika ε dinaikkan dan parameter lain tetap, apa yang terjadi pada temperatur permukaan model?",
    options: [
      { id: "up", icon: "up", text: "Naik" },
      { id: "same", icon: "flat", text: "Tidak berubah" },
      { id: "down", icon: "down", text: "Turun" },
    ],
    correctOptionId: "up",
    observeType: "adjust-epsilon",
    observeInstruction:
      "Ubah ε dari nilai baseline (0,78) menggunakan kontrol di bawah, lalu bandingkan hasilnya.",
    explainQuestion:
      "Jelaskan hubungan penyerapan dan pemancaran inframerah atmosfer dengan temperatur permukaan model, berdasarkan angka yang kamu amati.",
    feedbackCorrect:
      "Tepat. Dengan ε lebih besar, lebih banyak inframerah diserap dan dipancarkan kembali ke permukaan, sehingga temperatur kesetimbangan model naik.",
    feedbackIncorrect:
      "Pada model ini, menaikkan ε membuat temperatur permukaan naik karena lebih banyak inframerah dipancarkan kembali ke permukaan.",
    keyIdea:
      "ε adalah parameter efektif model, bukan konsentrasi ppm gas tertentu. Hasilnya tidak boleh dibaca sebagai hubungan linear CO₂ dan temperatur Bumi.",
  },
  {
    id: "exp3",
    version: 1,
    title: "Efek Rumah Kaca dan Penipisan Ozon",
    goal: "Membedakan mekanisme efek rumah kaca dan penipisan ozon.",
    context:
      "Dua istilah ini sering tertukar. Eksperimen ini memakai perbandingan penjelasan ilmiah, bukan simulasi energi, karena penipisan ozon adalah proses kimia yang tidak dimodelkan di simulasi.",
    predictQuestion:
      "Apakah efek rumah kaca dan penipisan lapisan ozon memiliki mekanisme yang sama?",
    options: [
      { id: "same", icon: "equal", text: "Ya, keduanya mekanisme yang sama" },
      { id: "different", icon: "shuffle", text: "Tidak, keduanya mekanisme yang berbeda" },
    ],
    correctOptionId: "different",
    observeType: "concept-table",
    observeInstruction: "Pelajari tabel perbandingan berikut.",
    explainQuestion:
      "Jelaskan perbedaan utama kedua fenomena dengan kata-katamu sendiri.",
    feedbackCorrect:
      "Tepat. Efek rumah kaca berkaitan dengan penyerapan dan pemancaran ulang inframerah, sedangkan penipisan ozon berkaitan dengan hilangnya ozon yang menyerap sinar ultraviolet.",
    feedbackIncorrect:
      "Keduanya berbeda. Efek rumah kaca terkait inframerah dan keseimbangan energi; penipisan ozon terkait reaksi kimia yang mengurangi ozon penyerap ultraviolet.",
    keyIdea:
      "Lubang pada lapisan ozon bukan penyebab utama efek rumah kaca.",
  },
];

export const OZONE_TABLE: { aspect: string; ghe: string; ozone: string }[] = [
  { aspect: "Radiasi utama", ghe: "Inframerah dari permukaan Bumi", ozone: "Ultraviolet dari Matahari" },
  { aspect: "Proses", ghe: "Gas menyerap dan memancarkan ulang inframerah", ozone: "Reaksi kimia mengurangi ozon" },
  { aspect: "Lapisan atmosfer", ghe: "Terutama troposfer", ozone: "Stratosfer" },
  { aspect: "Dampak utama", ghe: "Memengaruhi keseimbangan energi dan temperatur", ozone: "Lebih banyak UV mencapai permukaan" },
];
