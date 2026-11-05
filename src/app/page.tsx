import Link from "next/link";
import { Activity, ArrowRight, BookOpen, CircleHelp, FlaskConical, Lightbulb, Microscope, type LucideIcon } from "lucide-react";
import { HeroDiagram } from "@/components/home/HeroDiagram";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/motion/Reveal";

const ENTRIES = [
  {
    icon: BookOpen,
    tint: "#e3efff",
    color: "#1d4ed8",
    title: "Materi",
    body: "Lima bagian, dari cuaca dan iklim sampai mitigasi.",
    href: "/materi",
  },
  {
    icon: Activity,
    tint: "#fff4d6",
    color: "#b45309",
    title: "Simulasi",
    body: "Ubah parameter dan lihat aliran energinya.",
    href: "/simulasi",
  },
  {
    icon: FlaskConical,
    tint: "#dff5e8",
    color: "#0f7b3f",
    title: "Eksperimen",
    body: "Tebak, amati, lalu jelaskan hasilnya.",
    href: "/eksperimen",
  },
];

const STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: BookOpen, label: "Pelajari" },
  { icon: CircleHelp, label: "Prediksi" },
  { icon: Microscope, label: "Amati" },
  { icon: Lightbulb, label: "Jelaskan" },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr] md:py-16">
        <div>
          <Reveal>
            <h1 className="text-4xl sm:text-5xl">
              Pahami efek rumah kaca lewat simulasi yang bisa kamu ubah sendiri.
            </h1>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Lihat bagaimana energi Matahari, Bumi, dan atmosfer berinteraksi, lalu uji dugaanmu.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/materi" className="btn btn-primary btn-lg group">
                Mulai Belajar
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/simulasi" className="btn btn-secondary btn-lg">
                Coba Simulasi
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Untuk kelas X. Tanpa login atau kode.</p>
          </Reveal>
        </div>
        <HeroDiagram />
      </section>

      {/* Pintu masuk */}
      <section aria-label="Mulai dari mana" className="bg-ground-muted py-12">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ENTRIES.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 90}>
                <Link
                  href={e.href}
                  className="spot wiggle-hover card group flex h-full items-center gap-4 p-5 transition-all duration-150 hover:-translate-y-1 hover:border-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <IconTile icon={e.icon} tint={e.tint} color={e.color} size="md" className="wiggle-target" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-bold">{e.title}</span>
                    <span className="block text-sm text-muted">{e.body}</span>
                  </span>
                  <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </ul>

          {/* Cara belajar, sengaja ringkas */}
          <Reveal delay={200}>
            <ol aria-label="Cara belajar" className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-sm font-semibold">
              {STEPS.map((s, i) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-sm ring-1 ring-border transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none">
                    <s.icon aria-hidden className="h-4 w-4 text-primary" />
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <ArrowRight aria-hidden className="h-4 w-4 text-muted" />}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
