"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "./Collapse";
import { NumField } from "./NumField";
import { suggestVisual } from "@/lib/suggest";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor, accentSoft, customAccent, rgbOfAccent } from "./habits/shared";
import { VISUALS, VISUAL_ORDER, previewHabit } from "./habits/visuals";
import { CHECK_VISUALS, CHECK_VISUAL_ORDER } from "./habits/checkVisuals";
import { TEMPLATES, TEMPLATE_GROUPS, type HabitTemplate } from "@/lib/templates";
import { UNITS } from "@/lib/units";
import type { AccentKey, CheckVisualKey, Habit, HabitKind, NumericVisualKey, PresetAccent, VisualKey } from "@/lib/types";

const ACCENTS: PresetAccent[] = ["sage", "water", "sand", "clay", "lilac", "sun", "rose", "teal", "indigo", "olive", "coral", "slate"];
const EMOJIS = ["💧", "📖", "🧘", "🏃", "💪", "🚶", "🌙", "🌅", "🍎", "🥗", "☕", "🎓", "✍️", "🎨", "🎸", "🧠", "🙏", "🪷", "💊", "🛏️", "🧹", "🪥", "💰", "📵", "🚭", "🌱", "🐕", "❤️", "☀️", "🎯"];
const WEEKDAYS = [
  { n: 0, short: "D", full: "domingo" },
  { n: 1, short: "S", full: "segunda" },
  { n: 2, short: "T", full: "terça" },
  { n: 3, short: "Q", full: "quarta" },
  { n: 4, short: "Q", full: "quinta" },
  { n: 5, short: "S", full: "sexta" },
  { n: 6, short: "S", full: "sábado" },
];
type FreqMode = "day" | "days" | "week" | "month";
const KINDS: { kind: HabitKind; name: string; hint: string }[] = [
  { kind: "check", name: "Marcar", hint: "Feito / não feito" },
  { kind: "counter", name: "Contar", hint: "Copos, vezes…" },
  { kind: "progress", name: "Acumular", hint: "Páginas, minutos…" },
];
const PERIODS: { id: FreqMode; name: string }[] = [
  { id: "day", name: "Todo dia" },
  { id: "days", name: "Dias fixos" },
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
  /** chave de um modelo para abrir direto no formulário ajustável (vem dos guias) */
  startWith?: string | null;
}

