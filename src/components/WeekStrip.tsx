"use client";

import { motion } from "motion/react";
import { dayNumber, weekdayShort } from "@/lib/dates";
import { accentColor } from "./habits/shared";

interface Props {
  days: string[];
  selected: string;
  today: string;
  /** 0..1 de conclusão (nível ≥ mínimo) por dia */
  ratio: (date: string) => number;
  onSelect: (date: string) => void;
}

export function WeekStrip({ days, selected, today, ratio, onSelect }: Props) {
  return (
    <div className="flex justify-between gap-1" role="tablist" aria-label="Últimos dias">
      {days.map((d) => {
        const active = d === selected;
        const r = ratio(d);
        const circ = 2 * Math.PI * 15;
        return (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(d)}
            className="relative flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-2"
          >
            {active && (
              <motion.span
                layoutId="week-active"
                className="absolute inset-0 rounded-2xl bg-surface-2"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative text-[11px] uppercase tracking-wide text-muted">
              {d === today ? "hoje" : weekdayShort(d)}
            </span>
            <span className="relative grid h-9 w-9 place-items-center">
              <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="2.5" />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke={accentColor("sage")}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={false}
                  animate={{ strokeDashoffset: circ * (1 - r) }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </svg>
              <span className="relative text-sm tabular-nums">{dayNumber(d)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
