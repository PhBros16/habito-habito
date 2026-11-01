import { addDays, dateKey } from "./dates";
import { dayRatio, mondayOf, type CheckinFn, type PausedFn, type ValueFn } from "./stats";
import { levelOf, type Habit } from "./types";

/** Dias de prática (dias com ao menos um hábito feito) que viram marcos. */
export const MILESTONE_DAYS = [1, 3, 7, 14, 21, 30, 50, 66, 100, 150, 200, 365];

export const MILESTONE_TEXT: Record<number, string> = {
  1: "O primeiro dia. Tudo começa aqui.",
  3: "Três dias de prática: o hábito já tem um começo de caminho.",
  7: "Uma semana de prática. A constância aparece.",
  14: "Duas semanas. O hábito deixa de ser novidade.",
  21: "Vinte e um dias de prática. Sem mágica, mas com muito significado.",
  30: "Um mês de prática. Você já mudou a sua rotina.",
  50: "Cinquenta dias. Isso é construção de verdade.",
  66: "Sessenta e seis dias: a mediana de tempo que o estudo clássico encontrou para um hábito ficar automático.",
  100: "Cem dias de prática. Poucas pessoas chegam aqui.",
  150: "Cento e cinquenta dias. A prática virou parte de quem você é.",
  200: "Duzentos dias. Um ano de prática está se formando.",
  365: "Um ano de prática. Uma volta completa.",
};

/** Repetições que a pesquisa de Lally et al. (2010) encontrou como mediana até a automaticidade (varia de 18 a 254). */
export const AUTOMATIC_MEDIAN = 66;

export interface WeekBar {
  start: string;
  rate: number | null; // média de conclusão (0..1), null se não havia dias com hábitos
  kept: number; // dias de prática na semana
  current: boolean;
}

export interface Milestone {
  days: number;
  date: string | null; // quando foi alcançado
}

export interface HabitGrowth {
  habit: Habit;
  days: number; // dias feitos desde sempre
  auto: number; // 0..1 rumo às ~66 repetições
  rateChange: number | null; // pontos percentuais, últimos 28 dias x 28 anteriores
  valueChange: number | null; // variação % da quantidade média nos dias feitos (hábitos numéricos)
}

export interface Evolution {
  hasData: boolean;
  firstDay: string | null;
  journeyDays: number; // dias desde o primeiro hábito
  activeDays: number; // dias de prática
  weeks: WeekBar[]; // últimas 12 semanas
  recent: number | null; // conclusão média últimos 28 dias
  before: number | null; // 28 dias anteriores
  delta: number | null; // pontos percentuais (recent - before)
  first: number | null; // primeiras 2 semanas
  last: number | null; // últimas 2 semanas
  milestones: Milestone[];
  next: { days: number; remaining: number; progress: number } | null;
  comebacks: number; // retornos depois de 3+ dias sem fazer
  habits: HabitGrowth[];
  mood: { recent: number | null; before: number | null; delta: number | null } | null;
}

const startKey = (h: Habit) => dateKey(new Date(h.createdAt));

