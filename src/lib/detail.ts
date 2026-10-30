import { addDays, dateKey, parseKey } from "./dates";
import { goalOf, isPeriodic, periodHistory, periodStreaks, type PeriodRun } from "./periods";
import { habitStats, type PausedFn, type ValueFn } from "./stats";
import { levelOf, type Habit, type Level } from "./types";

export interface HeatDay {
  date: string;
  level: Level;
  future: boolean;
  before: boolean; // antes de o hábito existir
}

export interface HabitDetail {
  habit: Habit;
  streakUnit: "dias" | "semanas" | "meses";
  current: number;
  best: number;
  rate: number | null; // 0..1: dias (30d) ou períodos cumpridos (últimos 8)
  rateLabel: string;
  totalDays: number;
  perWeek: number | null; // média de dias feitos por semana (últimas 8 semanas)
  idealShare: number | null; // dos dias feitos, quanto % chegou ao ideal
  heat: HeatDay[][]; // colunas = semanas (segunda a domingo)
  weekday: { label: string; rate: number | null }[]; // seg..dom
  bestWeekday: string | null;
  recent: { date: string; value: number }[]; // últimos 14 dias
  totalValue: number;
  avgPerDoneDay: number | null;
  bestValue: { value: number; date: string } | null;
  periods: PeriodRun[]; // vazio para hábitos diários
}

const WD = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
const WD_FULL = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];
const dowOf = (date: string) => (parseKey(date).getDay() + 6) % 7;

export function habitDetail(habit: Habit, today: string, get: ValueFn, paused: PausedFn): HabitDetail {
  const created = dateKey(new Date(habit.createdAt));
  const val = (d: string) => get(habit.id, d);
  const lvl = (d: string): Level => levelOf(habit, val(d));

  // linha do tempo desde a criação
  const days: string[] = [];
  for (let d = created; d <= today; d = addDays(d, 1)) days.push(d);
  const done = days.filter((d) => lvl(d) >= 1);

  // calendário de 12 semanas, alinhado na segunda
  const monday = addDays(today, -dowOf(today));
  const heat: HeatDay[][] = [];
  for (let w = 11; w >= 0; w--) {
    const start = addDays(monday, -7 * w);
    heat.push(
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(start, i);
        return { date, level: lvl(date), future: date > today, before: date < created };
      })
    );
  }

  // desempenho por dia da semana (só em dias ativos e fora de pausa)
  const wdTotals = Array.from({ length: 7 }, () => ({ n: 0, ok: 0 }));
  days.forEach((d) => {
    if (paused(d) && lvl(d) === 0) return;
    const w = wdTotals[dowOf(d)];
    w.n++;
    if (lvl(d) >= 1) w.ok++;
  });
  const weekday = wdTotals.map((w, i) => ({ label: WD[i], rate: w.n >= 3 ? w.ok / w.n : null }));
  const bestIdx = weekday.reduce((b, w, i) => (w.rate !== null && (b < 0 || w.rate > (weekday[b].rate ?? 0)) ? i : b), -1);
  const bestWeekday = bestIdx >= 0 && (weekday[bestIdx].rate ?? 0) > 0 ? WD_FULL[bestIdx] : null;

  // números
  const recent = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, -13 + i);
    return { date, value: val(date) };
  });
  const values = days.map((d) => ({ date: d, value: val(d) })).filter((x) => x.value > 0);
  const totalValue = values.reduce((s, x) => s + x.value, 0);
  const bestValue = values.reduce<{ value: number; date: string } | null>(
    (b, x) => (b === null || x.value > b.value ? { value: x.value, date: x.date } : b),
    null
  );
  const idealDays = done.filter((d) => lvl(d) === 2).length;
  const idealShare = habit.minimum < habit.target && done.length > 0 ? idealDays / done.length : null;

  // últimas 8 semanas: média de dias feitos por semana
  const last8 = days.filter((d) => d > addDays(today, -56));
  const perWeek = last8.length >= 7 ? (last8.filter((d) => lvl(d) >= 1).length / last8.length) * 7 : null;

  let current: number, best: number, rate: number | null, rateLabel: string;
  let streakUnit: HabitDetail["streakUnit"] = "dias";
  let periods: PeriodRun[] = [];
  if (isPeriodic(habit)) {
    periods = periodHistory(habit, today, get, 8, created);
    const s = periodStreaks(periodHistory(habit, today, get, 200, created));
    current = s.current;
    best = s.best;
    streakUnit = habit.period === "week" ? "semanas" : "meses";
    // o período em andamento só entra se já fechou a meta
    const closed = periods.filter((p, i) => i < periods.length - 1 || p.met);
    rate = closed.length ? closed.filter((p) => p.met).length / closed.length : null;
    rateLabel = habit.period === "week" ? "semanas com meta cumprida" : "meses com meta cumprida";
  } else {
    const st = habitStats([habit], today, get, paused)[0];
    current = st.current;
    best = st.best;
    rate = st.rate30;
    rateLabel = "dos últimos 30 dias";
  }

  return {
    habit,
    streakUnit,
    current,
    best,
    rate,
    rateLabel,
    totalDays: done.length,
    perWeek,
    idealShare,
    heat,
    weekday,
    bestWeekday,
    recent,
    totalValue,
    avgPerDoneDay: done.length ? totalValue / done.length : null,
    bestValue,
    periods,
  };
}

export const periodGoalText = (h: Habit) => (isPeriodic(h) ? goalOf(h) : null);
