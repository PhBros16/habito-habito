"use client";

import { useState } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf, stagesOf } from "@/lib/types";
import { LevelBadge, accentColor, accentSoft, type HabitViewProps } from "./shared";

export function StampCheck({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const stages = stagesOf(habit);
  const level = levelOf(habit, value);
  const done = value >= stages; // selo completo
  const [pulse, setPulse] = useState(0);
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const set = (next: number) => {
    if (readOnly) return;
    const clamped = Math.max(0, Math.min(stages, next));
    if (clamped === value) return;
    onChange(clamped);
    setPulse((p) => p + 1);
    // o "bater" do carimbo
    if (clamped > 0 && scope.current) {
      animate(scope.current, { scale: [1.22, 1], rotate: [-8, 0] }, { type: "spring", stiffness: 420, damping: 15 });
    }
    if (clamped === 0) fb("unstamp", 6);
    else if (clamped === stages) fb("stamp2", 16);
    else fb("stamp", 12);
  };

  // toque no selo: avança 0 → 1 → 2 e, ao final, volta a 0
  const cycle = () => set(value >= stages ? 0 : value + 1);

  const labels = [habit.minLabel ?? "Mínimo", habit.idealLabel ?? "Ideal"];

  return (
    <div className="flex items-center gap-5">
      <motion.button
        type="button"
        onClick={cycle}
        whileTap={{ scale: 0.92 }}
        aria-pressed={value > 0}
        aria-label={done ? "Desmarcar" : "Marcar como feito"}
        className="relative shrink-0"
        style={{ width: 96, height: 96 }}
      >
        <div ref={scope} className="h-full w-full">
        <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
          {/* trilho */}
          <circle cx="48" cy="48" r="38" fill="none" stroke="var(--line)" strokeWidth="6" />
          {/* progresso dos estágios */}
          <motion.circle
            cx="48"
            cy="48"
            r="38"
            fill="none"
            stroke={accentColor(habit.accent)}
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            initial={false}
            animate={{ pathLength: value / stages, opacity: value > 0 ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          {/* marca do meio do caminho (estágio mínimo) */}
          {stages === 2 && (
            <circle cx="48" cy="86" r="2.4" fill={value >= 1 ? accentColor(habit.accent) : "var(--muted)"} opacity={value >= 1 ? 0 : 0.5} />
          )}
          {/* disco do carimbo */}
          <motion.circle
            cx="48"
            cy="48"
            r="29"
            fill={accentColor(habit.accent)}
            initial={false}
            animate={{ scale: done ? 1 : 0, opacity: done ? 1 : 0 }}
            style={{ transformOrigin: "48px 48px", transformBox: "fill-box" }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          />
          {/* ondas de tinta a cada toque */}
          <AnimatePresence>
            <motion.circle
              key={pulse}
              cx="48"
              cy="48"
              fill="none"
              stroke={accentColor(habit.accent)}
              strokeWidth="2"
              initial={{ r: 30, opacity: pulse ? 0.55 : 0 }}
              animate={{ r: 52, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </AnimatePresence>
          {/* check desenhado */}
          <motion.path
            d="M33 49 L43 59 L63 37"
            fill="none"
            stroke={done ? "var(--surface)" : accentColor(habit.accent)}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: value > 0 ? 1 : 0, opacity: value > 0 ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        </div>
      </motion.button>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <LevelBadge level={level} accent={habit.accent} />
        {stages === 2 ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((stage) => {
              const active = value >= stage;
              return (
                <motion.button
                  key={stage}
                  type="button"
                  disabled={readOnly}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => set(active ? stage - 1 : stage)}
                  className="flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-left text-sm transition-colors"
                  style={{
                    borderColor: active ? accentColor(habit.accent) : "var(--line)",
                    background: active ? accentSoft(habit.accent, 14) : "transparent",
                  }}
                >
                  <span
                    className="grid h-4 w-4 shrink-0 place-items-center rounded-full border"
                    style={{
                      borderColor: active ? accentColor(habit.accent) : "var(--line)",
                      background: active ? accentColor(habit.accent) : "transparent",
                    }}
                  >
                    {active && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="block h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--surface)" }}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{labels[stage - 1]}</span>
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    {stage === 1 ? "mínimo" : "ideal"}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">{done ? "Feito por hoje." : "Toque no selo para concluir."}</p>
        )}
      </div>
    </div>
  );
}
