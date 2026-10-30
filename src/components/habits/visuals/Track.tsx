"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const SPRING = { type: "spring" as const, stiffness: 55, damping: 14 };

/** Pista circular: a corredora dá a volta conforme o valor e corre de volta quando você remove. */
export function Track({ habit, value, frac }: VisualProps) {
  const accent = accentColor(habit.accent);
  const f = Math.min(1, frac);
  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      <circle cx="48" cy="54" r="38" fill="none" stroke={accentSoft(habit.accent, 18)} strokeWidth="14" />
      <circle cx="48" cy="54" r="38" fill="none" stroke="var(--ink)" strokeOpacity="0.14" strokeWidth="1.4" strokeDasharray="3 5" />
      <motion.circle
        cx="48"
        cy="54"
        r="38"
        fill="none"
        stroke={accent}
        strokeWidth="5"
        strokeLinecap="round"
        transform="rotate(-90 48 54)"
        initial={false}
        animate={{ pathLength: f, opacity: value > 0 ? 1 : 0 }}
        transition={SPRING}
      />
      {/* linha de largada */}
      <path d="M48 12 V30" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1.6" />
      {/* a corredora */}
      <motion.g style={{ transformOrigin: "48px 54px" }} initial={false} animate={{ rotate: f * 360 }} transition={SPRING}>
        <circle cx="48" cy="16" r="6.5" fill={accent} />
        <circle cx="48" cy="16" r="2.6" fill="var(--surface)" />
        <path d="M38 16 H30 M36 11 H30 M36 21 H31" stroke={accent} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
      {/* bandeira de chegada no centro */}
      <motion.g initial={false} animate={{ scale: f >= 1 ? 1 : 0.7, opacity: f >= 1 ? 1 : 0.35 }} style={{ transformOrigin: "48px 58px" }} transition={{ type: "spring", stiffness: 240, damping: 14 }}>
        <path d="M44 66 V42" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        <path d="M44 43 L60 48 L44 53 Z" fill={accent} />
      </motion.g>
    </svg>
  );
}
