"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHabits } from "@/lib/store";
import { dateKey } from "@/lib/dates";
import {
  getLevels,
  isPlaying,
  ringBell,
  setLevels,
  start as startEngine,
  stop as stopEngine,
  normalizeLevels,
  type Levels,
} from "@/lib/ambient";
import { accentColor } from "./habits/shared";

const DURATIONS = [3, 5, 10, 15, 20, 30];
const BEDS: { id: string; label: string; levels: Partial<Levels> }[] = [
  { id: "silencio", label: "Silêncio", levels: {} },
  { id: "chuva", label: "Chuva suave", levels: { rain: 0.4 } },
  { id: "mar", label: "Mar", levels: { waves: 0.6, wind: 0.1 } },
  { id: "riacho", label: "Riacho", levels: { river: 0.55, crickets: 0.15 } },
  { id: "piano", label: "Piano calmo", levels: { piano: 0.5 } },
  { id: "tigela", label: "Tigelas", levels: { bowl: 0.6, wind: 0.08 } },
];
const INTERVALS: { id: number; label: string }[] = [
  { id: 0, label: "Sem sinos no meio" },
  { id: 1, label: "A cada 1 min" },
  { id: 5, label: "A cada 5 min" },
];
const PREP = 5; // segundos para se ajeitar antes de começar

type Phase = "idle" | "prep" | "run" | "done";

