"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { speakEnso } from "@/lib/speak";
import { EnsoMark } from "./EnsoMark";
import { Sheet } from "./Sheet";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

const PRINCIPLES: { title: string; text: string; source: string; where: string }[] = [
  {
    title: "Comece pequeno demais para falhar",
    text: "Cada hábito tem um mínimo (a versão minúscula que já conta) e um ideal. Aparecer importa mais que render: o comportamento pequeno e repetido cria o caminho, e a intensidade vem depois, se você quiser.",
    source: "Fogg, Tiny Habits (2020)",
    where: "No Enso: cada hábito tem mínimo e ideal, e “Mínimo feito” já conta como dia cumprido.",
  },
  {
    title: "Hábito leva tempo, e o tempo varia",
    text: "No estudo clássico, o tempo para um comportamento ficar automático variou de 18 a 254 dias, com mediana de 66. Por isso o jardim cresce por meses e o app nunca promete “21 dias”. Falhar um dia isolado não atrapalhou o processo.",
    source: "Lally et al., European Journal of Social Psychology (2010)",
    where: "No Enso: a barra “Caminho até o automático” na aba Evolução, a pergunta “está ficando automático?” em cada hábito, o jardim que cresce por meses e o aviso “um dia de folga não quebra nada”.",
  },
  {
    title: "Autocompaixão sustenta, culpa derruba",
    text: "Quem reage a uma falha com gentileza tende a se recuperar mais rápido do que quem se cobra. Aqui, dias difíceis, pausas planejadas e recomeços nunca viram \"sequência perdida\" em tom de bronca.",
    source: "Adams & Leary (2007); Breines & Chen (2012)",
    where: "No Enso: dia difícil, pausas planejadas e frases sem culpa.",
  },
  {
    title: "Identidade antes do resultado",
    text: "\"Sou alguém que lê todo dia\" ajuda mais do que \"preciso ler 20 páginas\". Cada vez que você cumpre um hábito, dá um voto para a pessoa que quer ser, e a frase de identidade lembra disso.",
    source: "Oyserman, identity-based motivation; Clear, Atomic Habits (2018)",
    where: "No Enso: a frase “Sou alguém que…” no cartão do hábito e na retrospectiva da semana.",
  },
  {
    title: "Planos \"se-então\" e contexto estável",
    text: "Decidir antes onde e quando agir (\"depois do café, eu leio\") aumenta bastante a chance de cumprir, e hábitos se firmam quando o contexto se repete. Por isso cada hábito pode ter seu horário e sua âncora.",
    source: "Gollwitzer & Sheeran (2006); Wood & Neal (2007)",
    where: "No Enso: o campo “âncora” de cada hábito (por exemplo, depois do café).",
  },
  {
    title: "Autonomia: você decide",
    text: "A motivação dura mais quando é sua. O app sugere, nunca cobra: as frases usam convite (\"se quiser\") em vez de ordem, e o tom é você que escolhe.",
    source: "Deci & Ryan, Teoria da Autodeterminação (2000)",
    where: "No Enso: você escolhe o tom das frases, as metas e o que fica no dia difícil.",
  },
  {
    title: "Recomeços temporais",
    text: "Segundas-feiras, inícios de mês e datas marcantes funcionam como \"páginas em branco\" e aumentam a vontade de recomeçar. O app aproveita esses momentos, sem exigir nenhum deles.",
    source: "Dai, Milkman & Riis (2014)",
    where: "No Enso: convites mais calorosos em segundas, domingos e início de mês.",
  },
  {
    title: "Associar o difícil ao prazeroso",
    text: "Ligar o hábito a algo prazeroso ajudou pessoas a ir mais à academia. O efeito apareceu no começo e diminuiu com o tempo, então pense nisso como um empurrão inicial.",
    source: "Milkman, Minson & Volpp (2014)",
    where: "No Enso: o som ambiente é um “extra gostoso” para ligar enquanto você faz o hábito.",
  },
  {
    title: "Metas que desafiam na medida",
    text: "Metas específicas e um pouco desafiadoras rendem mais do que metas vagas ou fáceis demais. Quando o ideal fica leve por duas semanas, subir um pouco mantém o progresso sem assustar.",
    source: "Locke & Latham (2002)",
    where: "No Enso: a sugestão de subir a meta quando você cumpre o ideal quase todo dia.",
  },
  {
    title: "Ver o progresso motiva",
    text: "Pequenos avanços visíveis sustentam a motivação. Por isso o app mostra a evolução com números, marcos e um jardim que cresce, em vez de esperar o resultado final.",
    source: "Amabile & Kramer, The Progress Principle (2011)",
    where: "No Enso: aba Evolução, marcos de dias de prática e o jardim.",
  },
];

