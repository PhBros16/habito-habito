import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Entry, Habit, Settings } from "./types";

interface EnsoDB extends DBSchema {
  habits: { key: string; value: Habit };
  entries: { key: string; value: Entry };
  kv: { key: string; value: Settings };
}

let dbPromise: Promise<IDBPDatabase<EnsoDB>> | null = null;

function db() {
  if (!dbPromise) {
    dbPromise = openDB<EnsoDB>("enso", 1, {
      upgrade(d) {
        d.createObjectStore("habits", { keyPath: "id" });
        d.createObjectStore("entries", { keyPath: "id" });
        d.createObjectStore("kv");
      },
    });
  }
  return dbPromise;
}

export async function loadAll() {
  const d = await db();
  const [habits, entries, settings] = await Promise.all([
    d.getAll("habits"),
    d.getAll("entries"),
    d.get("kv", "settings"),
  ]);
  return { habits, entries, settings };
}

export async function saveHabit(h: Habit) {
  await (await db()).put("habits", h);
}

export async function deleteHabit(id: string) {
  const d = await db();
  const tx = d.transaction(["habits", "entries"], "readwrite");
  await tx.objectStore("habits").delete(id);
  let cursor = await tx.objectStore("entries").openCursor();
  while (cursor) {
    if (cursor.value.habitId === id) await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

export async function saveEntry(e: Entry) {
  await (await db()).put("entries", e);
}

export async function deleteEntry(id: string) {
  await (await db()).delete("entries", id);
}

export async function saveSettings(s: Settings) {
  await (await db()).put("kv", s, "settings");
}
