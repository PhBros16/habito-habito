const pad = (n: number) => String(n).padStart(2, "0");

/** YYYY-MM-DD no fuso local (não UTC). */
export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

export function lastDays(endKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(endKey, i - (count - 1)));
}

export function weekdayShort(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(parseKey(key))
    .replace(".", "");
}

export function dayNumber(key: string): number {
  return parseKey(key).getDate();
}

export function longDate(key: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(parseKey(key));
}

export type Moment = "morning" | "afternoon" | "evening";

export function momentOf(date: Date = new Date()): Moment {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function greetingOf(moment: Moment): string {
  return { morning: "Bom dia", afternoon: "Boa tarde", evening: "Boa noite" }[moment];
}

export function relativeLabel(key: string, today: string): string {
  if (key === today) return "Hoje";
  if (key === addDays(today, -1)) return "Ontem";
  return longDate(key);
}