const ART_BG = ["sage", "sun", "clay", "lilac", "water", "sage", "sun", "clay", "lilac", "water"] as const;

/** Ilustrações abstratas, uma por princípio (traços finos, cores do tema). */
function Art({ i }: { i: number }) {
  const c = `var(--${ART_BG[i % ART_BG.length]})`;
  const ink = "var(--ink)";
  const common = { fill: "none", stroke: ink, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const art = [
    // 0 · começar pequeno: semente que brota
    <g key="0"><circle cx="60" cy="58" r="3.5" fill={c} /><motion.path {...common} d="M60 54 C60 44 60 40 60 34" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.1 }} /><motion.path {...common} d="M60 40 C52 38 48 32 50 27 C57 27 60 33 60 40Z M60 36 C67 34 71 28 69 23 C62 23 60 29 60 36Z" fill={c} fillOpacity=".35" initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }} /><path {...common} d="M30 62 H90" opacity=".4" /></g>,
    // 1 · tempo: arco de pontos
    <g key="1">{Array.from({ length: 13 }, (_, k) => { const t = k / 12; const x = 20 + t * 80; const y = 58 - Math.sin(t * Math.PI) * 38; return <motion.circle key={k} cx={x} cy={y} r={k === 12 ? 4.5 : 2.4} fill={k === 12 ? c : ink} opacity={k === 12 ? 1 : 0.25 + t * 0.5} initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: k * 0.07 }} />; })}</g>,
    // 2 · autocompaixão: mãos em concha e coração
    <g key="2"><path {...common} d="M30 50 C40 66 80 66 90 50" /><motion.path d="M60 50 C44 38 50 24 60 32 C70 24 76 38 60 50Z" fill={c} fillOpacity=".5" stroke={ink} strokeWidth="1.4" initial={{ scale: 0.85 }} animate={{ scale: [0.9, 1.05, 0.9] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: "60px 40px" }} /></g>,
    // 3 · identidade: figura e ondas
    <g key="3"><circle cx="60" cy="32" r="8" fill={c} fillOpacity=".5" stroke={ink} strokeWidth="1.5" /><path {...common} d="M44 62 C44 48 76 48 76 62" />{[14, 22].map((r, k) => <motion.circle key={r} cx="60" cy="32" r={r} fill="none" stroke={c} strokeWidth="1.2" initial={{ opacity: 0.6, scale: 0.8 }} animate={{ opacity: 0, scale: 1.2 }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.9 }} style={{ transformOrigin: "60px 32px" }} />)}</g>,
    // 4 · se-então: duas pedras ligadas
    <g key="4"><circle cx="34" cy="48" r="9" fill={c} fillOpacity=".4" stroke={ink} strokeWidth="1.5" /><circle cx="86" cy="32" r="9" fill={c} fillOpacity=".7" stroke={ink} strokeWidth="1.5" /><motion.path {...common} d="M44 46 C58 44 66 38 76 33 M70 31 L77 33 L73 39" strokeDasharray="3 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1 }} /></g>,
    // 5 · autonomia: bifurcação
    <g key="5"><path {...common} d="M60 66 V46 C60 38 40 36 34 22 M60 46 C60 38 80 36 86 22" /><circle cx="34" cy="20" r="4" fill={c} /><circle cx="86" cy="20" r="4" fill={c} fillOpacity=".4" stroke={ink} strokeWidth="1.2" /></g>,
    // 6 · recomeço: nascer do sol
    <g key="6"><path {...common} d="M20 56 H100 M30 62 H90 M42 68 H78" opacity=".45" /><motion.path d="M38 56 A22 22 0 0 1 82 56Z" fill={c} fillOpacity=".55" stroke={ink} strokeWidth="1.5" initial={{ y: 14, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1.1 }} />{[-50, -25, 0, 25, 50].map((a) => <path key={a} {...common} d={`M60 ${56 - 26} L60 ${56 - 32}`} transform={`rotate(${a} 60 56)`} opacity=".6" />)}</g>,
    // 7 · prazer: xícara com vapor
    <g key="7"><path {...common} d="M42 40 H78 V52 C78 62 70 66 60 66 C50 66 42 62 42 52Z" fill={c} fillOpacity=".4" /><path {...common} d="M78 44 C88 44 88 56 78 56" />{[50, 60, 70].map((x, k) => <motion.path key={x} {...common} d={`M${x} 34 C${x - 4} 28 ${x + 4} 24 ${x} 18`} animate={{ opacity: [0, 0.8, 0], y: [4, -4] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.5 }} />)}</g>,
    // 8 · metas: degraus e bandeira
    <g key="8"><path {...common} d="M22 66 H44 V54 H64 V42 H84 V30 H100" /><path {...common} d="M100 30 V16" /><motion.path d="M100 16 H112 L107 21 L112 26 H100Z" fill={c} stroke={ink} strokeWidth="1.2" animate={{ skewY: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} /></g>,
    // 9 · progresso: barras que crescem
    <g key="9">{[0, 1, 2, 3, 4].map((k) => <motion.rect key={k} x={26 + k * 16} width="9" rx="4.5" fill={c} fillOpacity={0.3 + k * 0.15} initial={{ height: 0, y: 66 }} whileInView={{ height: 12 + k * 9, y: 66 - (12 + k * 9) }} transition={{ delay: k * 0.12, type: "spring", stiffness: 140, damping: 16 }} />)}</g>,
  ];
  return (
    <svg viewBox="0 0 120 76" className="h-full w-full" aria-hidden>
      {art[i % art.length]}
    </svg>
  );
}

