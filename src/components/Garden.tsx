"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { accentColor } from "./habits/shared";
import { useSyncExternalStore } from "react";
import { TREE_DAYS, butterfliesFor, gardenLevel, skyOf, type Plant, type Sky } from "@/lib/garden";

const SKY: Record<Sky, [string, string]> = {
  dawn: [
    "color-mix(in srgb, var(--clay) 22%, var(--bg))",
    "color-mix(in srgb, var(--sun) 26%, var(--bg))",
  ],
  day: [
    "color-mix(in srgb, var(--water) 22%, var(--bg))",
    "color-mix(in srgb, var(--water) 6%, var(--bg))",
  ],
  dusk: [
    "color-mix(in srgb, var(--lilac) 30%, var(--bg))",
    "color-mix(in srgb, var(--clay) 24%, var(--bg))",
  ],
  night: [
    "color-mix(in srgb, var(--lilac) 34%, var(--bg))",
    "color-mix(in srgb, var(--water) 16%, var(--bg))",
  ],
};

const LEAF = (resting: boolean) =>
  `color-mix(in srgb, var(--sage) ${resting ? 48 : 78}%, ${resting ? "var(--muted)" : "var(--surface)"})`;

/** Ponto de uma curva quadrática (para pendurar as folhas no caule). */
function q(t: number, p0: number, p1: number, p2: number) {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function PlantArt({ p }: { p: Plant }) {
  const g = p.growth;
  const color = accentColor(p.habit.accent);
  const lean = ((p.seed % 5) - 2) * 3;
  const sprout = p.days === 0;
  const h = p.species === "arbusto" ? 14 + g * 74 : 14 + g * 106;
  const topX = 50 + lean;
  const topY = 140 - h;
  const cx = 50 - lean * 1.2;
  const cy = 140 - h * 0.55;
  const leaf = LEAF(p.resting);

  if (p.days >= TREE_DAYS) return <TreeArt p={p} color={color} leaf={leaf} />;

  if (sprout) {
    return (
      <g>
        <ellipse cx="50" cy="139" rx="16" ry="5" fill="color-mix(in srgb, var(--clay) 40%, var(--surface-2))" />
        <ellipse cx="50" cy="136" rx="4.5" ry="3" fill="color-mix(in srgb, var(--clay) 70%, var(--ink))" />
      </g>
    );
  }

  const count = Math.max(2, Math.round(2 + g * 6));
  const leaves = Array.from({ length: count }, (_, i) => {
    const t = 0.28 + (0.68 * i) / count;
    const side = i % 2 === 0 ? 1 : -1;
    const x = q(t, 50, cx, topX);
    const y = q(t, 140, cy, topY);
    const s = (0.5 + 0.7 * g) * (1 - 0.35 * t);
    const ang = side * (42 - 12 * t) + (p.resting ? side * 22 : 0);
    return { x, y, s, ang, side };
  });

  return (
    <g>
      {p.doneToday && (
        <motion.circle
          cx={topX}
          cy={topY}
          r={20 + g * 10}
          fill={color}
          animate={{ opacity: [0.1, 0.28, 0.1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {p.species === "arbusto" ? (
        <>
          <path d={`M50 140 Q ${cx} ${cy} ${topX} ${topY + 6}`} stroke="color-mix(in srgb, var(--clay) 55%, var(--ink))" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {[[-9, 4, 1], [9, 5, 0.92], [0, -7, 1.05]].map(([dx, dy, k], i) => (
            <circle key={i} cx={topX + dx * (0.4 + g)} cy={topY + dy * (0.4 + g)} r={(7 + 15 * g) * k} style={{ fill: leaf }} opacity={0.92} />
          ))}
          {g > 0.5 &&
            [[-10, 2], [8, -4], [2, 9]].map(([dx, dy], i) => (
              <circle key={i} cx={topX + dx * (0.4 + g)} cy={topY + dy * (0.4 + g)} r={2.2 + 1.5 * g} fill={color} />
            ))}
        </>
      ) : (
        <>
          <path d={`M50 140 Q ${cx} ${cy} ${topX} ${topY}`} stroke={leaf} strokeWidth={2.6 + g * 1.2} fill="none" strokeLinecap="round" />
          {leaves.map((l, i) => (
            <path
              key={i}
              d="M0 0 Q 11 -8 22 0 Q 11 8 0 0"
              transform={`translate(${l.x} ${l.y}) rotate(${l.side === 1 ? l.ang - 8 : 180 - l.ang + 8}) scale(${l.s})`}
              style={{ fill: leaf }}
            />
          ))}
          {p.species === "flor" && g > 0.3 && g <= 0.55 && (
            <ellipse cx={topX} cy={topY - 3} rx={3.4} ry={5} fill={color} opacity={p.resting ? 0.55 : 1} />
          )}
          {p.species === "flor" && g > 0.55 && (
            <g transform={`translate(${topX} ${topY})`} opacity={p.resting ? 0.6 : 1}>
              {Array.from({ length: 6 }, (_, i) => (
                <ellipse key={i} cx={0} cy={-(5 + 9 * ((g - 0.55) / 0.45))} rx={3.6 + 3 * g} ry={5 + 6 * ((g - 0.55) / 0.45)} fill={color} transform={`rotate(${i * 60})`} />
              ))}
              <circle r={3.6 + 1.6 * g} fill="var(--sun)" />
            </g>
          )}
          {p.species === "broto" && g > 0.7 && (
            <g opacity={p.resting ? 0.6 : 1}>
              {[[-5, 4], [5, 2], [0, -4]].map(([dx, dy], i) => (
                <circle key={i} cx={topX + dx} cy={topY + dy} r={2.6 + g} fill={color} />
              ))}
            </g>
          )}
        </>
      )}
    </g>
  );
}


/** Árvore: depois de 100 dias o hábito vira árvore; quanto mais velha, mais copa, flores e frutos. */
function TreeArt({ p, color, leaf }: { p: Plant; color: string; leaf: string }) {
  const age = Math.min(1, (p.days - TREE_DAYS) / 265); // 100 → 365 dias
  const trunkH = 62 + age * 22;
  const topY = 140 - trunkH;
  const r = 20 + age * 12;
  const trunk = "color-mix(in srgb, var(--clay) 55%, var(--ink))";
  const crowns: [number, number, number][] = [[0, 0, 1], [-r * 0.8, r * 0.35, 0.8], [r * 0.8, r * 0.35, 0.8], [-r * 0.35, -r * 0.55, 0.78], [r * 0.4, -r * 0.5, 0.74]];
  return (
    <g>
      {p.doneToday && (
        <motion.circle cx={50} cy={topY} r={r * 1.7} fill={color} animate={{ opacity: [0.08, 0.22, 0.08] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} />
      )}
      <ellipse cx="50" cy="140" rx={16 + age * 8} ry="4" fill="var(--ink)" opacity="0.08" />
      <path d={`M50 140 C 48 ${140 - trunkH * 0.5}, 53 ${140 - trunkH * 0.8}, 50 ${topY + 6}`} stroke={trunk} strokeWidth={5 + age * 4} fill="none" strokeLinecap="round" />
      <path d={`M50 ${140 - trunkH * 0.5} q 10 -8 16 -16 M50 ${140 - trunkH * 0.6} q -9 -6 -14 -15`} stroke={trunk} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {crowns.map(([dx, dy, k], i) => (
        <circle key={i} cx={50 + dx} cy={topY + dy} r={r * k} style={{ fill: leaf }} opacity={0.94 - i * 0.03} />
      ))}
      {Array.from({ length: 4 + Math.round(age * 5) }, (_, i) => (
        <circle key={i} cx={50 + Math.cos(i * 2.3) * r * 0.9} cy={topY + Math.sin(i * 2.3) * r * 0.7} r={2.2 + age} fill={color} opacity={p.resting ? 0.5 : 1} />
      ))}
      {p.days >= 365 && (
        <motion.circle cx="50" cy={topY - r - 6} r="3" fill="var(--sun)" animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.3, 0.9] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      )}
    </g>
  );
}

function Bird({ i, w, h }: { i: number; w: number; h: number }) {
  const y = h * (0.12 + 0.1 * i);
  return (
    <motion.g initial={{ x: -20, y }} animate={{ x: w + 20, y: [y, y - 8, y + 4, y] }} transition={{ duration: 22 + i * 7, repeat: Infinity, delay: i * 6, ease: "linear" }}>
      <motion.path d="M-6 0 Q -3 -4 0 0 Q 3 -4 6 0" fill="none" stroke="var(--ink)" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" animate={{ scaleY: [1, -0.6, 1] }} transition={{ duration: 0.7, repeat: Infinity }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
    </motion.g>
  );
}

function Lantern({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <path d={`M${x} ${y - 14} V${y - 6}`} stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1" />
      <motion.circle cx={x} cy={y} r="9" fill="var(--sun)" animate={{ opacity: [0.12, 0.28, 0.12] }} transition={{ duration: 3, repeat: Infinity }} />
      <rect x={x - 3} y={y - 5} width="6" height="9" rx="2.4" fill="var(--sun)" opacity="0.85" />
    </g>
  );
}

function Butterfly({ i, w, h }: { i: number; w: number; h: number }) {
  const colors = ["sun", "lilac", "clay"] as const;
  const c = accentColor(colors[i % 3]);
  const xs = [0.15, 0.4, 0.75, 0.55, 0.25, 0.15].map((v, k) => (((v + i * 0.27 + k * 0.03) % 1) * (w - 30)) + 10);
  const ys = [0.25, 0.15, 0.3, 0.12, 0.28, 0.25].map((v, k) => (v + ((i + k) % 3) * 0.04) * h);
  return (
    <motion.g
      initial={{ x: xs[0], y: ys[0] }}
      animate={{ x: xs, y: ys }}
      transition={{ duration: 16 + i * 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.g animate={{ scaleX: [1, 0.25, 1] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <path d="M0 0 Q -7 -7 -9 -1 Q -7 4 0 1 Z M0 0 Q 7 -7 9 -1 Q 7 4 0 1 Z" fill={c} opacity={0.9} />
      </motion.g>
    </motion.g>
  );
}

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
function useIsDark(): boolean {
  return useSyncExternalStore(
    subscribeTheme,
    () => document.documentElement.getAttribute("data-theme") === "dark",
    () => false
  );
}

export function GardenScene({
  plants,
  hour,
  streak,
  compact = false,
  onPick,
}: {
  plants: Plant[];
  hour: number;
  streak: number;
  compact?: boolean;
  onPick?: (habitId: string) => void;
}) {
  const id = useId();
  const level = gardenLevel(plants).index;
  const dark = useIsDark();
  // O céu obedece ao tema: escuro = noite, claro = dia (com alvorada/entardecer só no claro).
  const raw = skyOf(hour);
  const sky: Sky = dark ? "night" : raw === "night" ? "day" : raw;
  const W = 360;
  const H = compact ? 132 : 210;
  const G = H - (compact ? 30 : 40); // linha do chão
  const n = Math.max(1, plants.length);
  const slot = W / n;
  const pw = Math.min(compact ? 66 : 118, slot * 1.3);
  const ph = pw * 1.4;
  const night = sky === "night";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Seu jardim">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: SKY[sky][0] }} />
          <stop offset="1" style={{ stopColor: SKY[sky][1] }} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />

      {night && (
        <>
          <circle cx={W - 52} cy={H * 0.2} r={compact ? 9 : 13} fill="color-mix(in srgb, var(--sun) 55%, var(--bg))" opacity={0.9} />
          {Array.from({ length: 14 }, (_, i) => (
            <motion.circle
              key={i}
              cx={(i * 71 + 23) % (W - 20) + 10}
              cy={((i * 37) % (G * 0.6)) + 8}
              r={0.9 + (i % 3) * 0.4}
              fill="var(--ink)"
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </>
      )}
      {sky === "day" && (
        <circle cx={52} cy={H * 0.2} r={compact ? 10 : 15} fill="var(--sun)" opacity={0.55} />
      )}

      {/* colinas */}
      <path
        d={`M0 ${G - 6} C 80 ${G - 22} 160 ${G - 8} 240 ${G - 18} S 330 ${G - 10} ${W} ${G - 16} V ${H} H0 Z`}
        style={{ fill: night ? "color-mix(in srgb, var(--sage) 14%, var(--bg))" : "color-mix(in srgb, var(--sage) 20%, var(--bg))" }}
      />
      <path
        d={`M0 ${G + 4} C 90 ${G - 8} 170 ${G + 8} 250 ${G - 2} S 330 ${G + 4} ${W} ${G - 2} V ${H} H0 Z`}
        style={{ fill: night ? "color-mix(in srgb, var(--sage) 22%, var(--bg))" : "color-mix(in srgb, var(--sage) 36%, var(--bg))" }}
      />

      {/* laguinho (nível Jardim) */}
      {level >= 2 && (
        <g>
          <ellipse cx={W - 70} cy={G + 8} rx={compact ? 26 : 34} ry={compact ? 4 : 6} fill="color-mix(in srgb, var(--water) 40%, var(--bg))" opacity="0.85" />
          <motion.ellipse cx={W - 70} cy={G + 8} fill="none" stroke="var(--water)" strokeWidth="0.8" animate={{ rx: [8, 28], ry: [1.5, 5], opacity: [0.6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }} />
        </g>
      )}
      {level >= 3 && !night && Array.from({ length: 2 }, (_, i) => <Bird key={i} i={i} w={W} h={G} />)}

      {plants.map((p, i) => {
        const x = slot * (i + 0.5) - pw / 2;
        const y = G + 12 - ph;
        return (
          <svg
            key={p.habit.id}
            x={x}
            y={y}
            width={pw}
            height={ph}
            viewBox="0 0 100 140"
            overflow="visible"
            onClick={onPick ? () => onPick(p.habit.id) : undefined}
            style={onPick ? { cursor: "pointer" } : undefined}
          >
            {onPick && <rect width="100" height="140" fill="transparent" />}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 70, damping: 13 }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            >
              <motion.g
                animate={{ rotate: p.resting ? [5, 6.5, 5] : [-1.6, 1.6, -1.6] }}
                transition={{ duration: 5 + (p.seed % 4), repeat: Infinity, ease: "easeInOut" }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
              >
                <PlantArt p={p} />
              </motion.g>
            </motion.g>
          </svg>
        );
      })}

      {level >= 4 && (sky === "dusk" || night) && [0.22, 0.5, 0.82].map((f, i) => <Lantern key={i} x={W * f} y={G - 34 - (i % 2) * 10} />)}

      {night && level >= 2 &&
        Array.from({ length: compact ? 3 : 5 }, (_, i) => (
          <motion.circle
            key={i}
            r={1.8}
            fill="var(--sun)"
            initial={{ cx: 40 + i * 70, cy: G - 18 - (i % 3) * 12 }}
            animate={{ opacity: [0, 1, 0], cx: [40 + i * 70, 55 + i * 70, 40 + i * 70], cy: [G - 18 - (i % 3) * 12, G - 30 - (i % 3) * 12, G - 18 - (i % 3) * 12] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          />
        ))}

      {!night &&
        Array.from({ length: butterfliesFor(streak) }, (_, i) => <Butterfly key={i} i={i} w={W} h={G} />)}
    </svg>
  );
}
