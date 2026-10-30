"use client";

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CheckVisualKey, Habit } from "@/lib/types";
import { accentColor, accentSoft } from "./shared";

export interface CheckVisualProps {
  habit: Habit;
  value: number;
  stages: 1 | 2;
  /** conta cada mudança (para soltar ondas) e a direção da última */
  pulse: number;
  dir: 1 | -1;
}

const SPRING = { type: "spring" as const, stiffness: 120, damping: 20 };

/** Onda a cada toque: abre para fora ao avançar, fecha para dentro ao voltar. */
function Ripple({ pulse, dir, color, r0 = 30, r1 = 52 }: { pulse: number; dir: 1 | -1; color: string; r0?: number; r1?: number }) {
  return (
    <AnimatePresence>
      <motion.circle
        key={pulse}
        cx="48"
        cy="48"
        fill="none"
        stroke={color}
        strokeWidth="2"
        initial={{ r: dir > 0 ? r0 : r1, opacity: pulse ? 0.55 : 0 }}
        animate={{ r: dir > 0 ? r1 : r0, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </AnimatePresence>
  );
}

function Track({ habit, value, stages }: Pick<CheckVisualProps, "habit" | "value" | "stages">) {
  return (
    <>
      <circle cx="48" cy="48" r="43" fill="none" stroke="var(--line)" strokeWidth="3" />
      <motion.circle
        cx="48"
        cy="48"
        r="43"
        fill="none"
        stroke={accentColor(habit.accent)}
        strokeWidth="3"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
        initial={false}
        animate={{ pathLength: value / stages, opacity: value > 0 ? 1 : 0 }}
        transition={SPRING}
      />
    </>
  );
}

/** Selo que carimba (o padrão). */
function Stamp({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const done = value >= stages;
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <circle cx="48" cy="48" r="38" fill="none" stroke="var(--line)" strokeWidth="6" />
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
      {stages === 2 && (
        <circle cx="48" cy="86" r="2.4" fill={value >= 1 ? accentColor(habit.accent) : "var(--muted)"} opacity={value >= 1 ? 0 : 0.5} />
      )}
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
      <Ripple pulse={pulse} dir={dir} color={accentColor(habit.accent)} />
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
  );
}

/** Nascer do sol: o sol sobe a cada nível e se põe quando você desmarca. */
function Sunrise({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const clip = useId();
  const frac = value / stages;
  const accent = accentColor(habit.accent);
  const full = frac >= 1;
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <defs>
        <clipPath id={clip}>
          <circle cx="48" cy="48" r="36" />
        </clipPath>
      </defs>
      <Track habit={habit} value={value} stages={stages} />
      <g clipPath={`url(#${clip})`}>
        <motion.rect x="0" y="0" width="96" height="96" fill={accent} initial={false} animate={{ opacity: 0.06 + frac * 0.2 }} transition={SPRING} />
        {/* raios */}
        <motion.g
          style={{ transformOrigin: "48px 52px" }}
          initial={false}
          animate={{ opacity: full ? 1 : 0, scale: full ? 1 : 0.5, rotate: full ? 360 : 0 }}
          transition={{ opacity: { duration: 0.3 }, scale: SPRING, rotate: { duration: 40, repeat: Infinity, ease: "linear" } }}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <line key={i} x1="48" y1="20" x2="48" y2="12" stroke={accent} strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${i * 36} 48 52)`} />
          ))}
        </motion.g>
        {/* sol */}
        <motion.circle cx="48" r="15" fill={accent} initial={false} animate={{ cy: 82 - frac * 36 }} transition={{ type: "spring", stiffness: 70, damping: 13 }} />
        <motion.circle cx="48" r="9" fill="var(--sun)" opacity={0.6} initial={false} animate={{ cy: 82 - frac * 36 }} transition={{ type: "spring", stiffness: 70, damping: 13 }} />
        {/* horizonte */}
        <rect x="0" y="62" width="96" height="40" fill="color-mix(in srgb, var(--sage) 38%, var(--surface))" />
        <path d="M0 62 H96" stroke="var(--ink)" strokeOpacity="0.15" strokeWidth="1.2" />
      </g>
      <Ripple pulse={pulse} dir={dir} color={accent} r0={36} r1={52} />
    </svg>
  );
}

/** Lâmpada: acende em dois níveis (fraca, depois plena) e apaga com um clique. */
function Lamp({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const frac = value / stages;
  const accent = accentColor(habit.accent);
  const full = frac >= 1;
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <Track habit={habit} value={value} stages={stages} />
      {/* brilho */}
      <motion.circle cx="48" cy="42" fill="var(--sun)" initial={false} animate={{ r: 14 + frac * 24, opacity: frac * 0.3 }} transition={SPRING} />
      {/* raios */}
      <motion.g
        style={{ transformOrigin: "48px 42px" }}
        initial={false}
        animate={{ opacity: full ? 1 : 0, scale: full ? 1 : 0.6 }}
        transition={SPRING}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="48" y1="12" x2="48" y2="6" stroke="var(--sun)" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${i * 45} 48 42)`} />
        ))}
      </motion.g>
      {/* bulbo */}
      <circle cx="48" cy="42" r="17" fill="var(--surface-2)" stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="2" />
      <motion.circle cx="48" cy="42" r="17" fill={accent} initial={false} animate={{ opacity: frac * 0.9 }} transition={SPRING} />
      <motion.circle cx="48" cy="42" r="10" fill="var(--sun)" initial={false} animate={{ opacity: frac * 0.9 }} transition={SPRING} />
      {/* piscada ao ligar */}
      <AnimatePresence>
        {dir > 0 && pulse > 0 && (
          <motion.circle
            key={pulse}
            cx="48"
            cy="42"
            r="17"
            fill="white"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 0, 0.5, 0] }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      {/* filamento e base */}
      <path d="M41 52 L44 40 L48 48 L52 40 L55 52" fill="none" stroke="var(--ink)" strokeOpacity={full ? 0.15 : 0.35} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="58" width="16" height="12" rx="3" fill="color-mix(in srgb, var(--ink) 18%, var(--surface))" />
      <path d="M41 63 H55 M42 67 H54" stroke="var(--ink)" strokeOpacity="0.25" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="43" y="70" width="10" height="5" rx="2.5" fill="color-mix(in srgb, var(--ink) 28%, var(--surface))" />
      <Ripple pulse={pulse} dir={dir} color={accentSoft(habit.accent, 80)} r0={40} r1={54} />
    </svg>
  );
}

