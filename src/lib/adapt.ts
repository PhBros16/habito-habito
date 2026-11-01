import { addDays, dateKey } from "./dates";
import { missedRun, type PausedFn, type ValueFn } from "./stats";
import { levelOf, type Habit } from "./types";

const never: PausedFn = () => false;

/**
 * "Não falhe duas vezes": o hábito ficou de fora só ontem, depois de pelo menos 3 dias seguidos.
 * Devolve o tamanho da sequência que veio antes (ou null se não se aplica).
 */
export function missedOnce(h: Habit, today: string, get: ValueFn, paused: PausedFn = never): number | null {
  if (missedRun(h, today, get, paused) !== 1) return null;
  const from = dateKey(new Date(h.createdAt));
  let run = 0;
  for (let d = addDays(today, -2); d >= from; d = addDays(d, -1)) {
    if (paused(d)) continue;
    if (levelOf(h, get(h.id, d)) >= 1) run++;
    else break;
  }
  return run >= 3 ? run : null;
}

export interface RaiseSuggestion {
  from: number;
  to: number;
}

/**
 * Sugestão de subir a meta ideal: nos últimos 14 dias o ideal saiu em pelo menos 12.
 * Metas que desafiam um pouco, sem assustar, mantêm o progresso (Locke e Latham, 2002).
 */
export function raiseSuggestion(h: Habit, today: string, get: ValueFn): RaiseSuggestion | null {
  if (h.kind === "check" || (h.period && h.period !== "day")) return null;
  const from = dateKey(new Date(h.createdAt));
  if (addDays(from, 14) > today) return null;
  let ideal = 0;
  for (let i = 1; i <= 14; i++) if (levelOf(h, get(h.id, addDays(today, -i))) === 2) ideal++;
  if (ideal < 12) return null;
  return { from: h.target, to: h.target + Math.max(1, Math.round(h.target * 0.15)) };
}

/** Um aviso dispensado fica quieto por `days` dias. */
export function dismissed(seen: Record<string, string>, key: string, today: string, days = 1): boolean {
  const s = seen[key];
  return s !== undefined && addDays(s, days) > today;
}
