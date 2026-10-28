"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

/** Contas que se acendem uma a uma. Bom para séries, vezes, tarefas. */
export function Beads({ habit, value, frac }: VisualProps) {
  const total = habit.target <= 12 ? Math.max(1, Math.round(habit.target)) : 10;
  const filled =
    value <= 0
      ? 0
      : frac >= 1
        ? total
        : Math.min(total - 1, Math.max(1, Math.round(frac * total)));
  const minIdx =
    Math.min(total, Math.max(1, Math.ceil((habit.minimum / habit.target) * total))) - 1;
  const cols = Math.min(5, total);

  return (
    <div
      className="grid justify-center gap-[6px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 16px)` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <span
            key={i}
            className="relative grid h-4 w-4 place-items-center rounded-full"
            style={{ border: `1.5px solid ${accentSoft(habit.accent, 55)}` }}
          >
            <motion.i
              className="absolute inset-[-1.5px] rounded-full"
              style={{ background: accentColor(habit.accent) }}
              initial={false}
              animate={{ scale: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 14 }}
            />
            {i === minIdx && (
              <i
                className="relative block h-1 w-1 rounded-full"
                style={{ background: on ? "var(--surface)" : accentColor(habit.accent) }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
