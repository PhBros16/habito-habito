"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { longDate } from "@/lib/dates";
import { AUTOMATIC_MEDIAN, MILESTONE_TEXT, evolution, type Evolution } from "@/lib/evolution";
import { MOOD_LABEL } from "@/lib/checkin";
import type { Mood } from "@/lib/types";

export function useEvolution(today: string): Evolution {
  const { habits, getValue, getCheckin, isPaused } = useHabits();
  return useMemo(
    () => evolution(habits, today, getValue, getCheckin, isPaused),
    [habits, today, getValue, getCheckin, isPaused]
  );
}

export function headline(e: Evolution): string {
  if (!e.hasData) return "Sua jornada começa no primeiro hábito que você fizer.";
  if (e.delta === null) return "Daqui a algumas semanas você poderá comparar fases. Por enquanto, cada dia soma.";
  if (e.delta >= 5) return `Você está mais constante: ${e.delta} pontos acima das 4 semanas anteriores.`;
  if (e.delta <= -5)
    return "O ritmo ficou um pouco menor nas últimas 4 semanas. Isso acontece em toda jornada; o que conta é retomar.";
  return "Você manteve o ritmo nas últimas 4 semanas. É a constância que constrói.";
}

/** O ensō: um círculo aberto que se completa a cada marco de dias de prática. */
export function Enso({ progress, size = 120, children }: { progress: number; size?: number; children?: React.ReactNode }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden style={{ transform: "rotate(-96deg)" }}>
        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="var(--sage)"
          strokeWidth="7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.02, Math.min(1, progress)) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function EvolutionCard({ today, onOpen }: { today: string; onOpen: () => void }) {
  const e = useEvolution(today);
  return (
    <motion.button
      type="button"
      aria-label="Abrir sua evolução"
      onClick={onOpen}
      whileTap={{ scale: 0.985 }}
      className="card mt-4 flex w-full items-center gap-4 p-4 text-left"
      style={{ borderRadius: 26 }}
    >
      <Enso progress={e.next ? e.next.progress : 1} size={72}>
        <span className="font-display text-xl leading-none tabular-nums">{e.activeDays}</span>
      </Enso>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight">Sua evolução</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">
          {e.hasData && e.next
            ? `${e.activeDays} ${e.activeDays === 1 ? "dia" : "dias"} de prática · faltam ${e.next.remaining} para ${e.next.days}.`
            : headline(e)}
        </p>
      </div>
      <span className="text-xs text-muted">ver →</span>
    </motion.button>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm text-muted">{title}</h3>
      {children}
    </section>
  );
}

const pct = (x: number) => Math.round(x * 100);
const moodOf = (x: number) => MOOD_LABEL[Math.min(5, Math.max(1, Math.round(x))) as Mood];

export function EvolutionSheet({ open, onClose, today }: { open: boolean; onClose: () => void; today: string }) {
  return (
    <Sheet open={open} onClose={onClose} title="Sua evolução">
      <EvolutionBody today={today} />
    </Sheet>
  );
}

