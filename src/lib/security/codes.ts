import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

/** Alfabet tanpa karakter membingungkan (tanpa O/0, I/1). 32 karakter. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const MIN_CODE_LENGTH = 10;

export function generateParticipantCode(length = MIN_CODE_LENGTH): string {
  if (length < MIN_CODE_LENGTH) {
    throw new RangeError(`Kode peserta minimal ${MIN_CODE_LENGTH} karakter`);
  }
  let out = "";
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

/** Normalisasi input siswa: huruf besar, buang spasi dan tanda hubung. */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[\s-]/g, "");
}

/** HMAC-SHA256 dengan secret server (pepper); tidak pernah menyimpan plaintext. */
export function hashParticipantCode(code: string, pepper: string): string {
  if (!pepper || pepper.length < 32) throw new Error("RESEARCH_CODE_PEPPER tidak valid");
  return createHmac("sha256", pepper).update(normalizeCode(code)).digest("hex");
}

export function generateAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
