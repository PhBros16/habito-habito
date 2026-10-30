"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { DotsIcon } from "@/components/icons";
import type { Habit } from "@/lib/types";
import { NumericHabit } from "./NumericHabit";
import { StampCheck } from "./StampCheck";
import { accentColor } from "./shared";

interface Props {
  habit: Habit;
  value: number;
  onChange: (v: number) => void;
  onRemove: () => void;
  onEdit?: () => void;
  onToggleEssential?: () => void;
  onDetails?: () => void;
  /** progresso da meta semanal/mensal, quando o hábito tem frequência */
  progress?: { done: number; goal: number; label: string } | null;
  readOnly?: boolean;
}

export function HabitCard({ habit, value, onChange, onRemove, onEdit, onToggleEssential, onDetails, progress, readOnly }: Props) {
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const View = habit.kind === "check" ? StampCheck : NumericHabit;

  // o menu fecha ao tocar fora dele ou com Esc
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

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
          {habit.anchor && <p className="mt-1 text-[13px] text-muted">↳ {habit.anchor}</p>}
          {habit.identity && (
            <p className="mt-1 text-[13px] italic text-muted">{habit.identity}</p>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Mais opções"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2"
          >
            <DotsIcon />
          </button>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="card absolute right-0 top-9 z-10 w-44 overflow-hidden p-1 text-sm"
              style={{ borderRadius: 16 }}
            >
              {onDetails && (
                <button type="button" onClick={() => { setMenu(false); onDetails(); }} className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2">
                  Ver detalhes
                </button>
              )}
              {onEdit && (
                <button type="button" onClick={() => { setMenu(false); onEdit(); }} className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2">
                  Editar
                </button>
              )}
              {onToggleEssential && (
                <button type="button" onClick={() => { setMenu(false); onToggleEssential(); }} className="w-full rounded-xl px-3 py-2 text-left hover:bg-surface-2">
                  {habit.essential ? "Tirar de essencial" : "Marcar essencial"}
                </button>
              )}
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

      {progress && (
        <div className="-mt-1 mb-3 flex items-center gap-2 text-[12px] text-muted" aria-label={`${progress.done} de ${progress.goal} ${progress.label}`}>
          <span className="flex gap-1">
            {Array.from({ length: Math.min(progress.goal, 12) }, (_, i) => (
              <i
                key={i}
                className="block h-1.5 w-4 rounded-full transition-colors"
                style={{ background: i < progress.done ? accentColor(habit.accent) : "var(--line)" }}
              />
            ))}
          </span>
          <span>
            {progress.done} de {progress.goal} {progress.label}
          </span>
        </div>
      )}
      <View habit={habit} value={value} onChange={onChange} readOnly={readOnly} />
    </motion.article>
  );
}
