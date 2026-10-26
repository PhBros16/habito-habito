"use client";

import { AnimatePresence, motion } from "motion/react";
import type { AccentKey, Habit } from "@/lib/types";

export const accentColor = (a: AccentKey) => `var(--${a})`;
export const accentSoft = (a: AccentKey, pct = 14) =>
  `color-mix(in srgb, var(--${a}) ${pct}%, transparent)`;

export interface HabitViewProps {
  habit: Habit;
  value: number;
  onChange: (value: number) => void;
  /** disparado ao mudar de nível (para frases/celebração) */
  readOnly?: boolean;
}

/** Número que "rola" ao mudar. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 14, opacity: 0, filter: "blur(3px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -14, opacity: 0, filter: "blur(3px)" }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 32,
            filter: { type: "tween", duration: 0.2 },
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function LevelBadge({ level, accent }: { level: 0 | 1 | 2; accent: AccentKey }) {
  const label = level === 2 ? "Meta atingida" : level === 1 ? "Mínimo feito" : "Ainda não";
  return (
    <motion.span
      layout
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        background: level ? accentSoft(accent, level === 2 ? 22 : 14) : "var(--surface-2)",
        color: level ? accentColor(accent) : "var(--muted)",
      }}
    >
      <span className="flex gap-0.5">
        <i
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: level >= 1 ? accentColor(accent) : "var(--line)" }}
        />
        <i
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: level >= 2 ? accentColor(accent) : "var(--line)" }}
        />
      </span>
      {label}
    </motion.span>
  );
}
