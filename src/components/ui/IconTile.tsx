import type { LucideIcon } from "lucide-react";

const SIZES = {
  sm: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
  md: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
  lg: { box: "h-16 w-16 rounded-2xl", icon: "h-8 w-8" },
} as const;

/** Ikon di dalam kotak berwarna lembut. Ukuran ikon dibuat seragam agar semua tile terlihat rapi. */
export function IconTile({
  icon: Icon,
  tint,
  color = "var(--dp-color-ink)",
  size = "md",
  className = "",
}: {
  icon: LucideIcon;
  tint: string;
  color?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center ${s.box} ${className}`}
      style={{ background: tint, color }}
    >
      <Icon className={s.icon} strokeWidth={2} />
    </span>
  );
}
