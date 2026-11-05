import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Mengembalikan angka yang bergerak halus menuju `value` (easing keluar). Tanpa animasi bila reduced motion. */
export function useAnimatedValue(value: number, duration = 450): number {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (reduced) return;
    const from = fromRef.current;
    if (from === value) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * eased;
      fromRef.current = v; // bila terputus, animasi berikutnya lanjut dari posisi ini
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return reduced ? value : shown;
}
