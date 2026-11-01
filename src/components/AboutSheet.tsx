"use client";

import { motion } from "motion/react";
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

/** Tela "Sobre": o conceito do app, o motivo do nome e a ciência por trás. */
export function AboutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={`Sobre o ${APP_NAME}`}>
      <div className="flex flex-col gap-7 pb-2">
        <div className="flex flex-col items-center gap-3 pt-1 text-center">
          <svg viewBox="0 0 120 120" width="120" height="120" aria-label="Círculo enso, desenhado em um só gesto" role="img">
            <motion.path
              d="M60 14 C 90 12, 108 36, 104 62 C 100 90, 74 108, 48 102 C 24 96, 10 74, 16 50 C 20 34, 32 22, 48 17"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <p className="font-display text-2xl">{APP_NAME}</p>
          <p className="text-sm text-muted">{APP_TAGLINE}</p>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm text-muted">A ideia</h3>
          <p className="text-[15px] leading-relaxed">
            O {APP_NAME} é um app de hábitos feito para quem já se cobrou demais. Em vez de sequências que viram
            pressão, ele trabalha com mínimos possíveis, dias difíceis, pausas planejadas e recomeços sem culpa.
            Você acompanha o que importa, vê seu progresso com honestidade e cresce no seu ritmo.
          </p>
          <p className="text-[15px] leading-relaxed">
            Tudo fica no seu aparelho: sem conta, sem servidor, sem anúncios.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-sm text-muted">Por que &ldquo;{APP_NAME}&rdquo;</h3>
          <p className="text-[15px] leading-relaxed">
            Enso (円相) é o círculo da caligrafia zen, desenhado num único gesto e quase sempre deixado levemente
            aberto. A abertura lembra que a imperfeição é aceita: o hábito não precisa ser perfeito, só precisa
            continuar. O círculo que você viu se desenhando acima é a imagem do app: constância sem rigidez.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm text-muted">A ciência por trás</h3>
          <p className="text-[13px] leading-snug text-muted">
            Cada decisão do app tem uma razão na pesquisa sobre hábitos. Para cada princípio, você vê onde ele aparece
            no app e a fonte para conferir. Os guias da aba Aprender aprofundam vários deles.
          </p>
          <ul className="flex flex-col gap-3">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="rounded-2xl border border-line p-4">
                <h4 className="font-display text-lg leading-tight">{p.title}</h4>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{p.text}</p>
                <p className="mt-2.5 text-[13px] leading-snug">{p.where}</p>
                <p className="mt-2 text-[12px] italic text-muted">{p.source}</p>
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-snug text-muted">
            O {APP_NAME} é uma ferramenta de apoio e não substitui acompanhamento profissional. Se você está
            passando por um momento muito pesado, conversar com alguém de confiança ou com um profissional de
            saúde pode ajudar.
          </p>
        </section>
      </div>
    </Sheet>
  );
}
