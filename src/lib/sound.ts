"use client";

/**
 * Sons de feedback sintetizados com Web Audio (sem arquivos, sem licença, offline).
 * Tudo bem baixinho: a intenção é textura, não alerta.
 */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): { ac: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return { ac: ctx, out: master! };
}

function blip(
  freq: number,
  at: number,
  dur: number,
  opts: { type?: OscillatorType; gain?: number; to?: number } = {}
) {
  const a = audio();
  if (!a) return;
  const { ac, out } = a;
  const { type = "sine", gain = 0.12, to } = opts;
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(at: number, dur: number, opts: { freq: number; to?: number; q?: number; gain?: number }) {
  const a = audio();
  if (!a) return;
  const { ac, out } = a;
  const t = ac.currentTime + at;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = opts.q ?? 1.2;
  filter.frequency.setValueAtTime(opts.freq, t);
  if (opts.to) filter.frequency.exponentialRampToValueAtTime(opts.to, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.1, t + dur * 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(t);
}

export type SoundName =
  | "plink"
  | "drain"
  | "stamp"
  | "stamp2"
  | "unstamp"
  | "page"
  | "pageBack"
  | "tick"
  | "pop"
  | "chime"
  | "ebb"
  | "coin"
  | "coinOut"
  | "clack"
  | "unclack"
  | "twinkle"
  | "whoosh"
  | "snuff"
  | "step"
  | "unstep"
  | "sand"
  | "sandBack"
  | "grow"
  | "wilt"
  | "beat"
  | "sunrise"
  | "sunset"
  | "lampOn"
  | "lampOff";

const SOUNDS: Record<SoundName, () => void> = {
  // gota d'água
  plink: () => {
    blip(520, 0, 0.16, { to: 940, gain: 0.11 });
    blip(780, 0.07, 0.18, { to: 1180, gain: 0.06 });
  },
  drain: () => blip(620, 0, 0.18, { to: 300, gain: 0.07 }),
  // carimbo: baque grave + textura
  stamp: () => {
    blip(150, 0, 0.2, { to: 60, gain: 0.2 });
    noise(0, 0.08, { freq: 900, q: 0.8, gain: 0.07 });
  },
  stamp2: () => {
    blip(150, 0, 0.22, { to: 55, gain: 0.22 });
    noise(0, 0.08, { freq: 900, q: 0.8, gain: 0.08 });
    blip(659, 0.1, 0.5, { gain: 0.07 });
    blip(988, 0.18, 0.6, { gain: 0.05 });
  },
  unstamp: () => blip(300, 0, 0.14, { to: 160, gain: 0.07 }),
  // folha virando
  page: () => noise(0, 0.22, { freq: 1200, to: 3800, q: 0.9, gain: 0.09 }),
  // folha voltando
  pageBack: () => noise(0, 0.2, { freq: 3800, to: 1200, q: 0.9, gain: 0.08 }),
  tick: () => blip(900, 0, 0.05, { type: "triangle", gain: 0.06 }),
  // descida suave genérica (remover/diminuir)
  ebb: () => {
    blip(520, 0, 0.16, { to: 250, gain: 0.07 });
    blip(390, 0.06, 0.14, { to: 200, gain: 0.04 });
  },
  // moeda no pote / moeda saindo
  coin: () => {
    blip(1568, 0, 0.09, { type: "triangle", gain: 0.07 });
    blip(2093, 0.07, 0.22, { type: "triangle", gain: 0.06 });
  },
  coinOut: () => {
    blip(1760, 0, 0.08, { type: "triangle", gain: 0.05, to: 1100 });
    blip(1320, 0.06, 0.12, { type: "triangle", gain: 0.04, to: 800 });
  },
  // anilha encaixando / saindo
  clack: () => {
    noise(0, 0.06, { freq: 2400, q: 1.5, gain: 0.1 });
    blip(180, 0, 0.12, { to: 110, gain: 0.12 });
  },
  unclack: () => {
    blip(220, 0, 0.1, { to: 140, gain: 0.07 });
    noise(0.03, 0.05, { freq: 1800, q: 1.4, gain: 0.05 });
  },
  // estrela surgindo
  twinkle: () => {
    blip(1480, 0, 0.3, { gain: 0.06 });
    blip(1976, 0.08, 0.35, { gain: 0.045 });
  },
  // chama crescendo / apagando
  whoosh: () => noise(0, 0.32, { freq: 260, to: 1500, q: 0.6, gain: 0.09 }),
  snuff: () => noise(0, 0.28, { freq: 1500, to: 240, q: 0.6, gain: 0.07 }),
  // passo suave / passo desfeito
  step: () => {
    blip(150, 0, 0.09, { to: 85, gain: 0.13 });
    noise(0, 0.05, { freq: 500, q: 0.8, gain: 0.05 });
  },
  unstep: () => blip(210, 0, 0.08, { to: 140, gain: 0.06 }),
  // areia caindo / voltando
  sand: () => noise(0, 0.38, { freq: 3200, to: 5200, q: 0.5, gain: 0.05 }),
  sandBack: () => noise(0, 0.34, { freq: 5200, to: 2600, q: 0.5, gain: 0.045 }),
  // planta crescendo / murchando
  grow: () => {
    blip(330, 0, 0.22, { to: 520, gain: 0.07 });
    blip(660, 0.1, 0.2, { to: 880, gain: 0.04 });
  },
  wilt: () => blip(440, 0, 0.24, { to: 200, gain: 0.05 }),
  // batida de coração
  beat: () => {
    blip(95, 0, 0.12, { to: 60, gain: 0.17 });
    blip(95, 0.15, 0.14, { to: 55, gain: 0.12 });
  },
  // nascer do sol / pôr do sol
  sunrise: () => {
    blip(392, 0, 0.5, { gain: 0.05 });
    blip(587, 0.12, 0.6, { gain: 0.04 });
  },
  sunset: () => blip(500, 0, 0.3, { to: 280, gain: 0.05 }),
  // interruptor
  lampOn: () => {
    blip(1200, 0, 0.03, { type: "square", gain: 0.03 });
    blip(700, 0.05, 0.25, { gain: 0.04 });
  },
  lampOff: () => blip(900, 0, 0.04, { type: "square", gain: 0.03 }),
  // bolinha estourando suave
  pop: () => {
    blip(380, 0, 0.1, { to: 760, gain: 0.09 });
    blip(1140, 0.04, 0.08, { gain: 0.03 });
  },
  // celebração do dia: arpejo pentatônico suave
  chime: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      blip(f, i * 0.13, 1.1, { gain: 0.07 - i * 0.008 })
    );
  },
};

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  try {
    SOUNDS[name]();
  } catch {
    /* sem áudio: tudo bem */
  }
}

/** Vibração curtinha em aparelhos que suportam (Android). */
export function haptic(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}
