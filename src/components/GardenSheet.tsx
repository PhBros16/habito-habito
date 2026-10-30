"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Sheet } from "./Sheet";
import { GardenScene } from "./Garden";
import { accentColor } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { overview } from "@/lib/stats";
import { GARDEN_LEVELS, STAGE_DAYS, STAGE_NAMES, gardenLevel, gardenPlants } from "@/lib/garden";

/** Dados do jardim a partir dos hábitos (compartilhado entre o cartão da home e a sheet). */
export function useGarden(today: string) {
  const { habits, getValue, isPaused } = useHabits();
  const [hour] = useState(() => new Date().getHours());
  const plants = useMemo(() => gardenPlants(habits, today, getValue, isPaused), [habits, today, getValue, isPaused]);
  const streak = useMemo(() => overview(habits, today, getValue, isPaused).current, [habits, today, getValue, isPaused]);
  return { plants, hour, streak };
}

export function GardenCard({ today, onOpen }: { today: string; onOpen: () => void }) {
  const { plants, hour, streak } = useGarden(today);
  if (plants.length === 0) return null;
  return (
    <motion.button
      type="button"
      aria-label="Abrir jardim"
      onClick={onOpen}
      whileTap={{ scale: 0.985 }}
      className="card mt-4 block w-full overflow-hidden text-left"
      style={{ borderRadius: 26 }}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
        <span className="font-display text-lg">Seu jardim</span>
        <span className="text-xs text-muted">ver →</span>
      </div>
      <GardenScene plants={plants} hour={hour} streak={streak} compact />
    </motion.button>
  );
}

export function GardenSheet({
  open,
  onClose,
  today,
}: {
  open: boolean;
  onClose: () => void;
  today: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Seu jardim">
      <Body today={today} />
    </Sheet>
  );
}

function Body({ today }: { today: string }) {
  const { plants, hour, streak } = useGarden(today);
  const [openId, setOpenId] = useState<string | null>(null);
  const level = gardenLevel(plants);

  if (plants.length === 0) {
    return (
      <p className="pb-6 text-[15px] leading-relaxed text-muted">
        O jardim nasce com o seu primeiro hábito. Cada um vira uma planta.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="-mx-1 overflow-hidden rounded-3xl border border-line">
        <GardenScene plants={plants} hour={hour} streak={streak} onPick={(id) => setOpenId((c) => (c === id ? null : id))} />
      </div>

      <div className="rounded-2xl border border-line p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg">Nível {level.index + 1}: {level.name}</span>
          <span className="text-sm text-muted">{level.total} {level.total === 1 ? "dia" : "dias"} somados</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div className="h-full rounded-full" style={{ background: "var(--sage)" }} initial={{ width: 0 }} animate={{ width: `${level.progress * 100}%` }} transition={{ delay: 0.3, type: "spring", stiffness: 90, damping: 20 }} />
        </div>
        <p className="mt-2.5 text-[13px] leading-snug text-muted">
          {level.unlock}
          {level.next !== null && ` Próximo nível: ${GARDEN_LEVELS[level.index + 1].name}, com ${level.next - level.total} dias somados.`}
        </p>
        <ul className="mt-2 space-y-1 text-[12px] text-muted">
          {GARDEN_LEVELS.slice(1).map((l, i) => (
            <li key={l.name} style={{ opacity: level.index >= i + 1 ? 1 : 0.5 }}>
              {level.index >= i + 1 ? "●" : "○"} {l.name} ({l.at} dias): {l.unlock}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[13px] leading-relaxed text-muted">
        Cada dia em que você faz um hábito, a planta dele cresce. Nada morre aqui: se você
        sumir, a planta só descansa e volta a crescer quando você voltar.
      </p>

      <div className="flex flex-col gap-2.5">
        {plants.map((p, i) => {
          const next = STAGE_DAYS[p.stage + 1];
          return (
            <motion.div
              key={p.habit.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06, type: "spring", stiffness: 240, damping: 26 }}
              className="rounded-2xl border p-3.5"
              style={{ borderColor: openId === p.habit.id ? accentColor(p.habit.accent) : "var(--line)" }}
            >
              <button type="button" className="block w-full text-left" aria-expanded={openId === p.habit.id} onClick={() => setOpenId((c) => (c === p.habit.id ? null : p.habit.id))}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <i className="block h-2 w-2 shrink-0 rounded-full" style={{ background: accentColor(p.habit.accent) }} />
                  <span className="font-display truncate text-lg">{p.habit.name}</span>
                </span>
                <span className="shrink-0 text-sm text-muted">{STAGE_NAMES[p.stage]}</span>
              </div>
              {p.toNext !== null && (
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: accentColor(p.habit.accent) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.toNext * 100}%` }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 90, damping: 20 }}
                  />
                </div>
              )}
              <p className="mt-2.5 text-[13px] text-muted">
                {p.days} {p.days === 1 ? "dia feito" : "dias feitos"}
                {next !== undefined && ` · faltam ${next - p.days} para ${STAGE_NAMES[p.stage + 1].toLowerCase()}`}
                {p.paused && " · em pausa, dormindo tranquila"}
                {p.resting && p.daysSince !== null && ` · descansando há ${p.daysSince} dias`}
                {p.doneToday && " · regada hoje"}
              </p>
              </button>
              {openId === p.habit.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <ol className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[13px]">
                    {STAGE_NAMES.map((n, si) => (
                      <li key={n} className="flex items-center gap-2" style={{ opacity: p.stage >= si ? 1 : 0.45 }}>
                        <i className="block h-2 w-2 rounded-full" style={{ background: p.stage >= si ? accentColor(p.habit.accent) : "var(--line)" }} />
                        <span className="flex-1">{n}</span>
                        <span className="text-muted">{STAGE_DAYS[si]} {STAGE_DAYS[si] === 1 ? "dia" : "dias"}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[12px] leading-snug text-muted">
                    {p.stage >= 8
                      ? "Uma árvore lendária: mais de um ano de cuidado. Ela fica aqui para sempre."
                      : p.stage >= 6
                        ? "Já é uma árvore. Cada novo ano de cuidado a deixa mais antiga e frondosa."
                        : "Cada dia feito é uma gota. A planta nunca morre: se você sumir, ela só descansa."}
                  </p>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
