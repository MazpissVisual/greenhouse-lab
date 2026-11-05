"use client";

import { useEffect, useState } from "react";
import { Brain, Check, CircleHelp, PartyPopper, Star, Trophy } from "lucide-react";
import type { QuizItem } from "@/features/learning/modules";
import { OptionCard } from "@/components/ui/OptionCard";
import { Confetti } from "@/components/ui/Confetti";
import { haptic } from "@/lib/haptics";
import { markDone } from "@/lib/progress";

export function FormativeQuiz({ items, progressSlug }: { items: QuizItem[]; progressSlug?: string }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const total = items.length;
  const right = items.filter((q, i) => answers[i] === q.correct).length;
  const answered = Object.keys(answers).length;
  const finished = answered === total;

  // Semua soal terjawab -> tandai bagian ini selesai (hanya di browser ini).
  useEffect(() => {
    if (progressSlug && finished) markDone(progressSlug);
  }, [progressSlug, finished]);

  return (
    <section aria-label="Latihan formatif" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl">
          <Brain aria-hidden className="h-6 w-6 text-primary" />
          Latihan Formatif
        </h2>
        <p
          className="flex items-center gap-1.5 rounded-full bg-ground-muted px-3 py-1 text-sm font-semibold"
          aria-live="polite"
        >
          <Star
            aria-hidden
            key={right}
            className={`h-4 w-4 fill-[#f5b301] text-[#f5b301] ${right > 0 ? "pop" : ""}`}
          />
          {right}/{total} tepat
        </p>
      </div>
      <p className="text-xs text-muted">
        Jawabanmu hanya diproses di browser ini dan tidak disimpan di server.
      </p>

      {items.map((q, qi) => {
        const chosen = answers[qi];
        const has = chosen !== undefined;
        const ok = chosen === q.correct;
        return (
          <div key={qi} role="radiogroup" aria-labelledby={`quiz-q-${qi}`} className="card p-5 sm:p-6">
            <p id={`quiz-q-${qi}`} className="flex gap-3 font-display text-base font-bold leading-snug">
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-white"
              >
                {qi + 1}
              </span>
              <span>{q.prompt}</span>
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {q.options.map((o, oi) => (
                <OptionCard
                  key={oi}
                  name={`q-${qi}`}
                  checked={chosen === oi}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [qi]: oi }));
                    haptic(oi === q.correct ? 12 : [12, 50, 12]);
                  }}
                  tone={has && chosen === oi ? (oi === q.correct ? "ok" : "warn") : undefined}
                >
                  {o}
                </OptionCard>
              ))}
            </div>
            {has && (
              <p
                role="status"
                className={`enter mt-4 flex gap-3 rounded-2xl p-3.5 text-sm ${ok ? "bg-success/10" : "bg-warning/10"}`}
              >
                <span
                  aria-hidden
                  className={`pop flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${ok ? "bg-success" : "bg-warning"}`}
                >
                  {ok ? <Check className="h-4 w-4" strokeWidth={3} /> : <CircleHelp className="h-4 w-4" />}
                </span>
                <span>
                  <strong className={ok ? "text-success" : "text-warning"}>
                    {ok ? "Benar!" : "Kurang tepat."}
                  </strong>{" "}
                  {q.explanation}
                </span>
              </p>
            )}
          </div>
        );
      })}

      {finished && right === total && (
        <div className="relative overflow-hidden rounded-2xl bg-primary/10">
          <Confetti />
          <p className="pop relative flex items-center justify-center gap-2 p-4 text-center font-display text-lg font-bold">
            <Trophy aria-hidden className="h-6 w-6 text-primary" />
            Sempurna! Semua jawabanmu tepat.
            <PartyPopper aria-hidden className="h-6 w-6 text-primary" />
          </p>
        </div>
      )}
      {finished && right < total && (
        <p className="enter rounded-2xl bg-ground-muted p-4 text-center text-sm font-semibold">
          Bagian ini ditandai selesai. Baca lagi penjelasannya kalau ada yang kurang tepat.
        </p>
      )}
    </section>
  );
}
