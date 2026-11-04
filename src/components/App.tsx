"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { HabitsProvider, useHabits } from "@/lib/store";
import { dateKey, greetingOf, lastDays, longDate, momentOf, parseKey, relativeLabel } from "@/lib/dates";
import { phraseFor, randomPhrase, type PhraseMoment } from "@/lib/phrases";
import { levelOf, type Habit } from "@/lib/types";
import { useFeedback } from "@/lib/useFeedback";
import { HabitCard } from "./habits/HabitCard";
import { WeekStrip } from "./WeekStrip";
import { Celebration } from "./Celebration";
import { AddHabitSheet } from "./AddHabitSheet";
import { MoodSheet } from "./MoodSheet";
import { BottomNav, type Tab } from "./BottomNav";
import { LearnPage } from "./LearnPage";
import { EvolutionPage } from "./EvolutionPage";
import { missedOnce, raiseSuggestion, dismissed } from "@/lib/adapt";
import { EvolutionCard, EvolutionSheet, useEvolution } from "./EvolutionSheet";
import { MILESTONE_DAYS, MILESTONE_TEXT } from "@/lib/evolution";
import { DiarySheet } from "./DiarySheet";
import { AboutSheet } from "./AboutSheet";
import { HabitDetailSheet } from "./HabitDetailSheet";
import { goalOf, isPeriodic, periodDone } from "@/lib/periods";
import { SettingsSheet } from "./SettingsSheet";
import { StatsSheet } from "./StatsSheet";
import { WeekReviewSheet } from "./WeekReviewSheet";
import { AmbientSheet } from "./AmbientSheet";
import { GardenCard, GardenSheet } from "./GardenSheet";
import { PauseSheet } from "./PauseSheet";
import { activePause, rangeText } from "@/lib/pauses";
import { isPlaying, subscribe } from "@/lib/ambient";
import { ReorderSheet } from "./ReorderSheet";
import { Onboarding } from "./Onboarding";
import { dueReminders, markNotified, systemNotify, wasNotified } from "@/lib/reminders";
import { profileLine } from "@/lib/profile";
import { missedRun, reviewWeekStart } from "@/lib/stats";
import { CheckIn } from "./CheckIn";
import { isLowDay } from "@/lib/checkin";
import { ChartIcon, LeafIcon, PlusIcon, SlidersIcon, WaveIcon } from "./icons";
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
  const { settings, habits } = useHabits();
  if (!ready) return <Skeleton />;
  return (
    <>
      <Main />
      <AnimatePresence>{!settings.onboarded && habits.length === 0 && <Onboarding key="onb" />}</AnimatePresence>
    </>
  );
}

const OBSTACLES: { label: string; action: "edit" | "tip"; tip: string }[] = [
  { label: "Estava difícil demais", action: "edit", tip: "" },
  { label: "Esqueci", action: "edit", tip: "" },
  { label: "Sem tempo", action: "tip", tip: "Tente a versão de 1 minuto: o mínimo conta." },
  { label: "Sem energia", action: "tip", tip: "Ligue o dia difícil quando precisar: só o essencial." },
];

const dowOf = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};

