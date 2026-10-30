"use client";

import { AnimatePresence, motion } from "motion/react";
import { accentColor } from "../shared";
import type { VisualProps } from "./types";

const LEAF = "M0 0 Q 9 -9 19 -1 Q 9 7 0 0";
const SPRING = { type: "spring" as const, stiffness: 100, damping: 15 };
// altura (y) em que cada par de folhas nasce no caule, quando surge e seu tamanho
const PAIRS = [
  { y: 68, at: 0.001, size: 0.75 },
  { y: 56, at: 0.4, size: 0.95 },
  { y: 45, at: 0.7, size: 1.1 },
];

/** Broto que cresce em folhas e floresce na meta. Ao voltar, as folhas caem uma a uma. */
export function Plant({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const accent = accentColor(habit.accent);
  const green = "color-mix(in srgb, var(--sage) 82%, var(--ink))";
  const bloom = frac >= 1;

  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      {/* caule */}
      <motion.path
        d="M48 82 C 47 68, 50 56, 48 30"
        fill="none"
        stroke={green}
        strokeWidth="3.4"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: value > 0 ? 0.18 + frac * 0.82 : 0, opacity: value > 0 ? 1 : 0 }}
        transition={SPRING}
      />

      <AnimatePresence>
        {PAIRS.flatMap((p, i) =>
          value > 0 && frac >= p.at
            ? [-1, 1].map((side) => (
                <motion.g
                  key={`${i}${side}`}
                  style={{ x: 48, y: p.y }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{
                    x: 48 + side * 16,
                    y: p.y + 42,
                    rotate: side * 75,
                    opacity: 0,
                    scale: 0.8,
                    transition: { duration: 0.85, ease: [0.4, 0, 0.8, 0.6], delay: (2 - i) * 0.08 },
                  }}
                  transition={{ ...SPRING, delay: 0.05 * i }}
                >
                  <g transform={`scale(${side * p.size} ${p.size}) rotate(-18)`} style={{ transformOrigin: "0 0" }}>
                    <path d={LEAF} fill={green} opacity={0.92} />
                  </g>
                </motion.g>
              ))
            : []
        )}
      </AnimatePresence>

      {/* flor da meta */}
      <AnimatePresence>
        {bloom && (
          <motion.g
            key="flower"
            style={{ x: 48, y: 28 }}
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 120, opacity: 0, transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 140, damping: 12 }}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse key={i} cx="0" cy="-9" rx="5.2" ry="8" fill={accent} transform={`rotate(${i * 60})`} opacity={0.94} />
            ))}
            <circle r="5" fill="var(--sun)" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* vaso */}
      <path d="M28 82 H68 L63 100 Q62 102 60 102 H36 Q34 102 33 100 Z" fill="color-mix(in srgb, var(--clay) 62%, var(--surface))" />
      <rect x="25" y="79" width="46" height="6" rx="3" fill="color-mix(in srgb, var(--clay) 78%, var(--surface))" />

      {bursts.map((b) =>
        b.dir > 0 ? (
          <g key={b.id}>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={34 + b.r[i] * 28}
                r={2.2}
                fill="var(--water)"
                initial={{ cy: 2, opacity: 0.9 }}
                animate={{ cy: 80, opacity: [0.9, 0.9, 0] }}
                transition={{ duration: 0.8, delay: b.delay + i * 0.07, ease: "easeIn" }}
                onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
              />
            ))}
            <motion.ellipse
              cx="48"
              cy="82"
              fill="none"
              stroke="var(--water)"
              strokeWidth="1.6"
              initial={{ rx: 6, ry: 1.5, opacity: 0 }}
              animate={{ rx: 24, ry: 4, opacity: [0, 0.7, 0] }}
              transition={{ duration: 0.7, delay: b.delay + 0.6 }}
            />
          </g>
        ) : (
          <motion.ellipse
            key={b.id}
            cx="48"
            cy="82"
            fill="none"
            stroke={accent}
            strokeWidth="1.6"
            initial={{ rx: 26, ry: 4, opacity: 0.5 }}
            animate={{ rx: 8, ry: 1.5, opacity: 0 }}
            transition={{ duration: 0.7, delay: b.delay }}
            onAnimationComplete={() => onBurstDone(b.id)}
          />
        )
      )}
    </svg>
  );
}