export function AddHabitSheet({ open, onClose, onAdd, editing, onSave, startWith }: Props) {
  // null = lista de modelos; objeto = formulário (preenchido pelo modelo ou em branco)
  const [draft, setDraft] = useState<HabitTemplate | "blank" | null>(null);
  const close = () => {
    onClose();
    setTimeout(() => setDraft(null), 300);
  };
  const startTpl = startWith ? (TEMPLATES.find((t) => t.key === startWith)?.habit ?? null) : null;
  const form = editing ?? draft ?? startTpl;

  return (
    <Sheet open={open} onClose={close} title={editing ? "Editar hábito" : form ? "Ajustar hábito" : "Adicionar hábito"}>
      {!form ? (
        <Chooser onPick={(t) => setDraft(t)} onBlank={() => setDraft("blank")} />
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


function Chooser({ onPick, onBlank }: { onPick: (t: HabitTemplate) => void; onBlank: () => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3 pb-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onBlank}
        className="flex min-h-14 items-center gap-3 rounded-2xl px-4 text-left"
        style={{ background: "var(--ink)", color: "var(--bg)" }}
      >
        <span className="text-xl" aria-hidden>✨</span>
        <span className="flex-1">
          <span className="block font-medium">Criar o meu</span>
          <span className="block text-[12px] opacity-70">Do seu jeito, do tamanho que couber</span>
        </span>
      </motion.button>
      <p className="px-1 pt-1 text-[13px] text-muted">Ou parta de uma ideia pronta:</p>
      {TEMPLATE_GROUPS.map((g) => {
        const list = TEMPLATES.filter((t) => t.group === g);
        return (
          <Collapse
            key={g}
            title={g}
            summary={list.map((t) => t.habit.emoji).join(" ")}
            open={openGroup === g}
            onToggle={(o) => setOpenGroup(o ? g : null)}
          >
            <div className="flex flex-col gap-2">
              {list.map((t) => (
                <motion.button
                  key={t.key}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPick(t.habit)}
                  className="flex min-h-14 items-center gap-3.5 rounded-2xl bg-surface-2 px-3.5 py-2.5 text-left"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl"
                    style={{ background: accentSoft(t.habit.accent, 22) }}
                    aria-hidden
                  >
                    {t.habit.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{t.habit.name}</span>
                    <span className="block truncate text-[13px] text-muted">{t.blurb}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </Collapse>
        );
      })}
    </div>
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
  const [emoji, setEmoji] = useState(initial?.emoji ?? "");
  const [emojiOpen, setEmojiOpen] = useState(false);
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
  const [mode, setMode] = useState<FreqMode>(
    initial?.days?.length ? "days" : initial?.period === "week" ? "week" : initial?.period === "month" ? "month" : "day"
  );
  const [periodGoal, setPeriodGoal] = useState(initial?.periodGoal ?? 3);
  const [days, setDays] = useState<number[]>(initial?.days ?? [1, 3, 5]);
  const [remind, setRemind] = useState(!!initial?.reminder);
  const [time, setTime] = useState(initial?.reminder?.time ?? "08:00");
  const [colorOpen, setColorOpen] = useState(false);
  const [visualOpen, setVisualOpen] = useState(false);

  const goalMax = mode === "week" ? 7 : 31;
  const suggested = visualPick ? null : suggestVisual(name, kind);
  const effective = visualPick ?? suggested;
  const checkPick = effective && effective in CHECK_VISUALS ? effective : null;
  const numericPick = effective && effective in VISUALS ? effective : null;
  const visual: VisualKey =
    kind === "check" ? (checkPick ?? "stamp") : (numericPick ?? (kind === "counter" ? "glass" : "ring"));
  const valid =
    name.trim().length > 0 &&
    (kind === "check" || (target > 0 && minimum > 0 && minimum <= target)) &&
    (mode === "day" ||
      (mode === "days" ? days.length >= 1 : periodGoal >= 1 && periodGoal <= goalMax));

  const submit = () => {
    if (!valid) return;
    const fixed = mode === "days";
    const period = mode === "day" ? "day" : mode === "month" ? "month" : "week";
    const base = {
      name: name.trim(),
      emoji: emoji || undefined,
      kind,
      accent,
      essential,
      identity: identity.trim() || undefined,
      anchor: anchor.trim() || undefined,
      period,
      periodGoal: mode === "day" ? undefined : fixed ? days.length : periodGoal,
      days: fixed ? [...days].sort() : undefined,
      reminder: remind ? { time, days: fixed ? [...days].sort() : undefined } : undefined,
    } as const;
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
  const rgb = rgbOfAccent(accent) ?? [124, 156, 136];
  const visualName = isCheckKey(visual) ? CHECK_VISUALS[visual].name : VISUALS[visual as NumericVisualKey].name;

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="Escolher emoji"
          aria-expanded={emojiOpen}
          onClick={() => setEmojiOpen((o) => !o)}
          className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl border border-line text-2xl"
          style={{ background: emoji ? accentSoft(accent, 18) : "transparent" }}
        >
          {emoji || "🙂"}
        </button>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm text-muted">
          Nome
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Caminhar" maxLength={40} />
        </label>
      </div>
      <AnimatePresence initial={false}>
        {emojiOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="-mt-2 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-surface-2 p-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`Emoji ${e}`}
                  onClick={() => {
                    setEmoji(e === emoji ? "" : e);
                    setEmojiOpen(false);
                  }}
                  className="grid h-11 w-11 place-items-center rounded-xl text-xl"
                  style={{ background: e === emoji ? accentSoft(accent, 30) : "transparent" }}
                >
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={twoLevels} onChange={(e) => setTwoLevels(e.target.checked)} className="h-5 w-5 accent-[var(--sage)]" />
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
              <NumField className={field} label="Mínimo" value={minimum} onChange={setMinimum} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Meta
              <NumField className={field} label="Meta" value={target} onChange={setTarget} />
            </label>
          </div>
          <p className="-mt-2 text-[12px] leading-snug text-muted">
            O mínimo já conta como dia cumprido. A meta é o ideal. Pode usar vírgula (2,5).
          </p>
        </>
      )}

      <Collapse
        title="Como ele aparece"
        summary={`${visualName}${suggested ? " · sugerido pelo nome" : ""}`}
        open={visualOpen}
        onToggle={setVisualOpen}
      >
        <div className={kind === "check" ? "grid grid-cols-3 gap-2" : "grid grid-cols-4 gap-2"}>
          {(kind === "check" ? CHECK_VISUAL_ORDER : VISUAL_ORDER).map((v) => (
            <VisualTile key={v} visual={v} accent={accent} selected={visual === v} onPick={() => setVisualPick(v)} />
          ))}
        </div>
      </Collapse>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Frequência</span>
        <div className="grid grid-cols-4 gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setMode(p.id);
                if (p.id === "week") setPeriodGoal((g) => Math.min(g, 7));
                if (p.id === "month") setPeriodGoal((g) => (g <= 7 ? 8 : g));
              }}
              aria-pressed={mode === p.id}
              className="min-h-11 rounded-2xl border px-1 text-[13px] transition-colors"
              style={{
                borderColor: mode === p.id ? "var(--sage)" : "var(--line)",
                background: mode === p.id ? accentSoft("sage", 12) : "transparent",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        {mode === "days" && (
          <div className="flex justify-between gap-1" role="group" aria-label="Dias da semana">
            {WEEKDAYS.map((d) => {
              const on = days.includes(d.n);
              return (
                <motion.button
                  key={d.n}
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  aria-label={d.full}
                  aria-pressed={on}
                  onClick={() => setDays((cur) => (on ? cur.filter((x) => x !== d.n) : [...cur, d.n]))}
                  className="grid h-11 flex-1 place-items-center rounded-full border text-sm font-medium"
                  style={{
                    borderColor: on ? accentColor(accent) : "var(--line)",
                    background: on ? accentSoft(accent, 26) : "transparent",
                    color: on ? "var(--ink)" : "var(--muted)",
                  }}
                >
                  {d.short}
                </motion.button>
              );
            })}
          </div>
        )}
        {(mode === "week" || mode === "month") && (
          <div className="flex items-center justify-between rounded-2xl border border-line px-4 py-2">
            <span className="text-sm">
              Meta: <b className="font-medium">{periodGoal}</b> {periodGoal === 1 ? "dia" : "dias"} {mode === "week" ? "na semana" : "no mês"}
            </span>
            <span className="flex gap-2">
              <button type="button" aria-label="Menos dias" onClick={() => setPeriodGoal((g) => Math.max(1, g - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-line">−</button>
              <button type="button" aria-label="Mais dias" onClick={() => setPeriodGoal((g) => Math.min(goalMax, g + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-line">+</button>
            </span>
          </div>
        )}
        <p className="text-[12px] leading-snug text-muted">
          {mode === "day"
            ? "Todos os dias contam."
            : mode === "days"
              ? "Fora desses dias nada é cobrado: descanso também faz parte."
              : "Os dias em que você não faz não contam como falta: só importa fechar a meta do período."}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-sm text-muted">Cor</span>
        <div className="flex flex-wrap gap-2.5">
          {ACCENTS.map((a) => (
            <button
              key={a}
              type="button"
              aria-label={`Cor ${a}`}
              onClick={() => setAccent(a)}
              className="h-9 w-9 rounded-full transition-transform"
              style={{
                background: accentColor(a),
                transform: accent === a ? "scale(1.15)" : "scale(1)",
                boxShadow: accent === a ? `0 0 0 3px var(--surface), 0 0 0 5px ${accentColor(a)}` : "none",
              }}
            />
          ))}
          <button
            type="button"
            aria-label="Cor própria (RGB)"
            aria-expanded={colorOpen}
            onClick={() => {
              setColorOpen((o) => !o);
              if (!accent.startsWith("custom-")) setAccent(customAccent(...rgb));
            }}
            className="grid h-9 w-9 place-items-center rounded-full text-[11px] font-medium text-white"
            style={{
              background: accent.startsWith("custom-")
                ? accentColor(accent)
                : "conic-gradient(#e0707a, #e4c673, #7cc4ba, #7882c4, #c98a9b, #e0707a)",
              boxShadow: accent.startsWith("custom-") ? `0 0 0 3px var(--surface), 0 0 0 5px ${accentColor(accent)}` : "none",
              textShadow: "0 1px 2px rgba(0,0,0,.4)",
            }}
          >
            RGB
          </button>
        </div>
        <AnimatePresence initial={false}>
          {colorOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 rounded-2xl bg-surface-2 px-4 py-3">
                {(["R", "G", "B"] as const).map((ch, i) => (
                  <label key={ch} className="flex items-center gap-3 text-[13px] text-muted">
                    <span className="w-3">{ch}</span>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={rgb[i]}
                      aria-label={`Cor ${ch}`}
                      onChange={(e) => {
                        const next = [...rgb] as [number, number, number];
                        next[i] = Number(e.target.value);
                        setAccent(customAccent(...next));
                      }}
                      className="h-9 flex-1 accent-[var(--sage)]"
                    />
                    <span className="w-8 text-right tabular-nums">{rgb[i]}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Collapse
        title="Mais opções"
        summary="Quem quer ser, quando e onde, lembrete, essencial"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Quem você está se tornando?
              <input className={field} value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="Sou alguém que…" maxLength={70} />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {IDENTITY_IDEAS.map((idea) => (
                <button key={idea} type="button" onClick={() => setIdentity(idea)} className="min-h-9 rounded-full border border-line px-3 text-[12px] text-muted">
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
            <div className="flex flex-wrap gap-1.5">
              {ANCHOR_IDEAS.map((a) => (
                <button key={a} type="button" onClick={() => setAnchor(a)} className="min-h-9 rounded-full border border-line px-3 text-[12px] text-muted">
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="h-5 w-5 accent-[var(--sage)]" />
              Lembrar de mim
            </label>
            {remind && (
              <input
                type="time"
                aria-label="Horário do lembrete"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={field}
              />
            )}
          </div>

          <label className="flex min-h-11 items-center gap-3 text-sm">
            <input type="checkbox" checked={essential} onChange={(e) => setEssential(e.target.checked)} className="h-5 w-5 accent-[var(--sage)]" />
            Essencial (aparece nos dias difíceis)
          </label>
        </div>
      </Collapse>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={!valid}
        onClick={submit}
        className="min-h-12 rounded-full py-3.5 font-medium transition-opacity disabled:opacity-40"
        style={{ background: "var(--ink)", color: "var(--bg)" }}
      >
        {editing ? "Salvar alterações" : "Criar hábito"}
      </motion.button>
    </div>
  );
}

const isCheckKey = (v: VisualKey): v is CheckVisualKey => v in CHECK_VISUALS;
