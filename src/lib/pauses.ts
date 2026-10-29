import { addDays, parseKey } from "./dates";
import type { Pause } from "./types";

export const REASONS = ["Viagem", "Doença", "Descanso", "Trabalho"];

export const isInPause = (p: Pause, date: string) =>
  date >= p.start && (p.end === null || date <= p.end);

export function pausedFn(pauses: Pause[]): (date: string) => boolean {
  return (date) => pauses.some((p) => isInPause(p, date));
}

export function activePause(pauses: Pause[], today: string): Pause | undefined {
  return pauses.find((p) => isInPause(p, today));
}

const short = (key: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" })
    .format(parseKey(key))
    .replace(".", "");

export function rangeText(p: Pause): string {
  if (p.end === null) return `desde ${short(p.start)}, até você voltar`;
  if (p.end === p.start) return short(p.start);
  return `${short(p.start)} a ${short(p.end)}`;
}

/** Quantos dias tem a pausa (null se for aberta). */
export function lengthOf(p: Pause): number | null {
  if (p.end === null) return null;
  return Math.round((parseKey(p.end).getTime() - parseKey(p.start).getTime()) / 86_400_000) + 1;
}

export const DURATIONS: { label: string; days: number | null }[] = [
  { label: "Só hoje", days: 1 },
  { label: "3 dias", days: 3 },
  { label: "1 semana", days: 7 },
  { label: "2 semanas", days: 14 },
  { label: "Até eu voltar", days: null },
];

export const endFor = (start: string, days: number | null) =>
  days === null ? null : addDays(start, days - 1);
