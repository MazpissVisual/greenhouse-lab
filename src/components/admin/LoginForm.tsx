"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, LogIn } from "lucide-react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-7 space-y-4">
      <div>
        <label htmlFor="code" className="mb-2 block text-sm font-semibold">
          Kode akses
        </label>
        <div className="relative">
          <KeyRound
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          />
          <input
            id="code"
            name="code"
            type={show ? "text" : "password"}
            inputMode="numeric"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            autoFocus
            maxLength={64}
            placeholder="••••••••••"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "code-error" : undefined}
            className="field h-14 w-full pl-12 pr-14 text-center font-mono text-xl tracking-[0.3em] placeholder:tracking-[0.3em]"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan kode" : "Tampilkan kode"}
            aria-pressed={show}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ground-muted hover:text-foreground"
          >
            {show ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p
          id="code-error"
          role="alert"
          key={state.error}
          className="shake rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-semibold text-error"
        >
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full">
        {pending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" />
            Memeriksa…
          </>
        ) : (
          <>
            <LogIn aria-hidden className="h-4 w-4" />
            Masuk
          </>
        )}
      </button>
    </form>
  );
}
