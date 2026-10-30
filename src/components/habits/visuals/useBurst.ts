"use client";

import { useEffect, useRef, useState } from "react";
import type { Burst } from "./types";

/** Executa `run` uma única vez para cada rajada nova (animações imperativas do contêiner). */
export function useBurstEffect(bursts: Burst[], run: (b: Burst) => void) {
  const seen = useRef(new Set<number>());
  useEffect(() => {
    for (const b of bursts) {
      if (!seen.current.has(b.id)) {
        seen.current.add(b.id);
        run(b);
      }
    }
  });
}

/**
 * Conta as mudanças de um estado ligado/desligado (para soltar um anel a cada virada,
 * sem disparar na primeira renderização).
 */
export function useFlash(on: boolean): { n: number; up: boolean } {
  const [state, setState] = useState({ on, n: 0, up: true });
  if (state.on !== on) setState({ on, n: state.n + 1, up: on });
  return { n: state.n, up: state.up };
}