function PrincipleCard({ p, i }: { p: (typeof PRINCIPLES)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  const first = p.text.split(/(?<=\.)\s/)[0];
  return (
    <li className="overflow-hidden rounded-3xl border border-line">
      <div className="h-24" style={{ background: `color-mix(in srgb, var(--${ART_BG[i % ART_BG.length]}) 14%, transparent)` }}>
        <Art i={i} />
      </div>
      <div className="p-4">
        <h4 className="font-display text-lg leading-tight">{p.title}</h4>
        <p className="mt-1.5 text-[14px] leading-snug text-muted">{first}</p>
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="mt-1 min-h-11 text-[13px] underline underline-offset-2">
          {open ? "Menos" : "Saber mais"}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="text-[14px] leading-relaxed text-muted">{p.text.slice(first.length).trim()}</p>
              <p className="mt-2.5 text-[13px] leading-snug">{p.where}</p>
              <p className="mt-2 text-[12px] italic text-muted">{p.source}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

/** Tela "Sobre": imagem primeiro, pouco texto; a ciência fica em cartões que se abrem. */
export function AboutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={`Sobre o ${APP_NAME}`}>
      <div className="flex flex-col gap-7 pb-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <EnsoMark size={132} />
          <p className="font-display text-3xl">{APP_NAME}</p>
          <p className="text-sm text-muted">{APP_TAGLINE}</p>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => speakEnso("pt")} className="flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm">
              <span aria-hidden>🔊</span> Ên-sô
            </button>
            <button type="button" onClick={() => speakEnso("ja")} className="flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm text-muted">
              <span aria-hidden>🔊</span> 円相 · em japonês
            </button>
          </div>
        </div>

        <ul className="grid grid-cols-3 gap-2 text-center">
          {[
            { e: "🌱", t: "Mínimos possíveis" },
            { e: "🫶", t: "Recomeço sem culpa" },
            { e: "🔒", t: "Tudo no seu aparelho" },
          ].map((x) => (
            <li key={x.t} className="rounded-2xl bg-surface-2 px-2 py-4">
              <span className="text-3xl" aria-hidden>{x.e}</span>
              <span className="mt-2 block text-[13px] leading-tight">{x.t}</span>
            </li>
          ))}
        </ul>

        <p className="text-center text-[15px] leading-relaxed">
          Enso é o círculo zen feito num gesto só e deixado aberto. O recado: <b className="font-medium">constância sem rigidez</b>.
        </p>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm text-muted">A ciência por trás</h3>
          <ul className="flex flex-col gap-3">
            {PRINCIPLES.map((p, i) => (
              <PrincipleCard key={p.title} p={p} i={i} />
            ))}
          </ul>
          <p className="text-[12px] leading-snug text-muted">
            O {APP_NAME} é uma ferramenta de apoio e não substitui acompanhamento profissional.
          </p>
        </section>
      </div>
    </Sheet>
  );
}
