"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Menyembunyikan kerangka situs publik (navbar, footer, bilah bawah) di halaman admin. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
