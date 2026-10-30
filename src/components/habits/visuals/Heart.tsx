"use client";

import { useId } from "react";
import { motion, useAnimate } from "motion/react";
import { accentColor } from "../shared";
import { useBurstEffect } from "./useBurst";
import type { VisualProps } from "./types";

const HEART =
  "M48 86 C24 68 12 54 12 38 C12 26 21 18 32 18 C39 18 45 22 48 28 C51 22 57 18 64 18 C75 18 84 26 84 38 C84 54 72 68 48 86 Z";
const MINI = "M0 7 C-9 0 -8 -7 -3.5 -7 C-1.5 -7 0 -5.5 0 -4.5 C0 -5.5 1.5 -7 3.5 -7 C8 -7 9 0 0 7 Z";
const SPRING = { type: "spring" as const, stiffness: 70, damping: 13 };

/** Coração que se enche de carinho. Bate ao avançar e se acalma ao voltar. */
export function Heart({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const id = useId();
  const color = accentColor(habit.accent);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useBurstEffect(bursts, (b) => {
    if (!scope.current) return;
    const keys = b.dir > 0 ? [1, 1.14, 0.97, 1.08, 1] : [1, 0.88, 1];
    void animate(scope.current, { scale: keys }, { duration: b.dir > 0 ? 0.55 : 0.5, delay: b.delay, ease: "easeInOut" });
  });

  return (
    <div ref={scope}>
      <svg viewBox="0 0 96 100" width="96" height="100" className="overflow-visible">
        <defs>
          <clipPath id={id}>
            <path d={HEART} />
          </clipPath>
        </defs>
        <path d={HEART} fill="color-mix(in srgb, var(--ink) 4%, transparent)" />
        <g clipPath={`url(#${id})`}>
          <motion.rect x="0" width="96" height="90" fill={color} opacity={0.88} initial={false} animate={{ y: 86 - frac * 68 }} transition={SPRING} />
        </g>
        <motion.path
          d={HEART}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinejoin="round"
          style={{ transformOrigin: "48px 52px" }}
          animate={value > 0 ? { scale: [1, 1.035, 1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 2.2, repeat: value > 0 ? Infinity : 0, ease: "easeInOut" }}
        />
        <path d="M22 34 C 22 28, 27 25, 31 26" stroke="white" strokeOpacity="0.5" strokeWidth="2.6" strokeLinecap="round" fill="none" />

        {bursts.map((b) =>
          b.dir > 0 ? (
            <g key={b.id}>
              {[0, 1, 2].map((i) => (
                <motion.path
                  key={i}
                  d={MINI}
                  fill={color}
                  style={{ x: 30 + b.r[i] * 36 }}
                  initial={{ y: 40, scale: 0.4, opacity: 0.9 }}
                  animate={{ y: -8 - b.r[i + 3] * 14, scale: 0.9, opacity: 0 }}
                  transition={{ duration: 1.2 + b.r[i] * 0.4, delay: b.delay + i * 0.1, ease: "easeOut" }}
                  onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
                />
              ))}
            </g>
          ) : (
            <motion.path
              key={b.id}
              d={MINI}
              fill={color}
              style={{ x: 36 + b.r[0] * 24 }}
              initial={{ y: 50, scale: 0.8, opacity: 0.7 }}
              animate={{ y: 104, scale: 0.5, opacity: 0, rotate: 24 }}
              transition={{ duration: 1, delay: b.delay, ease: "easeIn" }}
              onAnimationComplete={() => onBurstDone(b.id)}
            />
          )
        )}
      </svg>
    </div>
  );
}