/** Escudo: enche de baixo para cima (abstinência, "ficar sem") e se esvazia ao desmarcar. */
function Shield({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const clip = useId();
  const frac = value / stages;
  const accent = accentColor(habit.accent);
  const D = "M48 14 L76 24 V46 C76 64 64 76 48 84 C32 76 20 64 20 46 V24 Z";
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <defs>
        <clipPath id={clip}>
          <path d={D} />
        </clipPath>
      </defs>
      <motion.path d={D} fill={accent} initial={false} animate={{ opacity: frac >= 1 ? 0.28 : 0, scale: frac >= 1 ? 1.14 : 1 }} style={{ transformOrigin: "48px 48px" }} transition={SPRING} />
      <path d={D} fill="var(--surface-2)" />
      <g clipPath={`url(#${clip})`}>
        <motion.rect x="10" width="76" height="80" fill={accent} initial={false} animate={{ y: 86 - frac * 74 }} transition={{ type: "spring", stiffness: 70, damping: 15 }} />
        <motion.path d="M10 0 Q 29 -5 48 0 T 86 0 V6 H10 Z" fill={accent} initial={false} animate={{ y: 86 - frac * 74 - 3, opacity: frac > 0 && frac < 1 ? 0.6 : 0 }} transition={{ type: "spring", stiffness: 70, damping: 15 }} />
      </g>
      <path d={D} fill="none" stroke={accent} strokeWidth="3.4" strokeLinejoin="round" />
      <motion.path d="M36 48 L45 57 L61 38" fill="none" stroke="var(--surface)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: frac > 0 ? 1 : 0, opacity: frac > 0 ? 1 : 0 }} transition={{ duration: 0.4 }} />
      <Ripple pulse={pulse} dir={dir} color={accent} r0={36} r1={54} />
    </svg>
  );
}

