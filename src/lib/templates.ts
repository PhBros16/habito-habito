import type { Habit } from "./types";

export type HabitTemplate = Omit<Habit, "id" | "createdAt" | "order">;

export const TEMPLATES: { key: string; blurb: string; habit: HabitTemplate }[] = [
  {
    key: "agua",
    blurb: "O copo que enche a cada gole",
    habit: {
      name: "Água",
      kind: "counter",
      accent: "water",
      visual: "glass",
      unit: "copos",
      minimum: 4,
      target: 8,
      identity: "Sou alguém que cuida do próprio corpo.",
      essential: true,
    },
  },
  {
    key: "leitura",
    blurb: "Páginas que se acumulam",
    habit: {
      name: "Leitura",
      kind: "progress",
      accent: "sand",
      visual: "book",
      unit: "páginas",
      minimum: 1,
      target: 20,
      identity: "Sou alguém que lê todo dia.",
      essential: false,
    },
  },
  {
    key: "meditar",
    blurb: "Um selo para cada nível",
    habit: {
      name: "Respirar",
      kind: "check",
      accent: "lilac",
      unit: "",
      minimum: 1,
      target: 2,
      minLabel: "1 minuto",
      idealLabel: "10 minutos",
      identity: "Sou alguém que encontra calma.",
      essential: true,
    },
  },
  {
    key: "movimento",
    blurb: "Do alongamento ao treino completo",
    habit: {
      name: "Movimento",
      kind: "check",
      accent: "clay",
      unit: "",
      minimum: 1,
      target: 2,
      minLabel: "Alongar 5 min",
      idealLabel: "Treino completo",
      identity: "Sou alguém que se move todo dia.",
      essential: false,
    },
  },
  {
    key: "cama",
    blurb: "Simples: feito ou não",
    habit: {
      name: "Arrumar a cama",
      kind: "check",
      accent: "sage",
      unit: "",
      minimum: 1,
      target: 1,
      identity: "Sou alguém que começa o dia com ordem.",
      essential: false,
    },
  },
  {
    key: "estudo",
    blurb: "Minutos de foco acumulados",
    habit: {
      name: "Estudo",
      kind: "progress",
      accent: "sun",
      visual: "ring",
      unit: "min",
      minimum: 10,
      target: 45,
      identity: "Sou alguém que aprende sempre.",
      essential: false,
    },
  },
];

/** Hábitos iniciais para o app não abrir vazio. */
export const SEED_KEYS = ["agua", "leitura", "meditar"];
