import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { ParticipantGate } from "@/components/research/ParticipantGate";

export const metadata: Metadata = { title: "Masuk Partisipan — Greenhouse Lab" };

export default function PartisipanPage() {
  return (
    <main className="mx-auto flex min-h-[72vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="card w-full p-7 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-5 text-2xl">Masuk Partisipan</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Masukkan kode sesi dan kode partisipan yang kamu terima dari peneliti.
          </p>
        </div>
        <ParticipantGate />
      </div>
      <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Kembali ke beranda
      </Link>
    </main>
  );
}
