"use client";

import { useAnimatedValue } from "@/hooks/useAnimatedValue";

/** Angka yang berhitung halus saat nilainya berubah. */
export function AnimatedNumber({
  value,
  decimals = 1,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const v = useAnimatedValue(value);
  return <span className={className}>{v.toFixed(decimals)}</span>;
}
