import { addDays, parseKey } from "./dates";
import { levelOf, type Habit, type Period } from "./types";

type Get = (habitId: string, date: string) => number;

export const isPeriodic = (h: Habit): boolean => !!h.period && h.period !== "day";
export const goalOf = (h: Habit): number => Math.max(1, h.periodGoal ?? 1);

const monday = (date: string): string => {
  const dow = (parseKey(date).getDay() + 6) % 7;
  return addDays(date, -dow);
};

/** Primeiro dia da semana (segunda) ou do mês que contém `date`. */
export function periodStart(date: string, period: Period): string {
  if (period === "week") return monday(date);
  if (period === "month") return `${date.slice(0, 8)}01`;
  return date;
}

/** Início do período seguinte. */
export function nextPeriod(start: string, period: Period): string {
  if (period === "week") return addDays(start, 7);
  const d = parseKey(start);
  const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
}

export function prevPeriod(start: string, period: Period): string {
  if (period === "week") return addDays(start, -7);
  return periodStart(addDays(start, -1), "month");
}

/** Dias do período que contém `date`, até `date` (inclusive) ou até o fim do período. */
function daysOfPeriod(start: string, period: Period, upTo?: string): string[] {
  const end = addDays(nextPeriod(start, period), -1);
  const last = upTo && upTo < end ? upTo : end;
  const out: string[] = [];
  for (let d = start; d <= last; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Quantos dias do período (até `date`) o hábito foi feito. */
export function periodDone(h: Habit, date: string, get: Get): number {
  if (!isPeriodic(h)) return 0;
  const start = periodStart(date, h.period!);
  return daysOfPeriod(start, h.period!, date).filter((d) => levelOf(h, get(h.id, d)) >= 1).length;
}

export interface PeriodRun {
  start: string;
  done: number;
  goal: number;
  met: boolean;
}

/** Histórico dos últimos `n` períodos, do mais antigo ao atual (respeita o dia de criação). */
export function periodHistory(h: Habit, today: string, get: Get, n: number, created: string): PeriodRun[] {
  if (!isPeriodic(h)) return [];
  const period = h.period!;
  const out: PeriodRun[] = [];
  let start = periodStart(today, period);
  for (let i = 0; i < n; i++) {
    const end = addDays(nextPeriod(start, period), -1);
    if (end < created) break;
    const done = daysOfPeriod(start, period, today).filter((d) => levelOf(h, get(h.id, d)) >= 1).length;
    out.unshift({ start, done, goal: goalOf(h), met: done >= goalOf(h) });
    start = prevPeriod(start, period);
  }
  return out;
}

/** Períodos seguidos com a meta cumprida (o período em andamento não quebra a sequência). */
export function periodStreaks(runs: PeriodRun[]): { current: number; best: number } {
  let best = 0;
  let run = 0;
  runs.forEach((r, i) => {
    if (r.met) run++;
    else if (i < runs.length - 1) run = 0;
    best = Math.max(best, run);
  });
  let current = 0;
  for (let i = runs.length - 1; i >= 0; i--) {
    if (runs[i].met) current++;
    else if (i === runs.length - 1) continue;
    else break;
  }
  return { current, best };
}
