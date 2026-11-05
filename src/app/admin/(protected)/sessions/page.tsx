import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SessionForm } from "@/components/admin/SessionForm";

// Halaman admin selalu dinamis di balik login; tidak divalidasi sebagai halaman instan.
export const instant = false;

export default async function SessionsPage() {
  await connection();
  const supabase = await createSupabaseServer();
  const { data: sessions } = await supabase
    .from("research_sessions")
    .select("id,title,session_code,class_code,status,starts_at,ends_at")
    .order("created_at", { ascending: false });
  return (
    <section className="space-y-6">
      <h1 className="text-3xl sm:text-4xl">Research Sessions</h1>
      <SessionForm />
      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="p-2">Judul</th><th>Kode sesi</th><th>Kelas</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(sessions ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-2">
                  <Link href={`/admin/sessions/${s.id}`} className="text-primary underline">{s.title}</Link>
                </td>
                <td className="font-mono">{s.session_code}</td>
                <td>{s.class_code ?? "—"}</td>
                <td>{s.status}</td>
              </tr>
            ))}
            {!sessions?.length && (
              <tr><td colSpan={4} className="p-4 text-center text-muted">Belum ada sesi.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
