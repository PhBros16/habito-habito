import type { ComponentType } from "react";
import type { Habit, VisualKey } from "@/lib/types";
import { Beads } from "./Beads";
import { Book } from "./Book";
import { Glass } from "./Glass";
import { Ring } from "./Ring";
import type { VisualProps } from "./types";

export const VISUALS: Record<VisualKey, { name: string; Component: ComponentType<VisualProps> }> = {
  glass: { name: "Copo", Component: Glass },
  book: { name: "Livro", Component: Book },
  ring: { name: "Anel", Component: Ring },
  beads: { name: "Contas", Component: Beads },
};

export const VISUAL_ORDER: VisualKey[] = ["glass", "book", "ring", "beads"];

/** Passos rápidos de "+" adequados ao tamanho da meta (copos: 1; páginas: 1/5/10; minutos: 5/10/15). */
export function stepsOf(h: Habit): number[] {
  if (h.kind === "counter") return [1];
  const t = h.target;
  if (t <= 10) return [1, 2];
  if (t <= 30) return [1, 5, 10];
  if (t <= 120) return [5, 10, 15];
  return [10, 25, 50];
}

/** Hábito fictício, só para as pré-visualizações do seletor de visual. */
export function previewHabit(accent: Habit["accent"]): Habit {
  return {
    id: "preview",
    name: "",
    kind: "progress",
    accent,
    unit: "",
    minimum: 3,
    target: 10,
    essential: false,
    createdAt: "",
    order: 0,
  };
}
