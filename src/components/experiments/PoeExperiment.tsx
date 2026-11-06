"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleHelp,
  FileText,
  Key,
  Lightbulb,
  Microscope,
  PartyPopper,
  Pointer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Thermometer as ThermoIcon,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { DEFAULT_PARAMS, PARAM_RANGES, computeModel } from "@/features/simulation/model";
import { OZONE_TABLE, type ExperimentDef } from "@/features/experiments/data";
import { Thermometer } from "@/components/simulation/Thermometer";
import { OptionCard } from "@/components/ui/OptionCard";
import { Confetti } from "@/components/ui/Confetti";
import { haptic } from "@/lib/haptics";

type Stage = "predict" | "observe" | "explain" | "feedback";
const ORDER: Stage[] = ["predict", "observe", "explain", "feedback"];
const META: Record<Stage, { icon: LucideIcon; name: string; sub: string }> = {
  predict: { icon: CircleHelp, name: "Predict", sub: "Tebak dulu" },
  observe: { icon: Microscope, name: "Observe", sub: "Amati hasilnya" },
  explain: { icon: Lightbulb, name: "Explain", sub: "Ceritakan alasannya" },
  feedback: { icon: PartyPopper, name: "Hasil", sub: "Cek jawabanmu" },
};
const MIN_EXPLANATION = 15;

/** Judul bagian dengan ikon di kiri; ikon dan teks sejajar rapi. */
function Heading({ icon: Icon, children, id }: { icon: LucideIcon; children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className="flex items-start gap-3 font-display text-lg font-bold leading-snug">
      <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="pt-0.5">{children}</span>
    </p>
  );
}

