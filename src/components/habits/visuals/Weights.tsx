"use client";

import { motion } from "motion/react";
import { accentColor, accentSoft } from "../shared";
import type { VisualProps } from "./types";

const DOTS = 5;

/** Bíceps 💪: cresce com o progresso e contrai (aperta, treme e solta) a cada série. */
export function Weights({ habit, value, frac, bursts, onBurstDone }: VisualProps) {
  const color = accentColor(habit.accent);
  const lit = value > 0 ? Math.max(1, Math.ceil(frac * DOTS)) : 0;
  const rest = 0.74 + frac * 0.36; // tamanho de repouso

  return (
    <div className="relative flex flex-col items-center" style={{ width: 112, height: 96 }}>
      <div className="relative grid place-items-center" style={{ width: 112, height: 76 }}>
        {/* aura que enche com o esforço */}
        <motion.span
          className="absolute rounded-full"
          style={{ width: 70, height: 70, background: accentSoft(habit.accent, 26) }}
          initial={false}
          animate={{ scale: 0.55 + frac * 0.6, opacity: value > 0 ? 0.35 + frac * 0.65 : 0.2 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
        />
        <motion.span
          className="relative select-none leading-none"
          style={{ fontSize: 54, filter: value > 0 ? "none" : "grayscale(0.85) opacity(0.7)", transformOrigin: "55% 70%" }}
          initial={false}
          animate={{ scale: rest, rotate: value > 0 ? -4 : 0, opacity: bursts.length ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 190, damping: 13 }}
          aria-hidden
        >
          💪
        </motion.span>

        {bursts.map((b) => (
          <FlexBurst key={b.id} id={b.id} dir={b.dir} delay={b.delay} rest={rest} color={color} onDone={onBurstDone} />
        ))}
      </div>

      <div className="mt-1 flex gap-1.5" aria-hidden>
        {Array.from({ length: DOTS }, (_, i) => (
          <motion.i
            key={i}
            className="block h-1.5 rounded-full"
            initial={false}
            animate={{ width: i < lit ? 14 : 6, background: i < lit ? color : "var(--line)" }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Contração: aperta, treme com o esforço, solta; linhas de força saem dos lados. */
function FlexBurst({
  id,
  dir,
  delay,
  rest,
  color,
  onDone,
}: {
  id: number;
  dir: 1 | -1;
  delay: number;
  rest: number;
  color: string;
  onDone: (id: number) => void;
}) {
  const add = dir > 0;
  return (
    <>
      <motion.span
        className="absolute select-none leading-none"
        style={{ fontSize: 54, transformOrigin: "55% 70%" }}
        initial={{ opacity: 1, scale: rest }}
        animate={
          add
            ? {
                scale: [rest, rest * 1.34, rest * 1.26, rest * 1.3, rest],
                rotate: [-4, -12, -8, -11, -4],
                x: [0, 0, -1.5, 1.5, 0],
              }
            : { scale: [rest, rest * 0.82, rest], rotate: [-4, 2, -4] }
        }
        transition={{ duration: add ? 0.62 : 0.4, delay, times: add ? [0, 0.28, 0.5, 0.7, 1] : undefined, ease: "easeInOut" }}
        onAnimationComplete={() => onDone(id)}
        aria-hidden
      >
        💪
      </motion.span>
      {add &&
        [-1, 1].map((side) =>
          [0, 1, 2].map((i) => (
            <motion.i
              key={`${side}${i}`}
              className="absolute block rounded-full"
              style={{
                width: 3,
                height: 9,
                background: color,
                left: "50%",
                top: "50%",
                rotate: side * (28 + i * 22),
                transformOrigin: "50% 0%",
              }}
              initial={{ opacity: 0, x: side * 28, y: -22 + i * 11, scaleY: 0.4 }}
              animate={{ opacity: [0, 1, 0], x: side * (38 + i * 3), scaleY: [0.4, 1, 0.7] }}
              transition={{ duration: 0.5, delay: delay + 0.1 + i * 0.03 }}
            />
          ))
        )}
    </>
  );
}
