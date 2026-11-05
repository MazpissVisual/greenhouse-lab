import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleHelp, FlaskConical, Info, Lightbulb, Play, Tag, Target } from "lucide-react";
import { MODULES, getModule } from "@/features/learning/modules";
import { MODULE_STYLE } from "@/features/learning/style";
import { FormativeQuiz } from "@/components/learning/FormativeQuiz";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/motion/Reveal";
import { ReadingProgress } from "@/components/motion/ReadingProgress";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata(props: PageProps<"/materi/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const m = getModule(slug);
  return { title: m ? `${m.title} — Greenhouse Lab` : "Materi" };
}

export default function ModulePage(props: PageProps<"/materi/[slug]">) {
  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <ModuleContent params={props.params} />
    </Suspense>
  );
}

function ModuleSkeleton() {
  return (
    <main aria-busy="true" className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="h-44 rounded-3xl bg-ground-muted motion-safe:animate-pulse" />
      <div className="h-28 rounded-2xl bg-ground-muted motion-safe:animate-pulse" />
      <div className="h-56 rounded-2xl bg-ground-muted motion-safe:animate-pulse" />
    </main>
  );
}

async function ModuleContent({ params }: { params: PageProps<"/materi/[slug]">["params"] }) {
  const { slug } = await params;
  const m = getModule(slug);
  if (!m) notFound();
  const s = MODULE_STYLE[m.order] ?? MODULE_STYLE[1];
  const prev = MODULES.find((x) => x.order === m.order - 1);
  const next = MODULES.find((x) => x.order === m.order + 1);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <ReadingProgress />
      <nav aria-label="Jejak halaman" className="text-sm text-muted">
        <Link href="/materi" className="hover:text-foreground">Materi</Link>
        <span aria-hidden> / </span>
        <span>Bagian {m.order}</span>
      </nav>

      {/* Hero modul */}
      <header className="rounded-3xl p-6 sm:p-8" style={{ background: s.tint }}>
        <div className="flex items-start gap-5">
          <IconTile icon={s.icon} tint="#ffffff" color={s.color} size="lg" />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-white">Bagian {m.order}</span>
              {m.indicators.map((i) => (
                <span key={i} className="rounded-full bg-white px-2.5 py-0.5">Indikator {i}</span>
              ))}
              <span className="rounded-full bg-white px-2.5 py-0.5">Versi {m.version}</span>
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl">{m.title}</h1>
          </div>
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-white/70 p-3 text-xs text-muted">
          <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          Draf konten: belum ditelaah ahli dan belum diverifikasi terhadap kurikulum yang berlaku.
        </p>
      </header>

      {/* Tujuan */}
      <Reveal as="section" aria-labelledby="tujuan" className="card p-5 sm:p-6">
        <h2 id="tujuan" className="flex items-center gap-2 text-xl">
          <Target aria-hidden className="h-5 w-5 text-primary" />
          Tujuan pembelajaran
        </h2>
        <ul className="mt-3 space-y-2.5">
          {m.objectives.map((o) => (
            <li key={o} className="flex items-start gap-3 text-[15px]">
              <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
              {o}
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Pertanyaan pemantik */}
      <Reveal as="section" aria-labelledby="pemantik" className="flex items-start gap-4 rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 sm:p-6">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <CircleHelp className="h-6 w-6" />
        </span>
        <div>
          <h2 id="pemantik" className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pertanyaan pemantik
          </h2>
          <p className="mt-1 font-display text-xl font-bold leading-snug">{m.hook}</p>
        </div>
      </Reveal>

      {/* Isi */}
      <div className="space-y-5">
        {m.sections.map((sec, i) => (
          <Reveal as="section" key={sec.heading} className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-xl">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ground-muted font-display text-sm font-bold text-primary">
                {i + 1}
              </span>
              {sec.heading}
            </h2>
            {sec.body.map((p) => (
              <p key={p} className="mt-3 text-base leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </Reveal>
        ))}
      </div>

      {m.slug === "mekanisme-efek-rumah-kaca" && (
        <Reveal as="section" className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Coba sendiri">
          <Link href="/simulasi" className="card flex items-center gap-3 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none">
            <IconTile icon={Play} tint="#e3efff" color="#1d4ed8" size="sm" />
            <span>
              <span className="block font-display font-bold">Coba Simulasi</span>
              <span className="text-sm text-muted">Lihat aliran energinya langsung.</span>
            </span>
          </Link>
          <Link href="/eksperimen" className="card flex items-center gap-3 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none">
            <IconTile icon={FlaskConical} tint="#dff5e8" color="#0f7b3f" size="sm" />
            <span>
              <span className="block font-display font-bold">Uji lewat Eksperimen</span>
              <span className="text-sm text-muted">Tebak, amati, lalu jelaskan.</span>
            </span>
          </Link>
        </Reveal>
      )}

      {/* Istilah kunci */}
      <Reveal as="section" aria-labelledby="istilah">
        <h2 id="istilah" className="flex items-center gap-2 text-xl">
          <Tag aria-hidden className="h-5 w-5 text-primary" />
          Istilah kunci
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {m.keyTerms.map((t) => (
            <li key={t}>
              <Link href="/glosarium" className="inline-block rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                {t}
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Ringkasan */}
      <Reveal as="section" aria-labelledby="ringkasan" className="flex items-start gap-4 rounded-3xl bg-primary/10 p-5 sm:p-6">
        <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <Lightbulb className="h-6 w-6" />
        </span>
        <div>
          <h2 id="ringkasan" className="text-xl">Ringkasan</h2>
          <p className="mt-1 text-[15px] leading-relaxed">{m.summary}</p>
        </div>
      </Reveal>

      <FormativeQuiz items={m.quiz} progressSlug={m.slug} />

      {/* Berikutnya / sebelumnya */}
      <nav aria-label="Navigasi antarbagian" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/materi/${prev.slug}`} className="card group flex items-center gap-3 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none">
            <ArrowLeft aria-hidden className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
            <span>
              <span className="block text-xs text-muted">Sebelumnya</span>
              <span className="font-display font-bold leading-tight">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/materi/${next.slug}`} className="card group flex items-center justify-end gap-3 p-4 text-right transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none">
            <span>
              <span className="block text-xs text-muted">Berikutnya</span>
              <span className="font-display font-bold leading-tight">{next.title}</span>
            </span>
            <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </nav>
    </main>
  );
}
