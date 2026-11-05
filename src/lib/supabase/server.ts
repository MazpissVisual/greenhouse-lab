import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Klien Supabase atas nama pengguna yang login (RLS berlaku). Untuk peneliti/admin. */
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          try {
            for (const { name, value, options } of list) store.set(name, value, options);
          } catch {
            // dipanggil dari Server Component; abaikan
          }
        },
      },
    },
  );
}
