"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Sheet } from "./Sheet";
import { useHabits } from "@/lib/store";
import { GUIDES } from "@/lib/guides-data";
import { EVIDENCE_LABEL, GUIDE_CATEGORIES, type Evidence, type Guide, type GuideCategory } from "@/lib/guides";
import { TEMPLATES } from "@/lib/templates";

const EVIDENCE_COLOR: Record<Evidence, string> = {
  forte: "var(--sage)",
  moderada: "var(--water)",
  preliminar: "var(--sand)",
  debatida: "var(--clay)",
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function EvidenceBadge({ evidence, withHint = false }: { evidence: Evidence; withHint?: boolean }) {
  const e = EVIDENCE_LABEL[evidence];
  return (
    <span className="inline-flex flex-col gap-0.5">
      <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
        <i className="block h-2 w-2 rounded-full" style={{ background: EVIDENCE_COLOR[evidence] }} />
        {e.name}
      </span>
      {withHint && <span className="text-[12px] text-muted">{e.hint}</span>}
    </span>
  );
}

export function LearnPage({ onTry, onOpenAbout }: { onTry: (templateKey: string) => void; onOpenAbout: () => void }) {
  const { settings, updateSettings } = useHabits();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<GuideCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const read = settings.guidesRead;

  const list = useMemo(() => {
    const q = norm(query.trim());
    return GUIDES.filter((g) => (cat === "all" || g.category === cat) && (!q || norm(`${g.title} ${g.subtitle} ${g.tldr}`).includes(q)));
  }, [query, cat]);

  const guide = GUIDES.find((g) => g.id === openId) ?? null;
  const next = GUIDES.find((g) => !read.includes(g.id));

  const toggleRead = (id: string) =>
    updateSettings({ guidesRead: read.includes(id) ? read.filter((x) => x !== id) : [...read, id] });

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-[clamp(1.85rem,9vw,2.25rem)] leading-tight">Aprender</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Guias curtos baseados em pesquisa. Cada um mostra o quanto a evidência é forte, o que fazer na prática e as fontes para você conferir.
        </p>
      </header>

      <div className="flex items-center justify-between gap-3 text-[13px] text-muted">
        <span>
          {read.length} de {GUIDES.length} lidos
        </span>
        <button type="button" onClick={onOpenAbout} className="underline underline-offset-2">
          Como o Enso usa a ciência
        </button>
      </div>
      <span className="-mt-3 block h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
        <motion.span
          className="block h-full rounded-full"
          style={{ background: "var(--sage)" }}
          initial={false}
          animate={{ width: `${(read.length / GUIDES.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </span>

      {next && read.length < GUIDES.length && cat === "all" && !query && (
        <button
          type="button"
          onClick={() => setOpenId(next.id)}
          className="card flex flex-col gap-1.5 p-4 text-left"
          style={{ borderRadius: 24 }}
        >
          <span className="text-[12px] uppercase tracking-wide text-muted">{read.length === 0 ? "Comece por aqui" : "Próxima leitura"}</span>
          <span className="font-display text-xl leading-snug">{next.title}</span>
          <span className="text-[14px] leading-snug text-muted">{next.subtitle}</span>
        </button>
      )}

      <input
        type="search"
        aria-label="Buscar nos guias"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar: sono, foco, memória…"
        className="w-full rounded-2xl border border-line bg-transparent px-4 py-3 outline-none focus:border-sage"
      />

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" role="group" aria-label="Categorias">
        {(["all", ...GUIDE_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className="shrink-0 rounded-full border px-3.5 py-2 text-[13px] transition-colors"
            style={{
              borderColor: cat === c ? "var(--sage)" : "var(--line)",
              background: cat === c ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
              color: cat === c ? "var(--ink)" : "var(--muted)",
            }}
          >
            {c === "all" ? "Todos" : c}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {list.map((g) => {
            const done = read.includes(g.id);
            return (
              <motion.li key={g.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <button
                  type="button"
                  onClick={() => setOpenId(g.id)}
                  className="card flex w-full items-start gap-3 p-4 text-left"
                  style={{ borderRadius: 22 }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-[12px] text-muted">
                      {g.category} · {g.minutes} min
                    </span>
                    <span className="font-display mt-0.5 block text-lg leading-snug">{g.title}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-muted">{g.subtitle}</span>
                    <span className="mt-2.5 block">
                      <EvidenceBadge evidence={g.evidence} />
                    </span>
                  </span>
                  <span
                    aria-label={done ? "Lido" : "Não lido"}
                    className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[12px]"
                    style={{
                      borderColor: done ? "var(--sage)" : "var(--line)",
                      background: done ? "var(--sage)" : "transparent",
                      color: "var(--bg)",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      {list.length === 0 && <p className="text-sm text-muted">Nenhum guia encontrado. Tente outra palavra.</p>}

      <p className="text-[12px] leading-relaxed text-muted">
        Conteúdo informativo, não substitui orientação de profissionais de saúde. Os textos são originais do Enso, baseados nas fontes citadas em cada guia.
      </p>

      <GuideSheet
        guide={guide}
        read={guide ? read.includes(guide.id) : false}
        onToggleRead={() => guide && toggleRead(guide.id)}
        onClose={() => setOpenId(null)}
        onTry={(key) => {
          setOpenId(null);
          onTry(key);
        }}
      />
    </div>
  );
}

function GuideSheet({
  guide,
  read,
  onToggleRead,
  onClose,
  onTry,
}: {
  guide: Guide | null;
  read: boolean;
  onToggleRead: () => void;
  onClose: () => void;
  onTry: (key: string) => void;
}) {
  // mantém o último guia durante a animação de saída
  const [last, setLast] = useState<Guide | null>(guide);
  if (guide && guide !== last) setLast(guide);
  const g = guide ?? last;
  const tpl = g?.tryHabit ? TEMPLATES.find((t) => t.key === g.tryHabit) : null;

  return (
    <Sheet open={guide !== null} onClose={onClose} title={g ? g.category : "Guia"}>
      {g && (
        <article className="flex flex-col gap-6 pb-2">
          <header className="flex flex-col gap-2">
            <p className="text-[12px] text-muted">{g.minutes} min de leitura</p>
            <h2 className="font-display text-[1.65rem] leading-tight">{g.title}</h2>
            <EvidenceBadge evidence={g.evidence} withHint />
          </header>

          <p
            className="font-display rounded-3xl p-4 text-[1.15rem] leading-snug"
            style={{ background: "color-mix(in srgb, var(--sage) 12%, transparent)" }}
          >
            {g.tldr}
          </p>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm text-muted">O que a ciência mostra</h3>
            {g.science.map((p, i) =>
              typeof p === "string" ? (
                <p key={i} className="text-[15px] leading-relaxed">
                  {p}
                </p>
              ) : (
                <div key={i} className="flex flex-col gap-1">
                  <h4 className="font-display text-[1.05rem] leading-snug">{p.heading}</h4>
                  <p className="text-[15px] leading-relaxed">{p.text}</p>
                </div>
              )
            )}
          </section>

          {g.myth && (
            <section className="flex flex-col gap-2 rounded-3xl border border-line p-4">
              <p className="text-[12px] uppercase tracking-wide text-muted">Se diz por aí</p>
              <p className="text-[15px] italic leading-snug">{g.myth.claim}</p>
              <p className="mt-1 text-[12px] uppercase tracking-wide text-muted">O que se sabe</p>
              <p className="text-[15px] leading-relaxed">{g.myth.truth}</p>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h3 className="text-sm text-muted">Como aplicar</h3>
            <ol className="flex flex-col gap-3.5">
              {g.steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-medium"
                    style={{ background: "color-mix(in srgb, var(--sage) 18%, transparent)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed">
                    <b className="font-medium">{s.title}.</b> {s.text}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {tpl && (
            <button
              type="button"
              onClick={() => onTry(tpl.key)}
              className="flex flex-col items-start gap-0.5 rounded-3xl p-4 text-left"
              style={{ background: "var(--ink)", color: "var(--bg)" }}
            >
              <span className="text-[12px] opacity-70">Teste por uma semana</span>
              <span className="font-display text-lg">Criar o hábito “{tpl.habit.name}”</span>
              <span className="text-[13px] opacity-80">Você ajusta nome, metas e frequência antes de salvar.</span>
            </button>
          )}

          {g.enso && (
            <p className="rounded-3xl border border-line p-4 text-[14px] leading-relaxed">
              <span className="block text-[12px] uppercase tracking-wide text-muted">No Enso</span>
              {g.enso}
            </p>
          )}

          <section className="flex flex-col gap-2">
            <h3 className="text-sm text-muted">Cuidados e limites</h3>
            <ul className="flex flex-col gap-2">
              {g.limits.map((l) => (
                <li key={l} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
                  <span aria-hidden>•</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm text-muted">Fontes</h3>
            <ul className="flex flex-col gap-2">
              {g.sources.map((s) => {
                const cite = typeof s === "string" ? s : s.cite;
                const url = typeof s === "string" ? undefined : s.url;
                return (
                  <li key={cite} className="text-[12px] leading-snug text-muted">
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer noopener" className="underline underline-offset-2">
                        {cite}
                      </a>
                    ) : (
                      cite
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <button
            type="button"
            onClick={onToggleRead}
            aria-pressed={read}
            className="rounded-full border px-5 py-3 text-sm font-medium transition-colors"
            style={{
              borderColor: read ? "var(--sage)" : "var(--line)",
              background: read ? "color-mix(in srgb, var(--sage) 16%, transparent)" : "transparent",
            }}
          >
            {read ? "✓ Lido" : "Marcar como lido"}
          </button>
        </article>
      )}
    </Sheet>
  );
}
