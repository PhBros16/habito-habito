"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { Face } from "./CheckIn";
import { AnimatedNumber, accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { weekReview, type WeekReview } from "@/lib/stats";
import { MOOD_LABEL } from "@/lib/checkin";
import { longDate, parseKey } from "@/lib/dates";
import type { Mood } from "@/lib/types";

const LETTERS = ["S", "T", "Q", "Q", "S", "S", "D"]; // semana de segunda a domingo
const pct = (n: number) => Math.round(n * 100);

function rangeLabel(start: string, end: string): string {
  const s = parseKey(start);
  const e = parseKey(end);
  const month = (d: Date) => new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d);
  return s.getMonth() === e.getMonth()
    ? `${s.getDate()} a ${e.getDate()} de ${month(e)}`
    : `${s.getDate()} de ${month(s)} a ${e.getDate()} de ${month(e)}`;
}

function closing(r: WeekReview): string {
  if (r.keptDays === 0) return "Semana em branco também é semana. Recomeçar é o hábito, e ele começa pequeno.";
  if (r.activeDays > 0 && r.keptDays === r.activeDays)
    return "Presença todos os dias. Não foi perfeito, foi constante, e é isso que constrói.";
  if (r.keptDays >= 4) return "Uma semana sólida. O que você repete vira quem você é.";
  return "Cada dia que você apareceu conta. A próxima semana começa do mínimo, sem dívida.";
}

function Block({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.08, type: "spring", stiffness: 240, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}

export function WeekReviewSheet({
  open,
  onClose,
  weekStart,
}: {
  open: boolean;
  onClose: () => void;
  weekStart: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Sua semana">
      <Body weekStart={weekStart} />
    </Sheet>
  );
}

function Body({ weekStart }: { weekStart: string }) {
  const { habits, getValue, getCheckin } = useHabits();
  const r = useMemo(
    () => weekReview(habits, weekStart, getValue, getCheckin),
    [habits, weekStart, getValue, getCheckin]
  );

  if (r.activeDays === 0) {
    return (
      <p className="pb-6 text-[15px] leading-relaxed text-muted">
        Ainda não há uma semana para olhar. Assim que você registrar alguns dias, ela aparece aqui.
      </p>
    );
  }

  const delta = r.avg !== null && r.prevAvg !== null ? pct(r.avg) - pct(r.prevAvg) : null;
  let i = 0;

  return (
    <div className="flex flex-col gap-6 pb-2">
      <Block index={i++}>
        <p className="text-sm text-muted">{rangeLabel(r.start, r.end)}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <AnimatedNumber value={r.keptDays} className="font-display text-6xl leading-none" />
          <span className="font-display text-2xl text-muted">de {r.activeDays} dias</span>
        </p>
        <p className="mt-1 text-sm text-muted">com ao menos um hábito feito</p>
      </Block>

      <Block index={i++}>
        <div className="flex justify-between">
          {r.days.map((d, k) => {
            const ratio = d.ratio ?? 0;
            return (
              <div key={d.date} className="flex flex-col items-center gap-1.5">
                <svg viewBox="0 0 36 36" width={38} height={38} aria-label={`${longDate(d.date)}: ${d.ratio === null ? "sem dados" : `${pct(ratio)}%`}`} role="img">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={accentColor("sage")}
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                    strokeDasharray={88}
                    initial={{ strokeDashoffset: 88 }}
                    animate={{ strokeDashoffset: 88 * (1 - ratio) }}
                    transition={{ delay: 0.35 + k * 0.06, type: "spring", stiffness: 70, damping: 16 }}
                  />
                </svg>
                <span className="text-[11px] text-muted">{LETTERS[k]}</span>
              </div>
            );
          })}
        </div>
      </Block>

      <Block index={i++}>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-line p-3.5">
            <span className="flex items-baseline">
              <AnimatedNumber value={r.avg === null ? 0 : pct(r.avg)} className="font-display text-4xl leading-none" />
              <span className="font-display text-xl text-muted">%</span>
            </span>
            <span className="mt-2 block text-[11px] leading-tight text-muted">dos hábitos, em média</span>
          </div>
          <div className="rounded-2xl border border-line p-3.5">
            <AnimatedNumber value={r.fullDays} className="font-display text-4xl leading-none" />
            <span className="mt-2 block text-[11px] leading-tight text-muted">
              {r.fullDays === 1 ? "dia com tudo feito" : "dias com tudo feito"}
            </span>
          </div>
        </div>
        {delta !== null && (
          <p className="mt-3 text-[13px] text-muted">
            {delta > 0 && `${delta} pontos acima da semana anterior.`}
            {delta < 0 && `${Math.abs(delta)} pontos abaixo da semana anterior. Semanas oscilam, e tudo bem.`}
            {delta === 0 && "No mesmo ritmo da semana anterior."}
          </p>
        )}
      </Block>

      {(r.bestDay || r.topHabit) && (
        <Block index={i++}>
          <div className="card flex flex-col gap-2 p-4 text-sm leading-relaxed" style={{ borderRadius: 22 }}>
            {r.bestDay && (
              <p>
                Seu melhor dia foi <b className="font-medium">{longDate(r.bestDay)}</b>.
              </p>
            )}
            {r.topHabit && (
              <p>
                <b className="font-medium">{r.topHabit.habit.name}</b> foi o que você mais fez:{" "}
                {r.topHabit.days} de {r.topHabit.of} {r.topHabit.of === 1 ? "dia" : "dias"}.
              </p>
            )}
          </div>
        </Block>
      )}

      {r.moodAvg !== null && (
        <Block index={i++}>
          <div className="card flex items-center gap-3 p-4" style={{ borderRadius: 22 }}>
            <span style={{ color: accentColor("sage") }}>
              <Face mood={Math.min(5, Math.max(1, Math.round(r.moodAvg))) as Mood} size={34} />
            </span>
            <p className="text-sm leading-relaxed">
              Humor médio da semana:{" "}
              <b className="font-medium">{MOOD_LABEL[Math.min(5, Math.max(1, Math.round(r.moodAvg))) as Mood].toLowerCase()}</b>
              {r.energyAvg !== null && (
                <span className="text-muted">
                  {" "}
                  · energia {r.energyAvg < 1.67 ? "baixa" : r.energyAvg < 2.34 ? "média" : "alta"}
                </span>
              )}
              .
            </p>
          </div>
        </Block>
      )}

      {r.identity && (
        <Block index={i++}>
          <div className="rounded-3xl border border-line p-5 text-center">
            <p className="font-display text-xl leading-snug">{r.identity.text}</p>
            <p className="mt-2 text-[13px] text-muted">
              Você votou nisso em {r.identity.days} {r.identity.days === 1 ? "dia" : "dias"} desta semana.
            </p>
          </div>
        </Block>
      )}

      <Block index={i++}>
        <p className="text-center text-[15px] leading-relaxed text-muted">{closing(r)}</p>
      </Block>
    </div>
  );
}
