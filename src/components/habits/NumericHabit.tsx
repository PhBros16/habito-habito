"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MinusIcon, PlusIcon } from "@/components/icons";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf, numericVisualOf } from "@/lib/types";
import {
  AnimatedNumber,
  LevelBadge,
  accentColor,
  accentSoft,
  type HabitViewProps,
} from "./shared";
import { VISUALS, stepsOf } from "./visuals";
import type { Burst } from "./visuals/types";

/** Hábito numérico (contar/acumular) com o visual escolhido. */
export function NumericHabit({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const visual = numericVisualOf(habit);
  const def = VISUALS[visual];
  const { Component } = def;
  const steps = stepsOf(habit);
  const frac = Math.min(value / habit.target, 1);
  const level = levelOf(habit, value);
  const over = Math.max(0, value - habit.target);

  const [bursts, setBursts] = useState<Burst[]>([]);
  // o "−" desfaz o último passo dado (tocou +10 sem querer? um toque no − volta os 10)
  const [lastStep, setLastStep] = useState(steps[0]);
  const seq = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const done = (id: number) => setBursts((cur) => cur.filter((b) => b.id !== id));

  const launch = (n: number, dir: 1 | -1) => {
    if (!def.bursts) return; // contas e pegadas se animam sozinhas pelo valor
    const count = n <= steps[0] ? 1 : n <= steps[0] * 5 ? 2 : 3;
    const next: Burst[] = Array.from({ length: count }, (_, i) => ({
      id: ++seq.current,
      r: Array.from({ length: 6 }, () => Math.random()),
      delay: i * 0.14,
      dir,
    }));
    setBursts((cur) => [...cur, ...next]);
    // rede de segurança: nenhuma rajada fica pendurada se a animação for interrompida
    next.forEach((b) => timers.current.push(setTimeout(() => done(b.id), 3200 + b.delay * 1000)));
  };

  const add = (n: number) => {
    if (readOnly) return;
    onChange(value + n);
    setLastStep(n);
    fb(def.add, 10);
    launch(n, 1);
  };

  const undo = Math.min(lastStep, value);
  const remove = () => {
    if (readOnly || value <= 0) return;
    onChange(Math.max(0, value - undo));
    fb(def.remove, 6);
    launch(undo, -1);
  };

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
        <AnimatePresence>
          {over > 0 && (
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: accentColor(habit.accent), color: "var(--surface)" }}
            >
              +{over}
            </motion.span>
          )}
        </AnimatePresence>
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
              layout
              whileTap={{ scale: 0.9 }}
              onClick={remove}
              disabled={value <= 0}
              aria-label={`Remover ${undo} ${habit.unit}`}
              className="flex h-9 shrink-0 items-center justify-center gap-0.5 rounded-full border border-line text-muted transition-opacity disabled:opacity-30"
              style={{ minWidth: 36, paddingInline: undo > 1 ? 10 : 0 }}
            >
              <MinusIcon />
              {undo > 1 && <span className="text-sm tabular-nums">{undo}</span>}
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