export function evolution(
  habits: Habit[],
  today: string,
  get: ValueFn,
  checkin: CheckinFn,
  paused: PausedFn = () => false
): Evolution {
  const starts = habits.map(startKey).sort();
  if (starts.length === 0) {
    return {
      hasData: false, firstDay: null, journeyDays: 0, activeDays: 0, weeks: [], recent: null, before: null,
      delta: null, first: null, last: null, milestones: MILESTONE_DAYS.map((days) => ({ days, date: null })),
      next: { days: 1, remaining: 1, progress: 0 }, comebacks: 0, habits: [], mood: null,
    };
  }
  const from = starts[0];
  const range = (a: string, b: string) => {
    const out: string[] = [];
    for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
    return out;
  };
  const days = range(from, today);
  const ratioOf = (d: string) => dayRatio(habits, d, get, paused);
  const kept = (d: string) => (ratioOf(d) ?? 0) > 0;

  // dias de prática, marcos e retornos
  let active = 0;
  let gap = 0;
  let comebacks = 0;
  const reached: Record<number, string> = {};
  for (const d of days) {
    if (kept(d)) {
      if (gap >= 3 && active > 0) comebacks++;
      gap = 0;
      active++;
      if (MILESTONE_DAYS.includes(active)) reached[active] = d;
    } else if (ratioOf(d) !== null) {
      gap++;
    }
  }
  const milestones = MILESTONE_DAYS.map((n) => ({ days: n, date: reached[n] ?? null }));
  const nextDays = MILESTONE_DAYS.find((n) => n > active);
  const prevDays = [...MILESTONE_DAYS].reverse().find((n) => n <= active) ?? 0;
  const next = nextDays
    ? { days: nextDays, remaining: nextDays - active, progress: (active - prevDays) / (nextDays - prevDays) }
    : null;

  const avg = (list: string[]) => {
    const r = list.map(ratioOf).filter((x): x is number => x !== null);
    return r.length >= 5 ? r.reduce((a, b) => a + b, 0) / r.length : null;
  };
  const w = (a: number, b: number) => range(addDays(today, -a), addDays(today, -b)).filter((d) => d >= from);
  const recent = avg(w(27, 0));
  const before = avg(w(55, 28));
  const delta = recent !== null && before !== null ? Math.round((recent - before) * 100) : null;

  const journey = days.length;
  const first = journey >= 28 ? avg(range(from, addDays(from, 13))) : null;
  const last = journey >= 28 ? avg(range(addDays(today, -13), today)) : null;

  // últimas 12 semanas (segunda a domingo)
  const weeks: WeekBar[] = [];
  const thisMonday = mondayOf(today);
  for (let i = 11; i >= 0; i--) {
    const start = addDays(thisMonday, -7 * i);
    const ds = range(start, addDays(start, 6)).filter((d) => d <= today && d >= from);
    const r = ds.map(ratioOf).filter((x): x is number => x !== null);
    weeks.push({
      start,
      rate: r.length ? r.reduce((a, b) => a + b, 0) / r.length : null,
      kept: ds.filter(kept).length,
      current: i === 0,
    });
  }

  // crescimento por hábito
  const growth: HabitGrowth[] = habits.map((habit) => {
    const hs = startKey(habit);
    const done = (d: string) => levelOf(habit, get(habit.id, d)) >= 1;
    const total = range(hs, today).filter(done).length;
    const rate = (ds: string[]) => {
      const live = ds.filter((d) => d >= hs && !(paused(d) && !done(d)));
      return live.length >= 7 ? live.filter(done).length / live.length : null;
    };
    const r1 = rate(w(27, 0));
    const r0 = rate(w(55, 28));
    const avgVal = (ds: string[]) => {
      const v = ds.filter((d) => d >= hs && done(d)).map((d) => get(habit.id, d));
      return v.length >= 4 ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const v1 = habit.kind === "check" ? null : avgVal(w(27, 0));
    const v0 = habit.kind === "check" ? null : avgVal(w(55, 28));
    return {
      habit,
      days: total,
      auto: Math.min(1, total / AUTOMATIC_MEDIAN),
      rateChange: r1 !== null && r0 !== null ? Math.round((r1 - r0) * 100) : null,
      valueChange: v1 !== null && v0 !== null && v0 > 0 ? Math.round(((v1 - v0) / v0) * 100) : null,
    };
  });

  // humor: média dos últimos 28 dias x 28 anteriores
  const moodAvg = (ds: string[]) => {
    const m = ds.map((d) => checkin(d)?.mood).filter((x): x is NonNullable<typeof x> => x !== undefined);
    return m.length >= 8 ? m.reduce((a, b) => a + b, 0) / m.length : null;
  };
  const m1 = moodAvg(w(27, 0));
  const m0 = moodAvg(w(55, 28));
  const mood = m1 !== null || m0 !== null ? { recent: m1, before: m0, delta: m1 !== null && m0 !== null ? m1 - m0 : null } : null;

  return {
    hasData: active > 0,
    firstDay: from,
    journeyDays: journey,
    activeDays: active,
    weeks,
    recent,
    before,
    delta,
    first,
    last,
    milestones,
    next,
    comebacks,
    habits: growth,
    mood,
  };
}

/** Quantos dias de prática existem (para detectar um marco novo na hora). */
export function activeDaysCount(habits: Habit[], today: string, get: ValueFn, paused: PausedFn = () => false): number {
  return evolution(habits, today, get, () => undefined, paused).activeDays;
}
