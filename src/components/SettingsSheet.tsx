"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Collapse } from "./Collapse";
import { askNotifications, downloadIcs, notificationState } from "@/lib/reminders";
import { Sheet } from "./Sheet";
import { useHabits } from "@/lib/store";
import { TONE_LABEL } from "@/lib/phrases";
import type { ThemePref, Tone } from "@/lib/types";
import { APP_NAME } from "@/lib/brand";

const THEMES: { key: ThemePref; label: string }[] = [
  { key: "system", label: "Sistema" },
  { key: "light", label: "Claro" },
  { key: "dark", label: "Escuro" },
];

function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <motion.button
            key={o.key}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(o.key)}
            className="min-h-11 rounded-2xl border px-2 text-sm transition-colors"
            style={{
              borderColor: active ? "var(--sage)" : "var(--line)",
              background: active ? "color-mix(in srgb, var(--sage) 14%, transparent)" : "transparent",
            }}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export function SettingsSheet({
  open,
  onClose,
  onOpenPauses,
  onOpenAbout,
  onOpenDiary,
}: {
  open: boolean;
  onClose: () => void;
  onOpenPauses: () => void;
  onOpenAbout: () => void;
  onOpenDiary: () => void;
}) {
  const { settings, updateSettings, exportJson, habits } = useHabits();
  const [notif, setNotif] = useState(notificationState());
  const withReminder = habits.filter((h) => h.reminder);

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${APP_NAME.toLowerCase()}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Ajustes">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Aparência</h3>
          <Segment options={THEMES} value={settings.theme} onChange={(theme) => updateSettings({ theme })} />
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Tom das frases</h3>
          <Segment
            options={(Object.keys(TONE_LABEL) as Tone[]).map((k) => ({ key: k, label: TONE_LABEL[k].name }))}
            value={settings.tone}
            onChange={(tone) => updateSettings({ tone })}
          />
          <p className="text-[13px] text-muted">{TONE_LABEL[settings.tone].hint}</p>
        </section>

        <section className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm">Sons suaves</h3>
            <p className="text-[13px] text-muted">Gota, carimbo, folha virando</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.sound}
            onClick={() => updateSettings({ sound: !settings.sound })}
            className="relative h-8 w-14 rounded-full transition-colors"
            style={{ background: settings.sound ? "var(--sage)" : "var(--line)" }}
          >
            <motion.span
              className="absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow"
              animate={{ x: settings.sound ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </button>
        </section>

        <Collapse title="Seu perfil" summary={settings.profile?.future || settings.profile?.goal || "Conte o que você quer. As frases passam a falar com você."}>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Seu maior objetivo hoje
              <input
                value={settings.profile?.goal ?? ""}
                onChange={(e) => updateSettings({ profile: { slot: "varia", future: "", ...settings.profile, goal: e.target.value } })}
                maxLength={60}
                className="min-h-12 rounded-2xl border border-line bg-transparent px-4 outline-none focus:border-sage"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-muted">
              Quem você quer ser daqui a um ano
              <input
                value={settings.profile?.future ?? ""}
                onChange={(e) => updateSettings({ profile: { slot: "varia", goal: "", ...settings.profile, future: e.target.value } })}
                maxLength={70}
                placeholder="Alguém que…"
                className="min-h-12 rounded-2xl border border-line bg-transparent px-4 outline-none focus:border-sage"
              />
            </label>
          </div>
        </Collapse>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Lembretes</h3>
          {notif !== "unsupported" && notif !== "granted" && (
            <button
              type="button"
              onClick={async () => setNotif((await askNotifications()) ? "granted" : "denied")}
              className="min-h-12 rounded-2xl border border-line px-4 py-3 text-left text-sm"
            >
              Ativar avisos neste aparelho
              <span className="block text-[13px] text-muted">
                {notif === "denied" ? "Bloqueado no navegador: libere nas configurações do site." : "Aparecem quando o app está aberto ou em segundo plano."}
              </span>
            </button>
          )}
          <button
            type="button"
            disabled={withReminder.length === 0}
            onClick={() => downloadIcs(habits)}
            className="min-h-12 rounded-2xl border border-line px-4 py-3 text-left text-sm disabled:opacity-50"
          >
            Levar lembretes para o calendário (.ics)
            <span className="block text-[13px] text-muted">
              {withReminder.length === 0
                ? "Defina um horário em “Mais opções” ao editar um hábito."
                : "Tocam no horário mesmo com o app fechado."}
            </span>
          </button>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Diário e sobre</h3>
          <button type="button" onClick={onOpenDiary} className="rounded-2xl border border-line px-4 py-3 text-left text-sm">
            Seu diário
            <span className="block text-[13px] text-muted">As anotações que você escreveu junto do humor.</span>
          </button>
          <button type="button" onClick={onOpenAbout} className="rounded-2xl border border-line px-4 py-3 text-left text-sm">
            Sobre o app
            <span className="block text-[13px] text-muted">Conceito, o motivo do nome e a ciência por trás.</span>
          </button>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Pausas</h3>
          <button type="button" onClick={onOpenPauses} className="rounded-2xl border border-line px-4 py-3 text-left text-sm">
            Pausas planejadas
            <span className="block text-[13px] text-muted">
              Viagem ou doença sem quebrar a sequência.
              {settings.pauses.length > 0 && ` ${settings.pauses.length} ${settings.pauses.length === 1 ? "registrada" : "registradas"}.`}
            </span>
          </button>
        </section>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-sm text-muted">Seus dados</h3>
          <button type="button" onClick={download} className="rounded-2xl border border-line px-4 py-3 text-left text-sm">
            Exportar backup (JSON)
            <span className="block text-[13px] text-muted">Tudo fica só neste aparelho.</span>
          </button>
        </section>
      </div>
    </Sheet>
  );
}
