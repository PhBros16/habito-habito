"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf } from "@/lib/types";
import {
  AnimatedNumber,
  LevelBadge,
  accentColor,
  accentSoft,
  type HabitViewProps,
} from "./shared";

const SLIVERS = 8;
const QUICK = [1, 5, 10];

export function PagesProgress({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const frac = Math.min(value / habit.target, 1);
  const level = levelOf(habit, value);
  const filled = Math.round(frac * SLIVERS);
  const [flips, setFlips] = useState<number[]>([]);

  const add = (n: number) => {
    if (readOnly) return;
    onChange(value + n);
    setFlips((f) => [...f, Date.now()]);
    fb("page", 8);
  };
  const remove = () => {
    if (readOnly || value <= 0) return;
    onChange(Math.max(0, value - 1));
    fb("tick", 4);
  };

  return (
    <div className="flex items-center gap-5">
      {/* livro */}
      <div className="relative shrink-0" style={{ width: 96, height: 112, perspective: 520 }}>
        {/* páginas empilhadas (a espessura cresce com o progresso) */}
        <div className="absolute inset-y-3 flex items-stretch" style={{ left: 34 }}>
          {Array.from({ length: SLIVERS }).map((_, i) => (
            <motion.i
              key={i}
              className="block"
              initial={false}
              animate={{
                opacity: i < filled ? 1 : 0.25,
                scaleY: i < filled ? 1 : 0.92,
                background: i < filled ? accentColor(habit.accent) : "var(--line)",
              }}
              transition={{ delay: i * 0.025, type: "spring", stiffness: 260, damping: 22 }}
              style={{
                width: 7,
                marginLeft: i === 0 ? 0 : 1,
                borderRadius: 2,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
        {/* capa */}
        <div
          className="absolute inset-y-1 left-0 w-9 rounded-l-xl rounded-r-sm border"
          style={{
            background: accentSoft(habit.accent, 18),
            borderColor: accentSoft(habit.accent, 45),
          }}
        >
          <div className="mx-auto mt-5 h-1 w-5 rounded-full" style={{ background: accentColor(habit.accent), opacity: 0.6 }} />
          <div className="mx-auto mt-1.5 h-1 w-3.5 rounded-full" style={{ background: accentColor(habit.accent), opacity: 0.35 }} />
        </div>
        {/* página que vira */}
        <AnimatePresence>
          {flips.map((id) => (
            <motion.div
              key={id}
              className="pointer-events-none absolute rounded-r-md border"
              style={{
                top: 6,
                bottom: 6,
                left: 34,
                width: 56,
                transformOrigin: "left center",
                background: "var(--surface)",
                borderColor: "var(--line)",
                backfaceVisibility: "hidden",
              }}
              initial={{ rotateY: 0, opacity: 1 }}
              animate={{ rotateY: -160, opacity: [1, 1, 0] }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              onAnimationComplete={() => setFlips((f) => f.filter((x) => x !== id))}
            />
          ))}
        </AnimatePresence>
        {/* marcador */}
        <motion.div
          className="absolute top-1 w-2 rounded-b-sm"
          style={{ left: 24, background: accentColor(habit.accent) }}
          initial={false}
          animate={{ height: 14 + frac * 70 }}
          transition={{ type: "spring", stiffness: 140, damping: 18 }}
        />
      </div>

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
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-base text-muted transition-opacity disabled:opacity-30"
            >
              −
            </motion.button>
            {QUICK.map((n) => (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => add(n)}
                aria-label={`Adicionar ${n} ${habit.unit}`}
                className="h-9 flex-1 rounded-full text-sm font-medium"
                style={{
                  background: accentSoft(habit.accent, 16),
                  color: accentColor(habit.accent),
                }}
              >
                +{n}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
