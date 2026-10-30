"use client";

import { useEffect, useId } from "react";
import {
  motion,
  useAnimate,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { accentColor, accentSoft } from "../shared";
import { useBurstEffect } from "./useBurst";
import type { VisualProps } from "./types";

const GLASS = "M10 6 H86 L79 116 Q78 124 70 124 H26 Q18 124 17 116 Z";
const TOP = 6;
const BOTTOM = 124;

function wavePath(level: number, phase: number, amp: number, offset = 0) {
  const y = BOTTOM - level * (BOTTOM - TOP);
  const a = level <= 0.001 ? 0 : amp;
  let d = `M0 ${y}`;
  for (let x = 0; x <= 96; x += 4) {
    d += ` L${x} ${(y + Math.sin((x / 96) * Math.PI * 2 + phase + offset) * a).toFixed(2)}`;
  }
  return `${d} L96 140 L0 140 Z`;
}

/** Copo com onda que enche a cada toque. */
export function Glass({ habit, frac, bursts, onBurstDone }: VisualProps) {
  const clipId = useId();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  useBurstEffect(bursts, (b) => {
    if (!scope.current) return;
    // adicionar: um golinho de balanço; remover: o copo inclina e despeja
    const kick = b.dir > 0 ? [0, 1.5, -1, 0] : [0, -9, 5, -2, 0];
    void animate(scope.current, { rotate: kick }, { duration: b.dir > 0 ? 0.45 : 0.8, delay: b.delay, ease: "easeInOut" });
  });
  const lvl = useSpring(frac, { stiffness: 70, damping: 15, mass: 0.9 });
  const phase = useMotionValue(0);
  useEffect(() => lvl.set(frac), [frac, lvl]);
  useAnimationFrame((t) => phase.set(t / 650));

  const front = useTransform([lvl, phase], ([l, p]: number[]) => wavePath(l, p, 2.8));
  const back = useTransform([lvl, phase], ([l, p]: number[]) => wavePath(l, p, 2.2, 1.6));

  // marcador discreto do nível mínimo (o "mini-hábito")
  const minFrac = habit.minimum / habit.target;
  const showMin = minFrac > 0 && minFrac < 1;
  const my = BOTTOM - minFrac * (BOTTOM - TOP);
  const t = (my - TOP) / (116 - TOP);
  const xl = 10 + 7 * t + 3;
  const xr = 86 - 7 * t - 3;

  return (
    <div ref={scope} style={{ transformOrigin: "50% 100%" }}>
    <svg viewBox="0 0 96 132" width="96" height="132" className="overflow-visible">
      <defs>
        <clipPath id={clipId}>
          <path d={GLASS} />
        </clipPath>
      </defs>
      <path d={GLASS} fill={accentSoft(habit.accent, 6)} />
      <g clipPath={`url(#${clipId})`}>
        <motion.path d={back} fill={accentColor(habit.accent)} opacity={0.35} />
        <motion.path d={front} fill={accentColor(habit.accent)} opacity={0.78} />
        {bursts.filter((b) => b.dir > 0).flatMap((b) =>
          [0, 1, 2].map((i) => (
            <motion.circle
              key={`${b.id}-${i}`}
              cx={30 + b.r[i] * 36}
              r={2.4}
              fill="var(--surface)"
              initial={{ cy: 116, opacity: 0.9 }}
              animate={{ cy: 116 - (30 + b.r[i + 3] * 40), opacity: 0 }}
              transition={{ duration: 1.1, delay: b.delay, ease: "easeOut" }}
              onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
            />
          ))
        )}
      </g>
      {/* gotas escorrendo quando você tira água */}
      {bursts
        .filter((b) => b.dir < 0)
        .map((b) => (
          <g key={b.id}>
            {[0, 1, 2].map((i) => (
              <motion.ellipse
                key={i}
                cx={26 + b.r[i] * 44}
                rx={2}
                ry={3}
                fill={accentColor(habit.accent)}
                initial={{ cy: 126, opacity: 0.85 }}
                animate={{ cy: 150, opacity: 0 }}
                transition={{ duration: 0.6, delay: b.delay + 0.1 + i * 0.09, ease: "easeIn" }}
                onAnimationComplete={i === 2 ? () => onBurstDone(b.id) : undefined}
              />
            ))}
          </g>
        ))}
      {showMin && (
        <line
          x1={xl}
          x2={xr}
          y1={my}
          y2={my}
          stroke="var(--ink)"
          strokeOpacity="0.28"
          strokeWidth="1.4"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />
      )}
      {/* brilho e contorno do vidro */}
      <path d="M20 14 L24 108" stroke="white" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
      <path d={GLASS} fill="none" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinejoin="round" />
    </svg>
    </div>
  );
}
