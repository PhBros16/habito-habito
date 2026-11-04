import type { Profile } from "./types";

export const GOAL_CHIPS = [
  { id: "saude", label: "Cuidar da saúde", emoji: "🌿" },
  { id: "foco", label: "Estudar e ter foco", emoji: "🎯" },
  { id: "calma", label: "Ter mais calma", emoji: "🪷" },
  { id: "rotina", label: "Organizar a rotina", emoji: "🧭" },
  { id: "disciplina", label: "Ter mais disciplina", emoji: "🔥" },
];

export const FUTURE_CHIPS = [
  "Alguém que cuida de si",
  "Alguém que termina o que começa",
  "Alguém em paz com o próprio ritmo",
];

/** Primeiros mini-hábitos sugeridos por objetivo (todos cabem em um minuto). */
export const FIRST_STEPS: Record<string, { name: string; emoji: string }[]> = {
  saude: [
    { name: "Beber um copo d'água ao acordar", emoji: "💧" },
    { name: "Alongar por um minuto", emoji: "🤸" },
    { name: "Caminhar 5 minutos", emoji: "🚶" },
  ],
  foco: [
    { name: "Ler uma página", emoji: "📖" },
    { name: "Estudar 5 minutos", emoji: "🎓" },
    { name: "Escolher a tarefa mais importante", emoji: "🎯" },
  ],
  calma: [
    { name: "Respirar fundo três vezes", emoji: "🪷" },
    { name: "Meditar por um minuto", emoji: "🧘" },
    { name: "Escrever uma linha sobre o dia", emoji: "✍️" },
  ],
  rotina: [
    { name: "Arrumar a cama", emoji: "🛏️" },
    { name: "Separar a roupa de amanhã", emoji: "👕" },
    { name: "Planejar o dia em uma frase", emoji: "📝" },
  ],
  disciplina: [
    { name: "Fazer a tarefa mais chata por 2 minutos", emoji: "🔥" },
    { name: "Fazer uma flexão", emoji: "💪" },
    { name: "Deixar o celular longe por 10 minutos", emoji: "📵" },
  ],
};

export const SLOT_ANCHOR: Record<Profile["slot"], string> = {
  manha: "Depois do café da manhã",
  tarde: "Depois do almoço",
  noite: "Antes de dormir",
  varia: "",
};

/** "Alguém que cuida de si" -> "Sou alguém que cuida de si." */
export function identityFrom(future: string): string {
  const t = future.trim().replace(/[.!]+$/, "");
  if (!t) return "";
  const low = t.charAt(0).toLowerCase() + t.slice(1);
  return /^(sou|alguém|alguem)/i.test(low) ? `Sou ${low.replace(/^sou /i, "")}.` : `Sou ${low}.`;
}

/** Frases que citam o que a pessoa contou; o tom é leve e nunca cobra. */
export function profileLines(p: Profile): string[] {
  const goal = p.goal.trim().replace(/[.!]+$/, "").toLowerCase();
  const future = p.future.trim().replace(/[.!]+$/, "");
  const lines: string[] = [];
  if (goal) {
    lines.push(`Você veio para ${goal}. Um passo pequeno hoje já conta.`);
    lines.push(`Lembrete amigo: ${goal} se faz em dias comuns, não em dias heroicos.`);
  }
  if (future) {
    lines.push(`Daqui a um ano: ${future.charAt(0).toLowerCase() + future.slice(1)}. Hoje é um tijolinho disso.`);
    lines.push(`Quem vira ${future.charAt(0).toLowerCase() + future.slice(1)} começa por ações pequenas como a de hoje.`);
  }
  if (p.slot === "manha") lines.push("Você disse que as manhãs respiram. Que tal começar por elas?");
  if (p.slot === "noite") lines.push("A noite é o seu momento. Fechar o dia com um passo pequeno já vale.");
  if (p.slot === "tarde") lines.push("A tarde é a sua janela. Aproveite-a sem pressa.");
  return lines;
}

/** Uma linha do perfil, estável durante o dia. */
export function profileLine(p: Profile | undefined, seed: string): string | null {
  if (!p) return null;
  const lines = profileLines(p);
  if (!lines.length) return null;
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lines[h % lines.length];
}
