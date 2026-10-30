"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHabits } from "@/lib/store";
import { useFeedback } from "@/lib/useFeedback";
import { ENERGIES, ENERGY_LABEL, MOODS, MOOD_LABEL } from "@/lib/checkin";
import type { Energy, Mood } from "@/lib/types";
import { accentColor, accentSoft } from "./habits/shared";

const MOUTH: Record<Mood, string> = {
  1: "M10 24.5 Q16 16 22 24.5",
  2: "M11 23.5 Q16 19.5 21 23.5",
  3: "M11 21.5 H21",
  4: "M11 20 Q16 24.5 21 20",
  5: "M9.5 18.5 Q16 28 22.5 18.5",
};

export function Face({ mood, size = 30 }: { mood: Mood; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="13.5" />
      <circle cx="11.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="20.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
      <path d={MOUTH[mood]} />
    </svg>
  );
}

export function EnergyBars({ level, size = 20 }: { level: Energy; size?: number }) {
  const bars = [6, 10, 14];
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={3 + i * 5.5}
          y={17 - h}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
          opacity={i < level ? 1 : 0.22}
        />
      ))}
    </svg>
  );
}

const reveal = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

/**
 * Check-in do dia: um toque para o humor, um para a energia. Depois de respondido,
 * recolhe num resumo de uma linha (tocar nele reabre para editar).
 */
export function CheckIn({ date, isToday, onOpenDiary }: { date: string; isToday: boolean; onOpenDiary?: () => void }) {
  const { getCheckin, setCheckin } = useHabits();
  const fb = useFeedback();
  const c = getCheckin(date);
  const mood = c?.mood;
  const energy = c?.energy;

  const [open, setOpen] = useState(!(mood !== undefined && energy !== undefined));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const collapseSoon = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 800);
  };

  const pickMood = (m: Mood) => {
    const next = mood === m ? null : m;
    setCheckin(date, { mood: next });
    if (next !== null) {
      fb("pop", 8);
      if (energy !== undefined) collapseSoon();
    }
  };

  const pickEnergy = (e: Energy) => {
    const next = energy === e ? null : e;
    setCheckin(date, { energy: next });
    if (next !== null) {
      fb("tick", 6);
      if (mood !== undefined) collapseSoon();
    }
  };

  return (
    <motion.section layout className="card overflow-hidden" style={{ borderRadius: 24 }}>
      <AnimatePresence mode="wait" initial={false}>
        {open || mood === undefined || energy === undefined ? (
          <motion.div key="open" {...reveal} className="px-4 pb-4 pt-3.5">
            <h3 className="text-sm text-muted">
              {isToday ? "Como você está hoje?" : "Como foi esse dia?"}
            </h3>
            <div className="mt-3 flex justify-between" role="group" aria-label="Humor">
              {MOODS.map((m) => {
                const selected = mood === m;
                return (
                  <motion.button
                    key={m}
                    type="button"
                    aria-label={`Humor: ${MOOD_LABEL[m]}`}
                    aria-pressed={selected}
                    whileTap={{ scale: 0.84 }}
                    animate={{ scale: selected ? 1.14 : 1 }}
                    transition={{ type: "spring", stiffness: 440, damping: 17 }}
                    onClick={() => pickMood(m)}
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{
                      color: selected ? "var(--ink)" : "var(--muted)",
                      background: selected ? accentSoft("sage", 24) : "transparent",
                    }}
                  >
                    <Face mood={m} />
                  </motion.button>
                );
              })}
            </div>
            <p className="mt-2 min-h-[1.25rem] text-center text-[12px] text-muted">
              {mood !== undefined ? MOOD_LABEL[mood] : "Toque no rosto que combina"}
            </p>

            <AnimatePresence initial={false}>
              {(mood !== undefined || energy !== undefined) && (
                <motion.div key="energy" {...reveal} className="overflow-hidden">
                  <h3 className="pt-3 text-sm text-muted">Energia</h3>
                  <div className="mt-2.5 grid grid-cols-3 gap-2" role="group" aria-label="Energia">
                    {ENERGIES.map((e) => {
                      const selected = energy === e;
                      return (
                        <motion.button
                          key={e}
                          type="button"
                          aria-label={`Energia: ${ENERGY_LABEL[e]}`}
                          aria-pressed={selected}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => pickEnergy(e)}
                          className="flex h-10 items-center justify-center gap-2 rounded-full border text-sm transition-colors"
                          style={{
                            borderColor: selected ? accentColor("sage") : "var(--line)",
                            background: selected ? accentSoft("sage", 16) : "transparent",
                            color: selected ? "var(--ink)" : "var(--muted)",
                          }}
                        >
                          <EnergyBars level={e} />
                          {ENERGY_LABEL[e]}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            {...reveal}
            aria-label="Editar check-in"
            onClick={() => setOpen(true)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span style={{ color: accentColor("sage") }}>
              <Face mood={mood} size={28} />
            </span>
            <span className="min-w-0 flex-1 text-sm">
              {MOOD_LABEL[mood]}
              <span className="text-muted"> · energia {ENERGY_LABEL[energy].toLowerCase()}</span>
            </span>
            <span className="text-xs text-muted">editar</span>
          </motion.button>
        )}
      </AnimatePresence>
      <Note key={date} date={date} onOpenDiary={onOpenDiary} />
    </motion.section>
  );
}

/** Diário do dia: uma anotação livre, salva sozinha enquanto você escreve. */
function Note({ date, onOpenDiary }: { date: string; onOpenDiary?: () => void }) {
  const { getCheckin, setCheckin } = useHabits();
  const saved = getCheckin(date)?.note ?? "";
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(saved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const change = (v: string) => {
    setText(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCheckin(date, { note: v }), 500);
  };
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    if (text !== saved) setCheckin(date, { note: text });
  };

  return (
    <div className="border-t border-line px-4 py-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (open) flush();
          setOpen((o) => !o);
        }}
        className="flex w-full items-center gap-2 text-left text-sm text-muted"
      >
        <span aria-hidden>✎</span>
        <span className="min-w-0 flex-1 truncate">{saved && !open ? saved : "Escrever sobre o dia (opcional)"}</span>
        <span className="text-xs">{open ? "fechar" : saved ? "editar" : ""}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div {...reveal} className="overflow-hidden">
            <textarea
              aria-label="Diário do dia"
              value={text}
              onChange={(e) => change(e.target.value)}
              onBlur={flush}
              rows={4}
              maxLength={1000}
              placeholder="O que foi bom hoje? O que pesou? Pode ser uma linha só."
              className="mt-3 w-full resize-none rounded-2xl border border-line bg-transparent px-4 py-3 text-[15px] leading-snug outline-none focus:border-sage"
            />
            <div className="mt-1.5 flex items-center justify-between text-[12px] text-muted">
              <span>Fica só no seu aparelho.</span>
              {onOpenDiary && (
                <button type="button" onClick={onOpenDiary} className="underline underline-offset-2">
                  Ver diário
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
