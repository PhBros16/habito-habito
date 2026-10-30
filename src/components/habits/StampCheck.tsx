"use client";

import { useState } from "react";
import { motion, useAnimate } from "motion/react";
import { useFeedback } from "@/lib/useFeedback";
import { levelOf, stagesOf, visualOf, type CheckVisualKey } from "@/lib/types";
import { LevelBadge, accentColor, accentSoft, type HabitViewProps } from "./shared";
import { CHECK_VISUALS } from "./checkVisuals";

export function StampCheck({ habit, value, onChange, readOnly }: HabitViewProps) {
  const fb = useFeedback();
  const stages = stagesOf(habit);
  const level = levelOf(habit, value);
  const done = value >= stages; // selo completo
  const [pulse, setPulse] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const key = visualOf(habit) as CheckVisualKey;
  const { Component: Visual, on, off } = CHECK_VISUALS[key];
  const [scope, animate] = useAnimate<HTMLDivElement>();

  const set = (next: number) => {
    if (readOnly) return;
    const clamped = Math.max(0, Math.min(stages, next));
    if (clamped === value) return;
    const up = clamped > value;
    onChange(clamped);
    setPulse((p) => p + 1);
    setDir(up ? 1 : -1);
    // avançar: o visual "bate" com um solavanco; voltar: afunda de leve e se assenta
    if (scope.current) {
      if (up) animate(scope.current, { scale: [1.22, 1], rotate: [-8, 0] }, { type: "spring", stiffness: 420, damping: 15 });
      else animate(scope.current, { scale: [0.86, 1], rotate: [5, 0] }, { type: "spring", stiffness: 300, damping: 16 });
    }
    if (key === "stamp") {
      if (clamped === 0) fb("unstamp", 6);
      else if (clamped === stages) fb("stamp2", 16);
      else fb("stamp", 12);
    } else fb((up ? on : off) as never, up ? 12 : 6);
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
        <div ref={scope} className="grid h-full w-full place-items-center">
          <Visual habit={habit} value={value} stages={stages} pulse={pulse} dir={dir} />
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
