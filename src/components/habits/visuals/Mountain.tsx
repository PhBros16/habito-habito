"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const SPRING = { type: "spring" as const, stiffness: 60, damping: 14 };

/** Montanha: o alpinista sobe a cada passo, desce se você remover e planta a bandeira no topo. */
export function Mountain({ habit, value, frac }: VisualProps) {
  const accent = accentColor(habit.accent);
  const f = Math.min(1, frac);
  const x = 20 + f * 28; // base (20,86) -> topo (48,30)
  const y = 86 - f * 54;
  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      <path d="M4 90 L48 26 L92 90 Z" fill={accentSoft(habit.accent, 22)} />
      <path d="M48 26 L92 90 L66 90 L52 60 Z" fill={accentSoft(habit.accent, 34)} />
      <path d="M40 38 L48 26 L56 38 L51 36 L48 40 L45 36 Z" fill="var(--surface)" opacity="0.95" />
      <path d="M4 90 H92" stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="1.4" />
      {/* trilha */}
      <motion.path d="M20 86 L48 30" stroke={accent} strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" initial={false} animate={{ pathLength: f, opacity: value > 0 ? 0.8 : 0 }} transition={SPRING} />
      {/* bandeira */}
      <motion.g style={{ transformOrigin: "48px 28px" }} initial={false} animate={{ scale: f >= 1 ? 1 : 0, opacity: f >= 1 ? 1 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 12 }}>
        <path d="M48 28 V10" stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
        <motion.path d="M48 11 L62 15 L48 20 Z" fill={accent} animate={{ skewY: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
      </motion.g>
      {/* alpinista */}
      <motion.g initial={false} animate={{ x, y }} transition={SPRING}>
        <circle cx="0" cy="-5" r="4.6" fill={accent} />
        <circle cx="0" cy="-5" r="1.8" fill="var(--surface)" />
      </motion.g>
    </svg>
  );
}
