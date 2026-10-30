import type { Habit } from "./types";

/** Unidades válidas (lista fechada: nada de texto livre). `steps` são os atalhos de "+" do cartão. */
export const UNITS: { id: string; label: string; steps?: number[] }[] = [
  { id: "vezes", label: "vezes" },
  { id: "copos", label: "copos" },
  { id: "refeições", label: "refeições" },
  { id: "porções", label: "porções" },
  { id: "séries", label: "séries" },
  { id: "repetições", label: "repetições", steps: [5, 10, 20] },
  { id: "páginas", label: "páginas" },
  { id: "capítulos", label: "capítulos" },
  { id: "minutos", label: "minutos", steps: [5, 10, 15] },
  { id: "horas", label: "horas" },
  { id: "km", label: "km", steps: [1, 2, 5] },
  { id: "passos", label: "passos", steps: [500, 1000, 2000] },
  { id: "reais", label: "reais", steps: [10, 50, 100] },
  { id: "litros", label: "litros" },
];

export const unitSteps = (unit: string): number[] | undefined => UNITS.find((u) => u.id === unit)?.steps;

/** Rótulo curto da frequência do hábito. */
export function periodLabel(h: Pick<Habit, "period" | "periodGoal">): string | null {
  if (!h.period || h.period === "day") return null;
  const n = h.periodGoal ?? 1;
  return `${n}x por ${h.period === "week" ? "semana" : "mês"}`;
}
