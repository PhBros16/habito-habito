"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { AccentKey, Habit } from "@/lib/types";

/** Cores próprias (`custom-rrggbb`) caem no valor direto; as da paleta usam as variáveis do tema. */
export const accentColor = (a: AccentKey) => (a.startsWith("custom-") ? `#${a.slice(7)}` : `var(--${a})`);
export const accentSoft = (a: AccentKey, pct = 14) =>
  `color-mix(in srgb, ${accentColor(a)} ${pct}%, transparent)`;
export const customAccent = (r: number, g: number, b: number): AccentKey =>
  `custom-${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
export const rgbOfAccent = (a: AccentKey): [number, number, number] | null =>
  a.startsWith("custom-") && /^[0-9a-f]{6}$/i.test(a.slice(7))
    ? [parseInt(a.slice(7, 9), 16), parseInt(a.slice(9, 11), 16), parseInt(a.slice(11, 13), 16)]
    : null;

export interface HabitViewProps {
  habit: Habit;
  value: number;
  onChange: (value: number) => void;
  /** disparado ao mudar de nível (para frases/celebração) */
  readOnly?: boolean;
}

/** Número que "rola" ao mudar. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  // o número sobe ao crescer e desce ao diminuir (a direção vem da última mudança)
  const [track, setTrack] = useState({ value, dir: 1 });
  if (track.value !== value) setTrack({ value, dir: value > track.value ? 1 : -1 });
  const dir = track.dir;
  return (
    <span className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={value}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: 14 * d, opacity: 0, filter: "blur(3px)" }),
            center: { y: 0, opacity: 1, filter: "blur(0px)" },
            leave: (d: number) => ({ y: -14 * d, opacity: 0, filter: "blur(3px)" }),
          }}
          initial="enter"
          animate="center"
          exit="leave"
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 32,
            filter: { type: "tween", duration: 0.2 },
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function LevelBadge({ level, accent }: { level: 0 | 1 | 2; accent: AccentKey }) {
  const label = level === 2 ? "Meta atingida" : level === 1 ? "Mínimo feito" : "Ainda não";
  return (
    <motion.span
      layout
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{
        background: level ? accentSoft(accent, level === 2 ? 22 : 14) : "var(--surface-2)",
        color: level ? accentColor(accent) : "var(--muted)",
      }}
    >
      <span className="flex gap-0.5">
        <i
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: level >= 1 ? accentColor(accent) : "var(--line)" }}
        />
        <i
          className="block h-1.5 w-1.5 rounded-full"
          style={{ background: level >= 2 ? accentColor(accent) : "var(--line)" }}
        />
      </span>
      {label}
    </motion.span>
  );
}
