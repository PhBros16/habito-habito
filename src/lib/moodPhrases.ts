import type { Mood, Tone } from "./types";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Frase de apoio para um dia, conforme o humor registrado. Nada de positividade forçada. */
const DAY: Record<Tone, Record<Mood, string[]>> = {
  gentle: {
    1: ["Dia muito pesado. Você registrou mesmo assim, e isso já é cuidado.", "Sentir isso é humano. Hoje, só o necessário já basta.", "Se puder, descanse e peça apoio. Você não precisa dar conta de tudo."],
    2: ["Um dia mais difícil. Ele não define o seu caminho.", "Foi pesado, e tudo bem. Amanhã é outra página.", "Você passou por ele. Isso conta."],
    3: ["Um dia no meio do caminho. Também faz parte.", "Nem alto, nem baixo: um dia comum, e dias comuns constroem hábitos.", "Estável já é uma boa base."],
    4: ["Um bom dia. Vale notar o que ajudou.", "Que bom. Guarde na memória o que fez bem hoje.", "Dia leve. Aproveite sem pressa."],
    5: ["Um dia ótimo. Reparar nele ajuda a repetir o que funcionou.", "Que dia bom! Aproveite e agradeça a si mesmo.", "Dia cheio de luz. Isso também é seu."],
  },
  stoic: {
    1: ["Dia duro. Faça o que está ao seu alcance e deixe o resto passar.", "O que sente agora passa. O que você escolhe fazer fica.", "Nos dias pesados, o mínimo é suficiente."],
    2: ["Um dia difícil. Observe sem se julgar.", "Dificuldade é treino. Amanhã você começa com mais clareza.", "Passou. O próximo gesto está nas suas mãos."],
    3: ["Dia neutro. Constância se faz de dias assim.", "Sem euforia e sem queda: bom terreno para trabalhar.", "Serenidade também é um resultado."],
    4: ["Bom dia. Note o que o sustentou.", "Aproveite com gratidão, sem se apegar.", "Boa fase. Use-a para fortalecer o que importa."],
    5: ["Um dia excelente. Registre o que o tornou possível.", "Ótimo. Que isso reforce, e não substitua, a disciplina.", "Dia pleno. Agradeça e siga."],
  },
  direct: {
    1: ["Dia muito ruim. Faça só o mínimo e descanse.", "Pesado. Sem cobrança hoje.", "Registrado. Cuide de você."],
    2: ["Dia difícil. Passa.", "Foi ruim, mas acabou.", "Amanhã recomeça."],
    3: ["Dia neutro. Normal.", "Meio a meio. Segue.", "Estável."],
    4: ["Bom dia. Anote o que ajudou.", "Dia bom. Repita o que deu certo.", "Boa."],
    5: ["Dia ótimo. Veja o que funcionou.", "Excelente. Registre o porquê.", "Dia top."],
  },
  humor: {
    1: ["Dia daqueles. Abraço virtual e cobertor.", "Hoje o mínimo é medalha de ouro.", "Foi pesado. Amanhã a gente tenta de novo, sem pressa."],
    2: ["Dia meio ruim. Já já passa.", "Não foi dos melhores, mas você está aqui.", "Dia difícil não ganha de você em dois."],
    3: ["Dia mais ou menos. Também vale.", "Nem pra cima, nem pra baixo: modo equilibrado.", "Um dia normal, que raridade boa."],
    4: ["Dia bom! Anota a receita.", "Que bom! O dia merece um joinha.", "Gostei desse dia."],
    5: ["Dia dez! Pode sorrir.", "Dia incrível. Guarde esse para os dias nublados.", "Dia de ouro. Aproveita!"],
  },
};

export function dayPhrase(tone: Tone, mood: Mood, seed: string): string {
  const list = DAY[tone][mood];
  return list[hash(`${tone}:${mood}:${seed}`) % list.length];
}

export type MonthKind = "sparse" | "heavy" | "steady" | "bright" | "rising" | "falling";

const MONTH: Record<Tone, Record<MonthKind, string[]>> = {
  gentle: {
    sparse: ["Ainda há poucos registros. Quando quiser, um toque por dia já desenha o quadro."],
    heavy: ["Foi um mês pesado, e você seguiu registrando. Isso é cuidado, não fraqueza. Vale conversar com alguém de confiança se continuar assim."],
    steady: ["Um mês de altos e baixos, como a vida. O que se repete nos dias bons pode virar uma pista."],
    bright: ["Foi um mês de bons dias. Repare o que se repetiu neles: provavelmente é o que te faz bem."],
    rising: ["Seu humor foi melhorando ao longo do mês. Parece que algo que você está fazendo ajuda."],
    falling: ["O fim do mês foi mais pesado que o começo. Se puder, comece o próximo com um pouco mais de descanso."],
  },
  stoic: {
    sparse: ["Poucos registros ainda. Observar-se com regularidade é o primeiro passo."],
    heavy: ["Um mês duro. Você seguiu mesmo assim. Se o peso persistir, procure apoio profissional."],
    steady: ["Mês de variações naturais. Procure o padrão, não o dia isolado."],
    bright: ["Mês bom. Reconheça o que o sustentou e preserve isso."],
    rising: ["A tendência foi de melhora. Mantenha o que mudou."],
    falling: ["A tendência foi de queda. Reveja sono, descanso e carga antes de ajustar o resto."],
  },
  direct: {
    sparse: ["Poucos registros. Um toque por dia basta."],
    heavy: ["Mês pesado. Se persistir, busque apoio profissional."],
    steady: ["Mês misto. Veja o que se repete nos dias bons."],
    bright: ["Mês bom. Mantenha o que funciona."],
    rising: ["Humor subiu ao longo do mês."],
    falling: ["Humor caiu no fim do mês. Reveja sono e descanso."],
  },
  humor: {
    sparse: ["Poucos registros. Um toquinho por dia e o gráfico fica lindo."],
    heavy: ["Mês pesado, hein? Você aparecer aqui já é vitória. Se continuar assim, vale um papo com um profissional."],
    steady: ["Mês de montanha-russa suave. Procure o que se repete nos dias bons."],
    bright: ["Mês de bons ventos! Anota a receita."],
    rising: ["O mês foi melhorando. Seja lá o que você está fazendo, continue."],
    falling: ["O fim do mês pesou mais. Um bom descanso resolve muita coisa."],
  },
};

export function monthPhrase(tone: Tone, kind: MonthKind, seed: string): string {
  const list = MONTH[tone][kind];
  return list[hash(`${tone}:${kind}:${seed}`) % list.length];
}