/** Cápsula: as duas metades se encaixam a cada nível. */
function Pill({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const frac = value / stages;
  const accent = accentColor(habit.accent);
  const gap = (1 - frac) * 11;
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <Track habit={habit} value={value} stages={stages} />
      <motion.g style={{ transformOrigin: "48px 48px" }} initial={false} animate={{ rotate: -38 + frac * 10 }} transition={SPRING}>
        <motion.g initial={false} animate={{ x: -gap }} transition={{ type: "spring", stiffness: 160, damping: 12 }}>
          <path d="M48 36 H34 a12 12 0 0 0 0 24 H48 Z" fill={accent} />
        </motion.g>
        <motion.g initial={false} animate={{ x: gap }} transition={{ type: "spring", stiffness: 160, damping: 12 }}>
          <path d="M48 36 H62 a12 12 0 0 1 0 24 H48 Z" fill="var(--surface-2)" stroke={accent} strokeWidth="2.4" />
        </motion.g>
        <path d="M30 41 H44" stroke="var(--surface)" strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
      </motion.g>
      <Ripple pulse={pulse} dir={dir} color={accent} r0={30} r1={50} />
    </svg>
  );
}

/** Brilho: uma estrela que cresce, gira e atrai estrelinhas quando o dia está completo. */
function Sparkle({ habit, value, stages, pulse, dir }: CheckVisualProps) {
  const frac = value / stages;
  const accent = accentColor(habit.accent);
  const S = "M0 -22 C2 -8 8 -2 22 0 C8 2 2 8 0 22 C-2 8 -8 2 -22 0 C-8 -2 -2 -8 0 -22 Z";
  return (
    <svg viewBox="0 0 96 96" width="96" height="96" className="overflow-visible">
      <Track habit={habit} value={value} stages={stages} />
      <motion.g style={{ x: 48, y: 48 }} initial={false} animate={{ scale: 0.55 + frac * 0.75, rotate: frac * 90 }} transition={{ type: "spring", stiffness: 110, damping: 12 }}>
        <path d={S} fill={frac > 0 ? accent : "var(--line)"} />
      </motion.g>
      {[[70, 26, 0.5], [24, 68, 0.38], [72, 70, 0.3]].map(([x, y, k], i) => (
        <motion.g key={i} style={{ x, y }} initial={false} animate={{ scale: frac >= 1 ? k : 0, opacity: frac >= 1 ? 1 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: i * 0.08 }}>
          <motion.path d={S} fill={accent} animate={{ rotate: [0, 90] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }} />
        </motion.g>
      ))}
      <Ripple pulse={pulse} dir={dir} color={accent} r0={30} r1={52} />
    </svg>
  );
}

export const CHECK_VISUALS: Record<
  CheckVisualKey,
  { name: string; Component: (p: CheckVisualProps) => React.JSX.Element; on: string; off: string }
> = {
  stamp: { name: "Selo", Component: Stamp, on: "stamp", off: "unstamp" },
  sunrise: { name: "Sol", Component: Sunrise, on: "sunrise", off: "sunset" },
  lamp: { name: "Lâmpada", Component: Lamp, on: "lampOn", off: "lampOff" },
  shield: { name: "Escudo", Component: Shield, on: "stamp", off: "unstamp" },
  pill: { name: "Cápsula", Component: Pill, on: "pop", off: "ebb" },
  sparkle: { name: "Brilho", Component: Sparkle, on: "twinkle", off: "ebb" },
};

export const CHECK_VISUAL_ORDER: CheckVisualKey[] = ["stamp", "sunrise", "lamp", "shield", "pill", "sparkle"];
