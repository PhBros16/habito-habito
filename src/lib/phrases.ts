import type { Tone } from "./types";

export type PhraseMoment =
  | "morning"
  | "afternoon"
  | "evening"
  | "done" // um hábito concluído
  | "allDone" // dia completo
  | "hardDay"; // modo dia difícil

export const TONE_LABEL: Record<Tone, { name: string; hint: string }> = {
  gentle: { name: "Gentil", hint: "Acolhedor, sem cobrança" },
  stoic: { name: "Estoico", hint: "Sereno e firme" },
  direct: { name: "Direto", hint: "Curto e objetivo" },
  humor: { name: "Leve", hint: "Com um sorriso" },
};

// Frases originais, escritas para o app (nenhuma é citação de terceiros).
const PHRASES: Record<Tone, Record<PhraseMoment, string[]>> = {
  gentle: {
    morning: [
      "Um dia novo, sem pressa. Comece pelo menor passo.",
      "Hoje basta ir no seu ritmo.",
      "Respire fundo. O dia cabe em pequenas escolhas.",
    ],
    afternoon: [
      "Ainda há muito dia pela frente. Sem pressão.",
      "Uma pausa também faz parte do caminho.",
      "O que já foi feito conta. De verdade.",
    ],
    evening: [
      "O dia está terminando. Você fez o que pôde, e isso é suficiente.",
      "Hora de desacelerar. Amanhã o ritmo recomeça.",
      "Agradeça por um pequeno passo que deu hoje.",
    ],
    done: [
      "Bonito. Um passo de cada vez.",
      "Feito com calma. Isso importa.",
      "Mais um gesto de cuidado com você.",
    ],
    allDone: [
      "Dia completo. Respire e aproveite essa leveza.",
      "Tudo no lugar. Você merece esse descanso.",
      "Que dia bem cuidado. Obrigado por aparecer.",
    ],
    hardDay: [
      "Hoje o mínimo basta. Cuidar de você já é o suficiente.",
      "Dia pesado? Fique só com o essencial. Está tudo bem.",
      "Sem cobrança hoje. Um pequeno gesto já vale muito.",
    ],
  },
  stoic: {
    morning: [
      "O dia começa agora. Faça bem o que está ao seu alcance.",
      "Não controle o dia inteiro. Controle o próximo gesto.",
      "Constância é construída em manhãs comuns como esta.",
    ],
    afternoon: [
      "Metade do dia já passou. Use bem a outra metade.",
      "O que depende de você é pouco, e é o bastante.",
      "Faça o próximo passo, sem esperar vontade.",
    ],
    evening: [
      "Revise o dia sem julgar. Apenas aprenda.",
      "Encerrar bem também é uma disciplina.",
      "O que ficou para trás, deixe. Amanhã é outro treino.",
    ],
    done: [
      "Feito. Siga.",
      "Mais um tijolo no hábito.",
      "A disciplina é silenciosa. Bom trabalho.",
    ],
    allDone: [
      "O dia cumprido. Descanse sem culpa.",
      "Você fez a sua parte. O resto não é seu peso.",
      "Constância vence intensidade. Mais um dia provando isso.",
    ],
    hardDay: [
      "Em dias difíceis, a regra é simples: o essencial.",
      "Adapte-se ao dia. Fazer menos ainda é fazer.",
      "Reduza o escopo, mantenha o hábito.",
    ],
  },
  direct: {
    morning: ["Comece pelo mais fácil.", "Um hábito agora e o dia engrena.", "Sem negociar: o primeiro passo."],
    afternoon: ["Ainda dá tempo.", "Faça um agora.", "Pouco e feito vale mais que muito e adiado."],
    evening: ["Feche o dia: o mínimo ainda conta.", "Falta pouco. Termine.", "Amanhã recomeça. Hoje, finalize."],
    done: ["Feito.", "Marcado. Próximo.", "Boa."],
    allDone: ["Dia fechado.", "Tudo feito. Descanse.", "100% hoje."],
    hardDay: ["Só o essencial hoje.", "Mínimo e pronto.", "Dia difícil: reduza e siga."],
  },
  humor: {
    morning: [
      "Bom dia! Seu eu do futuro já agradece.",
      "O café pode esperar um copo d'água.",
      "Hoje é um ótimo dia para ser levemente impressionante.",
    ],
    afternoon: [
      "Aquele hábito não vai se fazer sozinho, mas a gente ajuda.",
      "Ainda dá tempo de parecer muito organizado.",
      "Meio do dia: perfeito para uma pequena vitória.",
    ],
    evening: [
      "Última chance de ser lendário hoje (opcional).",
      "O sofá está chamando, mas um hábito rapidinho ainda cabe.",
      "Fechando o expediente das boas ações.",
    ],
    done: [
      "Olha só quem apareceu!",
      "Mais um para a coleção.",
      "Impressionante. Quase suspeito de tão bom.",
    ],
    allDone: [
      "Dia 100%! Pode se achar um pouquinho.",
      "Tudo feito. Merece um biscoito simbólico.",
      "Missão cumprida. Os hábitos estão orgulhosos.",
    ],
    hardDay: [
      "Dia difícil? Hoje o mínimo é herói.",
      "Modo econômico ativado. Sem julgamentos.",
      "Fazer pouco hoje é estratégia, não preguiça.",
    ],
  },
};

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Frase estável para a mesma data/momento (não muda a cada render). */
export function phraseFor(tone: Tone, moment: PhraseMoment, seed: string): string {
  const list = PHRASES[tone][moment];
  return list[hash(`${tone}:${moment}:${seed}`) % list.length];
}

/** Frase aleatória para eventos (ao concluir algo). */
export function randomPhrase(tone: Tone, moment: PhraseMoment): string {
  const list = PHRASES[tone][moment];
  return list[Math.floor(Math.random() * list.length)];
}
