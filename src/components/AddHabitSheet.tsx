"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor, accentSoft } from "./habits/shared";
import { VISUALS, VISUAL_ORDER, previewHabit } from "./habits/visuals";
import { TEMPLATES, type HabitTemplate } from "@/lib/templates";
import type { AccentKey, HabitKind, VisualKey } from "@/lib/types";

const ACCENTS: AccentKey[] = ["sage", "water", "sand", "clay", "lilac", "sun"];
const KINDS: { kind: HabitKind; name: string; hint: string }[] = [
  { kind: "check", name: "Marcar", hint: "Feito / não feito" },
  { kind: "counter", name: "Contar", hint: "Copos, vezes…" },
  { kind: "progress", name: "Acumular", hint: "Páginas, minutos…" },
];
const IDENTITY_IDEAS = [
  "Sou alguém que se cuida.",
  "Sou alguém que aprende sempre.",
  "Sou alguém que cumpre o que combina.",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (h: HabitTemplate) => void;
}

export function AddHabitSheet({ open, onClose, onAdd }: Props) {
  const [custom, setCustom] = useState(false);
  const close = () => {
    onClose();
    setTimeout(() => setCustom(false), 300);
  };

  return (
    <Sheet open={open} onClose={close} title={custom ? "Novo hábito" : "Adicionar hábito"}>
      {!custom ? (
        <div className="flex flex-col gap-2.5">
          {TEMPLATES.map((t) => (
            <motion.button
              key={t.key}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onAdd(t.habit);
                close();
              }}
              className="flex items-center gap-3.5 rounded-2xl border border-line p-3.5 text-left"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-lg"
                style={{ background: accentSoft(t.habit.accent, 20), color: accentColor(t.habit.accent) }}
              >
                {t.habit.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{t.habit.name}</span>
                <span className="block truncate text-sm text-muted">{t.blurb}</span>
              </span>
            </motion.button>
          ))}
          <button
            type="button"
            onClick={() => setCustom(true)}
            className="mt-1 rounded-2xl border border-dashed border-line p-3.5 text-sm text-muted"
          >
            + Criar do zero
          </button>
        </div>
      ) : (
        <CustomForm
          onSubmit={(h) => {
            onAdd(h);
            close();
          }}
        />
      )}
    </Sheet>
  );
}

/** Miniatura viva de um visual (o mesmo componente do cartão, em escala reduzida). */
function VisualTile({
  visual,
  accent,
  selected,
  onPick,
}: {
  visual: VisualKey;
  accent: AccentKey;
  selected: boolean;
  onPick: () => void;
}) {
  const { name, Component } = VISUALS[visual];
  const habit = previewHabit(accent);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      aria-label={`Visual: ${name}`}
      className="flex flex-col items-center gap-1.5 rounded-2xl border px-1 pb-2 pt-3 transition-colors"
      style={{
        borderColor: selected ? "var(--sage)" : "var(--line)",
        background: selected ? accentSoft("sage", 12) : "transparent",
      }}
    >
      <span className="block overflow-hidden" style={{ width: 56, height: 62 }}>
        <span
          className="flex items-center justify-center"
          style={{ width: 112, height: 124, transform: "scale(0.5)", transformOrigin: "top left" }}
        >
          <Component habit={habit} value={6} frac={0.6} bursts={[]} onBurstDone={() => {}} />
        </span>
      </span>
      <span className="text-[12px]" style={{ color: selected ? "var(--ink)" : "var(--muted)" }}>
        {name}
      </span>
    </button>
  );
}

