"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { haptic } from "@/lib/haptics";
import type { ModelOutput } from "@/features/simulation/model";
import { CLIMATE_COLOR, CLIMATE_LABEL, climateOf, type Climate } from "@/features/simulation/climate";

interface Props {
  out: ModelOutput;
  playing: boolean;
  speed: number; // pengali kecepatan animasi
  showPaths: boolean;
  showLabels: boolean;
  /** tahap Mode Belajar: 1 = sinar Matahari, 2 = IR permukaan lolos, 3 = peran atmosfer */
  stage: 1 | 2 | 3;
}

/** Tebal panah mengikuti besar energi (dibatasi agar tetap terbaca). */
const thick = (flux: number) => Math.min(16, Math.max(4, flux / 28));
const fmt = (n: number) => n.toFixed(1);
const css = (v: Record<string, string>) => v as CSSProperties;
const fade = (ms = 600): CSSProperties => ({ transition: `stop-color ${ms}ms ease-out, fill ${ms}ms ease-out, opacity ${ms}ms ease-out` });

/* ---------------- palet adegan per kondisi suhu ---------------- */
const SKY: Record<Climate, [string, string]> = {
  frozen: ["#cfe0f5", "#eef5ff"],
  cold: ["#c4def5", "#e8f3fc"],
  nice: ["#bfe0ff", "#eaf5ff"],
  warm: ["#bfe0ff", "#fff1cf"],
  hot: ["#ffd2a6", "#fff0dc"],
};
const LAND: Record<Climate, [string, string]> = {
  frozen: ["#f6fbff", "#cfe3f5"],
  cold: ["#a9d6ad", "#74b184"],
  nice: ["#86e08a", "#3fb86b"],
  warm: ["#bfe97c", "#7fc94d"],
  hot: ["#ecc874", "#c98f3a"],
};
const TREE: Record<Climate, string> = {
  frozen: "#dcebf7",
  cold: "#5f9d70",
  nice: "#2f9e57",
  warm: "#3fae5e",
  hot: "#b38a3a",
};
const TINT: Record<Climate, { color: string; opacity: number }> = {
  frozen: { color: "#e8f3ff", opacity: 0.28 },
  cold: { color: "#e8f3ff", opacity: 0.1 },
  nice: { color: "#ffffff", opacity: 0 },
  warm: { color: "#ffd166", opacity: 0.12 },
  hot: { color: "#ff7a1a", opacity: 0.18 },
};

function Arrow(props: {
  id: string;
  x: number;
  y1: number;
  y2: number;
  flux: number;
  color: string;
  name: string;
  speed: number;
  showLabels: boolean;
}) {
  const { id, x, y1, y2, flux, color, name, speed, showLabels } = props;
  const shown = useAnimatedValue(flux);
  const sw = thick(flux);
  const dir = y2 > y1 ? 1 : -1;
  const endY = y2 - dir * sw;
  const len = Math.abs(endY - y1);
  const n = Math.min(9, Math.max(2, Math.round(flux / 45))); // makin besar energi, makin banyak foton
  const dur = len / (120 * speed);
  const midY = (y1 + y2) / 2;
  return (
    <g>
      <defs>
        <marker id={`h-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth={sw * 2.2} markerHeight={sw * 2.2} orient="auto">
          <path d="M1,1 L9,5 L1,9 z" fill={color} />
        </marker>
      </defs>
      <line x1={x} y1={y1} x2={x} y2={endY} stroke={color} strokeOpacity="0.35" strokeWidth={sw * 0.6} strokeLinecap="round" markerEnd={`url(#h-${id})`} />
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={x}
          cy={y1}
          r={Math.max(3.5, sw * 0.55)}
          fill={color}
          stroke="#fff"
          strokeWidth="1.5"
          className="photon"
          style={css({ "--d": `${endY - y1}px`, "--t": `${dur}s`, "--delay": `-${(i / n) * dur}s` })}
        />
      ))}
      {showLabels && (
        <g className="max-sm:hidden">
          <rect x={x - 56} y={midY - 21} width="112" height="42" rx="21" fill="#fff" stroke={color} strokeWidth="2" />
          <text x={x} y={midY - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#454c58">
            {name}
          </text>
          <text x={x} y={midY + 12} textAnchor="middle" fontSize="13" fontWeight="800" fill="#16191f">
            {fmt(shown)} W/m²
          </text>
        </g>
      )}
    </g>
  );
}

