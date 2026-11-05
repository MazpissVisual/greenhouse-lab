"use client";

import { useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from "react";

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  delay?: number;
  as?: "div" | "li" | "section";
}

/** Muncul halus (naik + memudar) saat masuk layar. Hanya sekali. Tanpa JS, konten tetap terlihat (lihat <noscript> di layout). */
export function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      const t = setTimeout(() => setShown(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      {...rest}
      ref={ref as never}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
