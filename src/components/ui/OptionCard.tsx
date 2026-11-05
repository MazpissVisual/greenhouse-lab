import type { ReactNode } from "react";
import { ArrowDown, ArrowLeftRight, ArrowUp, Equal, Shuffle, type LucideIcon } from "lucide-react";
import type { OptionIcon } from "@/features/experiments/data";

const ICONS: Record<OptionIcon, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: ArrowLeftRight,
  equal: Equal,
  shuffle: Shuffle,
};

/** Pilihan jawaban berbentuk kartu. Tetap <input type="radio"> asli (keyboard & pembaca layar). */
export function OptionCard(props: {
  name: string;
  checked: boolean;
  onChange: () => void;
  icon?: OptionIcon;
  tone?: "ok" | "warn";
  children: ReactNode;
}) {
  const { name, checked, onChange, icon, tone, children } = props;
  const Icon = icon ? ICONS[icon] : null;
  const toneClass =
    tone === "ok"
      ? "!border-success !bg-success/10 bump"
      : tone === "warn"        ? "!border-warning !bg-warning/10 shake"
        : "";
  return (
    <label className="block cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`flex items-center gap-3 rounded-2xl border-2 border-border bg-white px-4 py-3 text-[15px] font-medium shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-md peer-checked:[&_.dot]:border-primary peer-checked:[&_.dot]:bg-primary peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${toneClass}`}
      >
        {Icon && (
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ground-muted text-primary">
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </span>
        )}
        <span className="flex-1">{children}</span>
        <span aria-hidden className="dot h-5 w-5 shrink-0 rounded-full border-2 border-border" />
      </span>
    </label>
  );
}
