"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import { Sheet } from "./Sheet";
import { accentColor, accentSoft } from "./habits/shared";
import { useHabits } from "@/lib/store";
import { useFeedback } from "@/lib/useFeedback";
import type { Habit } from "@/lib/types";

function Row({ habit, onGrab }: { habit: Habit; onGrab: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={habit}
      dragListener={false}
      dragControls={controls}
      onDragStart={onGrab}
      whileDrag={{ scale: 1.03, boxShadow: "0 14px 34px rgba(0,0,0,0.22)", zIndex: 5 }}
      transition={{ type: "spring", stiffness: 500, damping: 36 }}
      className="card relative flex min-h-16 items-center gap-3 px-4"
      style={{ borderRadius: 20, boxShadow: "none" }}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl"
        style={{ background: accentSoft(habit.accent, 22), color: accentColor(habit.accent) }}
        aria-hidden
      >
        {habit.emoji ?? habit.name[0]}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{habit.name}</span>
      <button
        type="button"
        aria-label={`Arrastar ${habit.name}`}
        onPointerDown={(e) => controls.start(e)}
        className="grid h-12 w-12 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted active:cursor-grabbing"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          {[5, 10, 15].map((y) => (
            <g key={y}>
              <circle cx="7" cy={y} r="1.4" />
              <circle cx="13" cy={y} r="1.4" />
            </g>
          ))}
        </svg>
      </button>
    </Reorder.Item>
  );
}

/** Ordena os hábitos arrastando pela alça; a ordem vale na hora. */
export function ReorderSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Ordenar hábitos">
      <Body />
    </Sheet>
  );
}

function Body() {
  const { habits, reorderHabits } = useHabits();
  const fb = useFeedback();
  const [list, setList] = useState(habits);
  return (
    <>
      <p className="-mt-2 mb-4 text-[13px] text-muted">Segure a alça e arraste. A ordem vale já.</p>
      <Reorder.Group
        axis="y"
        values={list}
        onReorder={(next) => {
          setList(next);
          reorderHabits(next.map((h) => h.id));
        }}
        className="flex flex-col gap-2.5 pb-2"
      >
        {list.map((h) => (
          <Row key={h.id} habit={h} onGrab={() => fb("tick", 10)} />
        ))}
      </Reorder.Group>
    </>
  );
}
