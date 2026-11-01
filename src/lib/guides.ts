export type Evidence = "forte" | "moderada" | "preliminar" | "debatida";

export type GuideCategory =
  | "Corpo e energia"
  | "Atenção e mente"
  | "Hábitos e motivação"
  | "Aprendizado"
  | "Emoções"
  | "Decisões e mentalidade";

export const GUIDE_CATEGORIES: GuideCategory[] = [
  "Corpo e energia",
  "Atenção e mente",
  "Hábitos e motivação",
  "Aprendizado",
  "Emoções",
  "Decisões e mentalidade",
];

export const EVIDENCE_LABEL: Record<Evidence, { name: string; hint: string }> = {
  forte: { name: "Evidência forte", hint: "Vários estudos e revisões convergem." },
  moderada: { name: "Evidência moderada", hint: "Bons estudos, mas com limites ou efeito pequeno." },
  preliminar: { name: "Evidência preliminar", hint: "Resultados promissores, ainda poucos estudos." },
  debatida: { name: "Tema debatido", hint: "A ideia é popular, mas a ciência discute os resultados." },
};

export interface Guide {
  id: string;
  category: GuideCategory;
  title: string;
  /** Uma linha que diz do que o guia trata. */
  subtitle: string;
  minutes: number; // tempo de leitura
  evidence: Evidence;
  /** A ideia central em uma ou duas frases. */
  tldr: string;
  /** "O que a ciência mostra": parágrafos curtos. */
  science: (string | { heading: string; text: string })[];
  /** Uma crença popular e o que se sabe de fato. */
  myth?: { claim: string; truth: string };
  /** "Como aplicar": passos práticos. */
  steps: { title: string; text: string }[];
  /** "Cuidados e limites". */
  limits: string[];
  /** Referências: Autor(es) (ano). Título. Veículo. */
  sources: (string | { cite: string; url?: string })[];
  /** Chave de um modelo de hábito (templates.ts) que coloca o guia em prática. */
  tryHabit?: string;
  /** Uma frase: onde isso aparece no app. */
  enso?: string;
}
