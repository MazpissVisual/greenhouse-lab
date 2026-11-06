"use client";

import { useActionState } from "react";
import { createSession, type FormState } from "@/app/admin/actions";

const input = "mt-1 w-full field";

/** datetime-local tidak membawa zona waktu; server (UTC) akan salah membacanya. Ubah ke ISO UTC di browser. */
function withLocalTimezone(prev: FormState, fd: FormData) {
  for (const key of ["starts_at", "ends_at"]) {
    const v = fd.get(key);
    if (typeof v === "string" && v) {
      const d = new Date(v); // dibaca sebagai waktu lokal browser
      if (!Number.isNaN(d.getTime())) fd.set(key, d.toISOString());
    }
  }
  return createSession(prev, fd);
}

export function SessionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(withLocalTimezone, {});
  return (
    <form action={action} className="grid grid-cols-1 gap-3 card p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium">Judul sesi</label>
        <input id="title" name="title" required minLength={3} className={input} />
      </div>
      <div>
        <label htmlFor="session_code" className="text-sm font-medium">Kode sesi (kosongkan = acak)</label>
        <input id="session_code" name="session_code" maxLength={12} className={input} />
      </div>
      <div>
        <label htmlFor="class_code" className="text-sm font-medium">Kode kelas</label>
        <input id="class_code" name="class_code" className={input} />
      </div>
      <div>
        <label htmlFor="academic_year" className="text-sm font-medium">Tahun ajaran</label>
        <input id="academic_year" name="academic_year" placeholder="2026/2027" className={input} />
      </div>
      <div />
      <div>
        <label htmlFor="starts_at" className="text-sm font-medium">Mulai</label>
        <input id="starts_at" name="starts_at" type="datetime-local" className={input} />
      </div>
      <div>
        <label htmlFor="ends_at" className="text-sm font-medium">Selesai</label>
        <input id="ends_at" name="ends_at" type="datetime-local" className={input} />
      </div>
      {state.error && <p role="alert" className="text-sm text-error sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Menyimpan…" : "Buat sesi (draft)"}
        </button>
      </div>
    </form>
  );
}
