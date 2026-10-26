"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

const COLORS = ["var(--sage)", "var(--water)", "var(--sand)", "var(--lilac)", "var(--sun)", "var(--clay)"];

/** Celebração zen: pétalas/luzes que sobem e se dissolvem, com a frase no centro. */
export function Celebration({ show, phrase }: { show: boolean; phrase: string }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: 6 + ((i * 37) % 88), // determinístico (sem Math.random no render)
        size: 6 + ((i * 7) % 10),
        delay: (i % 9) * 0.07,
        dur: 2.2 + ((i * 13) % 14) / 10,
        drift: ((i * 29) % 60) - 30,
        color: COLORS[i % COLORS.length],
      })),
    []
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <div
            className="absolute inset-0 backdrop-blur-[6px]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--bg) 82%, transparent), color-mix(in srgb, var(--bg) 55%, transparent) 70%), radial-gradient(circle at 50% 55%, var(--glow), transparent 60%)",
            }}
          />
          {bits.map((b) => (
            <motion.span
              key={b.id}
              className="absolute rounded-full"
              style={{ left: `${b.x}%`, bottom: -20, width: b.size, height: b.size, background: b.color, opacity: 0.8 }}
              initial={{ y: 0, x: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -window.innerHeight * 0.85, x: b.drift, opacity: [0, 0.85, 0], scale: [0.6, 1, 0.8] }}
              transition={{ duration: b.dur, delay: b.delay, ease: "easeOut" }}
            />
          ))}
          <motion.p
            className="font-display absolute inset-x-8 top-[38%] text-center text-3xl leading-snug"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {phrase}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
