import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase/admin";
import { hashToken } from "@/lib/security/codes";
import { RESEARCH_COOKIE } from "@/lib/security/constants";
import { EXPERIMENTS } from "@/features/experiments/data";

const SIMULATION_VERSION = "v1";

const bodySchema = z.object({
  experimentId: z.enum(["exp1", "exp2", "exp3"]),
  prediction: z.string().trim().min(1).max(40),
  epsilon: z.number().min(0).max(1).optional(),
  explanation: z.string().trim().min(1).max(2000),
});

const fail = (status: number, code: string) =>
  NextResponse.json({ error: { code } }, { status });

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
  if (!sameOrigin(req)) return fail(403, "FORBIDDEN");

  const token = (await cookies()).get(RESEARCH_COOKIE)?.value;
  if (!token) return fail(401, "NO_ACCESS");

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(400, "VALIDATION_ERROR");
  const { experimentId, prediction, epsilon, explanation } = parsed.data;

  const def = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!def || !def.options.some((o) => o.id === prediction)) return fail(400, "VALIDATION_ERROR");

  const db = getServiceClient();

  const { data: access } = await db
    .from("research_access_sessions")
    .select("id,participant_id,session_id,expires_at,revoked_at")
    .eq("access_token_hash", hashToken(token))
    .maybeSingle();
  if (!access || access.revoked_at || Date.parse(access.expires_at) < Date.now()) {
    return fail(401, "NO_ACCESS");
  }

  // Pastikan peserta masih aktif dan sesi masih berjalan.
  const [{ data: participant }, { data: session }] = await Promise.all([
    db.from("participants").select("status").eq("id", access.participant_id).maybeSingle(),
    db.from("research_sessions").select("status,ends_at").eq("id", access.session_id).maybeSingle(),
  ]);
  if (!participant || participant.status !== "active") return fail(401, "NO_ACCESS");
  if (!session || session.status !== "active") return fail(403, "SESSION_CLOSED");
  if (session.ends_at && Date.parse(session.ends_at) < Date.now()) return fail(403, "SESSION_CLOSED");

  const { data: allowed } = await db.rpc("check_rate_limit", {
    p_key: `rec:${access.participant_id}`,
    p_limit: 60,
    p_window_seconds: 3600,
  });
  if (allowed === false) return fail(429, "RATE_LIMITED");

  // Baris eksperimen & versi simulasi dibuat sekali bila belum ada (tanpa migrasi manual).
  await db.from("simulation_configs").upsert(
    {
      version: SIMULATION_VERSION,
      model_name: "Model keseimbangan energi satu lapis",
      parameters: {},
      formula_version: SIMULATION_VERSION,
      status: "published",
    },
    { onConflict: "version", ignoreDuplicates: true },
  );
  const { data: sim } = await db
    .from("simulation_configs")
    .select("id")
    .eq("version", SIMULATION_VERSION)
    .maybeSingle();
  await db.from("experiments").upsert(
    {
      experiment_code: def.id,
      title: def.title,
      version: def.version,
      simulation_config_id: sim?.id ?? null,
      status: "published",
    },
    { onConflict: "experiment_code,version", ignoreDuplicates: true },
  );
  const { data: exp } = await db
    .from("experiments")
    .select("id")
    .eq("experiment_code", def.id)
    .eq("version", def.version)
    .maybeSingle();
  if (!exp) return fail(500, "SAVE_FAILED");

  const correct = prediction === def.correctOptionId; // dihitung server, bukan dipercaya dari klien
  const now = new Date().toISOString();
  const { error } = await db.from("experiment_records").upsert(
    {
      participant_id: access.participant_id,
      session_id: access.session_id,
      experiment_id: exp.id,
      experiment_version: def.version,
      simulation_version: SIMULATION_VERSION,
      prediction: { optionId: prediction, correct },
      parameter_settings: epsilon === undefined ? {} : { epsilon },
      observation: { type: def.observeType },
      explanation,
      status: "submitted",
      submitted_at: now,
    },
    { onConflict: "participant_id,session_id,experiment_id,experiment_version" },
  );
  if (error) return fail(500, "SAVE_FAILED");

  await db.from("research_access_sessions").update({ last_seen_at: now }).eq("id", access.id);
  return NextResponse.json({ ok: true, correct });
}
