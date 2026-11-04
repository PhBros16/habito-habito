"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

/** Bloco recolhível: título + resumo na linha, conteúdo abre com altura animada. */
export function Collapse({
  title,
  summary,
  defaultOpen = false,
  open: controlled,
  onToggle,
  children,
  flush = false,
}: {
  title: ReactNode;
  summary?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
  flush?: boolean;
}) {
  const [inner, setInner] = useState(defaultOpen);
  const open = controlled ?? inner;
  const toggle = () => {
    const next = !open;
    setInner(next);
    onToggle?.(next);
  };
  return (
    <div className={flush ? "" : "rounded-2xl border border-line"}>
      <button
        type="button"
        aria-expanded={open}
        onClick={toggle}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px]">{title}</span>
          {summary && !open && <span className="block truncate text-[12px] text-muted">{summary}</span>}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="text-muted" aria-hidden>
          ⌄
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
