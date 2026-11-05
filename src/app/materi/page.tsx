import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MODULES } from "@/features/learning/modules";
import { MODULE_STYLE } from "@/features/learning/style";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/motion/Reveal";
import { ModuleDone, ProgressSummary } from "@/components/learning/ProgressBadges";

export const metadata: Metadata = { title: "Materi — Greenhouse Lab" };

export default function MateriPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow">Peta belajar</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">Lima langkah memahami efek rumah kaca</h1>
      <p className="mt-2 max-w-2xl text-lg text-muted">
        Ikuti berurutan atau loncat ke bagian mana saja. Terbuka tanpa login.
      </p>

      <ProgressSummary slugs={MODULES.map((m) => m.slug)} />


      <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {MODULES.map((m) => {
          const s = MODULE_STYLE[m.order] ?? MODULE_STYLE[1];
          return (
            <Reveal as="li" key={m.slug} delay={(m.order - 1) * 80} className={m.order === 5 ? "sm:col-span-2" : ""}>
              <Link
                href={`/materi/${m.slug}`}
                className="spot wiggle-hover card group flex h-full items-start gap-4 p-5 transition-all duration-150 hover:-translate-y-1 hover:border-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <IconTile icon={s.icon} tint={s.tint} color={s.color} size="lg" className="wiggle-target" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-white">Bagian {m.order}</span>
                    {m.indicators.map((i) => (
                      <span key={i} className="rounded-full border border-border px-2.5 py-0.5 text-muted">
                        {i}
                      </span>
                    ))}
                    <ModuleDone slug={m.slug} />
                  </span>
                  <span className="mt-2 font-display text-xl font-bold leading-tight">{m.title}</span>
                  <span className="mt-1 text-sm text-muted">{m.objectives[0]}</span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Mulai belajar
                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </main>
  );
}
