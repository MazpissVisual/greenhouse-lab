"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Tombol "Pasang" yang hanya muncul bila browser menawarkan pemasangan. */
export function InstallButton({ className = "" }: { className?: string }) {
  const [evt, setEvt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallPromptEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!evt) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }}
      className={`btn btn-secondary !min-h-9 !px-3 text-[13px] ${className}`}
    >
      <Download aria-hidden className="h-4 w-4" />
      Pasang
    </button>
  );
}
