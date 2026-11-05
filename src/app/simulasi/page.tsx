import type { Metadata } from "next";
import { Simulator } from "@/components/simulation/Simulator";

export const metadata: Metadata = { title: "Simulasi — Greenhouse Lab" };

export default function SimulasiPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 pt-8">
        <h1 className="text-3xl sm:text-4xl">Simulasi Efek Rumah Kaca</h1>
        <p className="mt-1 text-muted">
          Amati aliran energi Matahari–Bumi–atmosfer. Terbuka tanpa login.
        </p>
      </div>
      <Simulator />
    </main>
  );
}
