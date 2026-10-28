"use client";

import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const PAGE_W = 49;
const PAGE_H = 62;
const PAGE_TOP = 14;
const LEFT_X = 6;
const RIGHT_X = 57;

const SPRING = { type: "spring" as const, stiffness: 120, damping: 18 };

/** Linhas de texto desfocadas que dão cara de página. */
function Lines({ color }: { color: string }) {
  const widths = [86, 100, 92, 100, 70, 96];
  return (
    <>
      {widths.map((w, i) => (
        <i
          key={i}
          className="absolute block rounded-full"
          style={{ left: 7, top: 9 + i * 8.5, height: 2, width: `calc(${w}% - 14px)`, background: color }}
        />
      ))}
    </>
  );
}

/**
 * Livro aberto. As páginas lidas se acumulam na esquerda (a pilha engrossa) e as
 * restantes afinam na direita. A cada toque, uma página vira de verdade.
 */
export function Book({ habit, frac, bursts, onBurstDone }: VisualProps) {
  const accent = accentColor(habit.accent);
  const readLine = accentSoft(habit.accent, 42);
  const pendingLine = "var(--line)";

  const left = 3 + frac * 13; // espessura da pilha lida
  const right = 3 + (1 - frac) * 13; // espessura da pilha restante

  const edge = (color: string): CSSProperties => ({
    backgroundImage: `repeating-linear-gradient(to bottom, ${color} 0, ${color} 1.5px, transparent 1.5px, transparent 3px)`,
    borderRadius: "0 0 4px 4px",
  });

  const page = (extra: CSSProperties): CSSProperties => ({
    position: "absolute",
    top: PAGE_TOP,
    width: PAGE_W,
    height: PAGE_H,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    ...extra,
  });

  return (
    <div className="relative" style={{ width: 112, height: 104, perspective: 700 }}>
      {/* capa */}
      <div
        className="absolute left-0 top-2 rounded-[10px]"
        style={{
          width: 112,
          height: 88,
          background: accentSoft(habit.accent, 28),
          border: `1px solid ${accentSoft(habit.accent, 50)}`,
        }}
      />

      {/* pilhas de páginas (espessura) */}
      <motion.div
        className="absolute"
        style={{ left: LEFT_X + 2, top: PAGE_TOP + PAGE_H, width: PAGE_W - 2, ...edge(accentSoft(habit.accent, 60)) }}
        initial={false}
        animate={{ height: left }}
        transition={SPRING}
      />
      <motion.div
        className="absolute"
        style={{ left: RIGHT_X, top: PAGE_TOP + PAGE_H, width: PAGE_W - 2, ...edge(accentSoft(habit.accent, 24)) }}
        initial={false}
        animate={{ height: right }}
        transition={SPRING}
      />

      {/* páginas abertas */}
      <div style={page({ left: LEFT_X, borderRadius: "7px 2px 2px 7px" })}>
        <Lines color={readLine} />
      </div>
      <div style={page({ left: RIGHT_X, borderRadius: "2px 7px 7px 2px" })}>
        <Lines color={pendingLine} />
      </div>

      {/* fita marcadora */}
      <div
        className="absolute"
        style={{
          left: 53,
          top: 8,
          width: 6,
          height: 40,
          background: accent,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%)",
        }}
      />

      {/* páginas virando (uma por toque) */}
      {bursts.map((b) => (
        <motion.div
          key={b.id}
          className="absolute"
          style={{
            left: RIGHT_X,
            top: PAGE_TOP,
            width: PAGE_W,
            height: PAGE_H,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -180 }}
          transition={{ duration: 0.7, delay: b.delay, ease: [0.45, 0, 0.2, 1] }}
          onAnimationComplete={() => onBurstDone(b.id)}
        >
          <div
            style={{
              ...page({ left: 0, top: 0, borderRadius: "2px 7px 7px 2px" }),
              backfaceVisibility: "hidden",
            }}
          >
            <Lines color={pendingLine} />
          </div>
          <div
            style={{
              ...page({ left: 0, top: 0, borderRadius: "7px 2px 2px 7px" }),
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Lines color={readLine} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
