"use client";

import { AnimatePresence, motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import { useFlash } from "./useBurst";
import type { AccentKey } from "@/lib/types";
import type { VisualProps } from "./types";

function Bead({ on, isMin, accent }: { on: boolean; isMin: boolean; accent: AccentKey }) {
  const flash = useFlash(on);
  return (
    <span
      className="relative grid h-4 w-4 place-items-center rounded-full"
      style={{ border: `1.5px solid ${accentSoft(accent, 55)}` }}
    >
      <AnimatePresence initial={false}>
        {on && (
          <motion.i
            key="fill"
            className="absolute inset-[-1.5px] rounded-full"
            style={{ background: accentColor(accent) }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: [1, 1.3, 0], opacity: [1, 1, 0], transition: { duration: 0.28 } }}
            transition={{ type: "spring", stiffness: 520, damping: 14 }}
          />
        )}
      </AnimatePresence>
      {isMin && (
        <i
          className="relative block h-1 w-1 rounded-full"
          style={{ background: on ? "var(--surface)" : accentColor(accent) }}
        />
      )}
      {flash.n > 0 && (
        <motion.i
          key={flash.n}
          className="pointer-events-none absolute inset-[-1.5px] rounded-full"
          style={{ border: `1.5px solid ${accentColor(accent)}` }}
          initial={{ scale: flash.up ? 1 : 2.1, opacity: flash.up ? 0.7 : 0.5 }}
          animate={{ scale: flash.up ? 2.1 : 1, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
    </span>
  );
}

/** Contas que se acendem uma a uma e se apagam, uma a uma, quando você volta. */
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
    <div className="grid justify-center gap-[6px]" style={{ gridTemplateColumns: `repeat(${cols}, 16px)` }}>
      {Array.from({ length: total }, (_, i) => (
        <Bead key={i} on={i < filled} isMin={i === minIdx} accent={habit.accent} />
      ))}
    </div>
  );
}
