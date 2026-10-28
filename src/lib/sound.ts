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

export type SoundName = "plink" | "drain" | "stamp" | "stamp2" | "unstamp" | "page" | "tick" | "pop" | "chime";

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
  tick: () => blip(900, 0, 0.05, { type: "triangle", gain: 0.06 }),
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
