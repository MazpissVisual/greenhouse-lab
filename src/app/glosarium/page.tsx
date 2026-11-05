import type { Metadata } from "next";
import { GlossaryList } from "@/components/learning/GlossaryList";

export const metadata: Metadata = { title: "Glosarium — Greenhouse Lab" };

export default function GlosariumPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow">Kamus mini</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Glosarium</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">
        Arti istilah penting dengan bahasa sederhana. Cari, filter berdasarkan
        huruf, atau loncat ke materinya.
      </p>
      <div className="mt-8">
        <GlossaryList />
      </div>
    </main>
  );
}
