import { describe, expect, it } from "vitest";
import {
  CODE_ALPHABET,
  generateAccessToken,
  generateParticipantCode,
  hashParticipantCode,
  hashToken,
  normalizeCode,
} from "./codes";

const PEPPER = "a".repeat(64);

describe("kode peserta", () => {
  it("panjang minimal 10 dan hanya memakai alfabet tidak membingungkan", () => {
    const code = generateParticipantCode();
    expect(code).toHaveLength(10);
    for (const ch of code) expect(CODE_ALPHABET).toContain(ch);
    expect(CODE_ALPHABET).not.toMatch(/[O0I1]/);
    expect(() => generateParticipantCode(8)).toThrow(RangeError);
  });

  it("kode acak tidak berulang pada sampel besar", () => {
    const set = new Set(Array.from({ length: 2000 }, () => generateParticipantCode()));
    expect(set.size).toBe(2000);
  });

  it("normalisasi dan HMAC konsisten, tergantung pepper", () => {
    expect(normalizeCode(" abcd-efgh 23 ")).toBe("ABCDEFGH23");
    const h1 = hashParticipantCode("abcd-efgh23", PEPPER);
    const h2 = hashParticipantCode("ABCDEFGH23", PEPPER);
    expect(h1).toBe(h2);
    expect(h1).not.toContain("ABCDEFGH23");
    expect(hashParticipantCode("ABCDEFGH23", "b".repeat(64))).not.toBe(h1);
    expect(() => hashParticipantCode("X", "pendek")).toThrow();
  });

  it("token akses unik dan di-hash", () => {
    const t = generateAccessToken();
    expect(t.length).toBeGreaterThanOrEqual(40);
    expect(generateAccessToken()).not.toBe(t);
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
  });
});
