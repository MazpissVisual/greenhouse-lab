"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Cloud, FlaskConical, Globe, Mountain, Sun, type LucideIcon } from "lucide-react";

interface Tile {
  label: string;
  icon: LucideIcon;
  tint: string;
  color: string;
  x: number; // posisi pusat dalam % kontainer
  y: number;
  delay: number;
}

const TILES: Tile[] = [
  { label: "Energi Matahari", icon: Sun, tint: "#fff4d6", color: "#b45309", x: 28, y: 14, delay: 0 },
  { label: "Atmosfer", icon: Cloud, tint: "#e3efff", color: "#1d4ed8", x: 72, y: 22, delay: -1.2 },
  { label: "Permukaan Bumi", icon: Mountain, tint: "#dff5e8", color: "#0f7b3f", x: 28, y: 84, delay: -2.4 },
  { label: "Eksperimen POE", icon: FlaskConical, tint: "#efe7ff", color: "#6d28d9", x: 72, y: 88, delay: -3.4 },
];

/** Diagram: konsep inti bertemu pada satu media. Ringan, dan geraknya mati saat reduced motion. */
export function HeroDiagram() {
  const box = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const DEPTH = [12, -9, 10, -13];

  // Kartu bergeser sedikit mengikuti kursor (parallax). Nonaktif saat reduced motion.
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || !box.current) return;
    const r = box.current.getBoundingClientRect();
    box.current.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    box.current.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const leave = () => {
    box.current?.style.setProperty("--px", "0");
    box.current?.style.setProperty("--py", "0");
  };

  return (
    <div
      ref={box}
      onPointerMove={move}
      onPointerLeave={leave}
      role="img"
      aria-label="Diagram: energi Matahari, atmosfer, permukaan Bumi, dan eksperimen POE bertemu pada Greenhouse Lab."
      className="relative mx-auto aspect-square w-full max-w-[460px]"
    >
      {/* orbit dan garis penghubung */}
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full">
        <g className="orbit-spin">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#dde0e6" strokeDasharray="1.5 2.5" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="31" fill="none" stroke="#dde0e6" />
        {TILES.map((t) => (
          <line
            key={t.label}
            x1={t.x}
            y1={t.y}
            x2="50"
            y2="50"
            stroke="#074ce0"
            strokeOpacity="0.4"
            strokeWidth="0.7"
            strokeLinecap="round"
            className="flow-sm"
          />
        ))}
      </svg>

      {/* inti produk */}
      <div className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2">
        <span aria-hidden className="absolute inset-0 rounded-full bg-primary/25 motion-safe:animate-ping" />
        <div
          className="relative flex h-full w-full flex-col items-center justify-center rounded-full text-center text-white shadow-[0_10px_30px_rgb(7_76_224/0.35)]"
          style={{ background: "radial-gradient(circle at 35% 30%, #5b8dff, #074ce0 70%)" }}
        >
          <Globe aria-hidden className="h-[34%] w-[34%]" strokeWidth={2} />
          <span className="mt-1 font-display text-[clamp(11px,2.6vw,15px)] font-bold leading-tight">
            Greenhouse
            <br />
            Lab
          </span>
        </div>
      </div>

      {/* kartu konsep yang melayang */}
      {TILES.map((t, i) => (
        <div
          key={t.label}
          className="absolute"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            transform: `translate(calc(-50% + var(--px, 0) * ${DEPTH[i]}px), calc(-50% + var(--py, 0) * ${DEPTH[i]}px))`,
            transition: "transform 240ms ease-out",
          }}
        >
          <div
            className="float flex items-center gap-1.5 rounded-2xl border border-border bg-white px-2 py-1.5 shadow-[0_6px_18px_rgb(22_25_31/0.1)] sm:gap-2 sm:px-3 sm:py-2"
            style={{ "--t": "4.4s", "--delay": `${t.delay}s` } as CSSProperties}
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8"
              style={{ background: t.tint, color: t.color }}
            >
              <t.icon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <span className="whitespace-nowrap text-[11px] font-semibold sm:text-[13px]">{t.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
