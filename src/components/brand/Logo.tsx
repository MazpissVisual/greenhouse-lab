import { useId } from "react";

/**
 * Tanda logo Greenhouse Lab: Matahari di dalam cincin orbit (atmosfer) pada kotak biru.
 * Bentuknya sama dengan ikon aplikasi (PWA) dan favicon agar mereknya konsisten.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  const gid = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f86ff" />
          <stop offset="75%" stopColor="#074ce0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gid})`} />
      <circle cx="16" cy="16" r="9.6" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="16" cy="16" r="4.4" fill="#ffd23f" />
    </svg>
  );
}

/** Logo lengkap: tanda + nama. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">Greenhouse Lab</span>
    </span>
  );
}
