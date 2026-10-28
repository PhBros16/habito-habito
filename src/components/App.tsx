"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { HabitsProvider, useHabits } from "@/lib/store";
import { dateKey, greetingOf, lastDays, longDate, momentOf, relativeLabel } from "@/lib/dates";
import { phraseFor, randomPhrase } from "@/lib/phrases";
import { levelOf, type Habit } from "@/lib/types";
import { useFeedback } from "@/lib/useFeedback";
import { HabitCard } from "./habits/HabitCard";
import { WeekStrip } from "./WeekStrip";
import { Celebration } from "./Celebration";
import { AddHabitSheet } from "./AddHabitSheet";
import { SettingsSheet } from "./SettingsSheet";
import { StatsSheet } from "./StatsSheet";
import { CheckIn } from "./CheckIn";
import { isLowDay } from "@/lib/checkin";
import { ChartIcon, LeafIcon, PlusIcon, SlidersIcon, SoundOffIcon, SoundOnIcon } from "./icons";
import { APP_NAME } from "@/lib/brand";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HabitsProvider>
        <Home />
      </HabitsProvider>
    </MotionConfig>
  );
}

/** Casca estática (pré-renderizada) → só monta a tela real no cliente, com os dados prontos. */
function Home() {
  const { ready } = useHabits();
  return ready ? <Main /> : <Skeleton />;
}

