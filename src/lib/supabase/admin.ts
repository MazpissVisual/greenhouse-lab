import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Klien service role. HANYA untuk kode server; melewati RLS. Jangan diimpor ke client component. */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Konfigurasi Supabase server belum lengkap");
  cached = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}

export function getPepper(): string {
  const p = process.env.RESEARCH_CODE_PEPPER;
  if (!p) throw new Error("RESEARCH_CODE_PEPPER belum diatur");
  return p;
}