export function EvolutionBody({ today }: { today: string }) {
  const e = useEvolution(today);
  const maxKept = 7;

  return (
    <div className="flex flex-col gap-7 pb-2">
      <div className="flex items-center gap-5">
        <Enso progress={e.next ? e.next.progress : 1} size={112}>
          <div>
            <p className="font-display text-3xl leading-none tabular-nums">{e.activeDays}</p>
            <p className="mt-1 text-[11px] text-muted">dias de prática</p>
          </div>
        </Enso>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-snug">{headline(e)}</p>
          {e.next && (
            <p className="mt-2 text-[13px] text-muted">
              Próximo marco: {e.next.days} dias (faltam {e.next.remaining}).
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={e.journeyDays} label="dias de jornada" />
        <Stat value={e.activeDays} label="dias de prática" />
        <Stat value={e.comebacks} label={e.comebacks === 1 ? "recomeço" : "recomeços"} />
      </div>
      {e.comebacks > 0 && (
        <p className="-mt-3 text-[13px] leading-snug text-muted">
          Recomeço é voltar depois de 3 dias ou mais sem fazer. Cada um mostra que a prática sobrevive a dias ruins.
        </p>
      )}

      {e.weeks.some((w) => w.rate !== null) && (
        <Block title="Constância, semana a semana">
          <div className="flex h-24 items-end gap-1.5" role="img" aria-label="Conclusão média nas últimas 12 semanas">
            {e.weeks.map((w, i) => (
              <div key={w.start} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <motion.i
                  className="block w-full rounded-lg"
                  title={`${longDate(w.start)}: ${w.kept} ${w.kept === 1 ? "dia" : "dias"} de prática`}
                  style={{
                    background: w.rate === null ? "var(--surface-2)" : "var(--sage)",
                    opacity: w.rate === null ? 0.5 : w.current ? 1 : 0.55 + 0.45 * (w.kept / maxKept),
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(5, (w.rate ?? 0) * 80)}px` }}
                  transition={{ delay: 0.03 * i, type: "spring", stiffness: 140, damping: 18 }}
                />
              </div>
            ))}
          </div>
          <p className="text-[12px] text-muted">Altura: média de hábitos feitos por dia. A última barra é a semana atual.</p>
        </Block>
      )}

      {e.first !== null && e.last !== null && (
        <Block title="Antes e agora">
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Primeiras 2 semanas", v: e.first },
              { label: "Últimas 2 semanas", v: e.last },
            ].map((r, i) => (
              <div key={r.label} className="flex items-center gap-3 text-[13px]">
                <span className="w-36 shrink-0 text-muted">{r.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.span
                    className="block h-full rounded-full"
                    style={{ background: "var(--sage)", opacity: i === 0 ? 0.55 : 1 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct(r.v)}%` }}
                    transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.1 * i }}
                  />
                </span>
                <span className="w-9 text-right tabular-nums">{pct(r.v)}%</span>
              </div>
            ))}
          </div>
        </Block>
      )}

      {(() => {
        const grown = e.habits
          .filter((h) => (h.rateChange ?? 0) > 0 || (h.valueChange ?? 0) > 0)
          .sort((a, b) => (b.rateChange ?? 0) - (a.rateChange ?? 0))
          .slice(0, 4);
        if (grown.length === 0) return null;
        return (
          <Block title="O que mais cresceu">
            <ul className="flex flex-col gap-2">
              {grown.map(({ habit, rateChange, valueChange }) => (
                <li key={habit.id} className="flex flex-col gap-1 rounded-2xl border border-line px-4 py-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <i className="block h-2 w-2 shrink-0 rounded-full" style={{ background: accentColor(habit.accent) }} />
                    <span className="truncate">{habit.name}</span>
                  </span>
                  <span className="pl-4 text-[13px] text-muted">
                    {rateChange !== null && rateChange > 0 ? `+${rateChange} pontos de constância` : null}
                    {rateChange !== null && rateChange > 0 && valueChange !== null && valueChange > 0 ? " · " : null}
                    {valueChange !== null && valueChange > 0 ? `+${valueChange}% de ${habit.unit} por dia` : null}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-muted">Compara os últimos 28 dias com os 28 anteriores.</p>
          </Block>
        );
      })()}

      {e.habits.some((h) => h.days > 0) && (
        <Block title="Caminho até o automático">
          <ul className="flex flex-col gap-3">
            {e.habits
              .filter((h) => h.days > 0)
              .sort((a, b) => b.days - a.days)
              .map(({ habit, days, auto }, i) => (
                <li key={habit.id} className="text-[13px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-[14px]">{habit.name}</span>
                    <span className="shrink-0 tabular-nums text-muted">
                      {days} de ~{AUTOMATIC_MEDIAN} dias
                    </span>
                  </div>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: accentColor(habit.accent) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct(auto)}%` }}
                      transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.05 * i }}
                    />
                  </span>
                </li>
              ))}
          </ul>
          <p className="text-[12px] leading-snug text-muted">
            No estudo clássico (Lally et al., 2010), um comportamento levou em média 66 dias para ficar automático, e a variação foi enorme: de 18 a 254 dias. Errar um dia isolado não atrapalhou. Use a barra como bússola, não como prazo.
          </p>
        </Block>
      )}

      {e.mood && (e.mood.recent !== null || e.mood.before !== null) && (
        <Block title="Humor">
          <p className="text-sm leading-snug">
            {e.mood.recent !== null && <>Média dos últimos 28 dias: <b className="font-medium">{moodOf(e.mood.recent)}</b>. </>}
            {e.mood.before !== null && <>Nas 4 semanas anteriores: {moodOf(e.mood.before)}.</>}
          </p>
          {e.mood.delta !== null && Math.abs(e.mood.delta) >= 0.4 && (
            <p className="text-[13px] text-muted">
              {e.mood.delta > 0 ? "O humor médio subiu. Não prova a causa, mas vale notar o que mudou." : "O humor médio ficou mais baixo. Se persistir, vale cuidar de descanso e apoio."}
            </p>
          )}
        </Block>
      )}

      <Block title="Marcos">
        <ul className="flex flex-col">
          {e.milestones.map((m, i) => {
            const got = m.date !== null;
            return (
              <li key={m.days} className="flex gap-3.5">
                <span className="flex flex-col items-center">
                  <i
                    className="mt-1 block h-3 w-3 shrink-0 rounded-full border-2"
                    style={{ borderColor: got ? "var(--sage)" : "var(--line)", background: got ? "var(--sage)" : "transparent" }}
                  />
                  {i < e.milestones.length - 1 && <i className="block w-px flex-1" style={{ background: "var(--line)" }} />}
                </span>
                <div className="pb-4" style={{ opacity: got ? 1 : 0.5 }}>
                  <p className="text-sm">
                    {m.days} {m.days === 1 ? "dia" : "dias"} de prática
                    {got && <span className="text-muted"> · {longDate(m.date!).split(",")[1]?.trim() ?? m.date}</span>}
                  </p>
                  <p className="text-[13px] leading-snug text-muted">{MILESTONE_TEXT[m.days]}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Block>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-line px-3 py-3">
      <p className="font-display text-2xl tabular-nums">{value}</p>
      <p className="text-[12px] leading-tight text-muted">{label}</p>
    </div>
  );
}
