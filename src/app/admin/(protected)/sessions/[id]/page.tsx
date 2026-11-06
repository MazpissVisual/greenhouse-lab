import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { GenerateCodes } from "@/components/admin/GenerateCodes";
import { setParticipantStatus, setSessionStatus } from "../../../actions";

const NEXT_ACTIONS: Record<string, { to: string; label: string }[]> = {
  draft: [{ to: "scheduled", label: "Jadwalkan" }, { to: "active", label: "Aktifkan" }],
  scheduled: [{ to: "active", label: "Aktifkan" }, { to: "draft", label: "Kembali ke draft" }],
  active: [{ to: "closed", label: "Tutup sesi" }],
  closed: [{ to: "active", label: "Buka lagi" }, { to: "archived", label: "Arsipkan" }],
  archived: [],
};

// Halaman admin selalu dinamis di balik login; tidak divalidasi sebagai halaman instan.
export const instant = false;

export default async function SessionDetail(props: PageProps<"/admin/sessions/[id]">) {
  await connection();
  const { id } = await props.params;
  const supabase = await createSupabaseServer();
  const { data: s } = await supabase.from("research_sessions").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();
  const { data: participants } = await supabase
    .from("participants")
    .select("id,participant_label,status,created_at")
    .eq("session_id", id)
    .order("participant_label");
  const { data: records } = await supabase
    .from("experiment_records")
    .select("id,participant_id,explanation,prediction,submitted_at,experiments(experiment_code,title)")
    .eq("session_id", id)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });
  const labelOf = new Map((participants ?? []).map((p) => [p.id, p.participant_label]));

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl sm:text-4xl">{s.title}</h1>
        <p className="text-sm text-muted">
          Kode sesi <span className="font-mono font-semibold text-foreground">{s.session_code}</span> · status {s.status}
          {s.academic_year ? ` · ${s.academic_year}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT_ACTIONS[s.status].map((a) => (
            <form key={a.to} action={setSessionStatus.bind(null, id, a.to)}>
              <button type="submit" className="btn btn-secondary">
                {a.label}
              </button>
            </form>
          ))}
        </div>
      </header>

      <div>
        <h2 className="mb-2 font-semibold">Peserta ({participants?.length ?? 0})</h2>
        <GenerateCodes sessionId={id} />
      </div>

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted"><th className="p-2">Label</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {(participants ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-2 font-mono">{p.participant_label}</td>
                <td>{p.status}</td>
                <td>
                  <form action={setParticipantStatus.bind(null, p.id, id, p.status === "active" ? "disabled" : "active")}>
                    <button type="submit" className="text-primary underline">
                      {p.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Hasil eksperimen ({records?.length ?? 0})</h2>
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="p-2">Peserta</th>
                <th>Eksperimen</th>
                <th>Prediksi</th>
                <th>Penjelasan</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {(records ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="p-3 text-muted">
                    Belum ada hasil yang masuk.
                  </td>
                </tr>
              )}
              {(records ?? []).map((r) => {
                const exp = (Array.isArray(r.experiments) ? r.experiments[0] : r.experiments) as {
                  experiment_code: string;
                  title: string;
                } | null;
                const pred = r.prediction as { optionId?: string; correct?: boolean } | null;
                return (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="p-2 font-mono">{labelOf.get(r.participant_id) ?? "-"}</td>
                    <td>{exp?.title ?? "-"}</td>
                    <td>
                      {pred?.optionId ?? "-"} {pred?.correct ? "(tepat)" : "(kurang tepat)"}
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap py-2">{r.explanation}</td>
                    <td className="whitespace-nowrap">
                      {r.submitted_at ? new Date(r.submitted_at).toLocaleString("id-ID") : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
