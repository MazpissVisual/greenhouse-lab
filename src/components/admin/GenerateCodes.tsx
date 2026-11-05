"use client";

import { useActionState } from "react";
import { generateParticipants, type CodesState } from "@/app/admin/actions";

export function GenerateCodes({ sessionId }: { sessionId: string }) {
  const [state, action, pending] = useActionState<CodesState, FormData>(
    generateParticipants.bind(null, sessionId),
    {},
  );

  const download = () => {
    if (!state.codes) return;
    const csv = "label,kode_peserta\n" + state.codes.map((c) => `${c.label},${c.code}`).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "kode-peserta.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <form action={action} className="flex items-end gap-2">
        <div>
          <label htmlFor="count" className="block text-sm font-medium">Jumlah peserta baru</label>
          <input id="count" name="count" type="number" min={1} max={200} defaultValue={10}
            className="mt-1 w-28 field" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Membuat…" : "Terbitkan kode"}
        </button>
      </form>
      {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
      {state.codes && (
        <div className="card p-4 text-sm">
          <p className="font-medium">
            Kode hanya ditampilkan sekali. Unduh sekarang dan simpan sebagai data terbatas.
            Sistem hanya menyimpan HMAC, jadi kode tidak dapat ditampilkan lagi.
          </p>
          <button type="button" onClick={download} className="mt-2 btn btn-secondary">
            Unduh CSV
          </button>
          <ul className="mt-3 grid grid-cols-2 gap-1 font-mono text-xs sm:grid-cols-3">
            {state.codes.map((c) => (
              <li key={c.label}>{c.label}: {c.code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
