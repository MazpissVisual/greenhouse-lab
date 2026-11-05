/** Kondisi suhu untuk tampilan (termometer dan adegan). Ambang sama di semua tempat. */
export type Climate = "frozen" | "cold" | "nice" | "warm" | "hot";

export function climateOf(celsius: number): Climate {
  if (celsius < 0) return "frozen";
  if (celsius < 10) return "cold";
  if (celsius < 20) return "nice";
  if (celsius < 30) return "warm";
  return "hot";
}

export const CLIMATE_LABEL: Record<Climate, string> = {
  frozen: "Beku",
  cold: "Dingin",
  nice: "Nyaman",
  warm: "Hangat",
  hot: "Panas sekali",
};

export const CLIMATE_COLOR: Record<Climate, string> = {
  frozen: "#2563eb",
  cold: "#0891b2",
  nice: "#0d9488",
  warm: "#d97706",
  hot: "#dc2626",
};
