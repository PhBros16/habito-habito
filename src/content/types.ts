export type CategoryId = "corpo" | "mente" | "memoria" | "habitos" | "emocoes" | "decisoes";

export const CATEGORIES: { id: CategoryId; name: string; hint: string }[] = [
  { id: "habitos", name: "Hábitos e motivação", hint: "Como o comportamento se forma e se sustenta" },
  { id: "memoria", name: "Aprender e lembrar", hint: "Memória, estudo e neuroplasticidade" },
  { id: "mente", name: "Atenção e percepção", hint: "Como o cérebro interpreta o mundo" },
  { id: "decisoes", name: "Decisões e vieses", hint: "Pensar melhor e escolher melhor" },
  { id: "emocoes", name: "Emoções e estresse", hint: "Regular o que sente sem brigar com isso" },
  { id: "corpo", name: "Corpo e energia", hint: "Sono, meditação e a base física" },
];

export type Evidence = "forte" | "moderada" | "mista" | "inicial";

export interface Article {
  id: string; // kebab-case, sem acento
  title: string;
  category: CategoryId;
  minutes: number; // tempo de leitura estimado
  hook: string; // 1-2 frases: por que isso importa na vida real
  tldr: string; // a ideia em uma frase
  science: { heading: string; text: string }[]; // 3 a 4 blocos curtos
  myth?: { claim: string; reality: string }; // um equívoco popular, quando houver
  practice: { title: string; text: string }[]; // 3 a 5 passos concretos
  evidence: Evidence;
  evidenceNote: string; // 1-2 frases honestas: o que é sólido e o que ainda é debatido
  sources: { cite: string; url?: string }[]; // SÓ fontes verificadas
  enso?: string; // 1 frase: como usar no app (opcional)
}
