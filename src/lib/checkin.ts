import type { Energy, Mood } from "./types";

export const MOODS: Mood[] = [1, 2, 3, 4, 5];
export const ENERGIES: Energy[] = [1, 2, 3];

export const MOOD_LABEL: Record<Mood, string> = {
  1: "Muito mal",
  2: "Mal",
  3: "Neutro",
  4: "Bem",
  5: "Muito bem",
};

export const ENERGY_LABEL: Record<Energy, string> = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

/** Dia "pesado": humor baixo ou energia baixa. Nesses dias o app pega leve. */
export function isLowDay(c: { mood?: Mood; energy?: Energy } | undefined): boolean {
  if (!c) return false;
  return (c.mood !== undefined && c.mood <= 2) || c.energy === 1;
}