function Main() {
  const { habits, getValue, setValue, addHabit, removeHabit, settings, updateSettings, getCheckin } =
    useHabits();
  const fb = useFeedback();

  // "hoje" acompanha a virada do dia mesmo com o app aberto
  const [today, setToday] = useState(() => dateKey());
  useEffect(() => {
    const t = setInterval(() => setToday(dateKey()), 60_000);
    return () => clearInterval(t);
  }, []);
  const [picked, setPicked] = useState<string | null>(null);
  const selected = picked ?? today;
  const isToday = selected === today;

  const [addOpen, setAddOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [celebrate, setCelebrate] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const toastSeq = useRef(0);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const hardDay = settings.hardDayDate === today;
  const essentials = useMemo(() => habits.filter((h) => h.essential), [habits]);
  const useEssentialOnly = hardDay && essentials.length > 0 && isToday;
  const visible = useEssentialOnly ? essentials : habits;

  const days = useMemo(() => lastDays(today, 7), [today]);

  const ratio = useCallback(
    (date: string) => {
      const set = hardDay && date === today && essentials.length > 0 ? essentials : habits;
      if (set.length === 0) return 0;
      const done = set.filter((h) => levelOf(h, getValue(h.id, date)) >= 1).length;
      return done / set.length;
    },
    [habits, essentials, hardDay, today, getValue]
  );

  const doneCount = visible.filter((h) => levelOf(h, getValue(h.id, selected)) >= 1).length;

  const moment = momentOf();
  // Em dia pesado (humor ou energia baixos) as frases ficam mais acolhedoras.
  const lowDay = isLowDay(getCheckin(today));
  const offerOpen =
    isToday && lowDay && !hardDay && essentials.length > 0 && settings.offerDismissedDate !== today;
  const phrase = useMemo(() => {
    if (!isToday) return "";
    if (hardDay || lowDay) return phraseFor(settings.tone, "hardDay", today);
    return phraseFor(settings.tone, moment, today);
  }, [isToday, hardDay, lowDay, settings.tone, moment, today]);

  const showToast = (text: string) => {
    const id = ++toastSeq.current;
    setToast({ id, text });
    timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600));
  };

  const handleChange = (habit: Habit, value: number) => {
    const before = levelOf(habit, getValue(habit.id, selected));
    const after = levelOf(habit, value);
    setValue(habit.id, selected, value);

    if (!isToday || after <= before) return;
    const othersDone = visible
      .filter((h) => h.id !== habit.id)
      .every((h) => levelOf(h, getValue(h.id, selected)) >= 1);
    const allDone = othersDone && after >= 1;

    if (allDone && visible.length > 1) {
      const text = randomPhrase(settings.tone, "allDone");
      timers.current.push(
        setTimeout(() => {
          fb("chime", 24);
          setCelebrate(text);
        }, 450),
        setTimeout(() => setCelebrate(null), 4200)
      );
    } else if (before === 0 || after === 2) {
      timers.current.push(setTimeout(() => showToast(randomPhrase(settings.tone, "done")), 350));
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-36 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {/* topo */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="whitespace-nowrap text-[13px] text-muted first-letter:uppercase">{longDate(selected)}</p>
          <h1 className="font-display mt-1 text-4xl leading-tight">
            {isToday ? greetingOf(moment) : relativeLabel(selected, today)}
          </h1>
        </div>
        <div className="flex shrink-0 items-center pt-1">
          <IconButton
            label={hardDay ? "Desativar dia difícil" : "Ativar dia difícil"}
            active={hardDay}
            onClick={() => {
              updateSettings({ hardDayDate: hardDay ? null : today });
              if (!hardDay) showToast("Modo dia difícil: só o essencial hoje.");
            }}
          >
            <LeafIcon />
          </IconButton>
          <IconButton
            label={settings.sound ? "Desligar sons" : "Ligar sons"}
            onClick={() => updateSettings({ sound: !settings.sound })}
          >
            {settings.sound ? <SoundOnIcon /> : <SoundOffIcon />}
          </IconButton>
          <IconButton label="Estatísticas" onClick={() => setStatsOpen(true)}>
            <ChartIcon />
          </IconButton>
          <IconButton label="Ajustes" onClick={() => setSettingsOpen(true)}>
            <SlidersIcon />
          </IconButton>
        </div>
      </header>

      {/* frase do momento */}
      <div className="mt-5 min-h-[4.25rem]">
        <AnimatePresence mode="wait" initial={false}>
          {isToday ? (
            <motion.p
              key={phrase}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-xl leading-snug text-ink/90"
            >
              {phrase}
            </motion.p>
          ) : (
            <motion.button
              key="back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setPicked(null)}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted"
            >
              ← Voltar para hoje
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* semana */}
      <div className="mt-4">
        <WeekStrip
          days={days}
          selected={selected}
          today={today}
          ratio={ratio}
          onSelect={(d) => setPicked(d === today ? null : d)}
        />
      </div>

      {/* check-in de humor e energia */}
      <div className="mt-5">
        <CheckIn key={selected} date={selected} isToday={isToday} />
      </div>

      {/* oferta gentil em dia pesado */}
      <AnimatePresence>
        {offerOpen && (
          <motion.div
            key="offer"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="card p-4" style={{ borderRadius: 24, boxShadow: "none" }}>
              <p className="text-sm leading-relaxed">
                Dia pesado? Posso deixar só o essencial por hoje. Fazer menos também é fazer.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ hardDayDate: today });
                    showToast("Modo dia difícil: só o essencial hoje.");
                  }}
                  className="flex-1 rounded-full py-2.5 text-sm font-medium"
                  style={{ background: "var(--ink)", color: "var(--bg)" }}
                >
                  Só o essencial
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ offerDismissedDate: today })}
                  className="rounded-full border border-line px-4 py-2.5 text-sm text-muted"
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* resumo */}
      <div className="mt-5 flex items-center justify-between px-1 text-sm text-muted">
        <span>
          {visible.length === 0
            ? "Nenhum hábito ainda"
            : `${doneCount} de ${visible.length} ${visible.length === 1 ? "hábito" : "hábitos"}`}
        </span>
        {useEssentialOnly && <span style={{ color: "var(--sage)" }}>só o essencial</span>}
      </div>

      {/* hábitos */}
      <LayoutGroup>
        <div className="mt-3 flex flex-col gap-4">
          <AnimatePresence initial>
            {visible.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                value={getValue(h.id, selected)}
                onChange={(v) => handleChange(h, v)}
                onRemove={() => removeHabit(h.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {habits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mt-6 p-8 text-center"
        >
          <p className="font-display text-2xl">Um começo tranquilo</p>
          <p className="mt-2 text-sm text-muted">Escolha um hábito pequeno. O resto vem com o tempo.</p>
        </motion.div>
      )}

      {/* botão de adicionar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <motion.button
          type="button"
          onClick={() => setAddOpen(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.3 }}
          className="pointer-events-auto flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium shadow-[var(--shadow)]"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          <PlusIcon /> Novo hábito
        </motion.button>
      </div>

      {/* aviso suave */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center px-6">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="card max-w-xs px-5 py-3 text-center text-sm"
              style={{ borderRadius: 999 }}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <Celebration show={celebrate !== null} phrase={celebrate ?? ""} />
      <AddHabitSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addHabit} />
      <SettingsSheet open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <StatsSheet open={statsOpen} onClose={() => setStatsOpen(false)} today={today} />

      <footer className="mt-10 text-center text-xs text-muted/70">
        {APP_NAME} · seus dados ficam só neste aparelho
      </footer>
    </main>
  );
}

function IconButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={active}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full transition-colors"
      style={{
        color: active ? "var(--sage)" : "var(--muted)",
        background: active ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
      }}
    >
      {children}
    </motion.button>
  );
}

function Skeleton() {
  return (
    <main className="mx-auto w-full max-w-md px-5 pt-8">
      <div className="h-4 w-40 animate-pulse rounded-full bg-surface-2" />
      <div className="mt-3 h-10 w-56 animate-pulse rounded-2xl bg-surface-2" />
      <div className="mt-10 flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-44 animate-pulse" style={{ opacity: 1 - i * 0.25 }} />
        ))}
      </div>
    </main>
  );
}
