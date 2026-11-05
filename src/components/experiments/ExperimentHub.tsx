"use client";

import { useCallback, useState } from "react";
import { Check, Flame, Globe, ShieldCheck, Star, Trophy, type LucideIcon } from "lucide-react";
import { EXPERIMENTS } from "@/features/experiments/data";
import { PoeExperiment } from "./PoeExperiment";
import { IconTile } from "@/components/ui/IconTile";

const STYLE: { icon: LucideIcon; tint: string; color: string }[] = [
  { icon: Globe, tint: "#dff5e8", color: "#0f7b3f" },
  { icon: Flame, tint: "#ffe4dc", color: "#b42318" },
  { icon: ShieldCheck, tint: "#e3efff", color: "#1d4ed8" },
];

export function ExperimentHub() {
  const [active, setActive] = useState(0);
  // hasil hanya di memori halaman: id -> apakah prediksi tepat
  const [results, setResults] = useState<Record<string, boolean>>({});
  const onComplete = useCallback(
    (id: string, correct: boolean) => setResults((r) => (r[id] === correct ? r : { ...r, [id]: correct })),
    [],
  );
  const done = Object.keys(results).length;
  const stars = Object.values(results).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <Trophy aria-hidden className="h-5 w-5 text-primary" />
          {done}/{EXPERIMENTS.length} eksperimen selesai
        </p>
        <p className="flex gap-1" aria-label={`${stars} bintang dari ${EXPERIMENTS.length}`}>
          {EXPERIMENTS.map((e) => (
            <Star
              key={`${e.id}-${!!results[e.id]}`}
              aria-hidden
              className={`h-6 w-6 transition-colors ${results[e.id] ? "pop fill-[#f5b301] text-[#f5b301]" : "text-border"}`}
            />
          ))}
        </p>
      </div>

      <div role="tablist" aria-label="Pilih eksperimen" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {EXPERIMENTS.map((e, i) => {
          const sel = i === active;
          const r = results[e.id];
          const s = STYLE[i];
          return (
            <button
              key={e.id}
              role="tab"
              aria-selected={sel}
              onClick={() => setActive(i)}
              className={`spot wiggle-hover flex items-center gap-3 rounded-2xl border-2 p-3 text-left sm:flex-col sm:items-start sm:p-4 transition-all duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                sel ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white shadow-sm"
              }`}
            >
              <IconTile icon={s.icon} tint={s.tint} color={s.color} size="sm" className="wiggle-target" />
              <span>
                <span className="block text-xs font-semibold text-muted">Eksperimen {i + 1}</span>
                <span className="block font-display text-[15px] font-bold leading-tight">{e.title}</span>
                {r !== undefined && (
                  <span className={`mt-1.5 flex items-center gap-1 text-xs font-bold ${r ? "text-success" : "text-warning"}`}>
                    {r ? <Star aria-hidden className="h-3.5 w-3.5 fill-current" /> : <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
                    {r ? "Tepat" : "Selesai"}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* key memaksa state eksperimen direset saat berpindah */}
      <PoeExperiment
        key={EXPERIMENTS[active].id}
        exp={EXPERIMENTS[active]}
        onComplete={onComplete}
        onNext={active < EXPERIMENTS.length - 1 ? () => setActive(active + 1) : undefined}
      />
    </div>
  );
}
