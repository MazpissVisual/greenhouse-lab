/** Termometer besar untuk temperatur permukaan MODEL (bukan prakiraan Bumi). */
import { Flame, Smile, Snowflake, Sun, ThermometerSnowflake, type LucideIcon } from "lucide-react";
import { CLIMATE_COLOR, CLIMATE_LABEL, climateOf, type Climate } from "@/features/simulation/climate";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

const MIN_C = -30;
const MAX_C = 60;
const TUBE_REM = 11; // tinggi tabung (rem)
const BULB_REM = 3.5; // tinggi bulb (rem)

/** Warna per suasana: tegas, kontras dengan latar putih, tanpa transisi lewat hijau neon. */
const MOOD_ICON: Record<Climate, LucideIcon> = {
  frozen: Snowflake,
  cold: ThermometerSnowflake,
  nice: Smile,
  warm: Sun,
  hot: Flame,
};

function mood(c: number): { text: string; icon: LucideIcon; color: string } {
  const k = climateOf(c);
  return { text: CLIMATE_LABEL[k], icon: MOOD_ICON[k], color: CLIMATE_COLOR[k] };
}

const level = (c: number) => Math.min(1, Math.max(0, (c - MIN_C) / (MAX_C - MIN_C)));

export function Thermometer({
  celsius,
  baselineC,
  caption = "Suhu permukaan model",
}: {
  celsius: number;
  baselineC: number;
  caption?: string;
}) {
  const pct = level(celsius);
  const m = mood(celsius);
  const delta = celsius - baselineC;
  const deltaText =
    Math.abs(delta) < 0.05
      ? "sama dengan baseline"
      : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} °C dari baseline`;
  const totalRem = TUBE_REM + BULB_REM - 1; // tabung menumpuk 1rem di atas bulb

  return (
    <div className="card flex items-center gap-4 p-5">
      <div
        className="relative w-20 shrink-0"
        style={{ height: `${totalRem}rem` }}
        role="img"
        aria-label={`Termometer model: ${celsius.toFixed(1)} derajat Celsius`}
      >
        {/* tabung */}
        <div
          className="absolute left-[14px] top-0 w-7 overflow-hidden rounded-full border-2 border-border bg-white"
          style={{ height: `${TUBE_REM}rem` }}
        >
          <div
            className="thermo-fill absolute bottom-0 w-full"
            style={{ height: `${Math.max(4, pct * 100)}%`, background: m.color }}
          />
        </div>
        {/* bulb */}
        <div
          className="thermo-fill absolute bottom-0 left-0 w-14 rounded-full border-2 border-border"
          style={{ height: `${BULB_REM}rem`, background: m.color }}
        />
        {/* penanda baseline: sejajar dengan tinggi cairan pada suhu baseline */}
        <span
          aria-hidden
          className="absolute left-[8px] h-0.5 w-10 rounded bg-foreground"
          style={{ bottom: `calc(${totalRem - TUBE_REM}rem + ${level(baselineC) * TUBE_REM}rem)` }}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {caption}
        </p>
        <p className="font-display text-4xl font-extrabold tabular-nums">
          <AnimatedNumber value={celsius} />
          <span className="text-2xl font-bold"> °C</span>
        </p>
        <p className="mt-1 flex items-center gap-2 whitespace-nowrap text-lg font-semibold" style={{ color: m.color }}>
          <m.icon key={m.text} aria-hidden className="pop h-5 w-5 shrink-0" />
          {m.text}
        </p>
        <p className="text-sm text-muted">{deltaText}</p>
        <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-muted">
          <span aria-hidden className="inline-block h-0.5 w-4 rounded bg-foreground" />
          garis = baseline
        </p>
      </div>
    </div>
  );
}
