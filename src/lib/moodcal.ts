import { addDays, dateKey, parseKey } from "./dates";
import type { Checkin, Mood } from "./types";

/** Cores do humor: uma escala gentil, sem vermelho para "ruim". Frios e pesados → quentes e leves. */
export const MOOD_TOKEN: Record<Mood, string> = {
  1: "lilac",
  2: "water",
  3: "sand",
  4: "sage",
  5: "sun",
};

export const moodFill = (m: Mood, strength = 62) =>
  `color-mix(in srgb, var(--${MOOD_TOKEN[m]}) ${strength}%, var(--bg))`;

export const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export interface YM {
  y: number;
  m: number; // 0..11
}

export const ymOf = (key: string): YM => {
  const d = parseKey(key);
  return { y: d.getFullYear(), m: d.getMonth() };
};

export const shiftMonth = ({ y, m }: YM, n: number): YM => {
  const d = new Date(y, m + n, 1);
  return { y: d.getFullYear(), m: d.getMonth() };
};

/** Células do mês começando no domingo: `null` são os espaços antes do dia 1. */
export function monthCells({ y, m }: YM): (string | null)[] {
  const first = new Date(y, m, 1);
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= count; d++) cells.push(dateKey(new Date(y, m, d)));
  return cells;
}

export interface MonthSummary {
  logged: number; // dias com humor registrado
  days: number; // dias do mês já vividos (até hoje)
  avg: number | null; // 1..5
  avgMood: Mood | null; // média arredondada
  dist: Record<Mood, number>;
  trend: "up" | "down" | "flat" | null; // 2ª metade x 1ª metade
  bestWeekday: number | null; // 0..6 (domingo = 0), precisa de dados suficientes
  notes: number;
}

export function summarize(ym: YM, today: string, get: (d: string) => Checkin | undefined): MonthSummary {
  const cells = monthCells(ym).filter((c): c is string => c !== null && c <= today);
  const dist: Record<Mood, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const moods: { d: string; m: Mood }[] = [];
  let notes = 0;
  for (const d of cells) {
    const c = get(d);
    if (c?.note) notes++;
    if (c?.mood) {
      dist[c.mood]++;
      moods.push({ d, m: c.mood });
    }
  }
  const logged = moods.length;
  const avg = logged ? moods.reduce((s, x) => s + x.m, 0) / logged : null;

  let trend: MonthSummary["trend"] = null;
  if (logged >= 8) {
    const half = Math.floor(moods.length / 2);
    const a = moods.slice(0, half).reduce((s, x) => s + x.m, 0) / half;
    const b = moods.slice(half).reduce((s, x) => s + x.m, 0) / (moods.length - half);
    trend = b - a >= 0.5 ? "up" : a - b >= 0.5 ? "down" : "flat";
  }

  let bestWeekday: number | null = null;
  if (logged >= 14) {
    const sum = Array(7).fill(0);
    const n = Array(7).fill(0);
    for (const x of moods) {
      const wd = parseKey(x.d).getDay();
      sum[wd] += x.m;
      n[wd]++;
    }
    let best = -1;
    let bestAvg = 0;
    for (let i = 0; i < 7; i++) {
      if (n[i] >= 3 && sum[i] / n[i] > bestAvg) {
        bestAvg = sum[i] / n[i];
        best = i;
      }
    }
    if (best >= 0) bestWeekday = best;
  }

  return {
    logged,
    days: cells.length,
    avg,
    avgMood: avg === null ? null : (Math.min(5, Math.max(1, Math.round(avg))) as Mood),
    dist,
    trend,
    bestWeekday,
    notes,
  };
}

export const WEEKDAY_NAMES = ["domingos", "segundas", "terças", "quartas", "quintas", "sextas", "sábados"];

/** Último dia do mês em `ym` ou hoje, o que vier primeiro. */
export const monthEnd = (ym: YM, today: string) => {
  const last = addDays(dateKey(new Date(ym.y, ym.m + 1, 1)), -1);
  return last < today ? last : today;
};
