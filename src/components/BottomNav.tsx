"use client";

import { motion } from "motion/react";
import type { SVGProps } from "react";

export type Tab = "today" | "evolution" | "learn";

const icon = (p: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

const TodayIcon = () => (
  <svg {...icon({})}>
    <circle cx="12" cy="12" r="8" />
    <path d="M8.5 12.5l2.4 2.4 4.6-5" />
  </svg>
);
const GrowIcon = () => (
  <svg {...icon({})}>
    <path d="M12 21v-9" />
    <path d="M12 12c0-3.5-2.5-5.5-6-5.5 0 3.5 2.5 5.5 6 5.5z" />
    <path d="M12 14.5c0-3 2.2-5 5.5-5 0 3-2.2 5-5.5 5z" />
  </svg>
);
const LearnIcon = () => (
  <svg {...icon({})}>
    <path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" />
    <path d="M12 6v13.5" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: () => React.JSX.Element }[] = [
  { id: "today", label: "Hoje", Icon: TodayIcon },
  { id: "evolution", label: "Evolução", Icon: GrowIcon },
  { id: "learn", label: "Aprender", Icon: LearnIcon },
];

export function BottomNav({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      aria-label="Seções"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="card flex w-full max-w-sm items-center gap-1 p-1.5"
        style={{ borderRadius: 999, pointerEvents: "auto", backdropFilter: "blur(14px)", background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              aria-label={label}
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(id)}
              className="relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium"
              style={{ color: active ? "var(--bg)" : "var(--muted)" }}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "var(--ink)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon />
                {active && <span>{label}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
