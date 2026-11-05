import { describe, expect, it } from "vitest";
import {
  DEFAULT_PARAMS,
  compareScenarios,
  computeModel,
  type ModelParams,
} from "./model";

const TOL = 1e-6;
const combos: ModelParams[] = [
  { epsilon: 0, albedo: 0.3, solar: 1361 },
  { epsilon: 0.5, albedo: 0.1, solar: 1200 },
  { epsilon: 0.78, albedo: 0.3, solar: 1361 },
  { epsilon: 1, albedo: 0.6, solar: 1500 },
];

describe("model atmosfer satu lapis", () => {
  it("1. epsilon=0 -> Ts = Te", () => {
    const o = computeModel({ ...DEFAULT_PARAMS, epsilon: 0 });
    expect(o.Ts).toBeCloseTo(o.Te, 9);
  });

  it("2. epsilon naik -> Ts tidak turun", () => {
    let prev = -Infinity;
    for (let e = 0; e <= 1.0001; e += 0.1) {
      const ts = computeModel({ ...DEFAULT_PARAMS, epsilon: Math.min(e, 1) }).Ts;
      expect(ts).toBeGreaterThanOrEqual(prev);
      prev = ts;
    }
  });

  it("3. albedo naik -> energi terserap dan Ts tidak naik", () => {
    let prevAbs = Infinity;
    let prevTs = Infinity;
    for (let a = 0.1; a <= 0.6001; a += 0.05) {
      const o = computeModel({ ...DEFAULT_PARAMS, albedo: Math.min(a, 0.6) });
      expect(o.absorbed).toBeLessThanOrEqual(prevAbs);
      expect(o.Ts).toBeLessThanOrEqual(prevTs);
      prevAbs = o.absorbed;
      prevTs = o.Ts;
    }
  });

  it("4. S naik -> energi terserap dan Ts tidak turun", () => {
    let prevAbs = -Infinity;
    let prevTs = -Infinity;
    for (let s = 1200; s <= 1500; s += 50) {
      const o = computeModel({ ...DEFAULT_PARAMS, solar: s });
      expect(o.absorbed).toBeGreaterThanOrEqual(prevAbs);
      expect(o.Ts).toBeGreaterThanOrEqual(prevTs);
      prevAbs = o.absorbed;
      prevTs = o.Ts;
    }
  });

  it("5. parameter di luar rentang ditolak", () => {
    expect(() => computeModel({ ...DEFAULT_PARAMS, epsilon: -0.1 })).toThrow(RangeError);
    expect(() => computeModel({ ...DEFAULT_PARAMS, epsilon: 1.1 })).toThrow(RangeError);
    expect(() => computeModel({ ...DEFAULT_PARAMS, albedo: 0.05 })).toThrow(RangeError);
    expect(() => computeModel({ ...DEFAULT_PARAMS, albedo: 0.7 })).toThrow(RangeError);
    expect(() => computeModel({ ...DEFAULT_PARAMS, solar: 1000 })).toThrow(RangeError);
    expect(() => computeModel({ ...DEFAULT_PARAMS, solar: NaN })).toThrow(RangeError);
  });

  it("6. neraca energi konsisten (TOA, permukaan, atmosfer)", () => {
    for (const p of combos) {
      const o = computeModel(p);
      // TOA: keluar = terserap
      expect(Math.abs(o.toaOutgoing - o.absorbed)).toBeLessThan(TOL);
      // Permukaan: masuk (surya + IR turun) = keluar (IR naik)
      expect(Math.abs(o.absorbed + o.atmEmitDown - o.surfaceIR)).toBeLessThan(TOL);
      // Atmosfer: diserap = dipancarkan atas + bawah
      expect(Math.abs(o.atmAbsorbed - (o.atmEmitUp + o.atmEmitDown))).toBeLessThan(TOL);
      // Masuk = dipantulkan + terserap
      expect(Math.abs(o.incoming - (o.reflected + o.absorbed))).toBeLessThan(TOL);
    }
  });

  it("7. default menghasilkan nilai baseline yang stabil", () => {
    const a = computeModel(DEFAULT_PARAMS);
    const b = computeModel({ ...DEFAULT_PARAMS });
    expect(a).toEqual(b);
    expect(a.Te).toBeGreaterThan(250);
    expect(a.Te).toBeLessThan(260);
  });

  it("8. perbandingan A/B konsisten dengan fungsi model yang sama", () => {
    const b: ModelParams = { ...DEFAULT_PARAMS, epsilon: 0.9 };
    const c = compareScenarios(DEFAULT_PARAMS, b);
    expect(c.a).toEqual(computeModel(DEFAULT_PARAMS));
    expect(c.b).toEqual(computeModel(b));
    expect(c.delta.Ts).toBeCloseTo(c.b.Ts - c.a.Ts, 12);
    expect(c.direction).toBe("naik");
    expect(compareScenarios(DEFAULT_PARAMS, DEFAULT_PARAMS).direction).toBe("tetap");
  });
});
