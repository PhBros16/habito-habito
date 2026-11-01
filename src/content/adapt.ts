import type { Article, CategoryId, Evidence as ArticleEvidence } from "./types";
import type { Evidence, Guide, GuideCategory } from "@/lib/guides";

const CATEGORY: Record<CategoryId, GuideCategory> = {
  habitos: "Hábitos e motivação",
  memoria: "Aprendizado",
  mente: "Atenção e mente",
  decisoes: "Decisões e mentalidade",
  emocoes: "Emoções",
  corpo: "Corpo e energia",
};

const EVIDENCE: Record<ArticleEvidence, Evidence> = {
  forte: "forte",
  moderada: "moderada",
  mista: "debatida",
  inicial: "preliminar",
};

const firstSentence = (s: string) => {
  const m = s.match(/^[^.?!]+[.?!]/);
  return (m ? m[0] : s).trim();
};

/** Converte um artigo do formato de conteúdo para o formato de guia exibido na aba Aprender. */
export function articleToGuide(a: Article): Guide {
  return {
    id: a.id,
    category: CATEGORY[a.category],
    title: a.title,
    subtitle: firstSentence(a.hook),
    minutes: a.minutes,
    evidence: EVIDENCE[a.evidence],
    tldr: a.tldr,
    science: a.science.map((b) => ({ heading: b.heading, text: b.text })),
    myth: a.myth ? { claim: a.myth.claim, truth: a.myth.reality } : undefined,
    steps: a.practice,
    limits: [a.evidenceNote],
    sources: a.sources,
    enso: a.enso,
  };
}
