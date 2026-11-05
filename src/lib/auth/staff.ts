import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export interface StaffContext {
  userId: string;
  displayName: string;
  role: "admin" | "researcher";
}

/** Memastikan pengguna login dan terdaftar aktif di admin_profiles. Dicek di server. */
export async function requireStaff(): Promise<StaffContext> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name, role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!profile || !profile.is_active) redirect("/admin/login?error=forbidden");
  return {
    userId: data.user.id,
    displayName: profile.display_name,
    role: profile.role,
  };
}
