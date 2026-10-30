import type { HabitKind, VisualKey } from "./types";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Palavras-chave (sem acento) -> visual. A ordem importa: o primeiro grupo que casar vence. */
const NUMERIC: [RegExp, VisualKey][] = [
  [/academia|treino|musculacao|\bpeso|forca|flexao|abdominal|agachamento|crossfit|halter/, "weights"],
  [/corrida|correr|\bcorro|pedal|bike|bicicleta|ciclismo|natacao|nadar/, "track"],
  [/caminh|andar|passos|trilha|\bwalk/, "steps"],
  [/medit|respir|mindful|yoga|alongar|alongamento|orar|oracao|rezar/, "lotus"],
  [/agua|beber|hidrat|\bcha\b|suco/, "glass"],
  [/ler|leitura|livro|podcast/, "book"],
  [/estud|curso|faculdade|prova|concurso|projeto|carreira|tcc/, "mountain"],
  [/dorm|sono|deitar|descans/, "moon"],
  [/gratid|amor|famil|filh|namor|abrac|carinho|amizade|ligar para/, "heart"],
  [/foco|pomodoro|concentr|trabalho profundo|deep work/, "hourglass"],
  [/poup|econom|dinheiro|invest|reserva|guardar/, "jar"],
  [/escrev|diario|journal|texto|redacao/, "flame"],
  [/idioma|ingles|espanhol|frances|alemao|italiano|japones|plant|jardin|horta/, "plant"],
  [/tarefa|serie|rodada|repeti/, "beads"],
];

const CHECK: [RegExp, VisualKey][] = [
  [/remedio|vitamina|suplement|medicament|pilula|creatina|colageno/, "pill"],
  [/sem |nao |parar de|evitar|abstin|largar|fumar|cigarro|acucar|alcool|bebida|refrigerante|doce|redes sociais|rede social|celular|vicio/, "shield"],
  [/acord|cedo|amanhec|sol\b|madrugar/, "sunrise"],
  [/noite|luz apagada|desligar|desconect|antes de dormir/, "lamp"],
  [/organiz|arrum|limp|faxina|cama|louca|skin|rosto|banho|dentes|escov/, "sparkle"],
];

/** Sugere o melhor visual para o nome digitado (ou null se nada combinar). */
export function suggestVisual(name: string, kind: HabitKind): VisualKey | null {
  const n = norm(name.trim());
  if (n.length < 3) return null;
  const table = kind === "check" ? CHECK : NUMERIC;
  for (const [re, v] of table) if (re.test(n)) return v;
  return null;
}
