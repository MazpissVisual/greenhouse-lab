import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Host_Grotesk, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { BottomNav } from "@/components/layout/BottomNav";
import { MainNav, NavLinks } from "@/components/layout/MainNav";
import { LogoMark } from "@/components/brand/Logo";
import { InstallButton } from "@/components/pwa/InstallButton";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { PointerGlow } from "@/components/motion/PointerGlow";

const display = Host_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Greenhouse Lab",
  applicationName: "Greenhouse Lab",
  description:
    "Media pembelajaran sains interaktif tentang pemanasan global dan efek rumah kaca.",
  appleWebApp: { capable: true, title: "Greenhouse Lab", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/pwa-icon?size=180", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // agar safe-area (notch, bilah gestur) bisa dipakai
  themeColor: "#074ce0",
};

const NAV = [
  { href: "/materi", label: "Materi" },
  { href: "/simulasi", label: "Simulasi" },
  { href: "/eksperimen", label: "Eksperimen" },
  { href: "/glosarium", label: "Glosarium" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <HideOnAdmin>
        <header className="border-b border-border bg-surface/85 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:sticky lg:top-0 lg:z-40">
          <nav
            aria-label="Navigasi utama"
            className="mx-auto flex max-w-6xl items-center gap-x-6 px-4 py-3"
          >
            <Link
              href="/"
              className="group mr-auto flex items-center gap-2.5 rounded-xl font-display text-lg font-bold tracking-tight"
            >
              <span className="inline-block transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                <LogoMark className="h-8 w-8" />
              </span>
              Greenhouse Lab
            </Link>
            <Suspense fallback={<NavLinks activeHref={null} />}>
              <MainNav />
            </Suspense>
            <InstallButton />
          </nav>
        </header>
        </HideOnAdmin>

        <div className="flex-1">{children}</div>

        <HideOnAdmin>
        <footer className="bg-field text-on-field">
          <div className="mx-auto grid grid-cols-1 max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2.5 font-display text-lg font-bold">
                <LogoMark className="h-8 w-8" />
                Greenhouse Lab
              </p>
              <p className="mt-2 max-w-sm text-sm text-on-field-secondary">
                Media pembelajaran sains berbasis web tentang pemanasan global
                dan efek rumah kaca.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <ul className="space-y-3">
                {NAV.slice(0, 2).map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="inline-block py-1 text-on-field-secondary hover:text-on-field">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-3">
                {NAV.slice(2).map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="inline-block py-1 text-on-field-secondary hover:text-on-field">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="border-t border-white/10 px-4 py-4 text-center text-[13px] text-on-field-secondary">
            Simulasi adalah model penyederhanaan untuk pembelajaran, bukan
            prediksi iklim.
          </p>
        </footer>
        </HideOnAdmin>

        <HideOnAdmin>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </HideOnAdmin>
        <PwaRegister />
        <PointerGlow />
      </body>
    </html>
  );
}
