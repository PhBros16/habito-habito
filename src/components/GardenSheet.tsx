"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { GardenScene } from "./Garden";
import { accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { addDays, dateKey, lastDays, longDate } from "@/lib/dates";
import { levelOf } from "@/lib/types";
import { overview } from "@/lib/stats";
import { GARDEN_LEVELS, STAGE_DAYS, STAGE_NAMES, gardenLevel, gardenPlants, type Plant } from "@/lib/garden";

/** Dados do jardim a partir dos hábitos (compartilhado entre o cartão da home e a sheet). */
export function useGarden(today: string) {
  const { habits, getValue, isPaused } = useHabits();
  const [hour] = useState(() => new Date().getHours());
  const plants = useMemo(() => gardenPlants(habits, today, getValue, isPaused), [habits, today, getValue, isPaused]);
  const streak = useMemo(() => overview(habits, today, getValue, isPaused).current, [habits, today, getValue, isPaused]);
  return { plants, hour, streak };
}

export function GardenCard({ today, onOpen }: { today: string; onOpen: () => void }) {
  const { plants, hour, streak } = useGarden(today);
  if (plants.length === 0) return null;
  return (
    <motion.button
      type="button"
      aria-label="Abrir jardim"
      onClick={onOpen}
      whileTap={{ scale: 0.985 }}
      className="card mt-4 block w-full overflow-hidden text-left"
      style={{ borderRadius: 26 }}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
        <span className="font-display text-lg">Seu jardim</span>
        <span className="text-xs text-muted">ver →</span>
      </div>
      <GardenScene plants={plants} hour={hour} streak={streak} compact />
      <GardenFooter plants={plants} />
    </motion.button>
  );
}

function GardenFooter({ plants }: { plants: Plant[] }) {
  const watered = plants.filter((p) => p.doneToday).length;
  const level = gardenLevel(plants);
  const nextLevel = level.next !== null ? GARDEN_LEVELS[level.index + 1] : null;
  // sinal de crescimento imediato: a cada hábito feito o contador pulsa
  const [seen, setSeen] = useState(watered);
  const [pulse, setPulse] = useState(0);
  if (seen !== watered) {
    if (watered > seen) setPulse((n) => n + 1);
    setSeen(watered);
  }
  const brandNew = plants.every((p) => p.days === 0);
  return (
    <div className="flex items-center gap-3 px-4 pb-3.5 pt-2.5 text-[12.5px] text-muted">
      <span className="flex items-center gap-1.5">
        <motion.span
          key={pulse}
          initial={pulse ? { scale: 1.5 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 14 }}
          className="flex gap-1"
          aria-hidden
        >
          {plants.slice(0, 8).map((p) => (
            <i key={p.habit.id} className="block h-2 w-2 rounded-full" style={{ background: p.doneToday ? accentColor(p.habit.accent) : "var(--line)" }} />
          ))}
        </motion.span>
        {brandNew ? "Faça um hábito e veja a semente brotar" : `${watered} de ${plants.length} ${plants.length === 1 ? "planta regada" : "plantas regadas"} hoje`}
      </span>
      {nextLevel && !brandNew && (
        <span className="ml-auto shrink-0">
          faltam {level.next! - level.total} para {nextLevel.name}
        </span>
      )}
    </div>
  );
}

export function GardenSheet({
  open,
  onClose,
  today,
}: {
  open: boolean;
  onClose: () => void;
  today: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Seu jardim">
      <Body today={today} />
    </Sheet>
  );
}

/** Crescimento de hoje, o que está perto de acontecer e as últimas duas semanas. */
function Today({ plants, level, today }: { plants: Plant[]; level: ReturnType<typeof gardenLevel>; today: string }) {
  const { habits, getValue } = useHabits();
  const watered = plants.filter((p) => p.doneToday).length;

  const soon = useMemo(() => {
    const items: { text: string; left: number }[] = [];
    for (const p of plants) {
      const next = STAGE_DAYS[p.stage + 1];
      if (next !== undefined) items.push({ text: `${p.habit.name} vira ${STAGE_NAMES[p.stage + 1].toLowerCase()}`, left: next - p.days });
    }
    const nl = GARDEN_LEVELS[level.index + 1];
    if (nl) items.push({ text: `O jardim vira ${nl.name.toLowerCase()}: ${nl.unlock.charAt(0).toLowerCase()}${nl.unlock.slice(1)}`.replace(/\.$/, ""), left: nl.at - level.total });
    return items.sort((a, b) => a.left - b.left).slice(0, 3);
  }, [plants, level]);

  const days = useMemo(() => lastDays(today, 14), [today]);
  const counts = useMemo(
    () =>
      days.map((d) =>
        habits.filter((h) => dateKey(new Date(h.createdAt)) <= d && levelOf(h, getValue(h.id, d)) >= 1).length
      ),
    [days, habits, getValue]
  );
  const max = Math.max(1, plants.length, ...counts);
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line p-3.5">
      <div>
        <p className="font-display text-lg">
          {watered === 0 ? "Hoje o jardim espera por você" : `Hoje o jardim cresceu em ${watered} ${watered === 1 ? "lugar" : "lugares"}`}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">
          {watered === 0
            ? "Um hábito feito, mesmo no mínimo, já rega a planta dele."
            : watered === plants.length
              ? "Tudo regado. Volte amanhã para ver o que mudou."
              : "Cada hábito feito rega a planta dele. O resto pode ficar para depois."}
        </p>
      </div>

      {soon.length > 0 && (
        <div>
          <p className="text-[12px] uppercase tracking-wide text-muted">Perto de acontecer</p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {soon.map((it) => (
              <li key={it.text} className="flex items-baseline justify-between gap-3 text-[14px]">
                <span className="min-w-0">{it.text}</span>
                <span className="shrink-0 text-[12px] tabular-nums text-muted">
                  {it.left === 1 ? "em 1 dia feito" : `em ${it.left} dias feitos`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-[12px] uppercase tracking-wide text-muted">Últimos 14 dias</p>
        <div className="mt-2 flex h-14 items-end gap-1" role="img" aria-label="Plantas regadas por dia nos últimos 14 dias">
          {counts.map((c, i) => (
            <motion.i
              key={days[i]}
              title={`${longDate(days[i])}: ${c}`}
              className="block flex-1 rounded-md"
              style={{ background: c ? "var(--sage)" : "var(--surface-2)", opacity: c ? 0.5 + 0.5 * (c / max) : 1 }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (c / max) * 52)}px` }}
              transition={{ delay: 0.025 * i, type: "spring", stiffness: 160, damping: 18 }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-muted">
          {total === 0 ? "A primeira rega faz a diferença." : `${total} ${total === 1 ? "rega" : "regas"} nesta quinzena. Cada uma é crescimento real.`}
        </p>
      </div>
    </div>
  );
}

/** Time-lapse: o jardim crescendo desde o primeiro hábito até hoje. */
function useReplay(today: string) {
  const { habits, getValue, isPaused } = useHabits();
  const frames = useMemo(() => {
    if (habits.length === 0) return [] as string[];
    const first = habits.map((h) => dateKey(new Date(h.createdAt))).sort()[0];
    const all: string[] = [];
    for (let d = first; d <= today; d = addDays(d, 1)) all.push(d);
    if (all.length < 3) return [];
    const step = Math.max(1, Math.ceil(all.length / 48));
    const out = all.filter((_, i) => i % step === 0);
    if (out[out.length - 1] !== today) out.push(today);
    return out;
  }, [habits, today]);
  const [frame, setFrame] = useState<number | null>(null);

  useEffect(() => {
    if (frame === null) return;
    const last = frame >= frames.length - 1;
    const t = setTimeout(() => setFrame((f) => (f === null ? null : last ? null : f + 1)), last ? 1400 : 150);
    return () => clearTimeout(t);
  }, [frame, frames.length]);

  const date = frame === null ? null : (frames[Math.min(frame, frames.length - 1)] ?? null);
  const data = useMemo(() => {
    if (date === null) return null;
    const alive = habits.filter((h) => dateKey(new Date(h.createdAt)) <= date);
    const plants = gardenPlants(alive, date, getValue, isPaused);
    const streak = overview(alive, date, getValue, isPaused).current;
    return { plants, streak };
  }, [date, habits, getValue, isPaused]);

  return { can: frames.length > 0, playing: frame !== null, date, data, start: () => setFrame(0), stop: () => setFrame(null), progress: frame === null || frames.length < 2 ? 0 : frame / (frames.length - 1) };
}

function Body({ today }: { today: string }) {
  const { plants: livePlants, hour, streak: liveStreak } = useGarden(today);
  const replay = useReplay(today);
  const plants = replay.data?.plants ?? livePlants;
  const streak = replay.data?.streak ?? liveStreak;
  const [openId, setOpenId] = useState<string | null>(null);
  const level = gardenLevel(plants);

  if (plants.length === 0) {
    return (
      <p className="pb-6 text-[15px] leading-relaxed text-muted">
        O jardim nasce com o seu primeiro hábito. Cada um vira uma planta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="-mx-1 overflow-hidden rounded-3xl border border-line">
        <GardenScene plants={plants} hour={hour} streak={streak} onPick={(id) => setOpenId((c) => (c === id ? null : id))} />
      </div>

      {replay.can && (
        <div className="-mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={replay.playing ? replay.stop : replay.start}
            className="rounded-full border border-line px-4 py-2 text-sm"
          >
            {replay.playing ? "Parar" : "Ver o jardim crescer"}
          </button>
          <span className="min-w-0 flex-1 text-[13px] text-muted">
            {replay.playing && replay.date ? (
              <>
                <span className="block first-letter:uppercase">{longDate(replay.date)}</span>
                <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full" style={{ width: `${replay.progress * 100}%`, background: "var(--sage)", transition: "width 150ms linear" }} />
                </span>
              </>
            ) : (
              "Reveja o crescimento desde o primeiro dia."
            )}
          </span>
        </div>
      )}

      <Today plants={plants} level={level} today={today} />

      <div className="rounded-2xl border border-line p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg">Nível {level.index + 1}: {level.name}</span>
          <span className="text-sm text-muted">{level.total} {level.total === 1 ? "dia" : "dias"} somados</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div className="h-full rounded-full" style={{ background: "var(--sage)" }} initial={{ width: 0 }} animate={{ width: `${level.progress * 100}%` }} transition={{ delay: 0.3, type: "spring", stiffness: 90, damping: 20 }} />
        </div>
        <p className="mt-2.5 text-[13px] leading-snug text-muted">
          {level.unlock}
          {level.next !== null && ` Próximo nível: ${GARDEN_LEVELS[level.index + 1].name}, com ${level.next - level.total} dias somados.`}
        </p>
        <ul className="mt-2 space-y-1 text-[12px] text-muted">
          {GARDEN_LEVELS.slice(1).map((l, i) => (
            <li key={l.name} style={{ opacity: level.index >= i + 1 ? 1 : 0.5 }}>
              {level.index >= i + 1 ? "●" : "○"} {l.name} ({l.at} dias): {l.unlock}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[13px] leading-relaxed text-muted">
        Cada dia em que você faz um hábito, a planta dele cresce. Nada morre aqui: se você
        sumir, a planta só descansa e volta a crescer quando você voltar.
      </p>

      <div className="flex flex-col gap-2.5">
        {plants.map((p, i) => {
          const next = STAGE_DAYS[p.stage + 1];
          return (
            <motion.div
              key={p.habit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 240, damping: 26 }}
              className="rounded-2xl border p-3.5"
              style={{ borderColor: openId === p.habit.id ? accentColor(p.habit.accent) : "var(--line)" }}
            >
              <button type="button" className="block w-full text-left" aria-expanded={openId === p.habit.id} onClick={() => setOpenId((c) => (c === p.habit.id ? null : p.habit.id))}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <i className="block h-2 w-2 shrink-0 rounded-full" style={{ background: accentColor(p.habit.accent) }} />
                  <span className="font-display truncate text-lg">{p.habit.name}</span>
                </span>
                <span className="shrink-0 text-sm text-muted">{STAGE_NAMES[p.stage]}</span>
              </div>
              {p.toNext !== null && (
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: accentColor(p.habit.accent) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.toNext * 100}%` }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 90, damping: 20 }}
                  />
                </div>
              )}
              <p className="mt-2.5 text-[13px] text-muted">
                {p.days} {p.days === 1 ? "dia feito" : "dias feitos"}
                {next !== undefined && ` · faltam ${next - p.days} para ${STAGE_NAMES[p.stage + 1].toLowerCase()}`}
                {p.paused && " · em pausa, dormindo tranquila"}
                {p.resting && p.daysSince !== null && ` · descansando há ${p.daysSince} dias`}
                {p.doneToday && " · regada hoje"}
              </p>
              </button>
              {openId === p.habit.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <ol className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13px]">
                    {STAGE_NAMES.map((n, si) => (
                      <li key={n} className="flex items-center gap-2" style={{ opacity: p.stage >= si ? 1 : 0.45 }}>
                        <i className="block h-2 w-2 rounded-full" style={{ background: p.stage >= si ? accentColor(p.habit.accent) : "var(--line)" }} />
                        <span className="flex-1">{n}</span>
                        <span className="text-muted">{STAGE_DAYS[si]} {STAGE_DAYS[si] === 1 ? "dia" : "dias"}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[12px] leading-snug text-muted">
                    {p.stage >= 8
                      ? "Uma árvore lendária: mais de um ano de cuidado. Ela fica aqui para sempre."
                      : p.stage >= 6
                        ? "Já é uma árvore. Cada novo ano de cuidado a deixa mais antiga e frondosa."
                        : "Cada dia feito é uma gota. A planta nunca morre: se você sumir, ela só descansa."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
