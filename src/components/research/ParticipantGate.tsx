"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

const ERRORS: Record<string, string> = {
  INVALID_PARTICIPANT_CODE:
    "Kode sesi atau kode partisipan tidak cocok, atau sesi belum/sudah tidak aktif.",
  RATE_LIMITED: "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.",
  VALIDATION_ERROR: "Periksa lagi isian kamu. Kode partisipan minimal 10 karakter.",
};

export function ParticipantGate() {
  const router = useRouter();
  const [step, setStep] = useState<"kode" | "persetujuan">("kode");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/research/access/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionCode: String(form.get("sessionCode") ?? ""),
          participantCode: String(form.get("participantCode") ?? ""),
        }),
      });
      if (res.ok) {
        setStep("persetujuan");
        return;
      }
      const body = await res.json().catch(() => null);
      setError(ERRORS[body?.error?.code] ?? "Terjadi kesalahan. Coba lagi.");
    } catch {
      setError("Tidak ada koneksi. Periksa jaringan lalu coba lagi.");
    } finally {
      setPending(false);
    }
  }

  if (step === "persetujuan") {
    return (
      <div className="mt-7 space-y-5">
        <div className="rounded-xl bg-ground-muted p-4 text-sm leading-relaxed">
          <p className="font-semibold">Persetujuan berpartisipasi</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
            <li>Kamu akan mengerjakan eksperimen sains tentang efek rumah kaca.</li>
            <li>Kamu diidentifikasi hanya dengan kode, bukan nama.</li>
            <li>Keikutsertaan bersifat sukarela dan boleh berhenti kapan saja.</li>
            <li>Data dipakai untuk keperluan penelitian pembelajaran.</li>
          </ul>
        </div>
        <label className="flex items-start gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0"
          />
          Saya sudah membaca dan bersedia berpartisipasi.
        </label>
        <button
          type="button"
          disabled={!agree}
          onClick={() => router.push("/eksperimen")}
          className="btn btn-primary btn-lg w-full"
        >
          Mulai eksperimen
          <ArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <div>
        <label htmlFor="sessionCode" className="mb-2 block text-sm font-semibold">
          Kode sesi
        </label>
        <input
          id="sessionCode"
          name="sessionCode"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
          minLength={3}
          maxLength={40}
          placeholder="Dari peneliti/guru"
          className="field h-14 w-full text-center font-mono text-lg uppercase tracking-widest"
        />
      </div>
      <div>
        <label htmlFor="participantCode" className="mb-2 block text-sm font-semibold">
          Kode partisipan
        </label>
        <div className="relative">
          <KeyRound
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            id="participantCode"
            name="participantCode"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            minLength={10}
            maxLength={40}
            placeholder="10 karakter"
            aria-invalid={error ? true : undefined}
            className="field h-14 w-full pl-12 text-center font-mono text-lg uppercase tracking-widest"
          />
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-semibold text-error">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full">
        {pending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            Memeriksa…
          </>
        ) : (
          <>
            <ShieldCheck aria-hidden className="h-4 w-4" />
            Lanjut
          </>
        )}
      </button>
    </form>
  );
}
