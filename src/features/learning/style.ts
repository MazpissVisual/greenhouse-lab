import { CloudRain, Factory, Globe, Sprout, Sun, type LucideIcon } from "lucide-react";

/** Ikon dan warna lembut per bagian materi (dekorasi; tidak memengaruhi isi). */
export const MODULE_STYLE: Record<number, { icon: LucideIcon; tint: string; color: string }> = {
  1: { icon: CloudRain, tint: "#e3efff", color: "#1d4ed8" },
  2: { icon: Sun, tint: "#fff4d6", color: "#b45309" },
  3: { icon: Globe, tint: "#dff5e8", color: "#0f7b3f" },
  4: { icon: Factory, tint: "#ffe4dc", color: "#b42318" },
  5: { icon: Sprout, tint: "#eaf6d8", color: "#4d7c0f" },
};
