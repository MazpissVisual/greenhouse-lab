"use client";

import { useEffect } from "react";

/** Satu pendengar untuk seluruh situs: kartu berkelas `.spot` bercahaya mengikuti kursor. Hanya di perangkat dengan hover. */
export function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(".spot") as HTMLElement | null;
      if (!el || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
