import type { Habit } from "@/lib/types";

/** Uma "rajada" de animação disparada por um toque (bolhas, página virando, ondas). */
export interface Burst {
  id: number;
  r: number[]; // aleatórios sorteados no clique (nunca no render)
  delay: number; // segundos, para encadear várias rajadas
}

export interface VisualProps {
  habit: Habit;
  value: number;
  frac: number; // 0..1 em relação à meta
  bursts: Burst[];
  onBurstDone: (id: number) => void;
}
