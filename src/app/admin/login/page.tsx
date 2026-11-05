import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Masuk Admin — Greenhouse Lab" };

async function ForbiddenNotice({ params }: { params: PageProps<"/admin/login">["searchParams"] }) {
  const { error } = await params;
  if (error !== "forbidden") return null;
  return (
    <p role="alert" className="mt-3 text-sm text-error">
      Akun ini tidak terdaftar sebagai peneliti/admin aktif.
    </p>
  );
}

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <main className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-bold">Masuk Peneliti/Admin</h1>
      <p className="mt-1 text-sm text-muted">
        Halaman ini hanya untuk peneliti dan admin. Siswa dan guru tidak perlu
        login.
      </p>
      <Suspense>
        <ForbiddenNotice params={props.searchParams} />
      </Suspense>
      <LoginForm />
    </main>
  );
}
