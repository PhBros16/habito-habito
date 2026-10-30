"use client";

import { AnimatePresence, motion } from "motion/react";
import { accentColor } from "../shared";
import type { VisualProps } from "./types";

const ROWS = 8;
const BODY = "M26 20 H70 Q77 20 77 28 V92 Q77 101 68 101 H28 Q19 101 19 92 V28 Q19 20 26 20 Z";

function Coin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="12" ry="4.6" fill="color-mix(in srgb, var(--ink) 22%, transparent)" />
      <ellipse cx="0" cy="0" rx="12" ry="4.6" fill={color} />
      <ellipse cx="0" cy="0" rx="7.5" ry="2.6" fill="none" stroke="var(--surface)" strokeOpacity="0.55" strokeWidth="1" />
    </g>
  );
}

/** Pote onde moedas caem a cada toque. Ao voltar, uma moeda salta de dentro dele. */
export function Jar({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const color = accentColor(habit.accent);
  const rows = value > 0 ? Math.max(1, Math.ceil(frac * ROWS)) : 0;

  return (
    <svg viewBox="0 0 96 112" width="96" height="112" className="overflow-visible">
      <path d={BODY} fill="color-mix(in srgb, var(--ink) 4%, transparent)" />

      <AnimatePresence>
        {Array.from({ length: rows }, (_, i) => (
          <motion.g
            key={i}
            initial={{ y: -70, opacity: 0, rotate: -12 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -54, opacity: 0, scale: 0.8, transition: { duration: 0.4, ease: "easeOut" } }}
            transition={{ type: "spring", stiffness: 210, damping: 14, mass: 0.7 }}
          >
            <Coin x={i % 2 ? 40 : 37} y={94 - i * 9.4} color={color} />
            <Coin x={i % 2 ? 58 : 61} y={94 - i * 9.4} color={color} />
          </motion.g>
        ))}
      </AnimatePresence>

      {/* brilho, contorno e tampa */}
      <path d="M26 30 L26 88" stroke="white" strokeOpacity="0.4" strokeWidth="2.4" strokeLinecap="round" />
      <path d={BODY} fill="none" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinejoin="round" />
      <rect x="24" y="10" width="48" height="10" rx="4" fill="color-mix(in srgb, var(--ink) 16%, var(--surface))" stroke="var(--ink)" strokeOpacity="0.2" />

      {bursts.map((b) =>
        b.dir > 0 ? (
          <g key={b.id}>
            {[0, 1, 2].map((i) => (
              <motion.line
                key={i}
                x1="48"
                x2="48"
                y1="-4"
                y2="4"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transformOrigin: "48px 96px", rotate: -50 + i * 50, x: 0, y: 0 }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.4, 1.6] }}
                transition={{ duration: 0.5, delay: b.delay + 0.25 }}
                onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
              />
            ))}
          </g>
        ) : (
          <motion.g
            key={b.id}
            initial={{ x: 48, y: 22, opacity: 1, rotate: 0 }}
            animate={{ x: 48 + (b.r[0] - 0.5) * 70, y: [22, -14, 40], opacity: [1, 1, 0], rotate: 320 }}
            transition={{ duration: 0.9, delay: b.delay, ease: "easeOut" }}
            onAnimationComplete={() => onBurstDone(b.id)}
          >
            <Coin x={0} y={0} color={color} />
          </motion.g>
        )
      )}
    </svg>
  );
}
