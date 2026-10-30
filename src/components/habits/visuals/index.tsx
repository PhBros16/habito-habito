import type { ComponentType } from "react";
import type { Habit, NumericVisualKey } from "@/lib/types";
import type { SoundName } from "@/lib/sound";
import { unitSteps } from "@/lib/units";
import { Beads } from "./Beads";
import { Book } from "./Book";
import { Flame } from "./Flame";
import { Glass } from "./Glass";
import { Heart } from "./Heart";
import { Hourglass } from "./Hourglass";
import { Jar } from "./Jar";
import { Moon } from "./Moon";
import { Plant } from "./Plant";
import { Ring } from "./Ring";
import { Steps } from "./Steps";
import { Weights } from "./Weights";
import { Track } from "./Track";
import { Lotus } from "./Lotus";
import { Mountain } from "./Mountain";
import type { VisualProps } from "./types";

export interface VisualDef {
  name: string;
  /** o que ele representa, para o formulário */
  hint: string;
  Component: ComponentType<VisualProps>;
  /** usa rajadas de animação (os demais se animam sozinhos pelo valor) */
  bursts: boolean;
  add: SoundName;
  remove: SoundName;
}

export const VISUALS: Record<NumericVisualKey, VisualDef> = {
  glass: { name: "Copo", hint: "água, líquidos", Component: Glass, bursts: true, add: "plink", remove: "drain" },
  book: { name: "Livro", hint: "leitura, estudo", Component: Book, bursts: true, add: "page", remove: "pageBack" },
  ring: { name: "Anel", hint: "tempo, metas", Component: Ring, bursts: true, add: "tick", remove: "ebb" },
  beads: { name: "Contas", hint: "séries, tarefas", Component: Beads, bursts: false, add: "pop", remove: "ebb" },
  moon: { name: "Lua", hint: "sono, descanso", Component: Moon, bursts: true, add: "twinkle", remove: "ebb" },
  plant: { name: "Planta", hint: "crescer, praticar", Component: Plant, bursts: true, add: "grow", remove: "wilt" },
  steps: { name: "Pegadas", hint: "caminhar, correr", Component: Steps, bursts: false, add: "step", remove: "unstep" },
  jar: { name: "Pote", hint: "dinheiro, poupar", Component: Jar, bursts: true, add: "coin", remove: "coinOut" },
  flame: { name: "Chama", hint: "foco, intensidade", Component: Flame, bursts: true, add: "whoosh", remove: "snuff" },
  weights: { name: "Barra", hint: "treino, força", Component: Weights, bursts: true, add: "clack", remove: "unclack" },
  hourglass: { name: "Ampulheta", hint: "tempo de foco", Component: Hourglass, bursts: true, add: "sand", remove: "sandBack" },
  heart: { name: "Coração", hint: "gratidão, afeto", Component: Heart, bursts: true, add: "beat", remove: "ebb" },
  track: { name: "Pista", hint: "corrida, ciclismo", Component: Track, bursts: false, add: "step", remove: "unstep" },
  lotus: { name: "Lótus", hint: "meditar, respirar", Component: Lotus, bursts: false, add: "twinkle", remove: "ebb" },
  mountain: { name: "Montanha", hint: "estudo, projetos", Component: Mountain, bursts: false, add: "grow", remove: "ebb" },
};

export const VISUAL_ORDER: NumericVisualKey[] = [
  "glass",
  "book",
  "ring",
  "beads",
  "moon",
  "plant",
  "steps",
  "jar",
  "flame",
  "weights",
  "hourglass",
  "heart",
  "track",
  "lotus",
  "mountain",
];

/** Passos rápidos de "+" adequados ao tamanho da meta (copos: 1; páginas: 1/5/10; minutos: 5/10/15). */
export function stepsOf(h: Habit): number[] {
  if (h.kind === "counter") return [1];
  const byUnit = unitSteps(h.unit);
  if (byUnit) return byUnit;
  const t = h.target;
  if (t <= 10) return [1, 2];
  if (t <= 30) return [1, 5, 10];
  if (t <= 120) return [5, 10, 15];
  return [10, 25, 50];
}

/** Hábito fictício, só para as pré-visualizações do seletor de visual. */
export function previewHabit(accent: Habit["accent"], kind: Habit["kind"] = "progress"): Habit {
  return {
    id: `preview-${kind}`,
    name: "",
    kind,
    accent,
    unit: "",
    minimum: kind === "check" ? 1 : 3,
    target: kind === "check" ? 2 : 10,
    essential: false,
    createdAt: "",
    order: 0,
  };
}
