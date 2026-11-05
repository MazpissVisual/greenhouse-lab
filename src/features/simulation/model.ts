/**
 * Model atmosfer satu lapis (one-layer gray atmosphere), kesetimbangan radiatif.
 * PRD Greenhouse Lab v2.1, bagian 7.3.3. Ini model pedagogis, bukan prediksi iklim.
 */

export const MODEL_VERSION = "1layer-1.0.0";
export const SIGMA = 5.670374419e-8; // W m^-2 K^-4

export const PARAM_RANGES = {
  epsilon: { min: 0, max: 1, default: 0.78 },
  albedo: { min: 0.1, max: 0.6, default: 0.3 },
  solar: { min: 1200, max: 1500, default: 1361 },
} as const;

export interface ModelParams {
  epsilon: number; // efektivitas penyerapan IR atmosfer (parameter model, bukan ppm)
  albedo: number;
  solar: number; // W/m^2
}

export interface ModelOutput {
  incoming: number; // S/4
  reflected: number; // S*alpha/4
  absorbed: number; // F_abs
  Te: number; // K
  Ts: number; // K
  Ta: number; // K
  TsCelsius: number;
  surfaceIR: number; // sigma*Ts^4 (naik dari permukaan)
  atmAbsorbed: number; // eps * surfaceIR
  atmEmitUp: number; // eps/2 * surfaceIR
  atmEmitDown: number; // eps/2 * surfaceIR
  escapedSurfaceIR: number; // (1-eps) * surfaceIR
  toaOutgoing: number; // escaped + atmEmitUp
}

export const DEFAULT_PARAMS: ModelParams = {
  epsilon: PARAM_RANGES.epsilon.default,
  albedo: PARAM_RANGES.albedo.default,
  solar: PARAM_RANGES.solar.default,
};

export function validateParams(p: ModelParams): void {
  for (const key of ["epsilon", "albedo", "solar"] as const) {
    const v = p[key];
    const r = PARAM_RANGES[key];
    if (!Number.isFinite(v) || v < r.min || v > r.max) {
      throw new RangeError(`Parameter ${key} di luar rentang ${r.min}-${r.max}: ${v}`);
    }
  }
}

export function computeModel(p: ModelParams): ModelOutput {
  validateParams(p);
  const incoming = p.solar / 4;
  const reflected = (p.solar * p.albedo) / 4;
  const absorbed = (p.solar * (1 - p.albedo)) / 4;
  const Te = Math.pow(absorbed / SIGMA, 0.25);
  const Ts = Math.pow(absorbed / (SIGMA * (1 - p.epsilon / 2)), 0.25);
  const Ta = Math.pow(Math.pow(Ts, 4) / 2, 0.25);
  const surfaceIR = SIGMA * Math.pow(Ts, 4);
  const atmAbsorbed = p.epsilon * surfaceIR;
  const atmEmitUp = atmAbsorbed / 2;
  const atmEmitDown = atmAbsorbed / 2;
  const escapedSurfaceIR = (1 - p.epsilon) * surfaceIR;
  return {
    incoming,
    reflected,
    absorbed,
    Te,
    Ts,
    Ta,
    TsCelsius: Ts - 273.15,
    surfaceIR,
    atmAbsorbed,
    atmEmitUp,
    atmEmitDown,
    escapedSurfaceIR,
    toaOutgoing: escapedSurfaceIR + atmEmitUp,
  };
}

export interface ScenarioComparison {
  a: ModelOutput;
  b: ModelOutput;
  delta: { Ts: number; absorbed: number; Te: number };
  direction: "naik" | "turun" | "tetap";
}

export function compareScenarios(a: ModelParams, b: ModelParams): ScenarioComparison {
  const oa = computeModel(a);
  const ob = computeModel(b);
  const dTs = ob.Ts - oa.Ts;
  return {
    a: oa,
    b: ob,
    delta: { Ts: dTs, absorbed: ob.absorbed - oa.absorbed, Te: ob.Te - oa.Te },
    direction: Math.abs(dTs) < 1e-9 ? "tetap" : dTs > 0 ? "naik" : "turun",
  };
}
