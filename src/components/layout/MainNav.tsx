"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, FlaskConical, Library, type LucideIcon } from "lucide-react";

const ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/materi", label: "Materi", icon: BookOpen },
  { href: "/simulasi", label: "Simulasi", icon: Activity },
  { href: "/eksperimen", label: "Eksperimen", icon: FlaskConical },
  { href: "/glosarium", label: "Glosarium", icon: Library },
];

/** Tautan menu utama (desktop). `activeHref` null = tanpa penanda (dipakai sebagai cadangan saat memuat). */
export function NavLinks({ activeHref }: { activeHref: string | null }) {
  return (
    <ul className="flex items-center gap-1 max-md:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`group relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors duration-150 motion-reduce:transition-none ${
                active ? "bg-primary/10 text-primary" : "text-muted hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Icon
                aria-hidden
                className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                strokeWidth={active ? 2.5 : 2.25}
              />
              {label}
              {/* garis bawah meluncur dari tengah saat di-hover; tetap tampil pada halaman aktif */}
              <span
                aria-hidden
                className={`absolute inset-x-4 -bottom-0.5 h-0.5 origin-center rounded-full bg-primary transition-transform duration-200 motion-reduce:transition-none ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Menu utama dengan penanda halaman aktif. */
export function MainNav() {
  const pathname = usePathname();
  const active = ITEMS.find((i) => pathname.startsWith(i.href))?.href ?? null;
  return <NavLinks activeHref={active} />;
}
