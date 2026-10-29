import { addDays, dateKey, parseKey } from "./dates";
import { levelOf, type Checkin, type Habit } from "./types";

export type ValueFn = (habitId: string, date: string) => number;
/** Dia em pausa planejada: sem nada feito, ele é neutro (não quebra sequência nem entra em médias). */
export type PausedFn = (date: string) => boolean;
const never: PausedFn = () => false;

/** Dia (fuso local) em que o hábito passou a existir. */
const startKey = (h: Habit) => dateKey(new Date(h.createdAt));

const isDone = (h: Habit, date: string, get: ValueFn) => levelOf(h, get(h.id, date)) >= 1;

const activeOn = (h: Habit, date: string) => date >= startKey(h);

/** Fração de hábitos feitos (≥ mínimo) no dia, ou null se ainda não havia hábitos. */
export function dayRatio(
  habits: Habit[],
  date: string,
  get: ValueFn,
  paused: PausedFn = never
): number | null {
  const active = habits.filter((h) => activeOn(h, date));
  if (active.length === 0) return null;
  const done = active.filter((h) => isDone(h, date, get)).length;
  if (done === 0 && paused(date)) return null;
  return done / active.length;
}

function daysBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Sequência atual e melhor sequência de uma lista de dias "mantidos". */
function streaks(
  kept: (date: string) => boolean,
  from: string,
  today: string,
  neutral: (date: string) => boolean = () => false
) {
  let best = 0;
  let run = 0;
  for (const d of daysBetween(from, today)) {
    if (neutral(d)) continue; // pausa: nem soma nem quebra
    run = kept(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  // sequência atual: hoje ainda está em andamento, então não "quebra" a sequência
  let current = 0;
  let d = kept(today) || neutral(today) ? today : addDays(today, -1);
  while (d >= from && (kept(d) || neutral(d))) {
    if (!neutral(d)) current++;
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

export function habitStats(
  habits: Habit[],
  today: string,
  get: ValueFn,
  paused: PausedFn = never
): HabitStat[] {
  return habits.map((habit) => {
    const from = startKey(habit);
    const idle = (d: string) => paused(d) && !isDone(habit, d, get);
    const { current, best } = streaks((d) => isDone(habit, d, get), from, today, idle);
    const window = daysBetween(
      from > addDays(today, -29) ? from : addDays(today, -29),
      today
    ).filter((d) => !idle(d));
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

export function overview(
  habits: Habit[],
  today: string,
  get: ValueFn,
  paused: PausedFn = never
): Overview {
  const starts = habits.map(startKey).sort();
  if (starts.length === 0) {
    return { hasData: false, firstDay: null, current: 0, best: 0, rate30: null, daysKept: 0 };
  }
  const from = starts[0];
  const kept = (d: string) => (dayRatio(habits, d, get, paused) ?? 0) > 0;
  const neutral = (d: string) => dayRatio(habits, d, get, paused) === null;
  const days = daysBetween(from, today);
  const daysKept = days.filter(kept).length;
  const { current, best } = streaks(kept, from, today, neutral);
  const win = daysBetween(from > addDays(today, -29) ? from : addDays(today, -29), today);
  const ratios = win.map((d) => dayRatio(habits, d, get, paused)).filter((r): r is number => r !== null);
  const rate30 = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : null;
  return { hasData: daysKept > 0, firstDay: from, current, best, rate30, daysKept };
}

export interface HeatCell {
  date: string;
  ratio: number | null; // null = futuro, pausa ou antes do primeiro hábito
  future: boolean;
  paused: boolean;
}

/** Grade de semanas (colunas) × dias da semana (linhas, domingo no topo). */
export function heatmap(
  habits: Habit[],
  today: string,
  get: ValueFn,
  weeks = 18,
  paused: PausedFn = never
): HeatCell[][] {
  const dow = parseKey(today).getDay();
  const firstStart = addDays(addDays(today, -dow), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(firstStart, w * 7 + d);
      const future = date > today;
      return {
        date,
        future,
        paused: !future && paused(date),
        ratio: future ? null : dayRatio(habits, date, get, paused),
      };
    })
  );
}

export interface WeekdayStat {
  dow: number; // 0 = domingo
  avg: number | null;
  n: number;
}

/** Média de conclusão por dia da semana nas últimas 12 semanas (sem contar hoje). */
export function weekdays(
  habits: Habit[],
  today: string,
  get: ValueFn,
  paused: PausedFn = never
): WeekdayStat[] {
  const sums = Array.from({ length: 7 }, () => ({ sum: 0, n: 0 }));
  for (let i = 1; i <= 84; i++) {
    const d = addDays(today, -i);
    const r = dayRatio(habits, d, get, paused);
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
export function recovery(
  habits: Habit[],
  today: string,
  get: ValueFn,
  paused: PausedFn = never
): Recovery {
  const starts = habits.map(startKey).sort();
  if (starts.length === 0) return { gaps: 0, avgDays: null, oneDayShare: null };
  const kept = (d: string) => (dayRatio(habits, d, get, paused) ?? 0) > 0;
  const days = daysBetween(starts[0], addDays(today, -1));
  const firstKept = days.findIndex(kept);
  if (firstKept === -1) return { gaps: 0, avgDays: null, oneDayShare: null };

  const lengths: number[] = [];
  let run = 0;
  for (const d of days.slice(firstKept)) {
    if (dayRatio(habits, d, get, paused) === null) continue; // pausa não é lacuna
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
export function correlations(
  habits: Habit[],
  today: string,
  get: ValueFn,
  paused: PausedFn = never
): Correlation[] {
  const found: Correlation[] = [];
  const window = daysBetween(addDays(today, -60), addDays(today, -1));
  for (const a of habits) {
    for (const b of habits) {
      if (a.id === b.id) continue;
      const days = window.filter((d) => activeOn(a, d) && activeOn(b, d) && !paused(d));
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

// ───────────────────────── humor e energia ─────────────────────────

export type CheckinFn = (date: string) => Checkin | undefined;

export interface MoodPoint {
  date: string;
  mood: number | null;
  energy: number | null;
}

export interface MoodInsight {
  highN: number; // dias com humor ≥ 4
  lowN: number; // dias com humor ≤ 2
  highAvg: number; // conclusão média nos dias bons (0..1)
  lowAvg: number; // conclusão média nos dias pesados (0..1)
  lowKept: number; // dias pesados com ao menos um hábito feito
  outcome: "better" | "same" | "worse";
}

export interface EnergyInsight {
  habit: Habit;
  high: number; // taxa com energia alta
  low: number; // taxa com energia baixa
}

export interface MoodStats {
  count: number; // check-ins registrados (qualquer campo)
  series: MoodPoint[]; // últimos 14 dias, o mais antigo primeiro
  mood: MoodInsight | null;
  energy: EnergyInsight[];
}

/**
 * Cruza humor/energia com o que foi feito. Hoje fica de fora das comparações
 * (o dia ainda está em andamento); só aparece com dados suficientes.
 */
export function moodStats(
  habits: Habit[],
  today: string,
  get: ValueFn,
  checkin: CheckinFn,
  paused: PausedFn = never
): MoodStats {
  const series: MoodPoint[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = addDays(today, -i);
    const c = checkin(date);
    series.push({ date, mood: c?.mood ?? null, energy: c?.energy ?? null });
  }

  const window = daysBetween(addDays(today, -60), addDays(today, -1));
  let count = 0;
  for (const d of daysBetween(addDays(today, -60), today)) {
    const c = checkin(d);
    if (c && (c.mood !== undefined || c.energy !== undefined)) count++;
  }

  const ratioOn = (d: string) => dayRatio(habits, d, get, paused);
  const high = window.filter((d) => (checkin(d)?.mood ?? 0) >= 4 && ratioOn(d) !== null);
  const low = window.filter((d) => {
    const m = checkin(d)?.mood;
    return m !== undefined && m <= 2 && ratioOn(d) !== null;
  });
  const avg = (days: string[]) =>
    days.reduce((s, d) => s + (ratioOn(d) ?? 0), 0) / days.length;

  let mood: MoodInsight | null = null;
  if (high.length >= 4 && low.length >= 3) {
    const highAvg = avg(high);
    const lowAvg = avg(low);
    const diff = highAvg - lowAvg;
    mood = {
      highN: high.length,
      lowN: low.length,
      highAvg,
      lowAvg,
      lowKept: low.filter((d) => (ratioOn(d) ?? 0) > 0).length,
      outcome: diff >= 0.15 ? "better" : diff <= -0.15 ? "worse" : "same",
    };
  }

  const energy: EnergyInsight[] = [];
  for (const h of habits) {
    const days = window.filter((d) => activeOn(h, d) && !(paused(d) && !isDone(h, d, get)));
    const hi = days.filter((d) => checkin(d)?.energy === 3);
    const lo = days.filter((d) => checkin(d)?.energy === 1);
    if (hi.length < 4 || lo.length < 4) continue;
    const pHi = hi.filter((d) => isDone(h, d, get)).length / hi.length;
    const pLo = lo.filter((d) => isDone(h, d, get)).length / lo.length;
    if (Math.abs(pHi - pLo) >= 0.25) energy.push({ habit: h, high: pHi, low: pLo });
  }
  energy.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));

  return { count, series, mood, energy: energy.slice(0, 2) };
}

// ───────────────────────── retrospectiva semanal ─────────────────────────

/** Segunda-feira da semana (segunda a domingo) que contém a data. */
export function mondayOf(date: string): string {
  const dow = parseKey(date).getDay(); // 0 = domingo
  return addDays(date, -((dow + 6) % 7));
}

/**
 * Semana que a retrospectiva mostra: no domingo, a semana que está fechando;
 * nos outros dias, a última semana completa.
 */
export function reviewWeekStart(today: string): string {
  const m = mondayOf(today);
  return parseKey(today).getDay() === 0 ? m : addDays(m, -7);
}

export interface WeekDay {
  date: string;
  ratio: number | null;
  mood: number | null;
}

export interface WeekReview {
  start: string;
  end: string;
  days: WeekDay[];
  activeDays: number; // dias da semana com algum hábito existindo (fora as pausas)
  pausedDays: number; // dias em pausa planejada
  keptDays: number; // dias com ao menos um hábito feito
  fullDays: number; // dias com todos os hábitos feitos
  avg: number | null; // conclusão média (0..1)
  prevAvg: number | null; // da semana anterior
  bestDay: string | null;
  topHabit: { habit: Habit; days: number; of: number } | null;
  moodAvg: number | null; // só com ≥ 3 registros
  energyAvg: number | null;
  identity: { text: string; days: number } | null;
}

export function weekReview(
  habits: Habit[],
  start: string,
  get: ValueFn,
  checkin: CheckinFn,
  paused: PausedFn = never
): WeekReview {
  const dates = daysBetween(start, addDays(start, 6));
  const days: WeekDay[] = dates.map((date) => ({
    date,
    ratio: dayRatio(habits, date, get, paused),
    mood: checkin(date)?.mood ?? null,
  }));
  const active = days.filter((d) => d.ratio !== null);
  const activeAny = (d: string) => habits.some((h) => activeOn(h, d));
  const avgOf = (list: WeekDay[]) =>
    list.length ? list.reduce((s, d) => s + (d.ratio ?? 0), 0) / list.length : null;

  const prev = daysBetween(addDays(start, -7), addDays(start, -1))
    .map((date) => ({ date, ratio: dayRatio(habits, date, get, paused), mood: null }))
    .filter((d) => d.ratio !== null);

  let bestDay: string | null = null;
  let bestRatio = 0;
  for (const d of days) {
    if ((d.ratio ?? 0) > bestRatio) {
      bestRatio = d.ratio ?? 0;
      bestDay = d.date;
    }
  }

  const perHabit = habits
    .map((habit) => {
      const on = dates.filter((d) => activeOn(habit, d) && !(paused(d) && !isDone(habit, d, get)));
      return { habit, of: on.length, days: on.filter((d) => isDone(habit, d, get)).length };
    })
    .filter((h) => h.of > 0 && h.days > 0);
  const byDays = (a: (typeof perHabit)[number], b: (typeof perHabit)[number]) =>
    b.days - a.days || b.days / b.of - a.days / a.of;
  const topHabit = [...perHabit].sort(byDays)[0] ?? null;
  const idHabit = [...perHabit].filter((h) => h.habit.identity?.trim()).sort(byDays)[0];

  const moods = dates.map((d) => checkin(d)?.mood).filter((m): m is NonNullable<typeof m> => m !== undefined);
  const energies = dates.map((d) => checkin(d)?.energy).filter((e): e is NonNullable<typeof e> => e !== undefined);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  return {
    start,
    end: addDays(start, 6),
    days,
    activeDays: active.length,
    pausedDays: days.filter((d) => d.ratio === null && paused(d.date) && activeAny(d.date)).length,
    keptDays: active.filter((d) => (d.ratio ?? 0) > 0).length,
    fullDays: active.filter((d) => d.ratio === 1).length,
    avg: avgOf(active),
    prevAvg: avgOf(prev),
    bestDay,
    topHabit,
    moodAvg: moods.length >= 3 ? mean(moods) : null,
    energyAvg: energies.length >= 3 ? mean(energies) : null,
    identity: idHabit ? { text: idHabit.habit.identity!.trim(), days: idHabit.days } : null,
  };
}
