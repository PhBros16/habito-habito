"use client";

import { useEffect, useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf } from "@/lib/types";
import {
  AnimatedNumber,
  LevelBadge,
  accentColor,
  accentSoft,
  type HabitViewProps,
} from "./shared";

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

export function GlassCounter({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const clipId = useId();
  const frac = Math.min(value / habit.target, 1);
  const level = levelOf(habit, value);
  const over = Math.max(0, value - habit.target);

  // nível com mola + onda contínua
  const lvl = useSpring(frac, { stiffness: 70, damping: 15, mass: 0.9 });
  const phase = useMotionValue(0);
  useEffect(() => lvl.set(frac), [frac, lvl]);
  useAnimationFrame((t) => phase.set(t / 650));

  const front = useTransform([lvl, phase], ([l, p]: number[]) => wavePath(l, p, 2.8));
  const back = useTransform([lvl, phase], ([l, p]: number[]) => wavePath(l, p, 2.2, 1.6));

  // bolhas ao adicionar
  const [bubbles, setBubbles] = useState<{ id: number; x: number; rise: number }[]>([]);
  const addBubbles = () => {
    const base = Date.now();
    setBubbles((b) => [
      ...b,
      ...[0, 1, 2].map((i) => ({
        id: base + i,
        x: 30 + Math.random() * 36,
        rise: 30 + Math.random() * 40,
      })),
    ]);
  };

  const add = () => {
    if (readOnly) return;
    onChange(value + 1);
    addBubbles();
    fb("plink", 10);
  };
  const remove = () => {
    if (readOnly || value <= 0) return;
    onChange(value - 1);
    fb("drain", 6);
  };

  return (
    <div className="flex items-center gap-5">
      <motion.button
        type="button"
        onClick={add}
        whileTap={{ scale: 0.96, rotate: -2 }}
        aria-label={`Adicionar 1 ${habit.unit}`}
        className="relative shrink-0"
        style={{ width: 96, height: 132 }}
      >
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
            <AnimatePresence>
              {bubbles.map((b) => (
                <motion.circle
                  key={b.id}
                  cx={b.x}
                  r={2.4}
                  fill="var(--surface)"
                  initial={{ cy: 116, opacity: 0.9 }}
                  animate={{ cy: 116 - b.rise, opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                  onAnimationComplete={() =>
                    setBubbles((cur) => cur.filter((x) => x.id !== b.id))
                  }
                />
              ))}
            </AnimatePresence>
          </g>
          {/* brilho e contorno do vidro */}
          <path d="M20 14 L24 108" stroke="white" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
          <path d={GLASS} fill="none" stroke="var(--ink)" strokeOpacity="0.22" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        {over > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-2 -top-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: accentColor(habit.accent), color: "var(--surface)" }}
          >
            +{over}
          </motion.span>
        )}
      </motion.button>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber value={value} className="font-display text-5xl leading-none" />
          <span className="text-sm text-muted">
            / {habit.target} {habit.unit}
          </span>
        </div>
        <LevelBadge level={level} accent={habit.accent} />
        {!readOnly && (
          <div className="mt-1 flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={remove}
              disabled={value <= 0}
              aria-label={`Remover 1 ${habit.unit}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-opacity disabled:opacity-30"
            >
              <MinusIcon />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={add}
              aria-label={`Adicionar 1 ${habit.unit}`}
              className="grid h-10 flex-1 place-items-center rounded-full"
              style={{ background: accentColor(habit.accent), color: "var(--surface)" }}
            >
              <PlusIcon />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
