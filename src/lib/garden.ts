import { addDays, dateKey, parseKey } from "./dates";
import { levelOf, type Habit } from "./types";
import type { ValueFn } from "./stats";

export type Species = "flor" | "broto" | "arbusto";
const SPECIES: Species[] = ["flor", "broto", "arbusto"];

/** Limiares de dias feitos: semente, broto, muda, jovem, florida, frondosa. */
export const STAGE_DAYS = [0, 1, 4, 10, 25, 50];
export const STAGE_NAMES = ["Semente", "Broto", "Muda", "Jovem", "Florida", "Frondosa"];

/** Dias sem fazer a partir dos quais a planta "descansa" (nunca morre). */
export const REST_AFTER = 3;

export interface Plant {
  habit: Habit;
  species: Species;
  seed: number; // 0..∞, estável por hábito: inclina e varia a planta
  days: number; // dias feitos desde sempre
  stage: number; // índice em STAGE_NAMES
  growth: number; // 0..1, contínuo
  toNext: number | null; // 0..1 até o próximo estágio (null no último)
  daysSince: number | null; // dias desde o último feito (null se nunca)
  resting: boolean;
  doneToday: boolean;
}

function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function stageOf(days: number): number {
  let s = 0;
  STAGE_DAYS.forEach((t, i) => {
    if (days >= t) s = i;
  });
  return s;
}

/** Crescimento contínuo: rápido no começo, devagar depois (50 dias = pleno). */
export function growthOf(days: number): number {
  return Math.pow(Math.min(1, days / 50), 0.65);
}

export function gardenPlants(habits: Habit[], today: string, get: ValueFn): Plant[] {
  return habits.map((habit) => {
    const from = dateKey(new Date(habit.createdAt));
    let days = 0;
    let last: string | null = null;
    for (let d = from; d <= today; d = addDays(d, 1)) {
      if (levelOf(habit, get(habit.id, d)) >= 1) {
        days++;
        last = d;
      }
    }
    const stage = stageOf(days);
    const next = STAGE_DAYS[stage + 1];
    const daysSince =
      last === null
        ? null
        : Math.round((parseKey(today).getTime() - parseKey(last).getTime()) / 86_400_000);
    const h = hash(habit.id);
    return {
      habit,
      species: SPECIES[h % SPECIES.length],
      seed: h % 997,
      days,
      stage,
      growth: growthOf(days),
      toNext: next === undefined ? null : (days - STAGE_DAYS[stage]) / (next - STAGE_DAYS[stage]),
      daysSince,
      resting: days > 0 && daysSince !== null && daysSince >= REST_AFTER,
      doneToday: daysSince === 0,
    };
  });
}

export type Sky = "dawn" | "day" | "dusk" | "night";
export function skyOf(hour: number): Sky {
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** Borboletas que visitam o jardim conforme a sequência atual de dias. */
export function butterfliesFor(streak: number): number {
  return streak >= 14 ? 3 : streak >= 7 ? 2 : streak >= 3 ? 1 : 0;
}
