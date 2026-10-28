"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const SPRING = { type: "spring" as const, stiffness: 110, damping: 18 };

/** Anel que se fecha. Um sol suave cresce no centro conforme você avança. */
export function Ring({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const done = frac >= 1;
  const minFrac = habit.minimum / habit.target;
  const showMin = minFrac > 0 && minFrac < 1;
  const a = minFrac * Math.PI * 2 - Math.PI / 2;

  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <circle cx="48" cy="48" r="38" fill="none" stroke="var(--line)" strokeWidth="8" />
      {/* sol interno */}
      <motion.circle
        cx="48"
        cy="48"
        fill={accentSoft(habit.accent, done ? 42 : 26)}
        initial={false}
        animate={{ r: 4 + frac * 28 }}
        transition={SPRING}
      />
      {/* arco de progresso */}
      <motion.circle
        cx="48"
        cy="48"
        r="38"
        fill="none"
        stroke={accentColor(habit.accent)}
        strokeWidth="8"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        initial={false}
        animate={{ pathLength: frac, opacity: value > 0 ? 1 : 0 }}
        transition={SPRING}
      />
      {/* onde a meta mínima fica */}
      {showMin && (
        <circle
          cx={48 + 38 * Math.cos(a)}
          cy={48 + 38 * Math.sin(a)}
          r="3.2"
          fill="var(--surface)"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
      )}
      {/* check quando a meta é atingida */}
      <motion.path
        d="M37 49 L45 57 L60 39"
        fill="none"
        stroke={accentColor(habit.accent)}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      />
      {bursts.map((b) => (
        <motion.circle
          key={b.id}
          cx="48"
          cy="48"
          fill="none"
          stroke={accentColor(habit.accent)}
          strokeWidth="2"
          initial={{ r: 40, opacity: 0.6 }}
          animate={{ r: 58, opacity: 0 }}
          transition={{ duration: 0.8, delay: b.delay, ease: "easeOut" }}
          onAnimationComplete={() => onBurstDone(b.id)}
        />
      ))}
    </svg>
  );
}
