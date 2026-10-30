"use client";

import { useMemo } from "react";
import { Sheet } from "./Sheet";
import { Face } from "./CheckIn";
import { useHabits } from "@/lib/store";
import { longDate } from "@/lib/dates";
import { MOOD_LABEL } from "@/lib/checkin";

/** Todas as anotações do diário, da mais recente para a mais antiga. */
export function DiarySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { allCheckins } = useHabits();
  const notes = useMemo(
    () => allCheckins.filter((c) => c.note).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [allCheckins]
  );
  return (
    <Sheet open={open} onClose={onClose} title="Seu diário">
      {notes.length === 0 ? (
        <p className="pb-6 text-[15px] leading-relaxed text-muted">
          Ainda não há anotações. No cartão &ldquo;Como você está hoje?&rdquo; há um espaço para escrever sobre o dia.
        </p>
      ) : (
        <ul className="flex flex-col gap-3 pb-2">
          {notes.map((c) => (
            <li key={c.date} className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between gap-3 text-sm text-muted">
                <span className="first-letter:uppercase">{longDate(c.date)}</span>
                {c.mood !== undefined && (
                  <span className="flex items-center gap-1.5" style={{ color: "var(--sage)" }}>
                    <Face mood={c.mood} size={20} />
                    <span className="text-[12px]">{MOOD_LABEL[c.mood]}</span>
                  </span>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{c.note}</p>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
