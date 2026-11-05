"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PARAMS,
  PARAM_RANGES,
  compareScenarios,
  computeModel,
  type ModelParams,
} from "@/features/simulation/model";
import { ArrowLegend, EnergyDiagram } from "./EnergyDiagram";
import { Thermometer } from "./Thermometer";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { Toast, type ToastMessage } from "@/components/ui/Toast";
import { haptic } from "@/lib/haptics";
import {
  BookOpen, Check, Cloud, Compass, FlaskConical, Flame, Globe, MapPin, Pause, Pin, Play,
  Radio, Repeat, RotateCcw, Scale, Sparkles, Sun, Wind, type LucideIcon,
} from "lucide-react";

type Mode = "belajar" | "eksperimen";

const LABELS: Record<keyof ModelParams, { icon: LucideIcon; label: string; hint: string; step: number; unit: string }> = {
  epsilon: {
    icon: Wind,
    label: "Efektivitas penyerapan inframerah atmosfer (parameter model)",
    hint: "Makin besar, makin banyak inframerah yang diserap lalu dipancarkan kembali.",
    step: 0.01,
    unit: "",
  },
  albedo: {
    icon: Cloud,
    label: "Albedo (α)",
    hint: "Seberapa banyak sinar Matahari yang dipantulkan.",
    step: 0.01,
    unit: "",
  },
  solar: {
    icon: Sun,
    label: "Konstanta surya (S)",
    hint: "Kekuatan sinar Matahari yang tiba di Bumi.",
    step: 10,
    unit: "W/m²",
  },
};

const STAGES = [
  { icon: Sun, title: "Sinar masuk", text: "Matahari memancarkan radiasi gelombang pendek. Sebagian dipantulkan, sisanya diserap permukaan." },
  { icon: Flame, title: "Bumi memancar", text: "Permukaan yang hangat memancarkan inframerah (IR). Tanpa penyerapan atmosfer, IR ini lolos ke angkasa." },
  { icon: Repeat, title: "Atmosfer beraksi", text: "Atmosfer menyerap sebagian IR lalu memancarkannya kembali ke atas dan ke bawah. IR yang kembali ke permukaan membuatnya lebih hangat." },
];

