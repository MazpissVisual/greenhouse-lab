import { Suspense } from "react";
import Link from "next/link";
import { CalendarDays, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { logout } from "../actions";

// Area admin selalu dinamis (butuh sesi login), jadi tidak divalidasi sebagai halaman instan.
export const instant = false;

async function Shell({ children }: { children: React.ReactNode }) {
  await connection(); // pemeriksaan sesi memakai waktu; harus dirender saat permintaan
  const staff = await requireStaff();
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
      <aside className="space-y-5 text-sm md:sticky md:top-20 md:self-start">
        <div className="card flex items-center gap-3 p-3.5">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{staff.displayName}</p>
            <p className="text-xs capitalize text-muted">{staff.role}</p>
          </div>
        </div>
        <nav aria-label="Navigasi admin" className="flex flex-row gap-1.5 md:flex-col">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-muted transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <LayoutDashboard aria-hidden className="h-4 w-4" />
            Overview
          </Link>
          <Link
            href="/admin/sessions"
            className="inline-flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold text-muted transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <CalendarDays aria-hidden className="h-4 w-4" />
            Research Sessions
          </Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary w-full">
            <LogOut aria-hidden className="h-4 w-4" />
            Keluar
          </button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Memuat…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
