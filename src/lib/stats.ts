import { addDays, dateKey, parseKey } from "./dates";
import { levelOf, type Habit } from "./types";

export type ValueFn = (habitId: string, date: string) => number;

/** Dia (fuso local) em que o hábito passou a existir. */
const startKey = (h: Habit) => dateKey(new Date(h.createdAt));

const isDone = (h: Habit, date: string, get: ValueFn) => levelOf(h, get(h.id, date)) >= 1;

const activeOn = (h: Habit, date: string) => date >= startKey(h);

/** Fração de hábitos feitos (≥ mínimo) no dia, ou null se ainda não havia hábitos. */
export function dayRatio(habits: Habit[], date: string, get: ValueFn): number | null {
  const active = habits.filter((h) => activeOn(h, date));
  if (active.length === 0) return null;
  return active.filter((h) => isDone(h, date, get)).length / active.length;
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Sequência atual e melhor sequência de uma lista de dias "mantidos". */
function streaks(kept: (date: string) => boolean, from: string, today: string) {
  let best = 0;
  let run = 0;
  for (const d of daysBetween(from, today)) {
    run = kept(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  // sequência atual: hoje ainda está em andamento, então não "quebra" a sequência
  let current = 0;
  let d = kept(today) ? today : addDays(today, -1);
  while (d >= from && kept(d)) {
    current++;
    d = addDays(d, -1);
  }
  return { current, best };
}

export interface HabitStat {
  habit: Habit;
  current: number;
  best: number;
  rate30: number | null; // 0..1
  total: number; // dias feitos desde sempre
}

export function habitStats(habits: Habit[], today: string, get: ValueFn): HabitStat[] {
  return habits.map((habit) => {
    const from = startKey(habit);
    const { current, best } = streaks((d) => isDone(habit, d, get), from, today);
    const window = daysBetween(
      from > addDays(today, -29) ? from : addDays(today, -29),
      today
    );
    const done = window.filter((d) => isDone(habit, d, get)).length;
    const total = daysBetween(from, today).filter((d) => isDone(habit, d, get)).length;
    return { habit, current, best, rate30: window.length ? done / window.length : null, total };
  });
}

export interface Overview {
  hasData: boolean;
  firstDay: string | null;
  current: number; // dias seguidos com ao menos um hábito feito
  best: number;
  rate30: number | null; // média da fração diária nos últimos 30 dias
  daysKept: number;
}

export function overview(habits: Habit[], today: string, get: ValueFn): Overview {
  const starts = habits.map(startKey).sort();
  if (starts.length === 0) {
    return { hasData: false, firstDay: null, current: 0, best: 0, rate30: null, daysKept: 0 };
  }
  const from = starts[0];
  const kept = (d: string) => (dayRatio(habits, d, get) ?? 0) > 0;
  const days = daysBetween(from, today);
  const daysKept = days.filter(kept).length;
  const { current, best } = streaks(kept, from, today);
  const win = daysBetween(from > addDays(today, -29) ? from : addDays(today, -29), today);
  const ratios = win.map((d) => dayRatio(habits, d, get)).filter((r): r is number => r !== null);
  const rate30 = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
  return { hasData: daysKept > 0, firstDay: from, current, best, rate30, daysKept };
}

export interface HeatCell {
  date: string;
  ratio: number | null; // null = futuro ou antes do primeiro hábito
  future: boolean;
}

/** Grade de semanas (colunas) × dias da semana (linhas, domingo no topo). */
export function heatmap(habits: Habit[], today: string, get: ValueFn, weeks = 18): HeatCell[][] {
  const dow = parseKey(today).getDay();
  const firstStart = addDays(addDays(today, -dow), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(firstStart, w * 7 + d);
      const future = date > today;
      return { date, future, ratio: future ? null : dayRatio(habits, date, get) };
    })
  );
}

export interface WeekdayStat {
  dow: number; // 0 = domingo
  avg: number | null;
  n: number;
}

/** Média de conclusão por dia da semana nas últimas 12 semanas (sem contar hoje). */
export function weekdays(habits: Habit[], today: string, get: ValueFn): WeekdayStat[] {
  const sums = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }));
  for (let i = 1; i <= 84; i++) {
    const d = addDays(today, -i);
    const r = dayRatio(habits, d, get);
    if (r === null) continue;
    const dow = parseKey(d).getDay();
    sums[dow].sum += r;
    sums[dow].n++;
  }
  return sums.map((s, dow) => ({ dow, avg: s.n >= 2 ? s.sum / s.n : null, n: s.n }));
}

export interface Recovery {
  gaps: number; // lacunas já encerradas (dias sem nada, seguidos de retorno)
  avgDays: number | null; // duração média da lacuna
  oneDayShare: number | null; // fração das lacunas que duraram só 1 dia
}

/** Quão rápido você volta depois de um dia em branco. */
export function recovery(habits: Habit[], today: string, get: ValueFn): Recovery {
  const starts = habits.map(startKey).sort();
  if (starts.length === 0) return { gaps: 0, avgDays: null, oneDayShare: null };
  const kept = (d: string) => (dayRatio(habits, d, get) ?? 0) > 0;
  const days = daysBetween(starts[0], addDays(today, -1));
  const firstKept = days.findIndex(kept);
  if (firstKept === -1) return { gaps: 0, avgDays: null, oneDayShare: null };

  const lengths: number[] = [];
  let run = 0;
  for (const d of days.slice(firstKept)) {
    if (kept(d)) {
      if (run > 0) lengths.push(run);
      run = 0;
    } else run++;
  }
  // lacuna em aberto (ainda sem voltar) não entra: ela ainda não terminou
  if (lengths.length === 0) return { gaps: 0, avgDays: null, oneDayShare: null };
  return {
    gaps: lengths.length,
    avgDays: lengths.reduce((a, b) => a + b, 0) / lengths.length,
    oneDayShare: lengths.filter((l) => l === 1).length / lengths.length,
  };
}

export interface Correlation {
  a: Habit;
  b: Habit;
  withA: number; // chance de fazer B nos dias em que fez A
  withoutA: number; // chance de fazer B nos dias em que não fez A
  n: number;
}

/**
 * "Nos dias em que você faz A, é mais provável fazer B." Só aparece com dados
 * suficientes (≥ 5 dias com e sem A) e diferença relevante (≥ 20 pontos).
 */
export function correlations(habits: Habit[], today: string, get: ValueFn): Correlation[] {
  const found: Correlation[] = [];
  const window = daysBetween(addDays(today, -60), addDays(today, -1));
  for (const a of habits) {
    for (const b of habits) {
      if (a.id === b.id) continue;
      const days = window.filter((d) => activeOn(a, d) && activeOn(b, d));
      const withA = days.filter((d) => isDone(a, d, get));
      const withoutA = days.filter((d) => !isDone(a, d, get));
      if (withA.length < 5 || withoutA.length < 5) continue;
      const pWith = withA.filter((d) => isDone(b, d, get)).length / withA.length;
      const pWithout = withoutA.filter((d) => isDone(b, d, get)).length / withoutA.length;
      if (pWith - pWithout >= 0.2) {
        found.push({ a, b, withA: pWith, withoutA: pWithout, n: days.length });
      }
    }
  }
  found.sort((x, y) => y.withA - y.withoutA - (x.withA - x.withoutA));
  // uma entrada por par (a maior diferença)
  const seen = new Set<string>();
  return found
    .filter((c) => {
      const key = [c.a.id, c.b.id].sort().join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 2);
}
