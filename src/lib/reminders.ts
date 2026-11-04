import type { Habit } from "./types";

const DAY_KEYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export const reminderLabel = (h: Habit): string | null =>
  h.reminder ? `${h.reminder.time}${h.reminder.days?.length ? "" : " todo dia"}` : null;

/** Lembretes que já passaram da hora (até 3 h atrás), valem hoje e ainda não foram feitos nem avisados. */
export function dueReminders(habits: Habit[], now: Date, isDone: (h: Habit) => boolean, wasNotified: (h: Habit) => boolean): Habit[] {
  const minutes = now.getHours() * 60 + now.getMinutes();
  return habits.filter((h) => {
    const r = h.reminder;
    if (!r || h.archived) return false;
    if (r.days?.length && !r.days.includes(now.getDay())) return false;
    const [hh, mm] = r.time.split(":").map(Number);
    const at = hh * 60 + mm;
    return minutes >= at && minutes - at <= 180 && !isDone(h) && !wasNotified(h);
  });
}

const key = (h: Habit, day: string) => `enso:notified:${day}:${h.id}`;
export const wasNotified = (h: Habit, day: string) => {
  try {
    return localStorage.getItem(key(h, day)) === "1";
  } catch {
    return false;
  }
};
export const markNotified = (h: Habit, day: string) => {
  try {
    localStorage.setItem(key(h, day), "1");
  } catch {
    /* ok */
  }
};

export const notificationState = (): "unsupported" | NotificationPermission =>
  typeof Notification === "undefined" ? "unsupported" : Notification.permission;

export async function askNotifications(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  const p = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return p === "granted";
}

/** Aviso do sistema (só aparece se o app estiver aberto ou em segundo plano recente). */
export async function systemNotify(title: string, body: string) {
  try {
    if (notificationState() !== "granted") return;
    const reg = await navigator.serviceWorker?.ready;
    if (reg) await reg.showNotification(title, { body, icon: "/icon-192.png", tag: title });
    else new Notification(title, { body });
  } catch {
    /* ok */
  }
}

const stamp = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

/** Arquivo de calendário com um evento recorrente (e alarme) por lembrete: funciona com o app fechado. */
export function icsFor(habits: Habit[], now = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Enso//Lembretes//PT", "CALSCALE:GREGORIAN"];
  for (const h of habits) {
    const r = h.reminder;
    if (!r) continue;
    const [hh, mm] = r.time.split(":").map(Number);
    const end = (hh * 60 + mm + 15) % (24 * 60);
    const t = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}00`;
    const rule = r.days?.length ? `FREQ=WEEKLY;BYDAY=${r.days.map((d) => DAY_KEYS[d]).join(",")}` : "FREQ=DAILY";
    lines.push(
      "BEGIN:VEVENT",
      `UID:enso-${h.id}@enso`,
      `DTSTAMP:${stamp(now)}T000000Z`,
      `DTSTART:${stamp(now)}T${t(hh * 60 + mm)}`,
      `DTEND:${stamp(now)}T${t(end)}`,
      `RRULE:${rule}`,
      `SUMMARY:${(h.emoji ? h.emoji + " " : "") + h.name.replace(/[,;\n]/g, " ")}`,
      "DESCRIPTION:Um passo pequeno já conta.",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Enso",
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(habits: Habit[]) {
  const blob = new Blob([icsFor(habits)], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "enso-lembretes.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