function Main() {
  const {
    habits,
    getValue,
    setValue,
    addHabit,
    removeHabit,
    updateHabit,
    isPaused,
    settings,
    updateSettings,
    getCheckin,
    endPause,
  } = useHabits();
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
  const [editing, setEditing] = useState<Habit | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [gardenOpen, setGardenOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [tryKey, setTryKey] = useState<string | null>(null);
  const [evolutionOpen, setEvolutionOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const ambientOn = useSyncExternalStore(subscribe, isPlaying, () => false);
  const remindRef = useRef<(text: string) => void>(() => {});
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
      const live = set.filter((h) => !isPeriodic(h) || levelOf(h, getValue(h.id, date)) >= 1);
      if (live.length === 0) return 0;
      const done = live.filter((h) => levelOf(h, getValue(h.id, date)) >= 1).length;
      return done / live.length;
    },
    [habits, essentials, hardDay, today, getValue]
  );

  const evo = useEvolution(today);
  const doneCount = visible.filter((h) => levelOf(h, getValue(h.id, selected)) >= 1).length;

  const moment = momentOf();
  const reviewStart = reviewWeekStart(today);
  const dowToday = parseKey(today).getDay();
  const retroOffer =
    isToday && evo.activeDays >= 2 && (dowToday === 0 || dowToday === 1 || dowToday === 2) && settings.retroSeenWeek !== reviewStart;

  // Em dia pesado (humor ou energia baixos) as frases ficam mais acolhedoras.
  const lowDay = isLowDay(getCheckin(today));
  const pauseNow = activePause(settings.pauses, today);
  const offerOpen =
    isToday && !pauseNow && lowDay && !hardDay && essentials.length > 0 && settings.offerDismissedDate !== today;
  // "voltando": nada feito ontem nem anteontem, mas já houve atividade no último mês
  const returning = useMemo(() => {
    if (!isToday || habits.length === 0) return false;
    const back = lastDays(today, 31).slice(0, -1); // do mais antigo ao dia anterior
    const recent = back.slice(-2);
    const older = back.slice(0, -2);
    return recent.every((d) => ratio(d) === 0) && older.some((d) => ratio(d) > 0);
  }, [isToday, habits.length, today, ratio]);
  const yesterdayBlank = useMemo(
    () => isToday && habits.length > 0 && ratio(lastDays(today, 2)[0]) === 0,
    [isToday, habits.length, today, ratio]
  );
  const dayContext: PhraseMoment = (() => {
    if (visible.length > 0 && doneCount === visible.length) return "allDone";
    if (doneCount > 0) return "partial";
    if (returning) return "returning";
    if (parseKey(today).getDate() === 1) return "monthStart";
    if (dowToday === 1) return "monday";
    if (dowToday === 0) return "sunday";
    return moment;
  })();
  const phrase = useMemo(() => {
    if (!isToday) return "";
    if (hardDay || lowDay || pauseNow) return phraseFor(settings.tone, "hardDay", today);
    // algumas vezes por semana, a frase cita o que a pessoa contou no começo
    if (dayContext === "morning" || dayContext === "afternoon" || dayContext === "evening" || dayContext === "partial") {
      const mine = profileLine(settings.profile, today);
      if (mine && (today.charCodeAt(9) + today.charCodeAt(8)) % 3 === 0) return mine;
    }
    return phraseFor(settings.tone, dayContext, today);
  }, [isToday, hardDay, lowDay, pauseNow, settings.tone, settings.profile, dayContext, today]);

  let stuck: { habit: Habit; days: number } | null = null;
  if (isToday && !pauseNow && !hardDay) {
    for (const h of visible) {
      if (settings.obstacleSeen[h.id] === today) continue;
      const days = missedRun(h, today, getValue, isPaused);
      if (days >= 3) {
        stuck = { habit: h, days };
        break;
      }
    }
  }

  // ciência aplicada: "não falhe duas vezes" (ontem ficou de fora) e meta que ficou fácil demais
  let again: { habit: Habit; run: number } | null = null;
  let raise: { habit: Habit; from: number; to: number } | null = null;
  if (isToday && !pauseNow && !hardDay && !stuck) {
    for (const h of visible) {
      if (dismissed(settings.obstacleSeen, `nm2:${h.id}`, today)) continue;
      const run = missedOnce(h, today, getValue, isPaused);
      if (run !== null) {
        again = { habit: h, run };
        break;
      }
    }
    if (!again) {
      for (const h of visible) {
        if (dismissed(settings.obstacleSeen, `up:${h.id}`, today, 14)) continue;
        const sug = raiseSuggestion(h, today, getValue);
        if (sug) {
          raise = { habit: h, ...sug };
          break;
        }
      }
    }
  }
  const hideNudge = (key: string) => updateSettings({ obstacleSeen: { ...settings.obstacleSeen, [key]: today } });

  const showToast = (text: string) => {
    const id = ++toastSeq.current;
    setToast({ id, text });
    timers.current.push(setTimeout(() => setToast((t) => (t?.id === id ? null : t)), Math.max(2600, text.length * 55)));
  };

  // lembretes: confere a cada 30 s se algum horário já chegou (com o app aberto)
  useEffect(() => {
    remindRef.current = showToast;
  });
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const day = dateKey(now);
      const due = dueReminders(
        habits,
        now,
        (h) => levelOf(h, getValue(h.id, day)) >= 1,
        (h) => wasNotified(h, day)
      );
      for (const h of due) {
        markNotified(h, day);
        const text = `${h.emoji ?? "🔔"} Hora de: ${h.name}. O mínimo já conta.`;
        remindRef.current(text);
        if (document.visibilityState !== "visible") void systemNotify("Enso", `${h.name}: o mínimo já conta.`);
      }
    };
    check();
    const t = setInterval(check, 30_000);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", check);
    };
  }, [habits, getValue]);

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
      const kind: PhraseMoment =
        after === 2 ? "ideal" : yesterdayBlank && doneCount === 0 ? "comeback" : "minimum";
      // primeiro hábito do dia pode fechar um marco de dias de prática
      const newTotal = evo.activeDays + 1;
      const milestone = before === 0 && doneCount === 0 && MILESTONE_DAYS.includes(newTotal) ? MILESTONE_TEXT[newTotal] : null;
      timers.current.push(setTimeout(() => showToast(milestone ?? randomPhrase(settings.tone, kind)), 350));
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {tab === "today" && (
        <>
      {/* topo */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="whitespace-nowrap text-[13px] text-muted first-letter:uppercase">{longDate(selected)}</p>
          <h1 className="font-display mt-1 text-[clamp(1.85rem,9vw,2.25rem)] leading-tight">
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
          <IconButton label="Som ambiente" active={ambientOn} onClick={() => setAmbientOpen(true)}>
            <WaveIcon />
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-xl leading-snug text-ink/90"
            >
              {phrase.split(/ \((?=[^()]*\)$)/)[0]}
              {/ \([^()]*\)$/.test(phrase) && (
                <span className="mt-1.5 block font-sans text-[12px] leading-snug text-muted">
                  {phrase.match(/ \(([^()]*)\)$/)?.[1]}
                </span>
              )}
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

      {/* pausa planejada em andamento */}
      <AnimatePresence>
        {isToday && pauseNow && (
          <motion.div
            key="pause"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border p-4" style={{ borderColor: "var(--sage)" }}>
              <p className="font-display text-lg">Em pausa{pauseNow.reason ? ` · ${pauseNow.reason}` : ""}</p>
              <p className="mt-1 text-sm leading-snug text-muted">
                {rangeText(pauseNow)}. Sua sequência está protegida; se você fizer algo hoje, conta do mesmo jeito.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => endPause(pauseNow.id, today)}
                  className="rounded-full px-4 py-2 text-sm font-medium"
                  style={{ background: "var(--ink)", color: "var(--bg)" }}
                >
                  Voltar agora
                </button>
                <button type="button" onClick={() => setPauseOpen(true)} className="rounded-full border border-line px-4 py-2 text-sm text-muted">
                  Ver pausas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dia difícil ligado */}
      <AnimatePresence>
        {isToday && hardDay && !pauseNow && (
          <motion.div
            key="hard"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border p-4" style={{ borderColor: "var(--sage)" }}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg">Dia difícil ligado</p>
                <button
                  type="button"
                  onClick={() => updateSettings({ hardDayDate: null })}
                  className="min-h-9 rounded-full bg-surface-2 px-4 text-[13px] text-muted active:scale-95"
                >
                  Voltar ao normal
                </button>
              </div>
              <p className="mt-1 text-sm leading-snug text-muted">
                {essentials.length > 0
                  ? `Hoje só ${essentials.length === 1 ? "o hábito essencial aparece" : "os hábitos essenciais aparecem"}. Os outros voltam amanhã, sem nenhuma culpa.`
                  : "Hoje o mínimo de cada hábito já é uma vitória. Escolha abaixo o que fica na tela hoje."}
              </p>
              {habits.length > 1 && (
                <div className="mt-3">
                  <p className="text-xs text-muted">Toque para escolher o que fica hoje:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {habits.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        aria-pressed={h.essential}
                        onClick={() => updateHabit(h.id, { essential: !h.essential })}
                        className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                        style={{
                          borderColor: h.essential ? "var(--sage)" : "var(--line)",
                          background: h.essential ? "color-mix(in srgb, var(--sage) 18%, transparent)" : "transparent",
                          color: h.essential ? "var(--ink)" : "var(--muted)",
                        }}
                      >
                        {h.essential ? "✓ " : ""}
                        {h.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* convite para a retrospectiva: domingo, segunda e terça, uma vez por semana */}
      <AnimatePresence>
        {retroOffer && (
          <motion.div
            key="retro"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex items-center gap-3 rounded-3xl border border-line px-4 py-3.5">
              <p className="min-w-0 flex-1 text-sm leading-snug">Sua semana está pronta para ser vista.</p>
              <button
                type="button"
                onClick={() => {
                  setReviewOpen(true);
                  updateSettings({ retroSeenWeek: reviewStart });
                }}
                className="rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "var(--ink)", color: "var(--bg)" }}
              >
                Ver
              </button>
              <button
                type="button"
                aria-label="Dispensar convite da semana"
                onClick={() => updateSettings({ retroSeenWeek: reviewStart })}
                className="px-1 text-sm text-muted"
              >
                Agora não
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* check-in de humor e energia */}
      <div className="mt-5">
        <CheckIn key={selected} date={selected} isToday={isToday} onOpenDiary={() => setDiaryOpen(true)} onOpenMood={() => setMoodOpen(true)} />
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

      {/* checagem de obstáculos: hábito parado há 3+ dias */}
      <AnimatePresence>
        {stuck && (
          <motion.div
            key={`stuck-${stuck.habit.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border border-line p-4">
              <p className="font-display text-lg">{stuck.habit.name} travou?</p>
              <p className="mt-1 text-sm leading-snug text-muted">
                Faz {stuck.days} dias que ele não acontece. Sem julgamento: o que costuma atrapalhar? Cada resposta tem um ajuste pequeno.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OBSTACLES.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => {
                      updateSettings({ obstacleSeen: { ...settings.obstacleSeen, [stuck.habit.id]: today } });
                      if (o.action === "edit") setEditing(stuck.habit);
                      else showToast(o.tip);
                    }}
                    className="rounded-full border border-line px-3.5 py-2 text-[13px]"
                  >
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => updateSettings({ obstacleSeen: { ...settings.obstacleSeen, [stuck.habit.id]: today } })}
                  className="px-2 py-2 text-[13px] text-muted"
                >
                  Agora não
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* não falhe duas vezes */}
      <AnimatePresence>
        {again && (
          <motion.div
            key={`again-${again.habit.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border border-line p-4">
              <p className="font-display text-lg">Um dia de folga não quebra nada</p>
              <p className="mt-1 text-sm leading-snug text-muted">
                {again.habit.name} ficou de fora ontem, depois de {again.run} dias seguidos. Pesquisas mostram que um dia perdido pesa pouco; o que pesa é perder dois. Hoje o mínimo já basta.
              </p>
              <button
                type="button"
                onClick={() => hideNudge(`nm2:${again.habit.id}`)}
                className="mt-3 rounded-full border border-line px-4 py-2 text-sm text-muted"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        )}
        {raise && (
          <motion.div
            key={`raise-${raise.habit.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 rounded-3xl border p-4" style={{ borderColor: "var(--sage)" }}>
              <p className="font-display text-lg">{raise.habit.name} está leve</p>
              <p className="mt-1 text-sm leading-snug text-muted">
                Você chegou ao ideal em quase todos os últimos 14 dias. Uma meta um pouco maior mantém o desafio sem assustar: de {raise.from} para {raise.to} {raise.habit.unit}. Se preferir, fica como está.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateHabit(raise.habit.id, { target: raise.to });
                    hideNudge(`up:${raise.habit.id}`);
                    showToast(`Meta nova: ${raise.to} ${raise.habit.unit}.`);
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium"
                  style={{ background: "var(--ink)", color: "var(--bg)" }}
                >
                  Subir para {raise.to}
                </button>
                <button
                  type="button"
                  onClick={() => hideNudge(`up:${raise.habit.id}`)}
                  className="rounded-full border border-line px-4 py-2 text-sm text-muted"
                >
                  Manter
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
        {useEssentialOnly ? (
          <span style={{ color: "var(--sage)" }}>só o essencial</span>
        ) : (
          <span className="flex items-center gap-1">
            {habits.length > 1 && (
              <button type="button" onClick={() => setReorderOpen(true)} className="min-h-11 rounded-full px-3 text-[13px]">
                Ordenar
              </button>
            )}
            <button type="button" onClick={() => setAddOpen(true)} className="flex min-h-11 items-center gap-1 rounded-full px-3 text-[13px]">
              <PlusIcon /> Novo
            </button>
          </span>
        )}
      </div>

      {/* hábitos */}
        <div className="mt-3 flex flex-col gap-4">
          <AnimatePresence initial>
            {visible.map((h) => (
              <HabitCard
                key={h.id}
                habit={h}
                value={getValue(h.id, selected)}
                onChange={(v) => handleChange(h, v)}
                onRemove={() => removeHabit(h.id)}
                onEdit={() => setEditing(h)}
                onDetails={() => setDetailId(h.id)}
                onToggleEssential={() => updateHabit(h.id, { essential: !h.essential })}
                offDay={!!h.days?.length && !h.days.includes(dowOf(selected))}
                progress={
                  isPeriodic(h)
                    ? { done: periodDone(h, selected, getValue), goal: goalOf(h), label: h.period === "week" ? "nesta semana" : "neste mês" }
                    : null
                }
              />
            ))}
          </AnimatePresence>
        </div>

      {/* jardim: cada hábito vira uma planta */}
      <GardenCard today={today} onOpen={() => setGardenOpen(true)} />
      {habits.length > 0 && <EvolutionCard today={today} onOpen={() => setTab("evolution")} />}

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

      {/* botão de adicionar (na página, não flutua) */}
      <div className="mt-6 flex justify-center">
        <motion.button
          type="button"
          onClick={() => setAddOpen(true)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ y: -2 }}
          className="flex items-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium shadow-[var(--shadow)]"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          <PlusIcon /> Novo hábito
        </motion.button>
      </div>

        </>
      )}

      {tab === "evolution" && (
        <EvolutionPage
          today={today}
          onOpenMood={() => setMoodOpen(true)}
          onOpenGarden={() => setGardenOpen(true)}
          onOpenStats={() => setStatsOpen(true)}
          onOpenReview={() => setReviewOpen(true)}
        />
      )}

      {tab === "learn" && (
        <LearnPage
          onTry={(key) => {
            setTryKey(key);
            setAddOpen(true);
          }}
          onOpenAbout={() => setAboutOpen(true)}
        />
      )}

      {/* aviso suave */}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-20 flex justify-center px-6">
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

      <BottomNav tab={tab} onChange={(t) => { setTab(t); window.scrollTo({ top: 0 }); }} />
      <Celebration show={celebrate !== null} phrase={celebrate ?? ""} />
      <HabitDetailSheet id={detailId} today={today} onClose={() => setDetailId(null)} />
      <DiarySheet open={diaryOpen} onClose={() => setDiaryOpen(false)} />
      <EvolutionSheet open={evolutionOpen} onClose={() => setEvolutionOpen(false)} today={today} />
      <MoodSheet open={moodOpen} onClose={() => setMoodOpen(false)} today={today} onOpenDiary={() => { setMoodOpen(false); setDiaryOpen(true); }} />
      <AddHabitSheet
        open={addOpen || !!editing}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
          setTimeout(() => setTryKey(null), 300);
        }}
        startWith={tryKey}
        onAdd={(t) => {
          addHabit(t);
          if (tryKey) {
            setTab("today");
            showToast("Hábito criado. Teste por uma semana e veja o que muda.");
          }
        }}
        editing={editing}
        onSave={updateHabit}
      />
      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenPauses={() => {
          setSettingsOpen(false);
          setPauseOpen(true);
        }}
        onOpenAbout={() => {
          setSettingsOpen(false);
          setAboutOpen(true);
        }}
        onOpenDiary={() => {
          setSettingsOpen(false);
          setDiaryOpen(true);
        }}
      />
      <PauseSheet open={pauseOpen} onClose={() => setPauseOpen(false)} today={today} />
      <StatsSheet
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        today={today}
        onOpenReview={() => {
          setStatsOpen(false);
          setReviewOpen(true);
        }}
        onOpenHabit={(id) => {
          setStatsOpen(false);
          setDetailId(id);
        }}
      />
      <AboutSheet open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <GardenSheet open={gardenOpen} onClose={() => setGardenOpen(false)} today={today} />
      <ReorderSheet open={reorderOpen} onClose={() => setReorderOpen(false)} />
      <AmbientSheet open={ambientOpen} onClose={() => setAmbientOpen(false)} />
      <WeekReviewSheet open={reviewOpen} onClose={() => setReviewOpen(false)} weekStart={reviewStart} />

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