const mmss = (s: number) => {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

/** Sessão guiada: respiração visual, sinos agendados no relógio de áudio e timer pelo relógio do sistema. */
export function MeditationPanel() {
  const { habits, getValue, setValue } = useHabits();
  const [minutes, setMinutes] = useState(5);
  const [bed, setBed] = useState("chuva");
  const [interval, setIntervalMin] = useState(0);
  const [guide, setGuide] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [left, setLeft] = useState(0); // segundos restantes
  const [logged, setLogged] = useState(false);

  const endAt = useRef(0);
  const startAt = useRef(0);
  const saved = useRef<{ levels: Levels; wasPlaying: boolean } | null>(null);
  const lock = useRef<{ release: () => Promise<void> } | null>(null);
  const doneRef = useRef(false);

  const target = useMemo(() => habits.find((h) => /medit|respir|mindful/i.test(h.name)), [habits]);

  const restore = (fade = 2) => {
    const s = saved.current;
    saved.current = null;
    if (!s) return;
    if (s.wasPlaying) setLevels(s.levels);
    else stopEngine(fade);
    void lock.current?.release().catch(() => {});
    lock.current = null;
  };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("done");
    setLogged(false);
    try {
      navigator.vibrate?.([120, 80, 120]);
    } catch {
      /* sem vibração */
    }
    restore(6);
  };

  const begin = () => {
    doneRef.current = false;
    saved.current = { levels: normalizeLevels(getLevels()), wasPlaying: isPlaying() };
    startEngine();
    const base = normalizeLevels({});
    setLevels({ ...base, ...(BEDS.find((b) => b.id === bed)?.levels ?? {}) });
    // sinos agendados de uma vez no relógio de áudio: tocam mesmo com a tela apagada
    ringBell(PREP, 1);
    const total = minutes * 60;
    if (interval > 0) for (let t = interval * 60; t < total - 5; t += interval * 60) ringBell(PREP + t, 0.6);
    ringBell(PREP + total, 1);
    ringBell(PREP + total + 5, 0.7);
    startAt.current = Date.now() + PREP * 1000;
    endAt.current = startAt.current + total * 1000;
    setLeft(total);
    setPhase("prep");
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
      void nav.wakeLock?.request("screen").then((l) => (lock.current = l)).catch(() => {});
    } catch {
      /* sem wake lock */
    }
  };

  const cancel = () => {
    doneRef.current = true;
    setPhase("idle");
    restore(1.5);
  };

  // relógio: sempre calculado pela hora do sistema (não acumula atraso em segundo plano)
  useEffect(() => {
    if (phase !== "prep" && phase !== "run") return;
    const tick = () => {
      const now = Date.now();
      if (now >= endAt.current) return finish();
      if (now >= startAt.current) setPhase("run");
      setLeft(Math.max(0, Math.min(minutes * 60, (endAt.current - now) / 1000)));
    };
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === "prep" || phase === "run", minutes]);

  // sair do painel no meio da sessão não deixa o som preso
  useEffect(
    () => () => {
      if (saved.current) restore(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const logSession = () => {
    if (!target) return;
    const day = dateKey();
    const cur = getValue(target.id, day);
    if (target.kind === "check") setValue(target.id, day, Math.max(cur, target.target));
    else if (target.unit === "minutos") setValue(target.id, day, cur + minutes);
    else setValue(target.id, day, cur + 1);
    setLogged(true);
  };

  const color = accentColor("lilac");
  const total = minutes * 60;
  const progress = phase === "run" ? 1 - left / total : phase === "done" ? 1 : 0;
  const elapsed = phase === "run" ? total - left : 0;
  const inhale = elapsed % 10 < 4;

  if (phase === "idle") {
    return (
      <div className="flex flex-col gap-6 pb-2">
        <p className="text-[15px] leading-snug text-muted">Sentar, respirar, deixar o tempo passar. Eu cuido do relógio e dos sinos.</p>
        <Group title="Quanto tempo?">
          {DURATIONS.map((d) => (
            <Chip key={d} on={minutes === d} onClick={() => setMinutes(d)}>
              {d} min
            </Chip>
          ))}
        </Group>
        <Group title="Som de fundo">
          {BEDS.map((b) => (
            <Chip key={b.id} on={bed === b.id} onClick={() => setBed(b.id)}>
              {b.label}
            </Chip>
          ))}
        </Group>
        <Group title="Sinos">
          {INTERVALS.map((i) => (
            <Chip key={i.id} on={interval === i.id} onClick={() => setIntervalMin(i.id)}>
              {i.label}
            </Chip>
          ))}
        </Group>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} className="h-5 w-5 accent-[var(--sage)]" />
          Guia de respiração (4 s inspira, 6 s solta)
        </label>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={begin}
          className="min-h-14 rounded-full text-[16px] font-medium"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          Começar sessão de {minutes} min
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-2 pt-2" aria-live="polite">
      <div className="relative grid h-64 w-64 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="1.5" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="1"
            animate={{ strokeDashoffset: 1 - progress }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </svg>
        <motion.span
          className="absolute rounded-full"
          style={{ width: 120, height: 120, background: `color-mix(in srgb, ${color} 28%, transparent)` }}
          animate={
            phase === "run" && guide
              ? { scale: inhale ? 1.55 : 0.8 }
              : { scale: phase === "done" ? 1.2 : 1 }
          }
          transition={{ duration: phase === "run" && guide ? (inhale ? 4 : 6) : 0.8, ease: "easeInOut" }}
        />
        <div className="relative text-center">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "prep" && (
              <motion.p key="prep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display text-2xl">
                Ajeite-se…
              </motion.p>
            )}
            {phase === "run" && (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-display text-5xl tabular-nums" aria-label="Tempo restante">{mmss(left)}</p>
                {guide && <p className="mt-1 text-sm text-muted">{inhale ? "Inspire" : "Solte devagar"}</p>}
              </motion.div>
            )}
            {phase === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <p className="font-display text-3xl">Pronto.</p>
                <p className="mt-1 text-sm text-muted">{minutes} min de calma</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {phase === "done" ? (
        <div className="flex w-full flex-col gap-3">
          {target && (
            <button
              type="button"
              disabled={logged}
              onClick={logSession}
              className="min-h-14 rounded-full text-[15px] font-medium disabled:opacity-60"
              style={{ background: "var(--ink)", color: "var(--bg)" }}
            >
              {logged ? `Registrado em ${target.name} ✓` : `Registrar em ${target.name}`}
            </button>
          )}
          <button type="button" onClick={() => setPhase("idle")} className="min-h-12 rounded-full border border-line text-[15px]">
            Nova sessão
          </button>
        </div>
      ) : (
        <button type="button" onClick={cancel} className="min-h-12 rounded-full border border-line px-8 text-[15px] text-muted">
          Encerrar
        </button>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm text-muted">{title}</h3>
      <div className="mt-2.5 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="min-h-11 rounded-full border px-4 text-sm transition-colors"
      style={{
        borderColor: on ? accentColor("lilac") : "var(--line)",
        background: on ? "color-mix(in srgb, var(--lilac) 18%, transparent)" : "transparent",
        color: on ? "var(--ink)" : "var(--muted)",
      }}
    >
      {children}
    </button>
  );
}
