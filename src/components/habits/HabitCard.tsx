"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { DotsIcon } from "@/components/icons";
import type { Habit } from "@/lib/types";
import { GlassCounter } from "./GlassCounter";
import { PagesProgress } from "./PagesProgress";
import { StampCheck } from "./StampCheck";
import { accentColor } from "./shared";

interface Props {
  habit: Habit;
  value: number;
  onChange: (v: number) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

export function HabitCard({ habit, value, onChange, onRemove, readOnly }: Props) {
  const [menu, setMenu] = useState(false);
  const View =
    habit.kind === "counter" ? GlassCounter : habit.kind === "progress" ? PagesProgress : StampCheck;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="card relative p-5"
    >
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <i
              className="block h-2 w-2 rounded-full"
              style={{ background: accentColor(habit.accent) }}
            />
            <h2 className="font-display truncate text-xl">{habit.name}</h2>
            {habit.essential && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                essencial
              </span>
            )}
          </div>
          {habit.identity && (
            <p className="mt-1 text-[13px] italic text-muted">{habit.identity}</p>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label="Mais opções"
            onClick={() => setMenu((m) => !m)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2"
          >
            <DotsIcon />
          </button>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="card absolute right-0 top-9 z-10 w-40 overflow-hidden p-1 text-sm"
              style={{ borderRadius: 16 }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  if (window.confirm(`Remover "${habit.name}" e todo o histórico dele?`)) onRemove();
                }}
                className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2"
                style={{ color: "var(--clay)" }}
              >
                Remover hábito
              </button>
            </motion.div>
          )}
        </div>
      </header>

      <View habit={habit} value={value} onChange={onChange} readOnly={readOnly} />
    </motion.article>
  );
}
