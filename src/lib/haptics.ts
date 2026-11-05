/** Getaran singkat di perangkat yang mendukung (umumnya ponsel Android). Diam-diam diabaikan bila tidak ada. */
export function haptic(pattern: number | number[] = 10): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch {
    // tidak didukung; abaikan
  }
}
