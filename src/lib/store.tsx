"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as store from "./db";
import { SEED_KEYS, TEMPLATES, type HabitTemplate } from "./templates";
import {
  defaultSettings,
  entryId,
  type Entry,
  type Habit,
  type Settings,
} from "./types";

interface Ctx {
  ready: boolean;
  habits: Habit[]; // ativos, em ordem
  getValue: (habitId: string, date: string) => number;
  setValue: (habitId: string, date: string, value: number) => void;
  addHabit: (t: HabitTemplate) => void;
  removeHabit: (id: string) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  exportJson: () => string;
}

const HabitsContext = createContext<Ctx | null>(null);

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Carrega do IndexedDB (e semeia os hábitos iniciais na primeira abertura).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await store.loadAll();
        let loadedHabits = data.habits;
        let loadedSettings = { ...defaultSettings, ...(data.settings ?? {}) };

        if (!loadedSettings.seeded && loadedHabits.length === 0) {
          const now = new Date().toISOString();
          loadedHabits = SEED_KEYS.map((key, i) => {
            const t = TEMPLATES.find((x) => x.key === key)!.habit;
            return { ...t, id: uid(), createdAt: now, order: i };
          });
          loadedSettings = { ...loadedSettings, seeded: true };
          await Promise.all([
            ...loadedHabits.map(store.saveHabit),
            store.saveSettings(loadedSettings),
          ]);
        }

        if (cancelled) return;
        setHabits(loadedHabits);
        setEntries(Object.fromEntries(data.entries.map((e) => [e.id, e])));
        setSettings(loadedSettings);
      } catch {
        /* IndexedDB indisponível (modo privado em alguns navegadores): segue em memória */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tema: espelha no <html> e no localStorage (lido pelo script anti-flash).
  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      const dark =
        settings.theme === "dark" ||
        (settings.theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    };
    apply();
    try {
      localStorage.setItem("enso:theme", JSON.stringify(settings.theme));
    } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [ready, settings.theme]);

  const getValue = useCallback(
    (habitId: string, date: string) => entries[entryId(habitId, date)]?.value ?? 0,
    [entries]
  );

  const setValue = useCallback((habitId: string, date: string, value: number) => {
    const id = entryId(habitId, date);
    const v = Math.max(0, Math.round(value * 100) / 100);
    setEntries((prev) => {
      const next = { ...prev };
      if (v === 0) delete next[id];
      else next[id] = { id, habitId, date, value: v };
      return next;
    });
    if (v === 0) store.deleteEntry(id).catch(() => {});
    else store.saveEntry({ id, habitId, date, value: v }).catch(() => {});
  }, []);

  const addHabit = useCallback(
    (t: HabitTemplate) => {
      // Criado fora do updater para não duplicar no StrictMode.
      const habit: Habit = {
        ...t,
        id: uid(),
        createdAt: new Date().toISOString(),
        order: habits.length,
      };
      setHabits([...habits, habit]);
      store.saveHabit(habit).catch(() => {});
    },
    [habits]
  );

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setEntries((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([, e]) => e.habitId !== id))
    );
    store.deleteHabit(id).catch(() => {});
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      store.saveSettings(next).catch(() => {});
      return next;
    });
  }, []);

  const exportJson = useCallback(
    () =>
      JSON.stringify(
        {
          app: "enso",
          exportedAt: new Date().toISOString(),
          habits,
          entries: Object.values(entries),
          settings,
        },
        null,
        2
      ),
    [habits, entries, settings]
  );

  const sorted = useMemo(
    () => [...habits].filter((h) => !h.archived).sort((a, b) => a.order - b.order),
    [habits]
  );

  const value = useMemo<Ctx>(
    () => ({
      ready,
      habits: sorted,
      getValue,
      setValue,
      addHabit,
      removeHabit,
      settings,
      updateSettings,
      exportJson,
    }),
    [ready, sorted, getValue, setValue, addHabit, removeHabit, settings, updateSettings, exportJson]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits fora do HabitsProvider");
  return ctx;
}