function Control(props: {
  name: keyof ModelParams;
  value: number;
  onChange: (v: number) => void;
}) {
  const { name, value, onChange } = props;
  const r = PARAM_RANGES[name];
  const { icon: Icon, label, hint, step, unit } = LABELS[name];
  const clamp = (v: number) => Math.min(r.max, Math.max(r.min, v));
  const id = `p-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-start gap-2 text-sm font-semibold">
        <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        {label}
      </label>
      <p className="text-xs text-muted">{hint}</p>
      {/* Di ponsel: tombol + slider satu baris, kotak angka di baris sendiri; di layar lebar sebaris */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:flex-1">
          <button type="button" aria-label={`Kurangi ${name}`} onClick={() => onChange(clamp(+(value - step).toFixed(4)))} className="btn btn-secondary btn-icon shrink-0">−</button>
          <input
            id={id}
            type="range"
            min={r.min}
            max={r.max}
            step={step}
            value={value}
            onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
            className="min-w-0 flex-1 cursor-pointer accent-primary"
          />
          <button type="button" aria-label={`Tambah ${name}`} onClick={() => onChange(clamp(+(value + step).toFixed(4)))} className="btn btn-secondary btn-icon shrink-0">+</button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label={`Nilai ${name}`}
            min={r.min}
            max={r.max}
            step={step}
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v)) onChange(clamp(v));
            }}
            className="field w-28"
          />
          {unit && <span className="text-xs text-muted">{unit}</span>}
        </div>
      </div>
      <p className="text-xs text-muted">Rentang {r.min}–{r.max}, default {r.default}</p>
    </div>
  );
}

function Chip(props: { tint: string; icon: LucideIcon; label: string; v: number; u: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: props.tint }}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        <props.icon aria-hidden className="h-4 w-4" />
        {props.label}
      </div>
      <div className="mt-1 font-display text-xl font-bold tabular-nums">
        <AnimatedNumber value={props.v} /> <span className="text-sm font-semibold">{props.u}</span>
      </div>
    </div>
  );
}

export function Simulator() {
  const [mode, setMode] = useState<Mode>("belajar");
  const [params, setParams] = useState<ModelParams>(DEFAULT_PARAMS);
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showPaths, setShowPaths] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [scenarioA, setScenarioA] = useState<ModelParams | null>(null);
  const [scenarioB, setScenarioB] = useState<ModelParams | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = (text: string) => {
    setToast({ id: Date.now(), text });
    haptic(10);
  };

  // Mode Belajar: parameter dikunci; ε mengikuti tahap (tahap 1-2 tanpa atmosfer).
  const out = useMemo(() => {
    const effective: ModelParams =
      mode === "belajar"
        ? { ...DEFAULT_PARAMS, epsilon: stage === 3 ? DEFAULT_PARAMS.epsilon : 0 }
        : params;
    return computeModel(effective);
  }, [mode, stage, params]);
  const cmp = useMemo(
    () => (scenarioA && scenarioB ? compareScenarios(scenarioA, scenarioB) : null),
    [scenarioA, scenarioB],
  );
  const baseline = useMemo(() => computeModel(DEFAULT_PARAMS), []);

  const set = (k: keyof ModelParams) => (v: number) => setParams((p) => ({ ...p, [k]: v }));
  const reset = () => {
    notify("Simulasi dikembalikan ke awal");
    setParams(DEFAULT_PARAMS);
    setStage(1);
    setScenarioA(null);
    setScenarioB(null);
  };

  return (
    <div className="mx-auto grid grid-cols-1 max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[2fr_1fr]">
      {/* Diagram menempel di atas saat di ponsel agar efek slider langsung terlihat */}
      <section
        aria-label="Visualisasi"
        className="sticky top-0 z-30 -mx-4 bg-background/95 px-4 pb-2 pt-2 backdrop-blur max-lg:order-1 lg:static lg:col-start-1 lg:row-start-1 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
      >
        <EnergyDiagram
          out={out}
          playing={playing}
          speed={speed}
          showPaths={showPaths}
          showLabels={showLabels}
          stage={mode === "belajar" ? stage : 3}
        />
        <p className="mt-2 hidden text-xs text-muted lg:block">
          Animasi hanya menunjukkan arah aliran energi pada keadaan
          kesetimbangan; ini bukan simulasi perubahan iklim terhadap waktu.
        </p>
      </section>

      <section aria-label="Hasil" className="space-y-4 max-lg:order-3 lg:col-start-1 lg:row-start-2">
        <ArrowLegend out={out} stage={mode === "belajar" ? stage : 3} show={showPaths && showLabels} />
        <p className="text-xs text-muted lg:hidden">
          Animasi hanya menunjukkan arah aliran energi pada keadaan
          kesetimbangan; ini bukan simulasi perubahan iklim terhadap waktu.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.1fr_1fr]">
          <Thermometer celsius={out.TsCelsius} baselineC={baseline.TsCelsius} />
          <div className="grid grid-cols-2 content-start gap-3">
            <Chip tint="#fff4d6" icon={Sun} label="Energi masuk" v={out.incoming} u="W/m²" />
            <Chip tint="#fdf0c2" icon={Sparkles} label="Dipantulkan" v={out.reflected} u="W/m²" />
            <Chip tint="#ffe4dc" icon={Globe} label="Diserap" v={out.absorbed} u="W/m²" />
            <Chip tint="#e3efff" icon={Radio} label="Suhu efektif emisi" v={out.Te} u="K" />
          </div>
        </div>
        <p className="text-xs text-muted">
          Nilai adalah keluaran model idealisasi, bukan prakiraan temperatur
          global. Suhu permukaan model: {out.Ts.toFixed(2)} K.
        </p>
      </section>

      <aside aria-label="Kontrol" className="space-y-4 max-lg:order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <div role="group" aria-label="Mode simulasi" className="grid grid-cols-2 gap-2 rounded-2xl bg-ground-muted p-1.5">
          {(["belajar", "eksperimen"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`btn ${mode === m ? "btn-primary" : "bg-transparent text-foreground hover:bg-white"}`}
            >
              {m === "belajar" ? <BookOpen aria-hidden className="h-4 w-4" /> : <FlaskConical aria-hidden className="h-4 w-4" />}
              {m === "belajar" ? "Belajar" : "Eksperimen"}
            </button>
          ))}
        </div>

        {mode === "belajar" ? (
          <div className="card space-y-4 p-5">
            <ol className="flex items-center gap-2" aria-label="Tahap belajar">
              {STAGES.map((s, i) => (
                <li key={s.title} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStage((i + 1) as 1 | 2 | 3)}
                    aria-current={stage === i + 1 ? "step" : undefined}
                    aria-label={`Tahap ${i + 1}: ${s.title}`}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg transition-colors ${
                      stage === i + 1
                        ? "border-primary bg-primary/10"
                        : stage > i + 1
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white"
                    }`}
                  >
                    <StepIcon done={stage > i + 1} icon={s.icon} />
                  </button>
                  {i < STAGES.length - 1 && (
                    <span aria-hidden className={`h-0.5 flex-1 rounded ${stage > i + 1 ? "bg-primary" : "bg-border"}`} />
                  )}
                </li>
              ))}
            </ol>
            <div aria-live="polite">
              <p className="font-display text-lg font-bold">
                Tahap {stage}: {STAGES[stage - 1].title}
              </p>
              <p className="mt-1 text-sm text-muted">{STAGES[stage - 1].text}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={stage === 1} onClick={() => setStage((s) => (s - 1) as 1 | 2 | 3)} className="btn btn-secondary">
                ← Kembali
              </button>
              <button type="button" disabled={stage === 3} onClick={() => setStage((s) => (s + 1) as 1 | 2 | 3)} className="btn btn-primary">
                Lanjut →
              </button>
            </div>
            <p className="text-xs text-muted">Parameter dikunci pada nilai default di Mode Belajar.</p>
          </div>
        ) : (
          <div className="card space-y-5 p-5">
            <Control name="epsilon" value={params.epsilon} onChange={set("epsilon")} />
            <Control name="albedo" value={params.albedo} onChange={set("albedo")} />
            <Control name="solar" value={params.solar} onChange={set("solar")} />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => {
                  setScenarioA({ ...params });
                  notify("Skenario A tersimpan");
                }} className="btn btn-secondary whitespace-nowrap !px-2">
                <Pin aria-hidden className="h-4 w-4" /> Simpan A
              </button>
              <button type="button" onClick={() => {
                  setScenarioB({ ...params });
                  notify("Skenario B tersimpan");
                }} className="btn btn-secondary whitespace-nowrap !px-2">
                <MapPin aria-hidden className="h-4 w-4" /> Simpan B
              </button>
            </div>
          </div>
        )}

        <div className="card space-y-3 p-5 text-sm">
          <div className="flex gap-2">
            <button type="button" onClick={() => setPlaying((p) => !p)} className="btn btn-secondary flex-1">
              {playing ? <><Pause aria-hidden className="h-4 w-4" /> Jeda</> : <><Play aria-hidden className="h-4 w-4" /> Putar</>}
            </button>
            <button type="button" onClick={reset} className="btn btn-secondary flex-1">
              <RotateCcw aria-hidden className="h-4 w-4" /> Reset
            </button>
          </div>
          <div role="group" aria-label="Kecepatan animasi" className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Kecepatan</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={speed === s}
                onClick={() => setSpeed(s)}
                className={`btn flex-1 ${speed === s ? "btn-primary" : "btn-secondary"}`}
              >
                {s}×
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-primary" checked={showPaths} onChange={(e) => setShowPaths(e.target.checked)} />
            Tampilkan jalur radiasi
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-primary" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Tampilkan label energi
          </label>
        </div>
      </aside>

      {mode === "eksperimen" && (
        <section className="card p-5 max-lg:order-4 lg:col-span-2" aria-label="Perbandingan skenario">
          <h2 className="flex items-center gap-2 text-xl"><Scale aria-hidden className="h-5 w-5 text-primary" /> Perbandingan Skenario A dan B</h2>
          {cmp && scenarioA && scenarioB ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-1">Besaran</th><th>A</th><th>B</th><th>Selisih (B − A)</th>
                  </tr>
                </thead>
                <tbody>
                  <Row n="ε" a={scenarioA.epsilon} b={scenarioB.epsilon} d={scenarioB.epsilon - scenarioA.epsilon} />
                  <Row n="Albedo" a={scenarioA.albedo} b={scenarioB.albedo} d={scenarioB.albedo - scenarioA.albedo} />
                  <Row n="S (W/m²)" a={scenarioA.solar} b={scenarioB.solar} d={scenarioB.solar - scenarioA.solar} />
                  <Row n="Diserap (W/m²)" a={cmp.a.absorbed} b={cmp.b.absorbed} d={cmp.delta.absorbed} />
                  <Row n="Ts (K)" a={cmp.a.Ts} b={cmp.b.Ts} d={cmp.delta.Ts} />
                </tbody>
              </table>
              <p className="mt-3 rounded-xl bg-ground-muted p-3 text-sm">
                Temperatur permukaan model <strong>{cmp.direction}</strong> pada Skenario B.
                Kedua hasil berasal dari model yang sama.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Atur parameter, lalu simpan sebagai Skenario A dan B untuk
              membandingkan. Skenario tidak tertimpa kecuali kamu menyimpannya lagi.
            </p>
          )}
        </section>
      )}

      <section className="card p-5 text-sm max-lg:order-5 lg:col-span-2" aria-label="Batas model">
        <h2 className="flex items-center gap-2 text-xl"><Compass aria-hidden className="h-5 w-5 text-primary" /> Batas model</h2>
        <p className="mt-2">
          Simulasi ini menggunakan model atmosfer satu lapis dalam kondisi
          kesetimbangan radiatif. Parameter dan hasil temperatur merupakan
          penyederhanaan untuk pembelajaran, bukan prediksi iklim atau
          representasi lengkap sistem Bumi.
        </p>
        <p className="mt-2 text-muted">
          Parameter ε bukan konsentrasi CO₂ (ppm). Model tidak mencakup
          spektrum dan pita serapan tiap gas, awan dan aerosol, konveksi,
          sirkulasi atmosfer dan laut, umpan balik uap air, kapasitas panas
          dan dinamika waktu, variasi geografis dan musim, serta kimia
          atmosfer.
        </p>
      </section>
      <Toast message={toast} />
    </div>
  );
}

function Row(props: { n: string; a: number; b: number; d: number }) {
  const { n, a, b, d } = props;
  return (
    <tr className="border-t border-border">
      <td className="py-1.5 font-medium">{n}</td>
      <td>{a.toFixed(2)}</td>
      <td>{b.toFixed(2)}</td>
      <td className={d > 0 ? "text-error" : d < 0 ? "text-primary" : ""}>
        {(d > 0 ? "+" : "") + d.toFixed(2)}
      </td>
    </tr>
  );
}

function StepIcon({ done, icon: Icon }: { done: boolean; icon: LucideIcon }) {
  return done ? <Check aria-hidden className="h-5 w-5" /> : <Icon aria-hidden className="h-5 w-5" />;
}
