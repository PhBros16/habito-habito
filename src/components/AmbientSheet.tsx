"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet } from "./Sheet";
import { MeditationPanel } from "./MeditationPanel";
import { accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import {
  LAYERS,
  normalizeLevels,
  PRESETS,
  getSleep,
  isPlaying,
  setLevels,
  setSleep,
  start,
  stop,
  subscribe,
  type Layer,
  type Levels,
} from "@/lib/ambient";

const TIMERS: { label: string; min: number | null }[] = [
  { label: "Sem timer", min: null },
  { label: "15 min", min: 15 },
  { label: "30 min", min: 30 },
  { label: "60 min", min: 60 },
  { label: "90 min", min: 90 },
];

const same = (a: Levels, b: Levels) => LAYERS.every(({ key }) => Math.abs(a[key] - b[key]) < 0.005);

export function AmbientSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Som e meditação">
      <Tabs />
    </Sheet>
  );
}

function Tabs() {
  const [tab, setTab] = useState<"som" | "meditar">("som");
  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-surface-2 p-1" role="tablist">
        {([["som", "Som ambiente"], ["meditar", "Meditar"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className="relative min-h-11 rounded-full text-sm"
            style={{ color: tab === id ? "var(--ink)" : "var(--muted)" }}
          >
            {tab === id && (
              <motion.span layoutId="amb-tab" className="absolute inset-0 rounded-full bg-surface" style={{ boxShadow: "var(--shadow)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
      {tab === "som" ? <Body /> : <MeditationPanel />}
    </div>
  );
}

function Body() {
  const { settings, updateSettings } = useHabits();
  const playing = useSyncExternalStore(subscribe, isPlaying, () => false);
  const sleep = useSyncExternalStore(subscribe, getSleep, () => null);
  const [mixer, setMixer] = useState(false);
  const [levels, setLocal] = useState<Levels>(normalizeLevels(settings.ambient));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // o motor segue o que está na tela; salvar nos ajustes é adiado para não gravar a cada pixel
  useEffect(() => {
    setLevels(levels);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!same(levels, normalizeLevels(settings.ambient))) updateSettings({ ambient: levels });
    }, 350);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levels]);

  const set = (key: Layer, v: number) => setLocal((l) => ({ ...l, [key]: v }));

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="flex flex-col items-center gap-3 pt-1">
        <div className="relative grid h-28 w-28 place-items-center">
          {playing &&
            [0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full"
                style={{ border: `1.5px solid ${accentColor("sage")}` }}
                initial={{ scale: 0.7, opacity: 0.5 }}
                animate={{ scale: 1.25, opacity: 0 }}
                transition={{ duration: 3.6, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
              />
            ))}
          <motion.button
            type="button"
            aria-label={playing ? "Pausar som ambiente" : "Tocar som ambiente"}
            aria-pressed={playing}
            whileTap={{ scale: 0.92 }}
            onClick={() => (playing ? stop() : start())}
            className="relative grid h-20 w-20 place-items-center rounded-full"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            <svg viewBox="0 0 24 24" width={30} height={30} fill="currentColor" aria-hidden>
              {playing ? (
                <path d="M8 6h3v12H8zM13 6h3v12h-3z" />
              ) : (
                <path d="M9 6.5v11a.6.6 0 0 0 .9.5l8.5-5.5a.6.6 0 0 0 0-1L9.9 6a.6.6 0 0 0-.9.5Z" />
              )}
            </svg>
          </motion.button>
        </div>
        <p className="text-sm text-muted">{playing ? "Tocando" : "Toque para começar"}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = same(levels, p.levels);
          return (
            <button
              key={p.name}
              type="button"
              aria-pressed={active}
              onClick={() => setLocal(p.levels)}
              className="rounded-full border px-3.5 py-2 text-sm transition-colors"
              style={{
                borderColor: active ? accentColor("sage") : "var(--line)",
                background: active ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
                color: active ? "var(--ink)" : "var(--muted)",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line px-4 py-1">
        <button
          type="button"
          aria-expanded={mixer}
          onClick={() => setMixer((m) => !m)}
          className="flex min-h-12 w-full items-center justify-between text-sm"
        >
          <span>Misturar do seu jeito</span>
          <motion.span animate={{ rotate: mixer ? 180 : 0 }} className="text-muted">⌄</motion.span>
        </button>
        <AnimatePresence initial={false}>
          {mixer && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
      <div className="flex flex-col gap-4 pt-3">
        {LAYERS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span className="tabular-nums text-muted">{Math.round(levels[key] * 100)}%</span>
            </div>
            <div className="relative mt-2 h-7">
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${levels[key] * 100}%`, background: accentColor("sage") }}
                />
              </div>
              <span
                className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line shadow-sm"
                style={{ left: `calc(10px + (100% - 20px) * ${levels[key]})`, background: "var(--surface)" }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(levels[key] * 100)}
                aria-label={`Volume: ${label}`}
                onChange={(e) => set(key, Number(e.target.value) / 100)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        ))}
      </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <h3 className="text-sm text-muted">Desligar sozinho</h3>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {TIMERS.map((t) => {
            const active = sleep === t.min && (playing || t.min === null);
            return (
              <button
                key={t.label}
                type="button"
                disabled={!playing}
                aria-pressed={active}
                onClick={() => setSleep(t.min)}
                className="rounded-full border px-3.5 py-2 text-sm transition-colors disabled:opacity-40"
                style={{
                  borderColor: active ? accentColor("sage") : "var(--line)",
                  background: active ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
                  color: active ? "var(--ink)" : "var(--muted)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[12px] leading-relaxed text-muted">
        O som é gerado no próprio aparelho e funciona offline. Ele retoma sozinho quando você volta ao app.
      </p>
    </div>
  );
}
