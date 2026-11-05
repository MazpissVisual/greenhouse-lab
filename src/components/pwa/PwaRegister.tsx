"use client";

import { useEffect } from "react";

/** Mendaftarkan service worker hanya di produksi; di dev justru dilepas agar tidak menyajikan cache lama. */
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // gagal mendaftar tidak boleh mengganggu pemakaian
    });
  }, []);
  return null;
}
