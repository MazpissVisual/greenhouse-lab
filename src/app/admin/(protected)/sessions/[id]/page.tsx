import { notFound } from "next/navigation";
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

export default async function SessionDetail(props: PageProps<"/admin/sessions/[id]">) {
  const { id } = await props.params;
  const supabase = await createSupabaseServer();
  const { data: s } = await supabase.from("research_sessions").select("*").eq("id", id).maybeSingle();
  if (!s) notFound();
  const { data: participants } = await supabase
    .from("participants")
    .select("id,participant_label,status,created_at")
    .eq("session_id", id)
    .order("participant_label");

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
    </section>
  );
}
