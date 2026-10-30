"use client";

import { AnimatePresence, motion } from "motion/react";
import { accentColor } from "../shared";
import type { VisualProps } from "./types";

const PLATES = 5;

/** Barra de treino: uma anilha encaixa de cada lado a cada passo e sai quando você volta. */
export function Weights({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const color = accentColor(habit.accent);
  const n = value > 0 ? Math.max(1, Math.ceil(frac * PLATES)) : 0;
  const sag = 1 + frac * 5;

  return (
    <svg viewBox="0 0 112 96" width="112" height="96" className="overflow-visible">
      {/* barra com leve curva sob o peso */}
      <motion.path
        d="M6 48 Q56 50 106 48"
        fill="none"
        stroke="color-mix(in srgb, var(--ink) 38%, var(--surface))"
        strokeWidth="4.5"
        strokeLinecap="round"
        initial={false}
        animate={{ d: `M6 48 Q56 ${48 + sag} 106 48` }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      />
      {/* pegadas das mãos */}
      <rect x="44" y="45.5" width="24" height="5" rx="2.5" fill="color-mix(in srgb, var(--ink) 20%, var(--surface))" />

      <AnimatePresence>
        {Array.from({ length: n }, (_, k) =>
          [-1, 1].map((side) => {
            const h = 44 - k * 7;
            const x = side < 0 ? 36 - k * 8 : 76 + k * 8;
            return (
              <motion.g
                key={`${k}${side}`}
                initial={{ x: side * 26, opacity: 0 }}
                animate={{ x: 0, opacity: 0.95 - k * 0.1 }}
                exit={{ x: side * 30, opacity: 0, transition: { duration: 0.32, ease: "easeIn" } }}
                transition={{ type: "spring", stiffness: 380, damping: 17 }}
              >
                <rect x={x - 3} y={48 - h / 2} width={6} height={h} rx={2.2} fill={color} />
              </motion.g>
            );
          })
        )}
      </AnimatePresence>

      {/* travas das anilhas */}
      {[34, 78].map((x) => (
        <rect key={x} x={x} y="44" width="3" height="8" rx="1.2" fill="var(--ink)" opacity="0.4" />
      ))}

      {bursts.map((b) => (
        <g key={b.id}>
          {[-1, 1].map((side) => (
            <motion.path
              key={side}
              d={b.dir > 0 ? "M0 -8 L0 -14 M-6 -5 L-10 -9 M6 -5 L10 -9" : "M0 8 L0 13 M-5 6 L-8 10 M5 6 L8 10"}
              fill="none"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{ x: side < 0 ? 33 : 79, y: 48 }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 1.3] }}
              transition={{ duration: 0.45, delay: b.delay + 0.1 }}
              onAnimationComplete={side === 1 ? () => onBurstDone(b.id) : undefined}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
