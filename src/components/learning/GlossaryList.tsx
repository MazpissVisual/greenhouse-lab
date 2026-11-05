"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, SearchX, Search, X } from "lucide-react";
import { GLOSSARY } from "@/features/learning/glossary";
import { MODULES } from "@/features/learning/modules";
import { MODULE_STYLE } from "@/features/learning/style";

const norm = (s: string) => s.toLocaleLowerCase("id");

/** Menyorot bagian teks yang cocok dengan kata yang dicari. */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="rounded bg-primary/15 px-0.5 text-inherit">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function GlossaryList() {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  // Urut abjad (locale Indonesia), lalu gabungkan info bagian materinya.
  const entries = useMemo(
    () =>
      [...GLOSSARY]
        .sort((a, b) => a.term.localeCompare(b.term, "id"))
        .map((g) => {
          const mod = MODULES.find((m) => m.slug === g.moduleSlug);
          return { ...g, mod, style: MODULE_STYLE[mod?.order ?? 1] };
        }),
    [],
  );
  const letters = useMemo(() => Array.from(new Set(entries.map((e) => e.term[0].toUpperCase()))), [entries]);

  const q = norm(query.trim());
  const shown = entries.filter(
    (e) =>
      (!letter || e.term[0].toUpperCase() === letter) &&
      (!q || norm(e.term).includes(q) || norm(e.definition).includes(q)),
  );

  return (
    <div className="space-y-6">
      {/* Pencarian */}
      <div className="card flex items-center gap-3 px-4 py-2.5">
        <Search aria-hidden className="h-5 w-5 shrink-0 text-muted" />
        <label htmlFor="gloss-q" className="sr-only">
          Cari istilah
        </label>
        <input
          id="gloss-q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari istilah atau arti…"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-base outline-none placeholder:text-muted"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" className="btn btn-secondary btn-icon !h-8 !w-8 !min-h-0">
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter huruf */}
      <div role="group" aria-label="Filter huruf awal" className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={letter === null}
          onClick={() => setLetter(null)}
          className={`rounded-full border-2 px-3.5 py-1 text-sm font-semibold transition-colors ${
            letter === null ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary"
          }`}
        >
          Semua
        </button>
        {letters.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={letter === l}
            onClick={() => setLetter(letter === l ? null : l)}
            className={`h-9 w-9 rounded-full border-2 text-sm font-bold transition-colors ${
              letter === l ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        Menampilkan {shown.length} dari {entries.length} istilah
      </p>

      {shown.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ground-muted text-muted">
            <SearchX className="h-7 w-7" />
          </span>
          <p className="font-display text-lg font-bold">Istilah tidak ditemukan</p>
          <p className="text-sm text-muted">Coba kata lain atau hapus filter huruf.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLetter(null);
            }}
            className="btn btn-secondary"
          >
            Tampilkan semua
          </button>
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map((e) => (
            <div
              key={e.term}
              className="spot enter card flex flex-col p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-xl font-extrabold"
                  style={{ background: e.style.tint, color: e.style.color }}
                >
                  {e.term[0].toUpperCase()}
                </span>
                <dt className="font-display text-lg font-bold leading-tight">
                  <Highlight text={e.term} q={query.trim()} />
                </dt>
              </div>
              <dd className="mt-3 flex-1 text-[15px] leading-relaxed text-foreground/90"><Highlight text={e.definition} q={query.trim()} /></dd>
              {e.mod && (
                <dd className="mt-4">
                  <Link
                    href={`/materi/${e.mod.slug}`}
                    className="group inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:brightness-95"
                    style={{ background: e.style.tint, color: e.style.color }}
                  >
                    <e.style.icon aria-hidden className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Bagian {e.mod.order}: {e.mod.title}</span>
                    <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
