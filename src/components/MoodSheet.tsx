"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet } from "./Sheet";
import { EnergyBars, Face } from "./CheckIn";
import { useHabits } from "@/lib/store";
import { dateKey, longDate, parseKey } from "@/lib/dates";
import { ENERGIES, ENERGY_LABEL, MOODS, MOOD_LABEL } from "@/lib/checkin";
import {
  MONTHS,
  WEEKDAY_NAMES,
  moodFill,
  monthCells,
  shiftMonth,
  summarize,
  ymOf,
  type MonthSummary,
  type YM,
} from "@/lib/moodcal";
import { dayPhrase, monthPhrase, type MonthKind } from "@/lib/moodPhrases";
import { levelOf, type Energy, type Mood } from "@/lib/types";

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

function monthKind(s: MonthSummary): MonthKind {
  if (s.logged < 5) return "sparse";
  if (s.trend === "up") return "rising";
  if (s.trend === "down") return "falling";
  if ((s.avg ?? 3) < 2.4) return "heavy";
  if ((s.avg ?? 3) >= 3.6) return "bright";
  return "steady";
}

export function MoodSheet({
  open,
  onClose,
  today,
  onOpenDiary,
}: {
  open: boolean;
  onClose: () => void;
  today: string;
  onOpenDiary: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Seu humor">
      <Body today={today} onOpenDiary={onOpenDiary} />
    </Sheet>
  );
}

