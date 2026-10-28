"use client";

import { useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { AnimatedNumber, accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import {
  correlations,
  habitStats,
  heatmap,
  overview,
  recovery,
  weekdays,
} from "@/lib/stats";
import { longDate } from "@/lib/dates";

const LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];
const NAMES = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

const pct = (n: number) => Math.round(n * 100);
const oneDecimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function heatFill(ratio: number | null, future: boolean): string {
  if (future) return "transparent";
  if (ratio === null) return "color-mix(in srgb, var(--surface-2) 55%, transparent)";
  if (ratio === 0) return "var(--surface-2)";
  const strength = ratio <= 0.34 ? 38 : ratio <= 0.67 ? 62 : ratio < 1 ? 82 : 100;
  return `color-mix(in srgb, var(--sage) ${strength}%, var(--surface-2))`;
}

export function StatsSheet({
  open,
  onClose,
  today,
}: {
  open: boolean;
  onClose: () => void;
  today: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Seu ritmo">
      <StatsBody today={today} />
    </Sheet>
  );
}

function Section({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.07, type: "spring", stiffness: 240, damping: 26 }}
      className="flex flex-col gap-3"
    >
      <h3 className="text-sm text-muted">{title}</h3>
      {children}
    </motion.section>
  );
}

function StatsBody({ today }: { today: string }) {
  const { habits, getValue } = useHabits();

  const data = useMemo(
    () => ({
      ov: overview(habits, today, getValue),
      cells: heatmap(habits, today, getValue),
      week: weekdays(habits, today, getValue),
      perHabit: habitStats(habits, today, getValue),
      rec: recovery(habits, today, getValue),
      cor: correlations(habits, today, getValue),
    }),
    [habits, today, getValue]
  );
  const { ov, cells, week, perHabit, rec, cor } = data;

  if (!ov.hasData) {
    return (
      <p className="pb-6 text-[15px] leading-relaxed text-muted">
        Seus números aparecem aqui assim que você marcar o primeiro hábito. Sem pressa: o
        primeiro passo pode ser o menor possível.
      </p>
    );
  }

  const maxAvg = Math.max(0, ...week.map((w) => w.avg ?? 0));
  const best = week.reduce<(typeof week)[number] | null>(
    (acc, w) => (w.avg !== null && (acc === null || w.avg > (acc.avg ?? 0)) ? w : acc),
    null
  );

  return (
    <div className="flex flex-col gap-7 pb-2">
      {/* resumo */}
      <Section title="Visão geral" index={0}>
        <div className="grid grid-cols-3 gap-2.5">
          <Tile label="dias seguidos">
            <AnimatedNumber value={ov.current} className="font-display text-4xl leading-none" />
          </Tile>
          <Tile label="melhor sequência">
            <AnimatedNumber value={ov.best} className="font-display text-4xl leading-none" />
          </Tile>
          <Tile label="últimos 30 dias">
            <span className="flex items-baseline">
              <AnimatedNumber
                value={ov.rate30 === null ? 0 : pct(ov.rate30)}
                className="font-display text-4xl leading-none"
              />
              <span className="font-display text-xl text-muted">%</span>
            </span>
          </Tile>
        </div>
        <p className="text-[13px] text-muted">
          Um dia conta quando você faz ao menos um hábito, nem que seja o mínimo.
        </p>
      </Section>

      {/* heatmap */}
      <Section title="Últimas 18 semanas" index={1}>
        <div className="card p-4" style={{ borderRadius: 22 }}>
          <svg
            viewBox="0 0 303 116"
            className="h-auto w-full"
            role="img"
            aria-label={`Mapa de ${ov.daysKept} dias com hábitos feitos desde ${longDate(ov.firstDay ?? today)}`}
          >
            {cells.map((col, w) =>
              col.map((c, d) => (
                <motion.rect
                  key={c.date}
                  x={w * 17}
                  y={d * 17}
                  width={14}
                  height={14}
                  rx={4}
                  fill={heatFill(c.ratio, c.future)}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + w * 0.025 + d * 0.006, duration: 0.35 }}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {!c.future && (
                    <title>
                      {longDate(c.date)}
                      {c.ratio !== null ? `: ${pct(c.ratio)}% dos hábitos` : ""}
                    </title>
                  )}
                </motion.rect>
              ))
            )}
          </svg>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted">
            menos
            {[0, 0.3, 0.6, 0.8, 1].map((r) => (
              <i
                key={r}
                className="block h-2.5 w-2.5 rounded-[3px]"
                style={{ background: heatFill(r, false) }}
              />
            ))}
            mais
          </div>
        </div>
      </Section>

      {/* melhor dia */}
      <Section title="Seus dias da semana" index={2}>
        <div className="card p-4" style={{ borderRadius: 22 }}>
          <div className="flex h-24 items-end gap-2">
            {week.map((w) => {
              const isBest = best !== null && w.dow === best.dow && maxAvg > 0;
              const h = w.avg === null || maxAvg === 0 ? 6 : Math.max(6, (w.avg / maxAvg) * 100);
              return (
                <div key={w.dow} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <motion.div
                    className="w-full rounded-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.3 + w.dow * 0.05, type: "spring", stiffness: 120, damping: 18 }}
                    style={{
                      background: isBest
                        ? accentColor("sage")
                        : "color-mix(in srgb, var(--sage) 30%, var(--surface-2))",
                    }}
                    title={w.avg === null ? "Sem dados ainda" : `${pct(w.avg)}% em média`}
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: isBest ? "var(--ink)" : "var(--muted)", fontWeight: isBest ? 600 : 400 }}
                  >
                    {LETTERS[w.dow]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm">
            {best && maxAvg > 0 ? (
              <>
                Seu dia mais forte é <b className="font-medium">{NAMES[best.dow]}</b>.
              </>
            ) : (
              <span className="text-muted">Ainda poucos dias para comparar. Continue.</span>
            )}
          </p>
        </div>
      </Section>

      {/* por hábito */}
      <Section title="Por hábito" index={3}>
        <div className="flex flex-col gap-2.5">
          {perHabit.map((s) => (
            <div key={s.habit.id} className="rounded-2xl border border-line p-3.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <i
                    className="block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: accentColor(s.habit.accent) }}
                  />
                  <span className="font-display truncate text-lg">{s.habit.name}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-muted">
                  {s.rate30 === null ? "–" : `${pct(s.rate30)}%`}
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: accentColor(s.habit.accent) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.rate30 ?? 0) * 100}%` }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 90, damping: 20 }}
                />
              </div>
              <p className="mt-2.5 text-[13px] text-muted">
                Sequência {s.current} · melhor {s.best} · {s.total}{" "}
                {s.total === 1 ? "dia feito" : "dias feitos"}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* recuperação */}
      <Section title="Como você volta" index={4}>
        <div className="card p-4" style={{ borderRadius: 22 }}>
          {rec.gaps === 0 || rec.avgDays === null || rec.oneDayShare === null ? (
            <p className="text-sm leading-relaxed">
              {ov.daysKept >= 3
                ? "Você ainda não teve nenhum dia em branco. Quando tiver, é aqui que a gente mede a sua volta, que importa mais que a sequência."
                : "Com alguns dias a mais de registro, mostramos aqui quão rápido você retoma o ritmo."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm leading-relaxed">
                Depois de um dia em branco, você volta em média em{" "}
                <b className="font-medium">
                  {oneDecimal.format(rec.avgDays)} {rec.avgDays <= 1.05 ? "dia" : "dias"}
                </b>
                .
              </p>
              <p className="text-[13px] text-muted">
                {pct(rec.oneDayShare)}% das suas pausas duraram só 1 dia ({rec.gaps}{" "}
                {rec.gaps === 1 ? "pausa" : "pausas"} no total). Cair faz parte; voltar é o hábito.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* padrões */}
      <Section title="Padrões" index={5}>
        {cor.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted">
            Os padrões entre hábitos aparecem depois de umas duas semanas de registros. Continue; eles
            chegam sozinhos.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cor.map((c) => (
              <div key={`${c.a.id}-${c.b.id}`} className="card p-4 text-sm leading-relaxed" style={{ borderRadius: 22 }}>
                Nos dias em que você faz <b className="font-medium">{c.a.name}</b>, você faz{" "}
                <b className="font-medium">{c.b.name}</b> em{" "}
                <b className="font-medium" style={{ color: accentColor("sage") }}>
                  {pct(c.withA)}%
                </b>{" "}
                das vezes. Sem {c.a.name}: {pct(c.withoutA)}%.
              </div>
            ))}
            <p className="text-[12px] text-muted">
              Padrões não são causa. Servem de pista, não de regra.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line p-3.5">
      {children}
      <span className="text-[11px] leading-tight text-muted">{label}</span>
    </div>
  );
}