function CustomForm({ onSubmit }: { onSubmit: (h: HabitTemplate) => void }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<HabitKind>("check");
  const [accent, setAccent] = useState<AccentKey>("sage");
  const [visualPick, setVisualPick] = useState<VisualKey | null>(null);
  const [unit, setUnit] = useState("vezes");
  const [minimum, setMinimum] = useState(1);
  const [target, setTarget] = useState(5);
  const [twoLevels, setTwoLevels] = useState(true);
  const [minLabel, setMinLabel] = useState("");
  const [idealLabel, setIdealLabel] = useState("");
  const [essential, setEssential] = useState(false);
  const [identity, setIdentity] = useState("");

  const visual: VisualKey = visualPick ?? (kind === "counter" ? "glass" : "ring");
  const valid =
    name.trim().length > 0 && (kind === "check" || (target >= 1 && minimum >= 1 && minimum <= target));

  const submit = () => {
    if (!valid) return;
    const base = {
      name: name.trim(),
      kind,
      accent,
      essential,
      identity: identity.trim() || undefined,
    };
    if (kind === "check") {
      onSubmit({
        ...base,
        unit: "",
        minimum: 1,
        target: twoLevels ? 2 : 1,
        minLabel: twoLevels ? minLabel.trim() || "Versão mínima" : undefined,
        idealLabel: twoLevels ? idealLabel.trim() || "Versão ideal" : undefined,
      });
    } else {
      onSubmit({ ...base, visual, unit: unit.trim() || "un", minimum, target });
    }
  };

  const field = "w-full rounded-2xl border border-line bg-transparent px-4 py-3 outline-none focus:border-sage";

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Nome
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Caminhar"
          autoFocus
          maxLength={40}
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => setKind(k.kind)}
            className="rounded-2xl border p-3 text-left text-sm transition-colors"
            style={{
              borderColor: kind === k.kind ? "var(--sage)" : "var(--line)",
              background: kind === k.kind ? accentSoft("sage", 12) : "transparent",
            }}
          >
            <span className="block font-medium">{k.name}</span>
            <span className="block text-[11px] text-muted">{k.hint}</span>
          </button>
        ))}
      </div>

      {kind === "check" ? (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={twoLevels} onChange={(e) => setTwoLevels(e.target.checked)} className="h-4 w-4 accent-[var(--sage)]" />
            Dois níveis (mínimo e ideal)
          </label>
          {twoLevels && (
            <div className="grid grid-cols-2 gap-2">
              <input className={field} value={minLabel} onChange={(e) => setMinLabel(e.target.value)} placeholder="Mínimo: 1 min" maxLength={28} />
              <input className={field} value={idealLabel} onChange={(e) => setIdealLabel(e.target.value)} placeholder="Ideal: 30 min" maxLength={28} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Unidade
              <input className={field} value={unit} onChange={(e) => setUnit(e.target.value)} maxLength={12} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Mínimo
              <input className={field} type="number" inputMode="numeric" min={1} value={minimum} onChange={(e) => setMinimum(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Meta
              <input className={field} type="number" inputMode="numeric" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Como ele aparece</span>
            <div className="grid grid-cols-4 gap-2">
              {VISUAL_ORDER.map((v) => (
                <VisualTile
                  key={v}
                  visual={v}
                  accent={accent}
                  selected={visual === v}
                  onPick={() => setVisualPick(v)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3">
        {ACCENTS.map((a) => (
          <button
            key={a}
            type="button"
            aria-label={`Cor ${a}`}
            onClick={() => setAccent(a)}
            className="h-8 w-8 rounded-full transition-transform"
            style={{
              background: accentColor(a),
              transform: accent === a ? "scale(1.18)" : "scale(1)",
              boxShadow: accent === a ? `0 0 0 3px var(--surface), 0 0 0 5px ${accentColor(a)}` : "none",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Quem você está se tornando? (opcional)
          <input
            className={field}
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="Sou alguém que…"
            maxLength={70}
          />
        </label>
        <p className="text-[12px] leading-snug text-muted">
          Aparece embaixo do nome do hábito, como lembrete de quem você quer ser. Quem se vê assim
          mantém o hábito com mais facilidade.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {IDENTITY_IDEAS.map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => setIdentity(idea)}
              className="rounded-full border border-line px-3 py-1.5 text-[12px] text-muted"
            >
              {idea}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} className="h-4 w-4 accent-[var(--sage)]" />
        Essencial (aparece nos dias difíceis)
      </label>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={!valid}
        onClick={submit}
        className="rounded-full py-3.5 font-medium transition-opacity disabled:opacity-40"
        style={{ background: "var(--ink)", color: "var(--bg)" }}
      >
        Criar hábito
      </motion.button>
    </div>
  );
}
