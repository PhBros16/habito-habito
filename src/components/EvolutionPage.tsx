"use client";

import { motion } from "motion/react";
import { EvolutionBody } from "./EvolutionSheet";
import { GardenCard } from "./GardenSheet";

function Tile({ title, hint, onClick, label }: { title: string; hint: string; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="card flex flex-col items-start gap-1 p-4 text-left"
      style={{ borderRadius: 22 }}
    >
      <span className="font-display text-lg leading-tight">{title}</span>
      <span className="text-[13px] leading-snug text-muted">{hint}</span>
    </motion.button>
  );
}

export function EvolutionPage({
  today,
  onOpenMood,
  onOpenGarden,
  onOpenStats,
  onOpenReview,
}: {
  today: string;
  onOpenMood: () => void;
  onOpenGarden: () => void;
  onOpenStats: () => void;
  onOpenReview: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-[clamp(1.85rem,9vw,2.25rem)] leading-tight">Evolução</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          O que você construiu até aqui, em números e em histórias. Progresso aparece primeiro na constância, não na pressa.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Abrir calendário de humor" title="Humor e diário" hint="Calendário de emoções, mês e ano" onClick={onOpenMood} />
        <Tile label="Abrir estatísticas" title="Estatísticas" hint="Sequências, padrões e hábitos" onClick={onOpenStats} />
        <Tile label="Abrir retrospectiva" title="Sua semana" hint="Um olhar para os últimos dias" onClick={onOpenReview} />
        <Tile label="Abrir jardim pela evolução" title="Jardim" hint="Cada hábito vira uma planta" onClick={onOpenGarden} />
      </div>

      <GardenCard today={today} onOpen={onOpenGarden} />

      <EvolutionBody today={today} />
    </div>
  );
}
