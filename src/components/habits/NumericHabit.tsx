"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf, visualOf, type VisualKey } from "@/lib/types";
import type { SoundName } from "@/lib/sound";
import {
  AnimatedNumber,
  LevelBadge,
  accentColor,
  accentSoft,
  type HabitViewProps,
} from "./shared";
import { VISUALS, stepsOf } from "./visuals";
import type { Burst } from "./visuals/types";

const ADD_SOUND: Record<VisualKey, SoundName> = {
  glass: "plink",
  book: "page",
  ring: "tick",
  beads: "pop",
};
const REMOVE_SOUND: Record<VisualKey, SoundName> = {
  glass: "drain",
  book: "tick",
  ring: "tick",
  beads: "tick",
};

/** Hábito numérico (contar/acumular) com o visual escolhido. */
export function NumericHabit({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const visual = visualOf(habit);
  const { Component } = VISUALS[visual];
  const steps = stepsOf(habit);
  const frac = Math.min(value / habit.target, 1);
  const level = levelOf(habit, value);
  const over = Math.max(0, value - habit.target);

  const [bursts, setBursts] = useState<Burst[]>([]);
  const seq = useRef(0);

  const add = (n: number) => {
    if (readOnly) return;
    onChange(value + n);
    fb(ADD_SOUND[visual], 10);
    if (visual === "beads") return; // as contas se animam sozinhas
    const count = n <= steps[0] ? 1 : n <= steps[0] * 5 ? 2 : 3;
    const next: Burst[] = Array.from({ length: count }, (_, i) => ({
      id: ++seq.current,
      r: Array.from({ length: 6 }, () => Math.random()),
      delay: i * 0.14,
    }));
    setBursts((cur) => [...cur, ...next]);
  };

  const remove = () => {
    if (readOnly || value <= 0) return;
    onChange(Math.max(0, value - steps[0]));
    fb(REMOVE_SOUND[visual], 6);
  };

  const done = (id: number) => setBursts((cur) => cur.filter((b) => b.id !== id));

  return (
    <div className="flex items-center gap-5">
      <motion.button
        type="button"
        onClick={() => add(steps[0])}
        whileTap={{ scale: 0.96 }}
        aria-label={`Adicionar ${steps[0]} ${habit.unit}`}
        className="relative grid shrink-0 place-items-center"
        style={{ width: 112, minHeight: 104 }}
      >
        <div data-visual={visual}>
          <Component habit={habit} value={value} frac={frac} bursts={bursts} onBurstDone={done} />
        </div>
        {over > 0 && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: accentColor(habit.accent), color: "var(--surface)" }}
          >
            +{over}
          </motion.span>
        )}
      </motion.button>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber value={value} className="font-display text-5xl leading-none" />
          <span className="truncate text-sm text-muted">
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
              aria-label={`Remover ${steps[0]} ${habit.unit}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-muted transition-opacity disabled:opacity-30"
            >
              <MinusIcon />
            </motion.button>
            {habit.kind === "counter" ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => add(1)}
                aria-label={`Adicionar 1 ${habit.unit}`}
                className="grid h-10 flex-1 place-items-center rounded-full"
                style={{ background: accentColor(habit.accent), color: "var(--surface)" }}
              >
                <PlusIcon />
              </motion.button>
            ) : (
              steps.map((n) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