function Body({ today, onOpenDiary }: { today: string; onOpenDiary: () => void }) {
  const { getCheckin, settings } = useHabits();
  const [view, setView] = useState<"month" | "year">("month");
  const { allCheckins } = useHabits();
  // Começo do mês com poucos registros? Abre o mês anterior, que já conta uma história.
  const [ym, setYm] = useState<YM>(() => {
    const cur = ymOf(today);
    const pre = shiftMonth(cur, -1);
    const n = (y: YM) => allCheckins.filter((c) => c.mood !== undefined && ymOf(c.date).y === y.y && ymOf(c.date).m === y.m).length;
    return n(cur) < 3 && n(pre) >= 3 ? pre : cur;
  });
  const [dir, setDir] = useState<1 | -1>(1);
  const [selected, setSelected] = useState<string>(today);
  const current = ymOf(today);
  const isCurrent = ym.y === current.y && ym.m === current.m;

  const go = (n: number) => {
    const next = shiftMonth(ym, n);
    if (next.y > current.y || (next.y === current.y && next.m > current.m)) return;
    setDir(n > 0 ? 1 : -1);
    setYm(next);
    // dia selecionado acompanha o mês: hoje (se for o atual) ou o 1º dia
    setSelected(next.y === current.y && next.m === current.m ? today : dateKey(new Date(next.y, next.m, 1)));
  };

  const summary = useMemo(() => summarize(ym, today, getCheckin), [ym, today, getCheckin]);

  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="flex rounded-full border border-line p-1 text-sm" role="tablist" aria-label="Período">
        {(["month", "year"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className="relative flex-1 rounded-full py-2 text-center"
            style={{ color: view === v ? "var(--bg)" : "var(--muted)" }}
          >
            {view === v && (
              <motion.span
                layoutId="mood-tab"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--ink)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{v === "month" ? "Mês" : "Ano"}</span>
          </button>
        ))}
      </div>

      {view === "month" ? (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => go(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted"
            >
              ‹
            </button>
            <p className="font-display text-xl first-letter:uppercase">
              {MONTHS[ym.m]} <span className="text-muted">{ym.y}</span>
            </p>
            <button
              type="button"
              aria-label="Próximo mês"
              disabled={isCurrent}
              onClick={() => go(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted disabled:opacity-30"
            >
              ›
            </button>
          </div>

          <div>
            <div className="mb-1.5 grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted">
              {WEEK.map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div
                key={`${ym.y}-${ym.m}`}
                custom={dir}
                initial={{ opacity: 0, x: dir * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-7 gap-1.5"
                role="grid"
                aria-label="Calendário de humor"
              >
                {monthCells(ym).map((d, i) =>
                  d === null ? (
                    <span key={`b${i}`} />
                  ) : (
                    <DayCell key={d} date={d} today={today} selected={selected === d} onPick={() => setSelected(d)} i={i} />
                  )
                )}
              </motion.div>
            </AnimatePresence>
            <Legend />
          </div>

          <DayDetail key={selected} date={selected} today={today} onOpenDiary={onOpenDiary} />
          <MonthCard s={summary} tone={settings.tone} seed={`${ym.y}-${ym.m}`} />
        </>
      ) : (
        <YearView
          year={ym.y}
          today={today}
          onYear={(n) => {
            const y = ym.y + n;
            if (y > current.y) return;
            setYm({ y, m: y === current.y ? Math.min(ym.m, current.m) : ym.m });
          }}
          currentYear={current.y}
          onMonth={(m) => {
            setDir(1);
            setYm({ y: ym.y, m });
            setSelected(ym.y === current.y && m === current.m ? today : dateKey(new Date(ym.y, m, 1)));
            setView("month");
          }}
        />
      )}
    </div>
  );
}

function DayCell({
  date,
  today,
  selected,
  onPick,
  i,
}: {
  date: string;
  today: string;
  selected: boolean;
  onPick: () => void;
  i: number;
}) {
  const { getCheckin } = useHabits();
  const c = getCheckin(date);
  const future = date > today;
  const n = parseKey(date).getDate();
  return (
    <motion.button
      type="button"
      role="gridcell"
      disabled={future}
      onClick={onPick}
      aria-label={`${longDate(date)}${c?.mood ? `: ${MOOD_LABEL[c.mood]}` : ""}`}
      aria-selected={selected}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: future ? 0.35 : 1, scale: 1 }}
      transition={{ delay: Math.min(i, 31) * 0.008, type: "spring", stiffness: 380, damping: 26 }}
      whileTap={{ scale: 0.9 }}
      className="relative grid aspect-square place-items-center rounded-xl text-[13px] tabular-nums"
      style={{
        background: c?.mood ? moodFill(c.mood) : "color-mix(in srgb, var(--surface-2) 55%, transparent)",
        color: c?.mood ? "var(--ink)" : "var(--muted)",
        outline: selected ? "2px solid var(--ink)" : date === today ? "1.5px solid var(--muted)" : "none",
        outlineOffset: selected ? 1 : 0,
      }}
    >
      {n}
      {c?.note && <i className="absolute right-1 top-1 block h-1 w-1 rounded-full" style={{ background: "var(--ink)", opacity: 0.55 }} />}
    </motion.button>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex items-center justify-between gap-1 text-[11px] text-muted" aria-label="Legenda de cores">
      {MOODS.map((m) => (
        <span key={m} className="flex items-center gap-1.5">
          <i className="block h-3 w-3 rounded-[5px]" style={{ background: moodFill(m) }} />
          {MOOD_LABEL[m]}
        </span>
      ))}
    </div>
  );
}

function DayDetail({ date, today, onOpenDiary }: { date: string; today: string; onOpenDiary: () => void }) {
  const { getCheckin, setCheckin, habits, getValue, settings } = useHabits();
  const c = getCheckin(date);
  const saved = c?.note ?? "";
  const [text, setText] = useState(saved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const done = habits
    .filter((h) => dateKey(new Date(h.createdAt)) <= date)
    .map((h) => ({ h, level: levelOf(h, getValue(h.id, date)) }));
  const doneCount = done.filter((x) => x.level >= 1).length;

  const save = (v: string) => {
    if (timer.current) clearTimeout(timer.current);
    setCheckin(date, { note: v });
  };

  return (
    <section className="rounded-3xl border border-line p-4" aria-label="Detalhe do dia">
      <p className="text-sm text-muted first-letter:uppercase">{date === today ? "Hoje" : longDate(date)}</p>

      <div className="mt-3 flex justify-between" role="group" aria-label="Humor do dia">
        {MOODS.map((m: Mood) => {
          const sel = c?.mood === m;
          return (
            <motion.button
              key={m}
              type="button"
              whileTap={{ scale: 0.86 }}
              aria-pressed={sel}
              aria-label={`Humor: ${MOOD_LABEL[m]}`}
              onClick={() => setCheckin(date, { mood: sel ? null : m })}
              className="grid h-11 w-11 place-items-center rounded-full"
              style={{ background: sel ? moodFill(m) : "transparent", color: sel ? "var(--ink)" : "var(--muted)" }}
            >
              <Face mood={m} size={28} />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence initial={false} mode="wait">
        {c?.mood && (
          <motion.p
            key={c.mood}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-display mt-3 text-[17px] leading-snug"
          >
            {dayPhrase(settings.tone, c.mood, date)}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Energia do dia">
        {ENERGIES.map((e: Energy) => {
          const sel = c?.energy === e;
          return (
            <button
              key={e}
              type="button"
              aria-pressed={sel}
              aria-label={`Energia: ${ENERGY_LABEL[e]}`}
              onClick={() => setCheckin(date, { energy: sel ? null : e })}
              className="flex items-center justify-center gap-1.5 rounded-2xl border py-2 text-[13px] transition-colors"
              style={{
                borderColor: sel ? "var(--sage)" : "var(--line)",
                background: sel ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
                color: sel ? "var(--ink)" : "var(--muted)",
              }}
            >
              <EnergyBars level={e} size={16} />
              {ENERGY_LABEL[e]}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-[13px] text-muted">
        {done.length === 0 ? (
          "Nenhum hábito existia nesse dia."
        ) : (
          <>
            <p>
              {doneCount} de {done.length} {done.length === 1 ? "hábito" : "hábitos"} nesse dia
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {done.map(({ h, level }) => (
                <li
                  key={h.id}
                  className="rounded-full border px-2.5 py-1 text-[12px]"
                  style={{
                    borderColor: level ? "var(--sage)" : "var(--line)",
                    color: level ? "var(--ink)" : "var(--muted)",
                    background: level === 2 ? "color-mix(in srgb, var(--sage) 18%, transparent)" : "transparent",
                  }}
                >
                  {level ? "✓ " : ""}
                  {h.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <textarea
        aria-label="Nota do dia"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (timer.current) clearTimeout(timer.current);
          const v = e.target.value;
          timer.current = setTimeout(() => setCheckin(date, { note: v }), 500);
        }}
        onBlur={() => text !== saved && save(text)}
        rows={3}
        maxLength={1000}
        placeholder="Quer anotar algo sobre esse dia?"
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-transparent px-4 py-3 text-[15px] leading-snug outline-none focus:border-sage"
      />
      <button type="button" onClick={onOpenDiary} className="mt-1 text-[12px] text-muted underline underline-offset-2">
        Ver todas as anotações
      </button>
    </section>
  );
}

function MonthCard({ s, tone, seed }: { s: MonthSummary; tone: Parameters<typeof monthPhrase>[0]; seed: string }) {
  const total = s.logged || 1;
  return (
    <section className="rounded-3xl border border-line p-4" aria-label="Resumo do mês">
      <div className="flex items-center gap-3">
        {s.avgMood ? (
          <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: moodFill(s.avgMood) }}>
            <Face mood={s.avgMood} size={30} />
          </span>
        ) : (
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line text-muted">–</span>
        )}
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight">
            {s.avgMood ? `Em média: ${MOOD_LABEL[s.avgMood].toLowerCase()}` : "Sem registros neste mês"}
          </p>
          <p className="text-[13px] text-muted">
            {s.logged} de {s.days} {s.days === 1 ? "dia" : "dias"} com humor registrado
            {s.notes > 0 ? ` · ${s.notes} ${s.notes === 1 ? "nota" : "notas"}` : ""}
          </p>
        </div>
      </div>

      {s.logged > 0 && (
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full" role="img" aria-label="Distribuição do humor no mês">
          {MOODS.map((m) =>
            s.dist[m] ? (
              <motion.i
                key={m}
                className="block h-full"
                style={{ background: moodFill(m, 80) }}
                initial={{ width: 0 }}
                animate={{ width: `${(s.dist[m] / total) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                title={`${MOOD_LABEL[m]}: ${s.dist[m]}`}
              />
            ) : null
          )}
        </div>
      )}

      {s.bestWeekday !== null && (
        <p className="mt-3 text-[13px] text-muted">
          Seus dias mais leves costumam ser as {WEEKDAY_NAMES[s.bestWeekday]}.
        </p>
      )}
      <p className="font-display mt-3 text-[16px] leading-snug">{monthPhrase(tone, monthKind(s), seed)}</p>
    </section>
  );
}

function YearView({
  year,
  today,
  onYear,
  currentYear,
  onMonth,
}: {
  year: number;
  today: string;
  onYear: (n: number) => void;
  currentYear: number;
  onMonth: (m: number) => void;
}) {
  const { getCheckin } = useHabits();
  const sums = useMemo(
    () => Array.from({ length: 12 }, (_, m) => summarize({ y: year, m }, today, getCheckin)),
    [year, today, getCheckin]
  );
  const logged = sums.reduce((s, x) => s + x.logged, 0);
  return (
    <>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Ano anterior" onClick={() => onYear(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted">
          ‹
        </button>
        <p className="font-display text-xl">{year}</p>
        <button
          type="button"
          aria-label="Próximo ano"
          disabled={year >= currentYear}
          onClick={() => onYear(1)}
          className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted disabled:opacity-30"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {sums.map((s, m) => {
          const future = year === currentYear && m > ymOf(today).m;
          return (
            <motion.button
              key={m}
              type="button"
              disabled={future}
              onClick={() => onMonth(m)}
              aria-label={`${MONTHS[m]} de ${year}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: future ? 0.35 : 1, y: 0 }}
              transition={{ delay: m * 0.03 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-2xl border border-line p-2.5 text-left"
            >
              <p className="mb-1.5 text-[12px] capitalize text-muted">{MONTHS[m].slice(0, 3)}</p>
              <div className="grid grid-cols-7 gap-[2px]">
                {monthCells({ y: year, m }).map((d, i) => {
                  const mood = d ? getCheckin(d)?.mood : undefined;
                  return (
                    <i
                      key={i}
                      className="block aspect-square rounded-[2px]"
                      style={{
                        background: d === null ? "transparent" : mood ? moodFill(mood, 80) : "color-mix(in srgb, var(--surface-2) 70%, transparent)",
                      }}
                    />
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] tabular-nums text-muted">{s.logged ? `${s.logged} dias` : "–"}</p>
            </motion.button>
          );
        })}
      </div>
      <p className="text-[13px] leading-snug text-muted">
        {logged === 0
          ? "Nenhum registro neste ano ainda. Um toque por dia no cartão de humor já desenha esta tela."
          : `${logged} ${logged === 1 ? "dia registrado" : "dias registrados"} em ${year}. Toque num mês para ver os detalhes.`}
      </p>
    </>
  );
}
