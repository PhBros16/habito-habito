"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { DURATIONS, REASONS, activePause, endFor, lengthOf, rangeText } from "@/lib/pauses";

const chip = (active: boolean) => ({
  borderColor: active ? accentColor("sage") : "var(--line)",
  background: active ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
  color: active ? "var(--ink)" : "var(--muted)",
});

export function PauseSheet({ open, onClose, today }: { open: boolean; onClose: () => void; today: string }) {
  return (
    <Sheet open={open} onClose={onClose} title="Pausas">
      <Body today={today} />
    </Sheet>
  );
}

function Body({ today }: { today: string }) {
  const { settings, addPause, endPause, removePause } = useHabits();
  const [days, setDays] = useState<number | null>(7);
  const [reason, setReason] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState("");

  const current = activePause(settings.pauses, today);
  const ordered = [...settings.pauses].sort((a, b) => (a.start < b.start ? 1 : -1));
  const invalid = custom && end !== "" && end < start;

  const create = () => {
    if (invalid) return;
    const s = custom ? start : today;
    addPause({
      start: s,
      end: custom ? (end === "" ? null : end) : endFor(s, days),
      ...(reason ? { reason } : {}),
    });
    setReason(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-2">
      <p className="text-[14px] leading-relaxed text-muted">
        Viagem, doença, uma semana corrida. Dias em pausa não quebram a sua sequência, não entram nas
        médias e as plantas dormem sem murchar.
      </p>

      <AnimatePresence initial={false}>
        {current && (
          <motion.div
            key="current"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-3xl border p-4" style={{ borderColor: accentColor("sage") }}>
              <p className="font-display text-xl">Em pausa</p>
              <p className="mt-1 text-sm text-muted">
                {rangeText(current)}
                {current.reason && ` · ${current.reason}`}
              </p>
              <button
                type="button"
                onClick={() => endPause(current.id, today)}
                className="mt-3 rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "var(--ink)", color: "var(--bg)" }}
              >
                Voltar agora
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm text-muted">Nova pausa</h3>
        {!custom ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Duração">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                type="button"
                aria-pressed={days === d.days}
                onClick={() => setDays(d.days)}
                className="rounded-full border px-3.5 py-2 text-sm transition-colors"
                style={chip(days === d.days)}
              >
                {d.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1 text-[13px] text-muted">
              Começa em
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-2xl border border-line bg-transparent px-3 py-2.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-[13px] text-muted">
              Termina em (opcional)
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-2xl border border-line bg-transparent px-3 py-2.5 text-sm text-ink"
              />
            </label>
          </div>
        )}
        <button type="button" onClick={() => setCustom((c) => !c)} className="self-start text-[13px] text-muted underline underline-offset-4">
          {custom ? "Usar duração pronta" : "Escolher datas (futuras ou passadas)"}
        </button>
        {invalid && <p className="text-[13px] text-muted">O fim precisa ser depois do começo.</p>}

        <div className="flex flex-wrap gap-2" role="group" aria-label="Motivo">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={reason === r}
              onClick={() => setReason(reason === r ? null : r)}
              className="rounded-full border px-3 py-1.5 text-[13px] transition-colors"
              style={chip(reason === r)}
            >
              {r}
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={invalid}
          onClick={create}
          className="rounded-full py-3 text-sm font-medium disabled:opacity-40"
          style={{ background: "var(--ink)", color: "var(--bg)" }}
        >
          Pausar
        </motion.button>
      </section>

      {ordered.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Suas pausas</h3>
          {ordered.map((p) => {
            const len = lengthOf(p);
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
                <div className="min-w-0 text-sm">
                  <p>{rangeText(p)}</p>
                  <p className="text-[13px] text-muted">
                    {[p.reason, len !== null ? `${len} ${len === 1 ? "dia" : "dias"}` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover pausa ${rangeText(p)}`}
                  onClick={() => removePause(p.id)}
                  className="shrink-0 text-[13px] text-muted"
                >
                  remover
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
