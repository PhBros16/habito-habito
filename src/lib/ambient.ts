"use client";

/**
 * Som ambiente sintetizado com Web Audio: sem arquivos, sem licença, funciona offline.
 * Quatro camadas independentes (chuva, vento, ondas e piano generativo) numa mistura só.
 */

export type Layer = "rain" | "wind" | "waves" | "piano";
export type Levels = Record<Layer, number>;

export const LAYERS: { key: Layer; label: string }[] = [
  { key: "rain", label: "Chuva" },
  { key: "wind", label: "Vento" },
  { key: "waves", label: "Ondas" },
  { key: "piano", label: "Piano" },
];

export const PRESETS: { name: string; levels: Levels }[] = [
  { name: "Chuva e piano", levels: { rain: 0.5, wind: 0, waves: 0, piano: 0.45 } },
  { name: "Tempestade", levels: { rain: 0.8, wind: 0.55, waves: 0, piano: 0 } },
  { name: "Mar calmo", levels: { rain: 0, wind: 0.2, waves: 0.7, piano: 0.25 } },
  { name: "Só piano", levels: { rain: 0, wind: 0, waves: 0, piano: 0.7 } },
];

export const defaultLevels: Levels = PRESETS[0].levels;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

// quanto cada camada pesa na mistura final (equilíbrio de volume percebido)
const SCALE: Levels = { rain: 0.55, wind: 0.5, waves: 0.8, piano: 0.9 };
const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]; // lá menor pentatônica

let ac: AudioContext | null = null;
let master: GainNode;
const layerGain = {} as Record<Layer, GainNode>;
let pianoBus: GainNode;
let levels: Levels = { ...defaultLevels };

let playing = false;
let sleepMin: number | null = null;
let token = 0;
let dropTimer: ReturnType<typeof setTimeout> | null = null;
let noteTimer: ReturnType<typeof setTimeout> | null = null;
let sleepTimer: ReturnType<typeof setTimeout> | null = null;
let melody = 3;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export const isPlaying = () => playing;
export const getSleep = () => sleepMin;

function noiseBuffer(c: AudioContext, kind: "pink" | "brown"): AudioBuffer {
  const len = c.sampleRate * 6;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
  }
  return buf;
}

function loopOf(c: AudioContext, buf: AudioBuffer): AudioBufferSourceNode {
  const s = c.createBufferSource();
  s.buffer = buf;
  s.loop = true;
  s.start();
  return s;
}

/** Oscilador lento que faz um parâmetro respirar (ondas do mar, rajadas de vento). */
function lfo(c: AudioContext, rate: number, depth: number, target: AudioParam) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.value = rate;
  g.gain.value = depth;
  o.connect(g).connect(target);
  o.start();
}

function build(): AudioContext | null {
  if (ac) return ac;
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  const c = new Ctor();
  ac = c;
  master = c.createGain();
  master.gain.value = 0;
  master.connect(c.destination);
  for (const { key } of LAYERS) {
    layerGain[key] = c.createGain();
    layerGain[key].gain.value = 0;
    layerGain[key].connect(master);
  }
  const pink = noiseBuffer(c, "pink");
  const brown = noiseBuffer(c, "brown");

  // chuva: ruído rosa filtrado (as gotas soltas entram em scheduleDrops)
  const rainHp = c.createBiquadFilter();
  rainHp.type = "highpass";
  rainHp.frequency.value = 500;
  const rainLp = c.createBiquadFilter();
  rainLp.type = "lowpass";
  rainLp.frequency.value = 7000;
  loopOf(c, pink).connect(rainHp).connect(rainLp).connect(layerGain.rain);

  // vento: ruído em banda que sobe e desce devagar
  const windBp = c.createBiquadFilter();
  windBp.type = "bandpass";
  windBp.frequency.value = 520;
  windBp.Q.value = 0.8;
  lfo(c, 0.07, 260, windBp.frequency);
  const windSwell = c.createGain();
  windSwell.gain.value = 0.65;
  lfo(c, 0.11, 0.3, windSwell.gain);
  loopOf(c, pink).connect(windBp).connect(windSwell).connect(layerGain.wind);

  // ondas: ruído marrom com a amplitude em maré
  const waveLp = c.createBiquadFilter();
  waveLp.type = "lowpass";
  waveLp.frequency.value = 900;
  const waveSwell = c.createGain();
  waveSwell.gain.value = 0.55;
  lfo(c, 0.09, 0.45, waveSwell.gain);
  loopOf(c, brown).connect(waveLp).connect(waveSwell).connect(layerGain.waves);

  // piano: reverb gerado (cauda de ruído que decai) para as notas soarem em sala
  const irLen = Math.floor(c.sampleRate * 3.2);
  const ir = c.createBuffer(2, irLen, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 2.6);
  }
  const verb = c.createConvolver();
  verb.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.55;
  pianoBus = c.createGain();
  pianoBus.connect(layerGain.piano);
  pianoBus.connect(verb);
  verb.connect(wet).connect(layerGain.piano);
  return c;
}

