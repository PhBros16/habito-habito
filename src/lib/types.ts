export type HabitKind = "check" | "counter" | "progress";
export type VisualKey = "glass" | "book" | "ring" | "beads";
export type AccentKey = "sage" | "water" | "sand" | "clay" | "lilac" | "sun";
export type Tone = "gentle" | "stoic" | "direct" | "humor";
export type ThemePref = "system" | "light" | "dark";
export type Level = 0 | 1 | 2; // 0 = nada, 1 = mínimo, 2 = ideal

export type Mood = 1 | 2 | 3 | 4 | 5; // 1 = muito mal … 5 = muito bem
export type Energy = 1 | 2 | 3; // 1 = baixa, 3 = alta

/** Check-in do dia: um toque para humor e um para energia. */
export interface Checkin {
  date: string; // YYYY-MM-DD (fuso local)
  mood?: Mood;
  energy?: Energy;
}

export interface Habit {
  id: string;
  name: string;
  kind: HabitKind;
  accent: AccentKey;
  visual?: VisualKey; // só para contar/acumular; ausente = padrão do tipo
  unit: string; // "copos", "páginas"...
  minimum: number; // versão mínima (mini-hábito)
  target: number; // versão ideal
  minLabel?: string; // só para "check" com dois níveis
  idealLabel?: string;
  identity?: string; // "Sou alguém que lê todo dia."
  essential: boolean; // aparece no "dia difícil"
  createdAt: string; // ISO
  order: number;
  archived?: boolean;
}

export interface Entry {
  id: string; // `${habitId}:${date}`
  habitId: string;
  date: string; // YYYY-MM-DD (fuso local)
  value: number;
}

import type { Levels } from "./ambient";

export interface Settings {
  theme: ThemePref;
  sound: boolean;
  tone: Tone;
  hardDayDate: string | null; // dia difícil vale só para a data guardada
  offerDismissedDate: string | null; // dia em que a oferta de "só o essencial" foi dispensada
  retroSeenWeek: string | null; // segunda-feira da última retrospectiva aberta
  ambient: Levels; // volume de cada camada do som ambiente (0..1)
  seeded: boolean;
}

export const defaultSettings: Settings = {
  theme: "system",
  sound: true,
  tone: "gentle",
  hardDayDate: null,
  offerDismissedDate: null,
  retroSeenWeek: null,
  ambient: { rain: 0.5, wind: 0, waves: 0, piano: 0.45 },
  seeded: false,
};

export const entryId = (habitId: string, date: string) => `${habitId}:${date}`;

/** Visual padrão de um hábito numérico (hábitos antigos não têm o campo). */
export function visualOf(h: Habit): VisualKey {
  return h.visual ?? (h.kind === "counter" ? "glass" : "book");
}

/** Quantos "estágios" tem um hábito de marcar (1 = simples, 2 = mínimo + ideal). */
export function stagesOf(h: Habit): 1 | 2 {
  return h.kind === "check" && h.minimum < h.target ? 2 : 1;
}

export function levelOf(h: Habit, value: number): Level {
  if (value >= h.target) return 2;
  if (value >= h.minimum && value > 0) return 1;
  return 0;
}
