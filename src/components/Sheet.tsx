"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/* Trava a rolagem da página enquanto houver sheet aberto (vale para vários empilhados). */
let locks = 0;
let savedY = 0;
function lockScroll() {
  if (locks++ > 0) return;
  savedY = window.scrollY;
  const b = document.body;
  b.style.position = "fixed";
  b.style.top = `-${savedY}px`;
  b.style.left = "0";
  b.style.right = "0";
  b.style.width = "100%";
  document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--locks > 0) return;
  locks = 0;
  const b = document.body;
  b.style.position = "";
  b.style.top = "";
  b.style.left = "";
  b.style.right = "";
  b.style.width = "";
  document.documentElement.style.overflow = "";
  window.scrollTo(0, savedY);
}

/** Bottom sheet: arrastar pela alça ou pelo cabeçalho, botão de fechar grande, fundo travado. */
export function Sheet({ open, onClose, title, children }: Props) {
  const controls = useDragControls();

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="card relative flex max-h-[88dvh] w-full max-w-md flex-col"
            style={{ borderRadius: "32px 32px 0 0", borderBottom: "none", willChange: "transform" }}
            initial={{ y: "100%" }}
            animate={{ y: 0, transition: { type: "spring", stiffness: 380, damping: 38, mass: 0.9 } }}
            exit={{ y: "100%", transition: { duration: 0.24, ease: [0.4, 0, 0.9, 0.6] } }}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) onClose();
            }}
          >
            <div
              className="flex h-11 shrink-0 cursor-grab touch-none items-start justify-center pt-3 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
            >
              <span className="h-1.5 w-10 rounded-full bg-line" />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="absolute right-3 top-2.5 grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-muted active:scale-90"
              style={{ transition: "transform 120ms" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
            <div className="soft-scroll overscroll-contain overflow-y-auto px-5 pb-[max(2rem,env(safe-area-inset-bottom))]" style={{ overscrollBehavior: "contain" }}>
              <h2 className="font-display mb-4 mt-1 pr-12 text-2xl">{title}</h2>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
