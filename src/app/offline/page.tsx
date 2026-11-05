import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sedang offline — Greenhouse Lab" };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <span aria-hidden className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ground-muted text-muted">
        <WifiOff className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl">Kamu sedang offline</h1>
      <p className="mt-3 text-muted">
        Halaman ini belum pernah dibuka sebelumnya, jadi belum tersimpan di
        perangkatmu. Sambungkan internet lalu coba lagi. Halaman yang sudah
        pernah kamu buka tetap bisa diakses.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Ke beranda
        </Link>
        <Link href="/materi" className="btn btn-secondary">
          Buka materi
        </Link>
      </div>
    </main>
  );
}