export function PoeExperiment({
  exp,
  onComplete,
  onSubmit,
  onNext,
}: {
  exp: ExperimentDef;
  onComplete?: (id: ExperimentDef["id"], correct: boolean) => void;
  /** Kirim hasil ke sesi penelitian; true bila tersimpan, false bila mode latihan/gagal. */
  onSubmit?: (r: {
    experimentId: ExperimentDef["id"];
    prediction: string;
    epsilon: number;
    explanation: string;
  }) => Promise<boolean>;
  onNext?: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const [stage, setStage] = useState<Stage>("predict");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [epsilon, setEpsilon] = useState(DEFAULT_PARAMS.epsilon);
  const [changed, setChanged] = useState(false);
  const [explanation, setExplanation] = useState("");

  const base = useMemo(() => computeModel(DEFAULT_PARAMS), []);
  const noAtm = useMemo(() => computeModel({ ...DEFAULT_PARAMS, epsilon: 0 }), []);
  const adjusted = useMemo(() => computeModel({ ...DEFAULT_PARAMS, epsilon }), [epsilon]);

  const correct = prediction === exp.correctOptionId;
  const idx = ORDER.indexOf(stage);
  const explainLen = explanation.trim().length;

  const canNext =
    (stage === "predict" && prediction !== null) ||
    (stage === "observe" && (exp.observeType !== "adjust-epsilon" || changed)) ||
    (stage === "explain" && explainLen >= MIN_EXPLANATION);

  // Laporkan hasil ke hub (hanya di memori halaman) saat masuk ke tahap hasil.
  useEffect(() => {
    if (stage === "feedback") {
      onComplete?.(exp.id, correct);
      haptic(correct ? [15, 40, 15] : 25);
    }
  }, [stage, correct, exp.id, onComplete]);

  // Bila peserta masuk lewat kode, simpan hasil ke sesi penelitian (sekali per tahap hasil).
  useEffect(() => {
    if (stage !== "feedback" || !prediction || !onSubmit) return;
    let cancelled = false;
    onSubmit({ experimentId: exp.id, prediction, epsilon, explanation }).then((ok) => {
      if (!cancelled) setSaved(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [stage, prediction, epsilon, explanation, exp.id, onSubmit]);

  const restart = () => {
    setStage("predict");
    setPrediction(null);
    setEpsilon(DEFAULT_PARAMS.epsilon);
    setChanged(false);
    setExplanation("");
    setSaved(false);
  };

  const bump = (d: number) => {
    setEpsilon((e) => Math.min(PARAM_RANGES.epsilon.max, Math.max(PARAM_RANGES.epsilon.min, +(e + d).toFixed(2))));
    setChanged(true);
  };

  return (
    <article className="space-y-6">
      <header className="card p-5 sm:p-6">
        <h2 className="text-2xl">{exp.title}</h2>
        <p className="mt-2 flex items-start gap-2 text-sm font-semibold text-primary">
          <Target aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {exp.goal}
        </p>
        <p className="mt-2 text-[15px] text-muted">{exp.context}</p>
      </header>

      {/* Langkah POE */}
      <ol className="flex items-start" aria-label="Tahapan POE">
        {ORDER.map((s, i) => {
          const done = i < idx;
          const current = i === idx;
          const Icon = META[s].icon;
          return (
            <li key={s} className="flex flex-1 flex-col items-center text-center" aria-current={current ? "step" : undefined}>
              <div className="flex w-full items-center">
                <span aria-hidden className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done || current ? "bg-primary" : "bg-border"}`} />
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-primary bg-primary text-white"
                      : current
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-muted"
                  }`}
                >
                  {done ? <Check aria-hidden className="h-5 w-5" strokeWidth={3} /> : <Icon aria-hidden className="h-5 w-5" />}
                </span>
                <span aria-hidden className={`h-0.5 flex-1 ${i === ORDER.length - 1 ? "opacity-0" : done ? "bg-primary" : "bg-border"}`} />
              </div>
              <span className={`mt-1.5 text-xs font-bold ${current ? "text-primary" : "text-muted"}`}>{META[s].name}</span>
              <span className="hidden text-[11px] text-muted sm:block">{META[s].sub}</span>
            </li>
          );
        })}
      </ol>

      <section className="card relative p-5 sm:p-6">
        {stage === "predict" && (
          <div role="radiogroup" aria-labelledby={`pq-${exp.id}`} className="enter space-y-4">
            <Heading id={`pq-${exp.id}`} icon={CircleHelp}>
              {exp.predictQuestion}
            </Heading>
            <p className="text-sm text-muted">Tidak ada jawaban yang salah di sini. Tebakanmu dulu, buktinya menyusul.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {exp.options.map((o) => (
                <OptionCard
                  key={o.id}
                  name={`predict-${exp.id}`}
                  icon={o.icon}
                  checked={prediction === o.id}
                  onChange={() => {
                    setPrediction(o.id);
                    haptic(10);
                  }}
                >
                  {o.text}
                </OptionCard>
              ))}
            </div>
          </div>
        )}

        {stage === "observe" && (
          <div className="enter space-y-4">
            <Heading icon={Microscope}>{exp.observeInstruction}</Heading>

            {exp.observeType === "compare-baseline" && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Thermometer celsius={noAtm.TsCelsius} baselineC={base.TsCelsius} caption="Tanpa atmosfer (ε = 0)" />
                  <Thermometer celsius={base.TsCelsius} baselineC={base.TsCelsius} caption={`Baseline (ε = ${DEFAULT_PARAMS.epsilon})`} />
                </div>
                <p className="flex items-start gap-2 rounded-2xl bg-[#fff4d6] p-3 text-sm">
                  <Sun aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
                  <span>
                    Energi Matahari yang diserap sama di kedua kondisi: <strong>{base.absorbed.toFixed(1)} W/m²</strong>. Yang
                    berbeda hanya peran atmosfer.
                  </span>
                </p>
              </>
            )}

            {exp.observeType === "adjust-epsilon" && (
              <>
                <div className="rounded-2xl bg-ground-muted p-4">
                  <label htmlFor="eps" className="flex items-start gap-2 text-sm font-semibold">
                    <Wind aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Efektivitas penyerapan inframerah atmosfer, ε (parameter model)
                  </label>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" aria-label="Kurangi ε" className="btn btn-secondary btn-icon shrink-0" onClick={() => bump(-0.05)}>−</button>
                    <input
                      id="eps"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={epsilon}
                      onChange={(e) => {
                        setEpsilon(parseFloat(e.target.value));
                        setChanged(true);
                      }}
                      className="min-w-0 flex-1 cursor-pointer accent-primary"
                    />
                    <button type="button" aria-label="Tambah ε" className="btn btn-secondary btn-icon shrink-0" onClick={() => bump(0.05)}>+</button>
                    <span className="w-11 shrink-0 text-right font-display text-lg font-bold tabular-nums">{epsilon.toFixed(2)}</span>
                  </div>
                  {!changed && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary" role="status">
                      <Pointer aria-hidden className="h-4 w-4" />
                      Geser ε dulu untuk melihat apa yang terjadi.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Thermometer celsius={base.TsCelsius} baselineC={base.TsCelsius} caption={`Baseline (ε = ${DEFAULT_PARAMS.epsilon})`} />
                  <Thermometer celsius={adjusted.TsCelsius} baselineC={base.TsCelsius} caption={`Pengaturanmu (ε = ${epsilon.toFixed(2)})`} />
                </div>
              </>
            )}

            {exp.observeType === "concept-table" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(
                  [
                    { key: "ghe", icon: ThermoIcon, title: "Efek rumah kaca", tint: "#ffe4dc", color: "#b42318" },
                    { key: "ozone", icon: ShieldCheck, title: "Penipisan ozon", tint: "#e3efff", color: "#1d4ed8" },
                  ] as const
                ).map((c) => (
                  <div key={c.key} className="rounded-2xl p-4" style={{ background: c.tint }}>
                    <h3 className="flex items-center gap-2.5 text-lg">
                      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-xl bg-white" style={{ color: c.color }}>
                        <c.icon className="h-5 w-5" />
                      </span>
                      {c.title}
                    </h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      {OZONE_TABLE.map((r) => (
                        <div key={r.aspect}>
                          <dt className="text-xs font-semibold text-muted">{r.aspect}</dt>
                          <dd className="font-medium">{r[c.key]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {stage === "explain" && (
          <div className="enter space-y-3">
            <label htmlFor="expl" className="block">
              <Heading icon={Lightbulb}>{exp.explainQuestion}</Heading>
            </label>
            <textarea
              id="expl"
              rows={5}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              aria-describedby="expl-hint"
              placeholder="Tulis dengan kata-katamu sendiri…"
              className="field w-full"
            />
            <div id="expl-hint">
              <div className="h-2 overflow-hidden rounded-full bg-ground-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-200 motion-reduce:transition-none"
                  style={{ width: `${Math.min(100, (explainLen / MIN_EXPLANATION) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                {explainLen >= MIN_EXPLANATION ? (
                  <>
                    <Sparkles aria-hidden className="h-3.5 w-3.5 text-primary" />
                    <span className="font-semibold text-primary">Mantap, siap lihat hasilnya!</span>
                  </>
                ) : (
                  <span>Tulis sedikit lagi ({explainLen}/{MIN_EXPLANATION} karakter).</span>
                )}
                <span>Jawabanmu hanya tersimpan sementara di halaman ini.</span>
              </p>
            </div>
          </div>
        )}

        {stage === "feedback" && (
          <div className="enter relative space-y-4" aria-live="polite">
            {correct && <Confetti />}
            <div className="flex flex-col items-center text-center">
              <span
                aria-hidden
                className={`pop flex h-16 w-16 items-center justify-center rounded-full text-white ${correct ? "bg-success" : "bg-warning"}`}
              >
                {correct ? <PartyPopper className="h-8 w-8" /> : <CircleHelp className="h-8 w-8" />}
              </span>
              <p className={`mt-3 font-display text-2xl font-extrabold ${correct ? "text-success" : "text-warning"}`}>
                {correct ? "Tebakanmu tepat!" : "Hampir! Yuk lihat kenapa."}
              </p>
            </div>
            <p className="text-[15px]">{correct ? exp.feedbackCorrect : exp.feedbackIncorrect}</p>
            <p className="flex items-start gap-3 rounded-2xl bg-primary/10 p-4 text-[15px]">
              <Key aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span>
                <strong>Ide kunci:</strong> {exp.keyIdea}
              </span>
            </p>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <FileText aria-hidden className="h-3.5 w-3.5" /> Penjelasanmu
              </p>
              <p className="mt-1 whitespace-pre-wrap rounded-2xl border border-border bg-white p-3 text-sm">{explanation}</p>
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {stage !== "predict" && stage !== "feedback" && (
          <button type="button" onClick={() => setStage(ORDER[idx - 1])} className="btn btn-secondary btn-lg">
            ← Kembali
          </button>
        )}
        {stage !== "feedback" ? (
          <button type="button" disabled={!canNext} onClick={() => setStage(ORDER[idx + 1])} className="btn btn-primary btn-lg">
            {stage === "explain" ? "Lihat hasil" : "Lanjut →"}
          </button>
        ) : (
          <>
            <button type="button" onClick={restart} className="btn btn-secondary btn-lg">
              <RotateCcw aria-hidden className="h-4 w-4" /> Ulangi
            </button>
            {onNext && (
              <button type="button" onClick={onNext} className="btn btn-primary btn-lg">
                Eksperimen berikutnya →
              </button>
            )}
          </>
        )}
      </div>
      <p className="text-xs text-muted">
        {saved
          ? "Jawabanmu sudah tersimpan ke sesi penelitian."
          : "Mode latihan: tidak ada data yang dikirim atau disimpan di server."}
      </p>
    </article>
  );
}
