"use client";

import { useState } from "react";
import { suggestVisual } from "@/lib/suggest";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor, accentSoft } from "./habits/shared";
import { VISUALS, VISUAL_ORDER, previewHabit } from "./habits/visuals";
import { CHECK_VISUALS, CHECK_VISUAL_ORDER } from "./habits/checkVisuals";
import { TEMPLATES, TEMPLATE_GROUPS, type HabitTemplate } from "@/lib/templates";
import { UNITS } from "@/lib/units";
import type { AccentKey, CheckVisualKey, Habit, HabitKind, NumericVisualKey, Period, VisualKey } from "@/lib/types";

const ACCENTS: AccentKey[] = ["sage", "water", "sand", "clay", "lilac", "sun"];
const KINDS: { kind: HabitKind; name: string; hint: string }[] = [
  { kind: "check", name: "Marcar", hint: "Feito / não feito" },
  { kind: "counter", name: "Contar", hint: "Copos, vezes…" },
  { kind: "progress", name: "Acumular", hint: "Páginas, minutos…" },
];
const PERIODS: { id: Period; name: string }[] = [
  { id: "day", name: "Todo dia" },
  { id: "week", name: "Por semana" },
  { id: "month", name: "Por mês" },
];
const ANCHOR_IDEAS = ["Depois do café da manhã", "Depois de escovar os dentes", "Quando chegar em casa", "Antes de dormir"];
const IDENTITY_IDEAS = [
  "Sou alguém que se cuida.",
  "Sou alguém que aprende sempre.",
  "Sou alguém que cumpre o que combina.",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (h: HabitTemplate) => void;
  /** quando definido, o formulário edita este hábito em vez de criar um novo */
  editing?: Habit | null;
  onSave?: (id: string, patch: Partial<Habit>) => void;
}