function applyLevels() {
  if (!ac) return;
  for (const { key } of LAYERS) {
    layerGain[key].gain.setTargetAtTime(levels[key] * SCALE[key], ac.currentTime, 0.35);
  }
}

function drop() {
  if (!ac || !playing) return;
  if (levels.rain > 0.05) {
    const len = Math.floor(ac.sampleRate * 0.04);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2200 + Math.random() * 4200;
    bp.Q.value = 6;
    const g = ac.createGain();
    const t = ac.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18 + Math.random() * 0.2, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    src.connect(bp).connect(g).connect(layerGain.rain);
    src.start(t);
  }
  dropTimer = setTimeout(drop, 70 + Math.random() * 190);
}

function note(freq: number, at: number, vel: number) {
  if (!ac) return;
  const t = ac.currentTime + at;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2600;
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vel, t + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
  [[1, 1], [2, 0.32], [3, 0.1], [4, 0.04]].forEach(([mult, amp]) => {
    const o = ac!.createOscillator();
    const g = ac!.createGain();
    o.type = "sine";
    o.frequency.value = freq * mult;
    g.gain.value = amp;
    o.connect(g).connect(lp);
    o.start(t);
    o.stop(t + 4.3);
  });
  lp.connect(env).connect(pianoBus);
}

function nextNote() {
  if (!ac || !playing) return;
  if (levels.piano > 0.05) {
    melody = Math.max(0, Math.min(PENTA.length - 1, melody + Math.round((Math.random() - 0.5) * 4)));
    note(PENTA[melody], 0, 0.16 + Math.random() * 0.1);
    if (Math.random() < 0.3) {
      note(PENTA[Math.max(0, melody - 2)], 0.22, 0.1);
    }
  }
  noteTimer = setTimeout(nextNote, 1800 + Math.random() * 3800);
}

function clearSchedulers() {
  if (dropTimer) clearTimeout(dropTimer);
  if (noteTimer) clearTimeout(noteTimer);
  dropTimer = noteTimer = null;
}

// iOS: o Web Audio some com o botão de silencioso e só toca como "mídia" se houver um <audio>
// tocando. Um WAV mudo em loop + audioSession "playback" resolvem os dois casos.
let keepAlive: HTMLAudioElement | null = null;
function silentWav(): string {
  const n = 8000; // 1 s a 8 kHz, 8 bits
  const b = new Uint8Array(44 + n);
  const dv = new DataView(b.buffer);
  const w = (o: number, t: string) => [...t].forEach((ch, i) => (b[o + i] = ch.charCodeAt(0)));
  w(0, "RIFF"); dv.setUint32(4, 36 + n, true); w(8, "WAVEfmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true);
  w(36, "data"); dv.setUint32(40, n, true);
  b.fill(128, 44);
  let bin = "";
  b.forEach((v) => (bin += String.fromCharCode(v)));
  return "data:audio/wav;base64," + btoa(bin);
}
function unlockPlayback() {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "playback";
    if (!keepAlive) {
      keepAlive = new Audio(silentWav());
      keepAlive.loop = true;
      keepAlive.setAttribute("playsinline", "");
    }
    void keepAlive.play().catch(() => {});
  } catch {
    /* sem suporte: segue só com Web Audio */
  }
}

export function start() {
  unlockPlayback();
  const c = build();
  if (!c || playing) return;
  token++;
  playing = true;
  void c.resume();
  applyLevels();
  master.gain.setTargetAtTime(1, c.currentTime, 0.9); // entra devagar
  clearSchedulers();
  drop();
  noteTimer = setTimeout(nextNote, 900);
  emit();
}

export function stop(fadeSeconds = 0.5) {
  if (!ac || !playing) return;
  const mine = ++token;
  playing = false;
  sleepMin = null;
  if (sleepTimer) clearTimeout(sleepTimer);
  sleepTimer = null;
  master.gain.setTargetAtTime(0, ac.currentTime, fadeSeconds / 3);
  emit();
  setTimeout(() => {
    if (mine !== token || !ac) return; // recomeçou nesse meio-tempo
    clearSchedulers();
    keepAlive?.pause();
    void ac.suspend();
  }, fadeSeconds * 1000 + 600);
}

export function setLevel(layer: Layer, value: number) {
  levels = { ...levels, [layer]: value };
  applyLevels();
}

export function setLevels(next: Levels) {
  levels = { ...next };
  applyLevels();
}

/** Desliga sozinho depois de N minutos, com um fade longo. null cancela. */
export function setSleep(minutes: number | null) {
  if (sleepTimer) clearTimeout(sleepTimer);
  sleepTimer = null;
  sleepMin = minutes;
  if (minutes !== null && playing) {
    sleepTimer = setTimeout(() => stop(8), minutes * 60_000);
  }
  emit();
}
