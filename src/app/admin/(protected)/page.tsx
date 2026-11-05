import { createSupabaseServer } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = await createSupabaseServer();
  const count = async (table: string, filter?: [string, string]) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    return (await q).count ?? 0;
  };
  const [sessions, active, participants] = await Promise.all([
    count("research_sessions"),
    count("research_sessions", ["status", "active"]),
    count("participants"),
  ]);
  const stats = [
    ["Total sesi", sessions],
    ["Sesi aktif", active],
    ["Peserta terdaftar", participants],
  ] as const;
  return (
    <section>
      <h1 className="text-3xl sm:text-4xl">Overview</h1>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(([l, v]) => (
          <div key={l} className="card p-4">
            <div className="text-xs text-muted">{l}</div>
            <div className="text-2xl font-semibold">{v}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        Angka berasal dari database saat halaman dimuat ({new Date().toLocaleString("id-ID")}).
      </p>
    </section>
  );
}