export function AddHabitSheet({ open, onClose, onAdd, editing, onSave }: Props) {
  // null = lista de modelos; objeto = formulário (preenchido pelo modelo ou em branco)
  const [draft, setDraft] = useState<HabitTemplate | "blank" | null>(null);
  const close = () => {
    onClose();
    setTimeout(() => setDraft(null), 300);
  };
  const form = editing ?? draft;

  return (
    <Sheet open={open} onClose={close} title={editing ? "Editar hábito" : form ? "Ajustar hábito" : "Adicionar hábito"}>
      {!form ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] leading-snug text-muted">
            Escolha um modelo para começar. Na próxima tela você ajusta nome, metas e frequência do seu jeito.
          </p>
          {TEMPLATE_GROUPS.map((g) => (
            <div key={g} className="flex flex-col gap-2.5">
              <h3 className="pt-2 text-sm text-muted">{g}</h3>
              {TEMPLATES.filter((t) => t.group === g).map((t) => (
                <motion.button
                  key={t.key}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDraft(t.habit)}
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
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft("blank")}
            className="mt-1 rounded-2xl border border-dashed border-line p-3.5 text-sm text-muted"
          >
            + Criar do zero
          </button>
        </div>
      ) : (
        <HabitForm
          key={editing?.id ?? (typeof form === "string" ? "blank" : form.name)}
          initial={form === "blank" ? null : form}
          editing={!!editing}
          onSubmit={(h) => {
            if (editing && onSave) onSave(editing.id, h);
            else onAdd(h);
            close();
          }}
        />
      )}
    </Sheet>
  );
}

function NumericPreview({ visual, habit }: { visual: NumericVisualKey; habit: ReturnType<typeof previewHabit> }) {
  const { Component } = VISUALS[visual];
  return <Component habit={habit} value={6} frac={0.6} bursts={[]} onBurstDone={() => {}} />;
}

function CheckPreview({ visual, habit }: { visual: CheckVisualKey; habit: ReturnType<typeof previewHabit> }) {
  const { Component } = CHECK_VISUALS[visual];
  return <Component habit={habit} value={2} stages={2} pulse={0} dir={1} />;
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
  const isCheck = visual in CHECK_VISUALS;
  const name = isCheck ? CHECK_VISUALS[visual as CheckVisualKey].name : VISUALS[visual as NumericVisualKey].name;
  const habit = previewHabit(accent, isCheck ? "check" : "progress");
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
          {isCheck ? (
            <CheckPreview visual={visual as CheckVisualKey} habit={habit} />
          ) : (
            <NumericPreview visual={visual as NumericVisualKey} habit={habit} />
          )}
        </span>
      </span>
      <span className="text-[12px]" style={{ color: selected ? "var(--ink)" : "var(--muted)" }}>
        {name}
      </span>
    </button>
  );
}

function HabitForm({
  initial,
  editing,
  onSubmit,
}: {
  initial: HabitTemplate | null;
  editing: boolean;
  onSubmit: (h: HabitTemplate) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kind, setKind] = useState<HabitKind>(initial?.kind ?? "check");
  const [accent, setAccent] = useState<AccentKey>(initial?.accent ?? "sage");
  const [visualPick, setVisualPick] = useState<VisualKey | null>(initial?.visual ?? null);
  const [unit, setUnit] = useState(initial?.unit || "vezes");
  const [minimum, setMinimum] = useState(initial?.minimum ?? 1);
  const [target, setTarget] = useState(initial?.target ?? 5);
  const [twoLevels, setTwoLevels] = useState(initial ? initial.kind !== "check" || initial.minimum < initial.target : true);
  const [minLabel, setMinLabel] = useState(initial?.minLabel ?? "");
  const [idealLabel, setIdealLabel] = useState(initial?.idealLabel ?? "");
  const [essential, setEssential] = useState(initial?.essential ?? false);
  const [identity, setIdentity] = useState(initial?.identity ?? "");
  const [anchor, setAnchor] = useState(initial?.anchor ?? "");
  const [period, setPeriod] = useState<Period>(initial?.period ?? "day");
  const [periodGoal, setPeriodGoal] = useState(initial?.periodGoal ?? 3);

  const goalMax = period === "week" ? 7 : 31;
  // Se a pessoa não escolheu um visual, sugerimos pelo nome (academia → barra, corrida → pista...).
  const suggested = visualPick ? null : suggestVisual(name, kind);
  const effective = visualPick ?? suggested;
  const checkPick = effective && effective in CHECK_VISUALS ? effective : null;
  const numericPick = effective && effective in VISUALS ? effective : null;
  const visual: VisualKey =
    kind === "check" ? (checkPick ?? "stamp") : (numericPick ?? (kind === "counter" ? "glass" : "ring"));
  const valid =
    name.trim().length > 0 &&
    (kind === "check" || (target >= 1 && minimum >= 1 && minimum <= target)) &&
    (period === "day" || (periodGoal >= 1 && periodGoal <= goalMax));

  const submit = () => {
    if (!valid) return;
    const base = {
      name: name.trim(),
      kind,
      accent,
      essential,
      identity: identity.trim() || undefined,
      anchor: anchor.trim() || undefined,
      period,
      periodGoal: period === "day" ? undefined : periodGoal,
    };
    if (kind === "check") {
      onSubmit({
        ...base,
        unit: "",
        minimum: 1,
        target: twoLevels ? 2 : 1,
        visual,
        minLabel: twoLevels ? minLabel.trim() || "Versão mínima" : undefined,
        idealLabel: twoLevels ? idealLabel.trim() || "Versão ideal" : undefined,
      });
    } else {
      onSubmit({ ...base, visual, unit, minimum, target });
    }
  };

  const field = "w-full rounded-2xl border border-line bg-transparent px-4 py-3 outline-none focus:border-sage";
  const unitOptions = UNITS.some((u) => u.id === unit) ? UNITS : [{ id: unit, label: unit }, ...UNITS];

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5 text-sm text-muted">
        Nome
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Caminhar"
          maxLength={40}
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            disabled={editing}
            onClick={() => setKind(k.kind)}
            className="rounded-2xl border p-3 text-left text-sm transition-colors disabled:opacity-50"
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
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Como ele aparece{suggested ? " · sugerido pelo nome" : ""}</span>
            <div className="grid grid-cols-3 gap-2">
              {CHECK_VISUAL_ORDER.map((v) => (
                <VisualTile key={v} visual={v} accent={accent} selected={visual === v} onPick={() => setVisualPick(v)} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Unidade
              <select className={field} value={unit} onChange={(e) => setUnit(e.target.value)}>
                {unitOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
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
          <p className="-mt-3 text-[12px] leading-snug text-muted">
            O mínimo é a versão pequena que já conta como dia cumprido. A meta é o ideal.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">Como ele aparece{suggested ? " · sugerido pelo nome" : ""}</span>
            <div className="grid grid-cols-4 gap-2">
              {VISUAL_ORDER.map((v) => (
                <VisualTile key={v} visual={v} accent={accent} selected={visual === v} onPick={() => setVisualPick(v)} />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Frequência</span>
        <div className="grid grid-cols-3 gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPeriod(p.id);
                if (p.id === "week") setPeriodGoal((g) => Math.min(g, 7));
                if (p.id === "month") setPeriodGoal((g) => (g <= 7 ? 8 : g));
              }}
              aria-pressed={period === p.id}
              className="rounded-2xl border px-2 py-2.5 text-sm transition-colors"
              style={{
                borderColor: period === p.id ? "var(--sage)" : "var(--line)",
                background: period === p.id ? accentSoft("sage", 12) : "transparent",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        {period !== "day" && (
          <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-2.5">
            <span className="text-sm">
              Meta: <b className="font-medium">{periodGoal}</b> {periodGoal === 1 ? "dia" : "dias"} {period === "week" ? "na semana" : "no mês"}
            </span>
            <span className="flex gap-2">
              <button type="button" aria-label="Menos dias" onClick={() => setPeriodGoal((g) => Math.max(1, g - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-line">−</button>
              <button type="button" aria-label="Mais dias" onClick={() => setPeriodGoal((g) => Math.min(goalMax, g + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-line">+</button>
            </span>
          </div>
        )}
        <p className="text-[12px] leading-snug text-muted">
          {period === "day"
            ? "Todos os dias contam."
            : "Os dias em que você não faz não contam como falta: só importa fechar a meta do período."}
        </p>
      </div>

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

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Quando e onde? (plano &ldquo;se-então&rdquo;)
          <input className={field} value={anchor} onChange={(e) => setAnchor(e.target.value)} placeholder="Depois de tomar café, eu…" maxLength={60} />
        </label>
        <p className="text-[12px] leading-snug text-muted">
          Ligar o hábito a algo que você já faz todo dia (ou a um lugar e hora) aumenta muito a chance de cumprir.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ANCHOR_IDEAS.map((a) => (
            <button key={a} type="button" onClick={() => setAnchor(a)} className="rounded-full border border-line px-3 py-1.5 text-[12px] text-muted">
              {a}
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
        {editing ? "Salvar alterações" : "Criar hábito"}
      </motion.button>
    </div>
  );
}
