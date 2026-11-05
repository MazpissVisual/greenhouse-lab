import type { Metadata } from "next";
import { ExperimentHub } from "@/components/experiments/ExperimentHub";

export const metadata: Metadata = { title: "Eksperimen — Greenhouse Lab" };

export default function EksperimenPage() {
  return (
    <main>
      <div className="mx-auto max-w-3xl px-4 pt-10">
        <p className="eyebrow">Predict · Observe · Explain</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Jadi ilmuwan sehari!</h1>
        <p className="mt-2 text-lg text-muted">
          Tebak dulu apa yang akan terjadi, uji lewat model, lalu jelaskan
          alasannya. Terbuka tanpa login.
        </p>
      </div>
      <ExperimentHub />
    </main>
  );
}
