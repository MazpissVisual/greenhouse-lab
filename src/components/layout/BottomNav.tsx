"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, FlaskConical, House, Library, type LucideIcon } from "lucide-react";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/materi", label: "Materi", icon: BookOpen },
  { href: "/simulasi", label: "Simulasi", icon: Activity },
  { href: "/eksperimen", label: "Eksperimen", icon: FlaskConical },
  { href: "/glosarium", label: "Glosarium", icon: Library },
];

/** Navigasi bawah untuk ponsel (seperti aplikasi). Tidak tampil di area admin dan penelitian. */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/penelitian")) return null;

  return (
    <>
      {/* spacer agar konten terakhir tidak tertutup bilah */}
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-16 flex-col items-center justify-center gap-0.5 transition-transform active:scale-90 motion-reduce:transition-none text-[11px] font-semibold ${
                    active ? "text-primary" : "text-muted"
                  }`}
                >
                  <span
                    className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors nav-ico ${
                      active ? "bg-primary/10" : ""
                    }`}
                  >
                    <Icon aria-hidden className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
