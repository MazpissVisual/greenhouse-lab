import { Suspense } from "react";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/staff";
import { logout } from "../actions";

async function Shell({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="mx-auto grid grid-cols-1 max-w-6xl gap-6 px-4 py-6 md:grid-cols-[200px_1fr]">
      <aside className="space-y-4 text-sm">
        <div>
          <p className="font-semibold">{staff.displayName}</p>
          <p className="text-xs text-muted">{staff.role}</p>
        </div>
        <nav aria-label="Navigasi admin" className="flex flex-col gap-2">
          <Link href="/admin" className="hover:underline">Overview</Link>
          <Link href="/admin/sessions" className="hover:underline">Research Sessions</Link>
        </nav>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary">
            Keluar
          </button>
        </form>
      </aside>
      <div>{children}</div>
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
