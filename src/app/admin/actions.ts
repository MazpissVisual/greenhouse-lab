"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/staff";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getPepper, getServiceClient } from "@/lib/supabase/admin";
import { CODE_ALPHABET, generateParticipantCode, hashParticipantCode } from "@/lib/security/codes";
import { logAudit } from "@/lib/audit/log";
import { randomInt } from "node:crypto";

export interface FormState {
  error?: string;
}

// ------------------------------------------------------------------ auth
export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Email atau password tidak valid." };
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email atau password salah." };
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// -------------------------------------------------------------- sessions
const sessionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  session_code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{4,12}$/).or(z.literal("")),
  class_code: z.string().trim().max(40).optional(),
  academic_year: z.string().trim().max(20).optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});

function randomSessionCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}

export async function createSession(_: FormState, formData: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Data sesi tidak valid (judul min. 3 karakter, kode sesi 4–12 huruf/angka)." };
  }
  const d = parsed.data;
  const startsAt = d.starts_at ? new Date(d.starts_at).toISOString() : null;
  const endsAt = d.ends_at ? new Date(d.ends_at).toISOString() : null;
  if (startsAt && endsAt && endsAt <= startsAt) return { error: "Waktu akhir harus setelah waktu mulai." };

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("research_sessions")
    .insert({
      title: d.title,
      session_code: d.session_code || randomSessionCode(),
      class_code: d.class_code || null,
      academic_year: d.academic_year || null,
      starts_at: startsAt,
      ends_at: endsAt,
      created_by: staff.userId,
    })
    .select("id")
    .single();
  if (error || !data) {
    return { error: error?.code === "23505" ? "Kode sesi sudah dipakai." : "Gagal membuat sesi." };
  }
  await logAudit(staff.userId, "session.create", "research_session", data.id, { title: d.title });
  redirect(`/admin/sessions/${data.id}`);
}

const TRANSITIONS: Record<string, string[]> = {
  draft: ["scheduled", "active"],
  scheduled: ["active", "draft"],
  active: ["closed"],
  closed: ["active", "archived"],
  archived: [],
};

export async function setSessionStatus(sessionId: string, next: string) {
  const staff = await requireStaff();
  const supabase = await createSupabaseServer();
  const { data: cur } = await supabase
    .from("research_sessions")
    .select("status")
    .eq("id", sessionId)
    .single();
  if (!cur || !TRANSITIONS[cur.status]?.includes(next)) return;
  await supabase
    .from("research_sessions")
    .update({ status: next, updated_at: new Date().toISOString() })
    .eq("id", sessionId);
  await logAudit(staff.userId, "session.status", "research_session", sessionId, {
    from: cur.status,
    to: next,
  });
  revalidatePath(`/admin/sessions/${sessionId}`);
  revalidatePath("/admin/sessions");
}

// ---------------------------------------------------------- participants
export interface CodesState {
  error?: string;
  /** Kode plaintext hanya dikembalikan sekali saat penerbitan. */
  codes?: { label: string; code: string }[];
}

export async function generateParticipants(
  sessionId: string,
  _: CodesState,
  formData: FormData,
): Promise<CodesState> {
  const staff = await requireStaff();
  const parsed = z.coerce.number().int().min(1).max(200).safeParse(formData.get("count"));
  if (!parsed.success) return { error: "Jumlah harus 1–200." };

  const supabase = await createSupabaseServer();
  const { data: session } = await supabase
    .from("research_sessions")
    .select("id,status")
    .eq("id", sessionId)
    .single();
  if (!session) return { error: "Sesi tidak ditemukan." };
  if (session.status === "archived") return { error: "Sesi sudah diarsipkan." };

  const { count } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .eq("session_id", sessionId);
  const start = (count ?? 0) + 1;
  const pepper = getPepper();

  const issued: { label: string; code: string }[] = [];
  const rows = Array.from({ length: parsed.data }, (_, i) => {
    const code = generateParticipantCode();
    const label = `P-${String(start + i).padStart(3, "0")}`;
    issued.push({ label, code });
    return {
      session_id: sessionId,
      participant_code_hash: hashParticipantCode(code, pepper),
      participant_label: label,
    };
  });

  const { error } = await supabase.from("participants").insert(rows);
  if (error) return { error: "Gagal menyimpan peserta. Coba lagi." };
  await logAudit(staff.userId, "participants.generate", "research_session", sessionId, {
    count: rows.length,
  });
  revalidatePath(`/admin/sessions/${sessionId}`);
  return { codes: issued };
}

export async function setParticipantStatus(
  participantId: string,
  sessionId: string,
  status: "active" | "disabled",
) {
  const staff = await requireStaff();
  const supabase = await createSupabaseServer();
  await supabase.from("participants").update({ status }).eq("id", participantId);
  // Nonaktifkan: cabut semua sesi akses sementara peserta tersebut
  if (status === "disabled") {
    await getServiceClient()
      .from("research_access_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("participant_id", participantId)
      .is("revoked_at", null);
  }
  await logAudit(staff.userId, "participant.status", "participant", participantId, { status });
  revalidatePath(`/admin/sessions/${sessionId}`);
}
