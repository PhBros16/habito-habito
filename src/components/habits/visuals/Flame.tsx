"use client";

import { motion } from "motion/react";
import { accentColor } from "../shared";
import type { VisualProps } from "./types";

const OUTER = "M48 14 C 58 34, 76 48, 72 70 C 69 86, 59 92, 48 92 C 37 92, 27 86, 24 70 C 20 48, 38 34, 48 14 Z";
const INNER = "M48 44 C 55 56, 64 62, 62 76 C 60 85, 55 89, 48 89 C 41 89, 36 85, 34 76 C 32 62, 41 56, 48 44 Z";
const SPRING = { type: "spring" as const, stiffness: 90, damping: 12 };

/** Fogueira. Cresce a cada passo; ao voltar, a chama baixa soltando fumaça. */
export function Flame({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const accent = accentColor(habit.accent);
  const size = value > 0 ? 0.3 + frac * 0.7 : 0.1;

  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      <motion.ellipse
        cx="48"
        cy="90"
        fill={accent}
        initial={false}
        animate={{ rx: 12 + size * 26, ry: 4 + size * 5, opacity: 0.12 + size * 0.18 }}
        transition={SPRING}
      />
      <motion.g
        initial={false}
        animate={{ scale: size, opacity: value > 0 ? 1 : 0.55 }}
        transition={SPRING}
        style={{ transformOrigin: "48px 92px", transformBox: "view-box" }}
      >
        <motion.g
          animate={{ scaleY: [1, 1.05, 0.97, 1.03, 1], scaleX: [1, 0.97, 1.03, 0.98, 1], rotate: [0, -1.6, 1.4, -0.8, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "48px 92px", transformBox: "view-box" }}
        >
          <path d={OUTER} fill={accent} opacity={0.9} />
          <motion.path
            d={INNER}
            fill="var(--sun)"
            animate={{ opacity: [0.95, 0.7, 0.95] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        </motion.g>
      </motion.g>

      {/* lenha */}
      <rect x="20" y="90" width="56" height="9" rx="4.5" fill="color-mix(in srgb, var(--clay) 70%, var(--ink))" transform="rotate(-7 48 94)" />
      <rect x="20" y="90" width="56" height="9" rx="4.5" fill="color-mix(in srgb, var(--clay) 55%, var(--ink))" transform="rotate(7 48 94)" />

      {bursts.map((b) =>
        b.dir > 0 ? (
          <g key={b.id}>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                r={1.7 + b.r[i] * 1.2}
                fill="var(--sun)"
                initial={{ cx: 40 + b.r[i] * 16, cy: 64, opacity: 1 }}
                animate={{ cx: 34 + b.r[i + 3] * 28, cy: 8 - b.r[i] * 10, opacity: 0 }}
                transition={{ duration: 1 + b.r[i] * 0.5, delay: b.delay + i * 0.08, ease: "easeOut" }}
                onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
              />
            ))}
          </g>
        ) : (
          <g key={b.id}>
            {[0, 1].map((i) => (
              <motion.circle
                key={i}
                cx={46 + b.r[i] * 8}
                fill="var(--muted)"
                initial={{ cy: 56, r: 4, opacity: 0.4 }}
                animate={{ cy: 6, r: 11, opacity: 0 }}
                transition={{ duration: 1.3, delay: b.delay + i * 0.25, ease: "easeOut" }}
                onAnimationComplete={i === 1 ? () => onBurstDone(b.id) : undefined}
              />
            ))}
          </g>
        )
      )}
    </svg>
  );
}
