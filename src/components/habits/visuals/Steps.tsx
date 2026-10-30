"use client";

import { motion } from "motion/react";
import { accentColor } from "../shared";
import { useFlash } from "./useBurst";
import type { VisualProps } from "./types";

const SPRING = { type: "spring" as const, stiffness: 320, damping: 16 };

/** Ponto e direção da trilha sinuosa onde as pegadas são pisadas. */
function point(i: number, total: number) {
  const t = total === 1 ? 0.5 : i / (total - 1);
  const x = 12 + t * 88;
  const y = 54 + 17 * Math.sin(t * 4.6 + 0.3);
  const dy = 17 * 4.6 * Math.cos(t * 4.6 + 0.3);
  const angle = (Math.atan2(dy, 88) * 180) / Math.PI;
  return { x, y, angle };
}

function Footprint({
  on,
  x,
  y,
  angle,
  side,
  color,
}: {
  on: boolean;
  x: number;
  y: number;
  angle: number;
  side: number;
  color: string;
}) {
  const flash = useFlash(on);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) translate(0 ${side * 4.5})`}>
      <motion.g
        initial={false}
        animate={{ scale: on ? 1 : 0.72, opacity: on ? 1 : 0.2, y: on ? 0 : -1 }}
        transition={SPRING}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <ellipse cx="-1.5" cy="0" rx="4.4" ry="2.9" fill={color} />
        {[-2, 0, 2].map((o) => (
          <circle key={o} cx="5.2" cy={o * 1.1} r="1.15" fill={color} />
        ))}
      </motion.g>
      {flash.n > 0 && (
        <motion.circle
          key={flash.n}
          cx="1"
          cy="0"
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          initial={{ r: flash.up ? 3 : 9, opacity: 0.7 }}
          animate={{ r: flash.up ? 10 : 3, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      )}
    </g>
  );
}

/** Trilha de pegadas. Um caminhante anda até o ponto em que você está, e volta se você desfaz. */
export function Steps({ habit, value, frac }: VisualProps) {
  const total = Math.max(3, habit.target <= 12 ? Math.round(habit.target) : 10);
  const filled = value <= 0 ? 0 : frac >= 1 ? total : Math.min(total - 1, Math.max(1, Math.round(frac * total)));
  const color = accentColor(habit.accent);
  const head = point(Math.max(0, filled - 1), total);
  const end = point(total - 1, total);

  return (
    <svg viewBox="0 0 112 96" width="112" height="96" className="overflow-visible">
      {Array.from({ length: total }, (_, i) => {
        const p = point(i, total);
        return (
          <Footprint key={i} on={i < filled} x={p.x} y={p.y} angle={p.angle} side={i % 2 ? 1 : -1} color={color} />
        );
      })}

      {/* bandeira da meta */}
      <g transform={`translate(${end.x + 5} ${end.y - 3})`}>
        <line x1="0" y1="0" x2="0" y2="-24" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
        <motion.path
          d="M0 -24 L14 -19 L0 -14 Z"
          fill={frac >= 1 ? color : "var(--line)"}
          animate={{ skewY: [0, 5, 0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "left center" }}
        />
      </g>

      {/* caminhante */}
      <motion.circle
        r="4"
        fill={color}
        stroke="var(--surface)"
        strokeWidth="1.6"
        initial={false}
        animate={{ cx: value > 0 ? head.x : 6, cy: (value > 0 ? head.y : 60) - 9, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
      />
    </svg>
  );
}
