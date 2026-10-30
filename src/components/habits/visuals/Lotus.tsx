"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const PETALS = 7;
const ANGLES = [-72, -48, -24, 0, 24, 48, 72];
// ordem em que as pétalas abrem: do meio para fora
const ORDER = [3, 2, 4, 1, 5, 0, 6];
const SPRING = { type: "spring" as const, stiffness: 90, damping: 13 };

/** Flor de lótus que abre pétala por pétala e fecha devagar quando você volta. */
export function Lotus({ habit, value, frac }: VisualProps) {
  const accent = accentColor(habit.accent);
  const open = value > 0 ? Math.max(1, Math.round(frac * PETALS)) : 0;
  const bloom = frac >= 1;
  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      {/* água */}
      <ellipse cx="48" cy="84" rx="40" ry="9" fill={accentSoft(habit.accent, 14)} />
      <motion.ellipse cx="48" cy="84" fill="none" stroke={accent} strokeWidth="1.2" initial={false}
        animate={{ rx: [20, 36], ry: [4, 8], opacity: [0.5, 0] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }} />
      {/* brilho do florescer */}
      <motion.circle cx="48" cy="56" fill="var(--sun)" initial={false} animate={{ r: bloom ? 34 : 6, opacity: bloom ? 0.22 : 0 }} transition={SPRING} />
      {/* pétalas */}
      {ANGLES.map((angle, i) => {
        const isOpen = ORDER.indexOf(i) < open;
        const len = 30 - Math.abs(angle) * 0.14;
        return (
          <motion.g key={i} style={{ transformOrigin: "48px 80px" }} initial={false}
            animate={{ rotate: isOpen ? angle : angle * 0.15, scale: isOpen ? 1 : 0.55, opacity: isOpen ? 1 : 0.3 }} transition={{ ...SPRING, delay: isOpen ? ORDER.indexOf(i) * 0.04 : 0 }}>
            <path d={`M48 80 C 38 ${80 - len * 0.5}, 42 ${80 - len}, 48 ${80 - len} C 54 ${80 - len}, 58 ${80 - len * 0.5}, 48 80 Z`}
              fill={i === 3 ? accent : accentSoft(habit.accent, 70)} stroke={accent} strokeOpacity="0.5" strokeWidth="1" />
          </motion.g>
        );
      })}
      <circle cx="48" cy="80" r="3.2" fill="var(--sun)" />
    </svg>
  );
}
