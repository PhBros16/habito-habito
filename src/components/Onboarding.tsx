"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHabits } from "@/lib/store";
import { speakEnso } from "@/lib/speak";
import { FIRST_STEPS, FUTURE_CHIPS, GOAL_CHIPS, SLOT_ANCHOR, identityFrom } from "@/lib/profile";
import type { Profile } from "@/lib/types";
import { EnsoMark } from "./EnsoMark";

const SLOTS: { id: Profile["slot"]; label: string; emoji: string }[] = [
  { id: "manha", label: "De manhã", emoji: "🌅" },
  { id: "tarde", label: "À tarde", emoji: "☀️" },
  { id: "noite", label: "À noite", emoji: "🌙" },
  { id: "varia", label: "Depende do dia", emoji: "🌀" },
];

const ease = [0.22, 1, 0.36, 1] as const;

/** Apresentação inicial: leve, com humor, termina criando o primeiro mini-hábito. */
export function Onboarding() {
  const { addHabit, updateSettings } = useHabits();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [future, setFuture] = useState("");
  const [slot, setSlot] = useState<Profile["slot"]>("varia");
  const [habitName, setHabitName] = useState("");
  const [habitEmoji, setHabitEmoji] = useState("🌱");

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const finish = (withHabit: boolean) => {
    const profile: Profile = { goal: goal.trim(), future: future.trim(), slot };
    if (withHabit && habitName.trim()) {
      addHabit({
        name: habitName.trim(),
        emoji: habitEmoji,
        kind: "check",
        accent: "sage",
        unit: "",
        minimum: 1,
        target: 1,
        identity: identityFrom(future) || undefined,
        anchor: SLOT_ANCHOR[slot] || undefined,
        essential: true,
      });
    }
    updateSettings({ onboarded: true, profile: goal.trim() || future.trim() ? profile : undefined });
  };

  const steps = [
    // 0 · boas-vindas
    <div key="0" className="flex flex-1 flex-col items-center justify-center text-center">
      <EnsoMark size={168} />
      <h1 className="font-display mt-8 text-4xl">Oi. Eu sou o Enso.</h1>
      <p className="mt-4 max-w-[17rem] text-[17px] leading-snug text-muted">
        Um círculo feito num gesto só e deixado aberto de propósito. Combina comigo: não cobro perfeição.
      </p>
      <button
        type="button"
        onClick={() => speakEnso("pt")}
        className="mt-5 flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-muted"
      >
        <span aria-hidden>🔊</span> Ên-sô (ouvir)
      </button>
    </div>,
    // 1 · verdades rápidas
    <div key="1" className="flex flex-1 flex-col justify-center gap-4">
      <h2 className="font-display text-3xl">Três verdades, sem sermão</h2>
      {[
        { e: "🐜", t: "Pequeno vence heroico", s: "Uma página por dia vira um livro." },
        { e: "🌧️", t: "Dia ruim faz parte", s: "Falhou? Amanhã tem outro. Eu não ligo." },
        { e: "🌱", t: "Constância, não perfeição", s: "O círculo aberto é o recado." },
      ].map((it, i) => (
        <motion.div
          key={it.t}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.18, duration: 0.5, ease }}
          className="card flex items-center gap-4 p-4"
          style={{ borderRadius: 22, boxShadow: "none" }}
        >
          <span className="text-3xl" aria-hidden>{it.e}</span>
          <span>
            <span className="block font-medium">{it.t}</span>
            <span className="block text-sm text-muted">{it.s}</span>
          </span>
        </motion.div>
      ))}
    </div>,
    // 2 · objetivo
    <div key="2" className="flex flex-1 flex-col justify-center gap-5">
      <div>
        <p className="text-sm text-muted">Pergunta 1 de 3</p>
        <h2 className="font-display mt-1 text-3xl">Qual é o seu maior objetivo hoje?</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {GOAL_CHIPS.map((g) => {
          const on = goalId === g.id;
          return (
            <motion.button
              key={g.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setGoalId(g.id);
                setGoal(g.label);
              }}
              aria-pressed={on}
              className="flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left"
              style={{
                borderColor: on ? "var(--sage)" : "var(--line)",
                background: on ? "color-mix(in srgb, var(--sage) 14%, transparent)" : "transparent",
              }}
            >
              <span className="text-xl" aria-hidden>{g.emoji}</span>
              {g.label}
            </motion.button>
          );
        })}
        <input
          value={goalId ? "" : goal}
          onChange={(e) => {
            setGoalId(null);
            setGoal(e.target.value);
          }}
          placeholder="Ou conte com as suas palavras"
          maxLength={60}
          className="min-h-14 rounded-2xl border border-line bg-transparent px-4 outline-none focus:border-sage"
        />
      </div>
    </div>,
    // 3 · futuro
    <div key="3" className="flex flex-1 flex-col justify-center gap-5">
      <div>
        <p className="text-sm text-muted">Pergunta 2 de 3</p>
        <h2 className="font-display mt-1 text-3xl">Quem você quer ser daqui a um ano?</h2>
      </div>
      <input
        value={future}
        onChange={(e) => setFuture(e.target.value)}
        placeholder="Alguém que…"
        maxLength={70}
        className="min-h-14 rounded-2xl border border-line bg-transparent px-4 outline-none focus:border-sage"
      />
      <div className="flex flex-wrap gap-2">
        {FUTURE_CHIPS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFuture(f)}
            className="min-h-11 rounded-full border border-line px-4 text-[13px] text-muted"
          >
            {f}
          </button>
        ))}
      </div>
    </div>,
    // 4 · ritmo
    <div key="4" className="flex flex-1 flex-col justify-center gap-5">
      <div>
        <p className="text-sm text-muted">Pergunta 3 de 3</p>
        <h2 className="font-display mt-1 text-3xl">Quando o seu dia respira?</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {SLOTS.map((s) => {
          const on = slot === s.id;
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSlot(s.id)}
              aria-pressed={on}
              className="flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border"
              style={{
                borderColor: on ? "var(--sage)" : "var(--line)",
                background: on ? "color-mix(in srgb, var(--sage) 14%, transparent)" : "transparent",
              }}
            >
              <span className="text-3xl" aria-hidden>{s.emoji}</span>
              <span className="text-sm">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>,
    // 5 · primeiro mini-hábito
    <div key="5" className="flex flex-1 flex-col justify-center gap-5">
      <div>
        <h2 className="font-display text-3xl">Agora, o menor passo possível</h2>
        <p className="mt-2 text-[15px] text-muted">Algo que caiba em um minuto. Sim, um minuto. Eu confio.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {(FIRST_STEPS[goalId ?? "disciplina"] ?? FIRST_STEPS.disciplina).map((f) => {
          const on = habitName === f.name;
          return (
            <motion.button
              key={f.name}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setHabitName(f.name);
                setHabitEmoji(f.emoji);
              }}
              aria-pressed={on}
              className="flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left"
              style={{
                borderColor: on ? "var(--sage)" : "var(--line)",
                background: on ? "color-mix(in srgb, var(--sage) 14%, transparent)" : "transparent",
              }}
            >
              <span className="text-xl" aria-hidden>{f.emoji}</span>
              {f.name}
            </motion.button>
          );
        })}
        <input
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Ou escreva o seu"
          maxLength={40}
          className="min-h-14 rounded-2xl border border-line bg-transparent px-4 outline-none focus:border-sage"
        />
      </div>
    </div>,
  ];

  const last = steps.length - 1;
  const canNext = step === 5 ? habitName.trim().length > 0 : true;
  const label = ["Prazer", "Faz sentido", "Próxima", "Próxima", "Próxima", "Criar e começar"][step];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex h-full w-full max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex h-11 items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((_, i) => (
              <motion.i
                key={i}
                className="block h-1.5 rounded-full"
                animate={{ width: i === step ? 22 : 6, background: i <= step ? "var(--sage)" : "var(--line)" }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          {step < last && (
            <button type="button" onClick={() => finish(false)} className="min-h-11 px-2 text-sm text-muted">
              Pular
            </button>
          )}
        </div>

        <div className="relative -mx-2 flex flex-1 flex-col overflow-y-auto px-2">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: 36 * d }),
                center: { opacity: 1, x: 0 },
                leave: (d: number) => ({ opacity: 0, x: -36 * d }),
              }}
              initial="enter"
              animate="center"
              exit="leave"
              transition={{ duration: 0.32, ease }}
              className="flex flex-1 flex-col"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pt-3">
          {step > 0 && (
            <button
              type="button"
              aria-label="Voltar"
              onClick={() => go(step - 1)}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-line text-muted"
            >
              ←
            </button>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={!canNext}
            onClick={() => (step === last ? finish(true) : go(step + 1))}
            className="min-h-14 flex-1 rounded-full text-[16px] font-medium disabled:opacity-40"
            style={{ background: "var(--ink)", color: "var(--bg)" }}
          >
            {label}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
