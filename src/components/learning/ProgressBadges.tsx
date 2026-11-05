"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Check, Trophy } from "lucide-react";
import { getServerSnapshot, getSnapshot, parse, subscribe } from "@/lib/progress";

function useDone() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => parse(raw), [raw]);
}

/** Ringkasan: n dari total bagian selesai, dengan bar yang terisi halus. */
export function ProgressSummary({ slugs }: { slugs: string[] }) {
  const done = useDone();
  const n = slugs.filter((s) => done[s]).length;
  const all = n === slugs.length && n > 0;
  return (
    <div className="card mt-6 flex items-center gap-4 p-4">
      <span
        aria-hidden
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${all ? "bg-[#fff4d6] text-[#b45309]" : "bg-primary/10 text-primary"}`}
      >
        <Trophy className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {n}/{slugs.length} bagian selesai{all ? " — hebat!" : ""}
        </p>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ground-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
            style={{ width: `${slugs.length ? (n / slugs.length) * 100 : 0}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted">Tersimpan hanya di browser ini.</p>
      </div>
    </div>
  );
}

/** Lencana "Selesai" untuk satu bagian. */
export function ModuleDone({ slug }: { slug: string }) {
  const done = useDone();
  if (!done[slug]) return null;
  return (
    <span className="pop inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-success">
      <Check aria-hidden className="h-3 w-3" strokeWidth={3.5} />
      Selesai
    </span>
  );
}
