export interface GlossaryEntry {
  term: string;
  definition: string;
  moduleSlug: string;
}

/** DRAF: perlu telaah ahli materi. */
export const GLOSSARY: GlossaryEntry[] = [
  { term: "Albedo", definition: "Bagian radiasi Matahari yang dipantulkan kembali oleh permukaan atau awan.", moduleSlug: "energi-matahari-dan-bumi" },
  { term: "Adaptasi", definition: "Penyesuaian diri terhadap dampak perubahan iklim.", moduleSlug: "dampak-dan-mitigasi" },
  { term: "Cuaca", definition: "Keadaan atmosfer pada suatu tempat dalam waktu singkat.", moduleSlug: "cuaca-iklim-pemanasan-global" },
  { term: "Efek rumah kaca", definition: "Proses ketika atmosfer menyerap dan memancarkan ulang inframerah sehingga permukaan lebih hangat.", moduleSlug: "mekanisme-efek-rumah-kaca" },
  { term: "Gas rumah kaca", definition: "Gas di atmosfer yang menyerap dan memancarkan ulang inframerah, misalnya CO₂ dan CH₄.", moduleSlug: "mekanisme-efek-rumah-kaca" },
  { term: "Iklim", definition: "Pola rata-rata cuaca suatu wilayah dalam jangka panjang.", moduleSlug: "cuaca-iklim-pemanasan-global" },
  { term: "Inframerah", definition: "Radiasi gelombang panjang yang dipancarkan benda hangat, termasuk permukaan Bumi.", moduleSlug: "energi-matahari-dan-bumi" },
  { term: "Keseimbangan energi", definition: "Kondisi ketika energi yang diserap sama dengan energi yang dilepas.", moduleSlug: "energi-matahari-dan-bumi" },
  { term: "Mitigasi", definition: "Upaya mengurangi penyebab perubahan iklim, misalnya menekan emisi gas rumah kaca.", moduleSlug: "dampak-dan-mitigasi" },
  { term: "Parameter model", definition: "Nilai masukan yang dapat diubah pada simulasi. ε adalah parameter model, bukan ppm CO₂.", moduleSlug: "gas-rumah-kaca-dan-aktivitas-manusia" },
  { term: "Pemanasan global", definition: "Kenaikan rata-rata temperatur permukaan Bumi dalam jangka panjang.", moduleSlug: "cuaca-iklim-pemanasan-global" },
  { term: "Penipisan ozon", definition: "Berkurangnya ozon stratosfer yang menyerap sinar ultraviolet; berbeda dari efek rumah kaca.", moduleSlug: "mekanisme-efek-rumah-kaca" },
  { term: "Radiasi", definition: "Perpindahan energi dalam bentuk gelombang elektromagnetik.", moduleSlug: "energi-matahari-dan-bumi" },
];
