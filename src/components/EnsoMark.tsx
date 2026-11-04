"use client";

import { motion } from "motion/react";

/** O círculo enso: desenhado num gesto só e deixado aberto. */
export function EnsoMark({ size = 160, draw = true }: { size?: number; draw?: boolean }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} fill="none" aria-hidden>
      <motion.path
        d="M118 38 C 96 16, 52 18, 34 52 C 16 88, 38 134, 82 138 C 120 141, 146 112, 140 78"
        stroke="var(--ink)"
        strokeWidth="9"
        strokeLinecap="round"
        initial={draw ? { pathLength: 0, opacity: 0.2 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.1, ease: [0.45, 0, 0.2, 1] }}
      />
      <motion.circle
        cx="124"
        cy="42"
        r="4.5"
        fill="var(--sage)"
        initial={draw ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 300, damping: 12 }}
      />
    </svg>
  );
}
