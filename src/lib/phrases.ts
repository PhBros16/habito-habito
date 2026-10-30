import type { Tone } from "./types";
import { CLASSICS, MORE } from "./phrases-more";

export type PhraseMoment =
  | "morning"
  | "afternoon"
  | "evening"
  | "done" // um hábito concluído
  | "allDone" // dia completo
  | "hardDay" // modo dia difícil
  | "returning" // voltando depois de dias sem fazer nada
  | "partial" // já fez alguma coisa hoje
  | "monday"
  | "sunday"
  | "monthStart"
  | "minimum" // chegou ao mínimo (mini hábito cumprido)
  | "ideal" // chegou ao ideal
  | "comeback"; // primeiro hábito feito após um dia em branco

export const TONE_LABEL: Record<Tone, { name: string; hint: string }> = {
  gentle: { name: "Gentil", hint: "Acolhedor, sem cobrança" },
  stoic: { name: "Estoico", hint: "Sereno e firme" },
  direct: { name: "Direto", hint: "Curto e objetivo" },
  humor: { name: "Leve", hint: "Com um sorriso" },
};

type BaseMoment = "morning" | "afternoon" | "evening" | "done" | "allDone" | "hardDay";

// Frases originais, escritas para o app (nenhuma é citação de terceiros).
const PHRASES: Record<Tone, Record<BaseMoment, string[]>> = {
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


// Contextos além do horário. Linguagem de apoio à autonomia ("se quiser", "dá pra"),
// elogio ao processo (não ao resultado) e autocompaixão: nada de culpa por faltas.
const EXTRA: Record<Tone, Partial<Record<PhraseMoment, string[]>>> = {
  gentle: {
    returning: [
      "Que bom te ver de volta. Recomeçar também é parte do caminho.",
      "Os dias passaram, e tudo bem. Vamos com o menor passo possível.",
      "Sem cobrança por ontem. Hoje só precisa de um começo pequeno.",
    ],
    partial: [
      "Você já começou, e começar é a parte mais difícil.",
      "Já tem coisa boa feita hoje. Siga se fizer sentido.",
      "Um passo dado. O resto pode vir no seu tempo.",
    ],
    monday: [
      "Semana nova, página em branco. Sem pressa de preencher.",
      "Segunda-feira: dá pra começar leve e ir ajustando.",
      "Uma semana inteira pela frente, um dia de cada vez.",
    ],
    sunday: [
      "Domingo é bom para olhar o que deu certo na semana.",
      "Dia de descanso e de se reconhecer pelo que fez.",
      "Fechando a semana com gentileza. Você apareceu mais do que pensa.",
    ],
    monthStart: [
      "Mês novo. Uma chance gentil de ajustar o que quiser.",
      "Começo de mês: nada a provar, só um novo ritmo a testar.",
      "Novo mês, mesmas pequenas escolhas, agora com mais prática.",
    ],
    minimum: [
      "O mínimo conta, e muito. Foi você aparecendo.",
      "Mínimo feito: o hábito está de pé. Se quiser mais, ótimo; se não, está ótimo.",
      "Aparecer já é o que constrói o hábito. Obrigado a você mesmo.",
    ],
    ideal: [
      "Foi além do mínimo, no seu tempo. Que bonito.",
      "Ideal alcançado. Repare como foi bom chegar aqui.",
      "Você se deu o melhor de hoje. Aproveite o gostinho.",
    ],
    comeback: [
      "Voltou! É assim que se constrói consistência de verdade.",
      "Recomeço feito com calma. É isso que importa.",
      "Depois de uma pausa, esse primeiro passo vale ouro.",
    ],
  },
  stoic: {
    returning: [
      "O que passou, passou. Hoje, um ato simples.",
      "Retomar é uma habilidade. Pratique-a agora.",
      "Não carregue os dias perdidos. Faça o próximo gesto.",
    ],
    partial: [
      "Já começou. Continue só enquanto fizer sentido.",
      "O esforço de hoje já está registrado. Siga com calma.",
      "O que está ao seu alcance, você já começou a fazer.",
    ],
    monday: [
      "Nova semana. Foque no que depende de você.",
      "Segunda-feira é só um dia, com as mesmas pequenas escolhas.",
      "Comece sem expectativa, termine com um passo feito.",
    ],
    sunday: [
      "Olhe a semana sem julgar. Aprenda e siga.",
      "Domingo: revise com serenidade o que o esforço construiu.",
      "Descanse. O hábito está sendo moldado mesmo quando você pausa.",
    ],
    monthStart: [
      "Novo mês. Ajuste o rumo sem drama.",
      "Mês novo é só uma data útil para recomeçar com clareza.",
      "Escolha o que importa neste mês e deixe o resto de lado.",
    ],
    minimum: [
      "Mínimo cumprido. A constância nasce de gestos assim.",
      "Pouco, mas feito. Isso pesa mais que o muito prometido.",
      "O mínimo é o chão firme. Daqui, só você decide mais.",
    ],
    ideal: [
      "Ideal feito. O esforço foi seu, ninguém fez por você.",
      "Você foi além. Guarde a lição, não a vaidade.",
      "Disciplina em ato. Siga com a mesma serenidade.",
    ],
    comeback: [
      "Retomou. É o que separa quem constrói de quem desiste.",
      "O primeiro passo depois da pausa é o mais valioso.",
      "Voltar sem alarde. Assim se forma o caráter do hábito.",
    ],
  },
  direct: {
    returning: [
      "Voltou. Faça o mínimo agora, sem ritual.",
      "Passou. Hoje: um hábito, o menor.",
      "Recomece pelo mais fácil.",
    ],
    partial: [
      "Já começou. Mais um?",
      "Em andamento. Bom ritmo.",
      "Primeiro passo dado.",
    ],
    monday: ["Segunda. Um hábito de cada vez.", "Semana nova. Comece pequeno.", "Segunda: o mínimo já vale."],
    sunday: ["Domingo. Olhe a semana e siga.", "Fechamento: o que funcionou?", "Descanse e ajuste."],
    monthStart: ["Mês novo. Ajuste o que não funciona.", "Dia 1. Simples assim.", "Novo mês, mesma meta: aparecer."],
    minimum: ["Mínimo feito. Hábito mantido.", "Feito. Pode parar ou seguir.", "Mínimo: check."],
    ideal: ["Ideal feito. Forte.", "Foi além. Anote o que ajudou.", "Ideal: check."],
    comeback: ["De volta. É isso.", "Retomou. Siga.", "Voltou ao jogo."],
  },
  humor: {
    returning: [
      "Sumiu, hein? Brincadeira, bem-vindo de volta!",
      "Os hábitos sentiram saudade. Dê um oizinho pra eles.",
      "Recomeço oficial. Ninguém viu nada do passado.",
    ],
    partial: [
      "Já aqueceu os motores. Bora?",
      "Começou bem. Os hábitos estão de olho, orgulhosos.",
      "Um já foi. Os outros estão ansiosos.",
    ],
    monday: [
      "Segunda-feira: sim, ela existe. Vamos de mínimo.",
      "Semana nova, desculpas novas... ou hábitos novos!",
      "Segunda, mas com cara de oportunidade.",
    ],
    sunday: [
      "Domingo: modo balanço, sem boleto.",
      "Fim de semana. Os hábitos aceitam café e carinho.",
      "Hora de olhar a semana e se dar um joinha.",
    ],
    monthStart: [
      "Mês novo, saldo zerado de culpa.",
      "Dia 1: a melhor desculpa pra recomeçar.",
      "Mês novo. Sem pressão, com biscoito.",
    ],
    minimum: [
      "Mínimo no bolso. Dá até pra comemorar.",
      "Feito o mínimo. O sofá que espere.",
      "Pouquinho que vale muito. Ponto pra você.",
    ],
    ideal: [
      "Ideal! Quem é você e o que fez com a preguiça?",
      "Foi além. Pode se achar, só um tiquinho.",
      "Ideal feito. Os hábitos pediram para dizer 'uau'.",
    ],
    comeback: [
      "Voltou! Aplausos discretos, mas sinceros.",
      "Primeiro hábito pós-pausa: lendário.",
      "O retorno do herói. Trilha sonora imaginária ligada.",
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

function listOf(tone: Tone, moment: PhraseMoment): string[] {
  const base = (PHRASES[tone] as Partial<Record<PhraseMoment, string[]>>)[moment] ?? [];
  const extra = EXTRA[tone][moment] ?? [];
  const more = MORE[tone][moment] ?? [];
  const classics = CLASSICS.filter((c) => c.moments.includes(moment) && c.tones.includes(tone)).map((c) => `${c.text} (${c.by})`);
  const all = [...base, ...extra, ...more, ...classics];
  return all.length ? all : PHRASES[tone].morning;
}

/** Quantas frases existem no total (para o "Sobre" e os testes). */
export function phraseCount(): number {
  const tones = Object.keys(PHRASES) as Tone[];
  const moments = new Set<PhraseMoment>(["morning", "afternoon", "evening", "done", "allDone", "hardDay", "returning", "partial", "monday", "sunday", "monthStart", "minimum", "ideal", "comeback"]);
  let n = 0;
  for (const t of tones) for (const m of moments) n += new Set(listOf(t, m)).size;
  return n;
}

/** Frase estável para a mesma data/momento (não muda a cada render). */
export function phraseFor(tone: Tone, moment: PhraseMoment, seed: string): string {
  const list = listOf(tone, moment);
  return list[hash(`${tone}:${moment}:${seed}`) % list.length];
}

const MEMORY_KEY = "enso:phrases";
const MEMORY_SIZE = 3;

function readMemory(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Frase aleatória para eventos; evita repetir as últimas mostradas. */
export function randomPhrase(tone: Tone, moment: PhraseMoment): string {
  const list = listOf(tone, moment);
  const key = `${tone}:${moment}`;
  const mem = readMemory();
  const recent = mem[key] ?? [];
  const fresh = list.filter((p) => !recent.includes(p));
  const pool = fresh.length ? fresh : list;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  try {
    mem[key] = [pick, ...recent].slice(0, Math.min(MEMORY_SIZE, list.length - 1));
    localStorage.setItem(MEMORY_KEY, JSON.stringify(mem));
  } catch {
    /* sem memória: tudo bem */
  }
  return pick;
}