function Cloud({ x, y, s = 1, t, dir = 1 }: { x: number; y: number; s?: number; t: number; dir?: 1 | -1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="cloud" style={css({ "--t": `${t}s`, "--dx": `${18 * dir}px` })}>
        <g fill="#fff" opacity="0.95">
          <ellipse cx="0" cy="0" rx="26" ry="13" />
          <ellipse cx="-16" cy="-8" rx="15" ry="12" />
          <ellipse cx="8" cy="-12" rx="18" ry="14" />
        </g>
      </g>
    </g>
  );
}

/** Matahari berwajah; ekspresi dan ukuran mengikuti kondisi suhu. */
function Sun({ climate, giggle }: { climate: Climate; giggle: number }) {
  const scale = { frozen: 0.88, cold: 0.95, nice: 1, warm: 1.08, hot: 1.18 }[climate];
  const fill = { frozen: "#fff0b8", cold: "#ffe27a", nice: "#ffd23f", warm: "#ffd23f", hot: "#ffb347" }[climate];
  const stroke = climate === "hot" ? "#ff7a1a" : "#ffb703";
  const cold = climate === "frozen" || climate === "cold";
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g transform={`translate(75 75) scale(${scale}) translate(-75 -75)`} style={{ transition: "transform 500ms ease-out" }}>
      <g key={giggle} className={giggle ? "giggle" : ""}>
      <g className="sun-bob">
        <g className={climate === "frozen" ? "shiver" : ""}>
          <g className="sun-rays" style={{ transformOrigin: "75px 75px" }}>
            {rays.map((a) => (
              <line key={a} x1="75" y1="26" x2="75" y2="12" stroke={stroke} strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 75 75)`} />
            ))}
          </g>
          <circle cx="75" cy="75" r="36" fill={fill} stroke={stroke} strokeWidth="3" style={fade(400)} />

          {/* mata: kacamata hitam saat hangat */}
          {climate === "warm" ? (
            <g fill="#16191f">
              <rect x="53" y="62" width="19" height="13" rx="5" />
              <rect x="78" y="62" width="19" height="13" rx="5" />
              <rect x="70" y="65" width="10" height="3" />
              <rect x="56" y="64" width="6" height="2.5" rx="1" fill="#fff" opacity="0.55" />
            </g>
          ) : (
            <g className="pupils">
              <circle className="eye" cx="63" cy="68" r="4.5" fill="#16191f" />
              <circle className="eye" cx="87" cy="68" r="4.5" fill="#16191f" />
            </g>
          )}

          {/* mulut */}
          {cold ? (
            <path d="M58 90 l5 -5 l5 5 l5 -5 l5 5 l5 -5 l5 5" fill="none" stroke="#16191f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          ) : climate === "hot" ? (
            <ellipse cx="75" cy="89" rx="7" ry="9" fill="#7a1d10" />
          ) : (
            <path d="M60 83 Q75 98 90 83" fill="none" stroke="#16191f" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* pipi */}
          <circle cx="54" cy="80" r="5" fill={cold ? "#8ec5ff" : climate === "hot" ? "#ff6b4a" : "#ff9a8b"} opacity="0.75" />
          <circle cx="96" cy="80" r="5" fill={cold ? "#8ec5ff" : climate === "hot" ? "#ff6b4a" : "#ff9a8b"} opacity="0.75" />

          {/* keringat saat panas */}
          {climate === "hot" &&
            [108, 42].map((x, i) => (
              <path
                key={x}
                d={`M${x} 56 q 5 8 0 12 q -5 -4 0 -12 z`}
                fill="#7cc4ff"
                stroke="#3b9be8"
                strokeWidth="1"
                className="sweat"
                style={css({ "--delay": `-${i * 0.7}s` })}
              />
            ))}
        </g>
      </g>
      </g>
    </g>
  );
}

function Tree({ x, y, climate, delay = 0 }: { x: number; y: number; climate: Climate; delay?: number }) {
  const wilted = climate === "hot";
  const crown = TREE[climate];
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="tree-sway" style={css({ "--delay": `${delay}s` })}>
        <rect x="-4" y="-6" width="8" height="26" rx="3" fill="#8a5a2b" />
        <circle cx="0" cy={wilted ? -12 : -18} r={wilted ? 14 : 20} fill={crown} style={fade()} />
        <circle cx="-12" cy={wilted ? -4 : -8} r={wilted ? 8 : 12} fill={crown} opacity={climate === "frozen" ? 0.85 : 0.88} style={fade()} />
        {climate === "frozen" && <circle cx="6" cy="-26" r="7" fill="#fff" />}
      </g>
    </g>
  );
}

const FLAKES = [40, 120, 200, 285, 370, 450, 540, 620, 700, 760];
const HEAT = [180, 300, 420, 540, 660];
const FLOWERS = [
  { x: 188, y: 404, c: "#ff6b9a" },
  { x: 300, y: 416, c: "#ffd23f" },
  { x: 432, y: 400, c: "#b388ff" },
  { x: 528, y: 414, c: "#ff8a5b" },
  { x: 668, y: 410, c: "#ff6b9a" },
];

export function EnergyDiagram({ out, playing, speed, showPaths, showLabels, stage }: Props) {
  const common = { showLabels, speed };
  const svgRef = useRef<SVGSVGElement>(null);
  const [giggle, setGiggle] = useState(0);
  const reduced = usePrefersReducedMotion();

  // Pupil Matahari mengikuti kursor (nonaktif saat reduced motion).
  const setGaze = (x: number, y: number) => {
    svgRef.current?.style.setProperty("--ex", String(x));
    svgRef.current?.style.setProperty("--ey", String(y));
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (reduced || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width) * 800 - 75;
    const dy = ((e.clientY - r.top) / r.height) * 470 - 75;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 160) * 3;
    setGaze((dx / d) * k, (dy / d) * k);
  };
  const celsius = out.TsCelsius;
  const climate = climateOf(celsius);
  const eps = out.surfaceIR > 0 ? out.atmAbsorbed / out.surfaceIR : 0; // ε yang sedang dipakai
  const tint = TINT[climate];
  const snowCount = climate === "frozen" ? FLAKES.length : climate === "cold" ? 4 : 0;
  const heatCount = climate === "hot" ? HEAT.length : climate === "warm" ? 2 : 0;

  return (
    <svg
      ref={svgRef}
      onPointerMove={onMove}
      onPointerLeave={() => setGaze(0, 0)}
      viewBox="0 0 800 470"
      role="img"
      aria-label={`Diagram aliran energi dengan suhu permukaan model ${celsius.toFixed(1)} derajat Celsius (kondisi ${CLIMATE_LABEL[climate].toLowerCase()}): radiasi Matahari masuk, sebagian dipantulkan, permukaan memancarkan inframerah, atmosfer menyerap dan memancarkan kembali ke atas dan ke bawah.`}
      className={`h-auto w-full rounded-[20px] border border-border ${playing ? "" : "anim-paused"}`}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: SKY[climate][0], ...fade() }} />
          <stop offset="100%" style={{ stopColor: SKY[climate][1], ...fade() }} />
        </linearGradient>
        <linearGradient id="atm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ec5ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c9e4ff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: LAND[climate][0], ...fade() }} />
          <stop offset="100%" style={{ stopColor: LAND[climate][1], ...fade() }} />
        </linearGradient>
      </defs>

      <rect width="800" height="470" fill="url(#sky)" />
      <rect width="800" height="470" fill={tint.color} opacity={tint.opacity} style={fade()} />

      <g
        className="sun-clickable"
        onClick={() => {
          setGiggle((g) => g + 1);
          haptic(12);
        }}
      >
        <Sun climate={climate} giggle={giggle} />
      </g>

      {/* Burung hanya saat nyaman */}
      {climate === "nice" &&
        [
          { y: 70, t: 20, d: -3 },
          { y: 110, t: 26, d: -14 },
        ].map((b) => (
          <g key={b.y} className="bird" style={css({ "--t": `${b.t}s`, "--delay": `${b.d}s` })}>
            <path d={`M0 ${b.y} q 6 -7 12 0 q 6 -7 12 0`} fill="none" stroke="#16191f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

      {/* Atmosfer berawan; makin ungu saat ε naik */}
      <rect x="0" y="168" width="800" height="100" fill="url(#atm)" />
      <rect x="0" y="168" width="800" height="100" fill="#8b5cf6" opacity={eps * 0.28} style={{ transition: "opacity 300ms ease-out" }} />
      <line x1="0" y1="168" x2="800" y2="168" stroke="#5aa9ff" strokeDasharray="4 6" strokeLinecap="round" />
      <line x1="0" y1="268" x2="800" y2="268" stroke="#5aa9ff" strokeDasharray="4 6" strokeLinecap="round" />
      <Cloud x={160} y={196} t={7} />
      <Cloud x={300} y={240} s={0.8} t={9} dir={-1} />
      <Cloud x={530} y={200} s={1.1} t={8} />
      <Cloud x={660} y={244} s={0.9} t={10} dir={-1} />
      <g className="max-sm:hidden">
        <rect x="660" y="176" width="124" height="26" rx="13" fill="#fff" stroke="#5aa9ff" strokeWidth="2" />
        <text x="722" y="193" textAnchor="middle" fontSize="12" fontWeight="700" fill="#074ce0">
          Atmosfer
        </text>
      </g>

      {/* Bumi */}
      <path d="M0 372 Q 200 336 400 356 T 800 350 V470 H0 Z" fill="url(#land)" />

      {/* tambahan per kondisi */}
      {climate === "frozen" && (
        <g fill="#ffffff" opacity="0.95">
          <ellipse cx="210" cy="396" rx="70" ry="14" />
          <ellipse cx="430" cy="380" rx="56" ry="12" />
          <ellipse cx="690" cy="392" rx="64" ry="13" />
        </g>
      )}
      {climate === "hot" && (
        <g fill="none" stroke="#8a5a1c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
          <path d="M120 410 l14 -10 l-6 -12 l16 -8" />
          <path d="M330 424 l-12 -14 l10 -10" />
          <path d="M470 400 l16 -12 l-4 -14 l14 -8" />
          <path d="M700 432 l-10 -12 l8 -10" />
        </g>
      )}
      {climate === "nice" &&
        FLOWERS.map((f, i) => (
          <g key={f.x} transform={`translate(${f.x} ${f.y})`}>
            <g className="tree-sway" style={css({ "--delay": `-${i * 0.6}s` })}>
              <line x1="0" y1="0" x2="0" y2="16" stroke="#2f7d46" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="-2" r="6.5" fill={f.c} />
              <circle cx="0" cy="-2" r="2.5" fill="#fff6c8" />
            </g>
          </g>
        ))}

      <Tree x={90} y={372} climate={climate} />
      <Tree x={730} y={366} climate={climate} delay={-1.4} />
      <g transform="translate(610 340)">
        <rect x="-26" y="0" width="52" height="38" rx="4" fill="#fff" stroke="#dde0e6" strokeWidth="2" />
        <path d="M-32 2 L0 -26 L32 2 Z" fill={climate === "frozen" ? "#f4f9ff" : "#e5533d"} stroke={climate === "frozen" ? "#cfe0f0" : "none"} strokeWidth="1.5" style={fade()} />
        {climate === "frozen" && <path d="M-22 -4 L0 -23 L22 -4 Q 11 1 0 -4 Q -11 1 -22 -4 Z" fill="#fff" />}
        <rect x="-7" y="14" width="14" height="24" rx="3" fill="#074ce0" />
      </g>
      <g className="max-sm:hidden">
        <rect x="14" y="424" width="136" height="26" rx="13" fill="#fff" stroke="#3fb86b" strokeWidth="2" />
        <text x="82" y="441" textAnchor="middle" fontSize="12" fontWeight="700" fill="#14532d">
          Permukaan Bumi
        </text>
      </g>

      {/* Lencana kondisi */}
      <g className="max-sm:hidden">
        <rect x="640" y="10" width="148" height="28" rx="14" fill="#fff" stroke={CLIMATE_COLOR[climate]} strokeWidth="2" />
        <text x="714" y="29" textAnchor="middle" fontSize="12" fontWeight="800" fill={CLIMATE_COLOR[climate]}>
          Kondisi: {CLIMATE_LABEL[climate]}
        </text>
      </g>

      {/* Cuaca: salju dan gelombang panas */}
      {FLAKES.slice(0, snowCount).map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={0}
          r={3 + (i % 3)}
          fill="#fff"
          stroke="#bfd9ff"
          className="snow"
          style={css({ "--d": "420px", "--t": `${5 + (i % 4)}s`, "--delay": `-${i * 0.9}s` })}
        />
      ))}
      {HEAT.slice(0, heatCount).map((x, i) => (
        <path
          key={x}
          d={`M${x} 360 q 8 -10 0 -20 q -8 -10 0 -20`}
          fill="none"
          stroke={climate === "hot" ? "#ff7a45" : "#ffb347"}
          strokeWidth="3"
          strokeLinecap="round"
          className="heat"
          style={css({ "--delay": `-${i * 0.5}s` })}
        />
      ))}

      {showPaths && (
        <>
          <Arrow id="in" x={115} y1={118} y2={350} flux={out.absorbed} color="#f59e0b" name="Diserap" {...common} />
          <Arrow id="ref" x={235} y1={350} y2={20} flux={out.reflected} color="#d4a017" name="Dipantulkan" {...common} />
          {stage >= 2 && (
            <Arrow id="up" x={355} y1={350} y2={stage >= 3 ? 272 : 20} flux={out.surfaceIR} color="#e5533d" name="IR permukaan" {...common} />
          )}
          {stage >= 3 && (
            <>
              <Arrow id="esc" x={475} y1={350} y2={20} flux={out.escapedSurfaceIR} color="#ff7a45" name="IR lolos" {...common} />
              <Arrow id="aup" x={595} y1={168} y2={20} flux={out.atmEmitUp} color="#8b5cf6" name="IR atmosfer ↑" {...common} />
              <Arrow id="adn" x={705} y1={268} y2={350} flux={out.atmEmitDown} color="#8b5cf6" name="IR atmosfer ↓" {...common} />
            </>
          )}
        </>
      )}
    </svg>
  );
}

/** Legenda nilai energi untuk layar sempit, tempat label di dalam gambar terlalu kecil untuk dibaca. */
export function ArrowLegend({ out, stage, show }: { out: ModelOutput; stage: 1 | 2 | 3; show: boolean }) {
  if (!show) return null;
  const items = [
    { name: "Diserap", v: out.absorbed, c: "#f59e0b" },
    { name: "Dipantulkan", v: out.reflected, c: "#d4a017" },
    ...(stage >= 2 ? [{ name: "IR permukaan", v: out.surfaceIR, c: "#e5533d" }] : []),
    ...(stage >= 3
      ? [
          { name: "IR lolos", v: out.escapedSurfaceIR, c: "#ff7a45" },
          { name: "IR atmosfer ↑", v: out.atmEmitUp, c: "#8b5cf6" },
          { name: "IR atmosfer ↓", v: out.atmEmitDown, c: "#8b5cf6" },
        ]
      : []),
  ];
  return (
    <ul aria-label="Nilai aliran energi" className="grid grid-cols-2 gap-2 sm:hidden">
      {items.map((i) => (
        <li key={i.name} className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
          <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ background: i.c }} />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold text-muted">{i.name}</span>
            <span className="block text-sm font-bold tabular-nums"><AnimatedNumber value={i.v} /> W/m²</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
