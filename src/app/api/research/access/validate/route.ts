import { NextResponse } from "next/server";
import { z } from "zod";
import { getPepper, getServiceClient } from "@/lib/supabase/admin";
import {
  generateAccessToken,
  hashParticipantCode,
  hashToken,
  normalizeCode,
} from "@/lib/security/codes";

import { ACCESS_TTL_SECONDS, RESEARCH_COOKIE } from "@/lib/security/constants";

const bodySchema = z.object({
  sessionCode: z.string().trim().min(3).max(40),
  participantCode: z.string().trim().min(10).max(40),
});

const fail = (status: number, code: string) =>
  NextResponse.json({ error: { code } }, { status });

/** Respons generik agar tidak membocorkan apakah kode tertentu terdaftar. */
const invalid = () => fail(401, "INVALID_PARTICIPANT_CODE");

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail(403, "FORBIDDEN"); // proteksi CSRF

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, "VALIDATION_ERROR");
  const sessionCode = parsed.data.sessionCode.toUpperCase();
  const participantCode = normalizeCode(parsed.data.participantCode);

  const db = getServiceClient();
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();

  // Batas percobaan: 5 / 10 menit per IP+sesi, 20 / jam per kode sesi (PRD 6.4)
  const [perIp, perSession] = await Promise.all([
    db.rpc("check_rate_limit", { p_key: `ip:${ip}:${sessionCode}`, p_limit: 5, p_window_seconds: 600 }),
    db.rpc("check_rate_limit", { p_key: `sess:${sessionCode}`, p_limit: 20, p_window_seconds: 3600 }),
  ]);
  if (perIp.error || perSession.error) return fail(500, "SAVE_FAILED");
  if (!perIp.data || !perSession.data) return fail(429, "RATE_LIMITED");

  const { data: session } = await db
    .from("research_sessions")
    .select("id,status,starts_at,ends_at")
    .eq("session_code", sessionCode)
    .maybeSingle();
  if (!session || session.status !== "active") return invalid();
  const now = Date.now();
  if (session.starts_at && Date.parse(session.starts_at) > now) return invalid();
  if (session.ends_at && Date.parse(session.ends_at) < now) return invalid();

  const hash = hashParticipantCode(participantCode, getPepper());
  const { data: participant } = await db
    .from("participants")
    .select("id,status")
    .eq("session_id", session.id)
    .eq("participant_code_hash", hash)
    .maybeSingle();
  if (!participant || participant.status !== "active") return invalid();

  const token = generateAccessToken();
  const expiresAt = new Date(now + ACCESS_TTL_SECONDS * 1000).toISOString();
  const { error } = await db.from("research_access_sessions").insert({
    participant_id: participant.id,
    session_id: session.id,
    access_token_hash: hashToken(token),
    expires_at: expiresAt,
    last_seen_at: new Date(now).toISOString(),
  });
  if (error) return fail(500, "SAVE_FAILED");

  const res = NextResponse.json({ ok: true, expiresAt });
  res.cookies.set(RESEARCH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TTL_SECONDS,
  });
  return res;
}
