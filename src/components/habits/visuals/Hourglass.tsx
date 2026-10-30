"use client";

import { useId } from "react";
import { motion, useAnimate } from "motion/react";
import { accentColor } from "../shared";
import { useBurstEffect } from "./useBurst";
import type { VisualProps } from "./types";

const GLASS =
  "M26 14 H70 C70 36 54 45 54 52 C54 59 70 68 70 90 H26 C26 68 42 59 42 52 C42 45 26 36 26 14 Z";
const SPRING = { type: "spring" as const, stiffness: 60, damping: 14 };

/** Ampulheta: a areia passa para baixo conforme o tempo acumula; ao voltar, ela escorre para cima. */
export function Hourglass({ habit, frac, bursts, onBurstDone }: VisualProps) {
  const id = useId();
  const color = accentColor(habit.accent);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useBurstEffect(bursts, (b) => {
    if (!scope.current) return;
    const kick = b.dir > 0 ? [0, 4, -3, 0] : [0, -14, 9, -4, 0];
    void animate(scope.current, { rotate: kick }, { duration: b.dir > 0 ? 0.45 : 0.9, delay: b.delay, ease: "easeInOut" });
  });

  const topH = 36 * (1 - frac);
  const botH = 38 * frac;

  return (
    <div ref={scope} style={{ transformOrigin: "50% 55%" }}>
      <svg viewBox="0 0 96 104" width="96" height="104" className="overflow-visible">
        <defs>
          <clipPath id={id}>
            <path d={GLASS} />
          </clipPath>
        </defs>
        <path d={GLASS} fill="color-mix(in srgb, var(--ink) 4%, transparent)" />
        <g clipPath={`url(#${id})`}>
          {/* areia de cima */}
          <motion.rect x="20" width="56" fill={color} opacity={0.5} initial={false} animate={{ y: 14 + (36 - topH), height: topH + 1 }} transition={SPRING} />
          {/* monte de areia embaixo */}
          <motion.rect x="20" width="56" fill={color} opacity={0.85} initial={false} animate={{ y: 90 - botH, height: botH }} transition={SPRING} />
          {/* fio de areia durante o movimento */}
          {bursts.map((b) =>
            b.dir > 0 ? (
              <motion.line
                key={b.id}
                x1="48"
                x2="48"
                y1="50"
                y2="88"
                stroke={color}
                strokeWidth="1.8"
                strokeDasharray="2 3"
                initial={{ opacity: 0, strokeDashoffset: 0 }}
                animate={{ opacity: [0, 1, 1, 0], strokeDashoffset: -30 }}
                transition={{ duration: 0.9, delay: b.delay }}
                onAnimationComplete={() => onBurstDone(b.id)}
              />
            ) : (
              <g key={b.id}>
                {[0, 1, 2, 3].map((i) => (
                  <motion.circle
                    key={i}
                    cx={46 + b.r[i] * 4}
                    r={1.5}
                    fill={color}
                    initial={{ cy: 86, opacity: 0.9 }}
                    animate={{ cy: 20, opacity: 0 }}
                    transition={{ duration: 0.9, delay: b.delay + i * 0.1, ease: "easeOut" }}
                    onAnimationComplete={i === 3 ? () => onBurstDone(b.id) : undefined}
                  />
                ))}
              </g>
            )
          )}
        </g>
        <path d="M30 18 L34 32" stroke="white" strokeOpacity="0.45" strokeWidth="2.2" strokeLinecap="round" />
        <path d={GLASS} fill="none" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinejoin="round" />
        <rect x="20" y="8" width="56" height="7" rx="3.5" fill="color-mix(in srgb, var(--clay) 60%, var(--surface))" />
        <rect x="20" y="89" width="56" height="7" rx="3.5" fill="color-mix(in srgb, var(--clay) 60%, var(--surface))" />
      </svg>
    </div>
  );
}
