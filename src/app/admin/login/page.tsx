import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/brand/Logo";

export const metadata: Metadata = { title: "Masuk Admin — Greenhouse Lab" };

async function ForbiddenNotice({ params }: { params: PageProps<"/admin/login">["searchParams"] }) {
  const { error } = await params;
  if (error !== "forbidden") return null;
  return (
    <p role="alert" className="mt-5 flex items-start gap-2.5 rounded-xl bg-error/10 px-3.5 py-3 text-sm text-error">
      <ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      Akun ini belum terdaftar sebagai peneliti/admin aktif.
    </p>
  );
}

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="mx-auto flex min-h-[72vh] max-w-md flex-col items-center justify-center px-4 py-12">
      <div className="card w-full p-7 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-5 text-2xl">Masuk Peneliti/Admin</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Masukkan kode akses untuk membuka dashboard. Siswa dan guru tidak perlu masuk;
            belajar bisa langsung dari beranda.
          </p>
        </div>
        <Suspense>
          <ForbiddenNotice params={props.searchParams} />
        </Suspense>
        <LoginForm />
      </div>
      <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Kembali ke beranda
      </Link>
    </main>
  );
}
