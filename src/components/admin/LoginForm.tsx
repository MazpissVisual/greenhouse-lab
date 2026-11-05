"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username"
          className="mt-1 w-full field" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password"
          className="mt-1 w-full field" />
      </div>
      {state.error && <p role="alert" className="text-sm text-error">{state.error}</p>}
      <button type="submit" disabled={pending}
        className="w-full btn btn-primary">
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
