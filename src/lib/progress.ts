/**
 * Progres belajar PUBLIK: hanya di localStorage browser ini. Bukan data penelitian dan tidak dikirim ke server
 * (PRD 6.1 dan 7.7). Semua akses dibungkus try/catch karena penyimpanan bisa diblokir.
 */
const KEY = "gl-progress-v1";
const listeners = new Set<() => void>();

export type DoneMap = Record<string, boolean>;

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function getSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function getServerSnapshot(): string {
  return "";
}

export function parse(raw: string): DoneMap {
  try {
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === "object" ? (v as DoneMap) : {};
  } catch {
    return {};
  }
}

export function markDone(slug: string): void {
  try {
    const cur = parse(getSnapshot());
    if (cur[slug]) return;
    cur[slug] = true;
    window.localStorage.setItem(KEY, JSON.stringify(cur));
  } catch {
    // penyimpanan diblokir; progres tidak tersimpan, tidak masalah
  }
  listeners.forEach((l) => l());
}
