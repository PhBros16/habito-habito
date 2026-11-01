"use client";

import { useMemo } from "react";
import { addDays } from "@/lib/dates";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor, accentSoft } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { habitDetail } from "@/lib/detail";
import { periodLabel } from "@/lib/units";
import { longDate } from "@/lib/dates";

const pct = (r: number) => Math.round(r * 100);
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ","));

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line px-3.5 py-3">
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="mt-0.5 text-[12px] leading-snug text-muted">{label}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-sm text-muted">{title}</h3>
      {children}
    </section>
  );
}


const AUTO_LABELS = ["De jeito nenhum", "Pouco", "Mais ou menos", "Bastante", "Totalmente"];
const AUTO_EVERY_DAYS = 14;

/**
 * Pulso de automaticidade: uma pergunta a cada 14 dias, baseada no índice SRBAI (Gardner e colegas, 2012).
 * Dá ao usuário uma medida do que a repetição já mudou, além da contagem de dias.
 */
function AutomaticityBlock({ habitId, name, today, days, color }: { habitId: string; name: string; today: string; days: number; color: string }) {
  const { settings, updateSettings } = useHabits();
  const answers = settings.automaticity[habitId] ?? [];
  const last = answers[answers.length - 1];
  const due = !last || addDays(last.date, AUTO_EVERY_DAYS) <= today;
  const ready = days >= 7;
  const graduated = answers.length >= 2 && answers.slice(-2).every((a) => a.score >= 4);

  const answer = (score: number) =>
    updateSettings({ automaticity: { ...settings.automaticity, [habitId]: [...answers.filter((a) => a.date !== today), { date: today, score }].slice(-24) } });

  return (
    <Block title="Está ficando automático?">
      {!ready ? (
        <p className="text-[13px] leading-snug text-muted">
          Depois de uns 7 dias de prática, o Enso pergunta o quanto isso já acontece sem esforço. É uma medida mais fiel do que contar dias.
        </p>
      ) : due ? (
        <>
          <p className="text-[15px] leading-snug">Fazer “{name}” já é algo que acontece sem eu precisar pensar?</p>
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Nível de automaticidade">
            {AUTO_LABELS.map((l, i) => (
              <button
                key={l}
                type="button"
                onClick={() => answer(i + 1)}
                className="flex flex-col items-center gap-1 rounded-2xl border border-line px-1 py-2.5 text-[11px] leading-tight text-muted"
              >
                <span className="font-display text-lg text-ink">{i + 1}</span>
                {l}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[13px] leading-snug text-muted">
          Próxima pergunta em {Math.max(1, daysUntil(last!.date, today))} {Math.max(1, daysUntil(last!.date, today)) === 1 ? "dia" : "dias"}.
        </p>
      )}
      {answers.length > 0 && (
        <div className="flex items-end gap-2" role="img" aria-label="Histórico de automaticidade">
          {answers.map((a) => (
            <div key={a.date} className="flex flex-col items-center gap-1" title={`${a.date}: ${a.score}/5`}>
              <span className="block w-3.5 rounded-full" style={{ height: 8 + a.score * 8, background: color, opacity: 0.35 + a.score * 0.13 }} />
              <span className="text-[10px] tabular-nums text-muted">{a.score}</span>
            </div>
          ))}
        </div>
      )}
      {graduated && (
        <p className="rounded-2xl p-3.5 text-[14px] leading-relaxed" style={{ background: "color-mix(in srgb, var(--sage) 12%, transparent)" }}>
          Duas respostas seguidas altas: esse hábito já se sustenta quase sozinho. Você pode mantê-lo leve, como está, ou subir um pouco o desafio no menu Editar.
        </p>
      )}
      <p className="text-[12px] leading-snug text-muted">
        Pergunta única inspirada no índice de automaticidade comportamental (Gardner e colegas, 2012). É uma estimativa sua, não um diagnóstico.
      </p>
    </Block>
  );
}

function daysUntil(last: string, today: string): number {
  let n = 0;
  for (let d = today; d < addDays(last, AUTO_EVERY_DAYS) && n < 60; d = addDays(d, 1)) n++;
  return n;
}

/** Detalhes de um hábito: sequência, calendário, dias da semana, valores recentes e metas por período. */
export function HabitDetailSheet({ id, today, onClose }: { id: string | null; today: string; onClose: () => void }) {
  const { habits, getValue, isPaused } = useHabits();
  const habit = habits.find((h) => h.id === id) ?? null;
  const d = useMemo(() => (habit ? habitDetail(habit, today, getValue, isPaused) : null), [habit, today, getValue, isPaused]);
  const color = habit ? accentColor(habit.accent) : "var(--sage)";
  const numeric = habit && habit.kind !== "check";

  return (
    <Sheet open={!!habit} onClose={onClose} title={habit?.name ?? "Detalhes"}>
      {habit && d && (
        <div className="flex flex-col gap-6 pb-2">
          {(habit.identity || periodLabel(habit)) && (
            <p className="-mt-2 text-[13px] italic leading-snug text-muted">
              {habit.identity}
              {habit.identity && periodLabel(habit) ? " · " : ""}
              {periodLabel(habit) && <span className="not-italic">{periodLabel(habit)}</span>}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <Stat value={String(d.current)} label={`${d.streakUnit} seguidos${d.streakUnit === "dias" ? "" : " cumprindo a meta"}`} />
            <Stat value={String(d.best)} label={`melhor sequência (${d.streakUnit})`} />
            <Stat value={d.rate === null ? "–" : `${pct(d.rate)}%`} label={d.rateLabel} />
            <Stat value={String(d.totalDays)} label={d.totalDays === 1 ? "dia feito no total" : "dias feitos no total"} />
          </div>

          <Block title="Últimas 12 semanas">
            <div className="flex gap-1" role="img" aria-label="Calendário das últimas 12 semanas">
              {d.heat.map((col, ci) => (
                <div key={ci} className="flex flex-1 flex-col gap-1">
                  {col.map((c, ri) => (
                    <motion.i
                      key={c.date}
                      title={`${c.date}`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.02 * (ci + ri * 0.3), type: "spring", stiffness: 300, damping: 22 }}
                      className="block aspect-square w-full rounded-[5px]"
                      style={{
                        background:
                          c.future
                            ? "transparent"
                            : c.before
                              ? "color-mix(in srgb, var(--surface-2) 40%, transparent)"
                              : c.level === 2
                              ? color
                              : c.level === 1
                                ? accentSoft(habit.accent, 55)
                                : "var(--surface-2)",
                        outline: c.date === today ? `1.5px solid ${color}` : "none",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted">
              {habit.minimum < habit.target || habit.kind === "check" ? "Tom claro: mínimo. Tom cheio: ideal." : "Cada quadrado é um dia feito."}
            </p>
          </Block>

          {d.periods.length > 0 && (
            <Block title={habit.period === "week" ? "Semana a semana" : "Mês a mês"}>
              <div className="flex h-24 items-end gap-2">
                {d.periods.map((p, i) => {
                  const max = Math.max(p.goal, ...d.periods.map((x) => x.done), 1);
                  return (
                    <div key={p.start} className="flex flex-1 flex-col items-center gap-1.5">
                      <motion.div
                        className="w-full rounded-lg"
                        style={{ background: p.met ? color : accentSoft(habit.accent, 45) }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(6, (p.done / max) * 72)}px` }}
                        transition={{ delay: 0.05 * i, type: "spring", stiffness: 140, damping: 18 }}
                      />
                      <span className="text-[11px] tabular-nums text-muted">{p.done}/{p.goal}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[12px] text-muted">A barra cheia é período com a meta cumprida; a última é o período atual.</p>
            </Block>
          )}

          <Block title="Por dia da semana">
            <div className="flex flex-col gap-1.5">
              {d.weekday.map((w, i) => (
                <div key={w.label} className="flex items-center gap-3 text-[13px]">
                  <span className="w-8 text-muted">{w.label}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <motion.span
                      className="block h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(w.rate ?? 0) * 100}%` }}
                      transition={{ delay: 0.05 * i, type: "spring", stiffness: 110, damping: 20 }}
                    />
                  </span>
                  <span className="w-9 text-right tabular-nums text-muted">{w.rate === null ? "–" : `${pct(w.rate)}%`}</span>
                </div>
              ))}
            </div>
            {d.bestWeekday && <p className="text-[13px] text-muted">Seu dia mais forte para este hábito é {d.bestWeekday}.</p>}
          </Block>

          {numeric && (
            <Block title="Últimos 14 dias">
              <div className="flex h-24 items-end gap-1">
                {d.recent.map((r, i) => {
                  const max = Math.max(habit.target, ...d.recent.map((x) => x.value), 1);
                  return (
                    <motion.i
                      key={r.date}
                      title={`${r.date}: ${r.value}`}
                      className="block flex-1 rounded-md"
                      style={{ background: r.value >= habit.target ? color : r.value > 0 ? accentSoft(habit.accent, 55) : "var(--surface-2)" }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, (r.value / max) * 88)}px` }}
                      transition={{ delay: 0.03 * i, type: "spring", stiffness: 140, damping: 18 }}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <Stat value={fmt(d.totalValue)} label={`${habit.unit} no total`} />
                <Stat value={d.avgPerDoneDay === null ? "–" : fmt(d.avgPerDoneDay)} label="por dia feito" />
                <Stat value={d.bestValue ? fmt(d.bestValue.value) : "–"} label={d.bestValue ? `recorde, ${longDate(d.bestValue.date).split(",")[1]?.trim() ?? ""}` : "recorde"} />
              </div>
            </Block>
          )}

          <AutomaticityBlock habitId={habit.id} name={habit.name} today={today} days={d.totalDays} color={color} />

          <Block title="Leitura honesta">
            <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-muted">
              {d.perWeek !== null && <li>Nas últimas 8 semanas, você fez em média {fmt(d.perWeek)} {d.perWeek === 1 ? "dia" : "dias"} por semana.</li>}
              {d.idealShare !== null && <li>{pct(d.idealShare)}% dos dias feitos chegaram ao ideal; os outros ficaram no mínimo, e o mínimo conta.</li>}
              {d.current === 0 && d.totalDays > 0 && <li>A sequência zerou, mas os {d.totalDays} {d.totalDays === 1 ? "dia" : "dias"} feitos continuam seus. Retomar vale mais que não ter parado.</li>}
              {d.totalDays === 0 && <li>Ainda sem registros. O primeiro dia, mesmo no mínimo, já muda a história.</li>}
            </ul>
          </Block>
        </div>
      )}
    </Sheet>
  );
}
