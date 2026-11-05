import type { CSSProperties } from "react";

const COLORS = ["#074ce0", "#f59e0b", "#e5533d", "#8b5cf6", "#0d9488", "#ffd23f"];

/** Konfeti perayaan; nilai diturunkan dari indeks (tanpa acak) agar render konsisten. */
export function Confetti({ count = 32 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${(i * 37 + 11) % 100}%`,
              background: COLORS[i % COLORS.length],
              "--t": `${1.6 + (i % 5) * 0.25}s`,
              "--delay": `${(i % 8) * 0.08}s`,
              "--r": `${(i % 2 ? 1 : -1) * (360 + (i % 4) * 90)}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
