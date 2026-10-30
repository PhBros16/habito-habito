"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const STARS: [number, number, number][] = [
  [16, 20, 1],
  [80, 16, 0.8],
  [86, 56, 1.1],
  [12, 66, 0.9],
  [72, 92, 0.8],
  [26, 90, 1],
];
const STAR = "M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3 Z";
const SPRING = { type: "spring" as const, stiffness: 90, damping: 16 };

/** Lua que vai de fina a cheia; estrelas surgem a cada passo e caem quando você volta. */
export function Moon({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const id = useId();
  const accent = accentColor(habit.accent);
  const stars = value > 0 ? Math.max(1, Math.round(frac * STARS.length)) : 0;

  return (
    <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
      <defs>
        <mask id={id}>
          <rect width="96" height="104" fill="white" />
          <motion.circle cy="54" r="26" fill="black" initial={false} animate={{ cx: 48 + frac * 58 }} transition={SPRING} />
        </mask>
      </defs>
      <motion.circle cx="48" cy="54" fill={accentSoft(habit.accent, 14)} initial={false} animate={{ r: 28 + frac * 12 }} transition={SPRING} />
      <circle cx="48" cy="54" r="26" fill="none" stroke="var(--ink)" strokeOpacity="0.16" strokeDasharray="2 4" strokeLinecap="round" />
      <circle cx="48" cy="54" r="26" fill={accent} mask={`url(#${id})`} />

      <AnimatePresence>
        {STARS.slice(0, stars).map(([x, y, k], i) => (
          <motion.g
            key={i}
            style={{ x, y }}
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], rotate: 0, opacity: 1 }}
            exit={{ x: x - 14, y: y + 38, scale: 0.3, opacity: 0, rotate: -80, transition: { duration: 0.6, ease: "easeIn" } }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <g transform={`scale(${k})`}>
              <motion.path
                d={STAR}
                fill={accent}
                animate={{ opacity: [1, 0.45, 1], scale: [1, 0.82, 1] }}
                transition={{ duration: 2.4 + i * 0.35, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            </g>
          </motion.g>
        ))}
      </AnimatePresence>

      {bursts.map((b) => (
        <motion.circle
          key={b.id}
          cx="48"
          cy="54"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          initial={{ r: b.dir > 0 ? 28 : 46, opacity: b.dir > 0 ? 0.6 : 0.45 }}
          animate={{ r: b.dir > 0 ? 46 : 28, opacity: 0 }}
          transition={{ duration: 0.85, delay: b.delay, ease: "easeOut" }}
          onAnimationComplete={() => onBurstDone(b.id)}
        />
      ))}
    </svg>
  );
}
