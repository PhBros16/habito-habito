"use client";

/**
 * Som ambiente sintetizado com Web Audio: sem arquivos, sem licença, funciona offline.
 * Quatro camadas independentes (chuva, vento, ondas e piano generativo) numa mistura só.
 */

export type Layer = "rain" | "wind" | "waves" | "piano" | "fire" | "river" | "crickets" | "bowl" | "focus";
export type Levels = Record<Layer, number>;

export const LAYERS: { key: Layer; label: string; group: "Natureza" | "Instrumentos" | "Foco" }[] = [
  { key: "rain", label: "Chuva", group: "Natureza" },
  { key: "wind", label: "Vento", group: "Natureza" },
  { key: "waves", label: "Ondas", group: "Natureza" },
  { key: "river", label: "Riacho", group: "Natureza" },
  { key: "fire", label: "Lareira", group: "Natureza" },
  { key: "crickets", label: "Noite de grilos", group: "Natureza" },
  { key: "piano", label: "Piano", group: "Instrumentos" },
  { key: "bowl", label: "Tigela tibetana", group: "Instrumentos" },
  { key: "focus", label: "Ruído marrom", group: "Foco" },
];

const zero: Levels = { rain: 0, wind: 0, waves: 0, piano: 0, fire: 0, river: 0, crickets: 0, bowl: 0, focus: 0 };
const mix = (l: Partial<Levels>): Levels => ({ ...zero, ...l });

/** Garante todas as camadas (ajustes salvos antes das novas camadas só têm quatro). */
export const normalizeLevels = (l?: Partial<Levels> | null): Levels => ({ ...zero, ...(l ?? {}) });

export const PRESETS: { name: string; levels: Levels }[] = [
  { name: "Chuva e piano", levels: mix({ rain: 0.5, piano: 0.45 }) },
  { name: "Tempestade", levels: mix({ rain: 0.8, wind: 0.55 }) },
  { name: "Mar calmo", levels: mix({ wind: 0.2, waves: 0.7, piano: 0.25 }) },
  { name: "Lareira e chuva", levels: mix({ fire: 0.65, rain: 0.35 }) },
  { name: "Riacho na mata", levels: mix({ river: 0.65, wind: 0.15, crickets: 0.2 }) },
  { name: "Noite de verão", levels: mix({ crickets: 0.55, wind: 0.15, piano: 0.2 }) },
  { name: "Foco profundo", levels: mix({ focus: 0.6, rain: 0.15 }) },
  { name: "Tigela e silêncio", levels: mix({ bowl: 0.7, wind: 0.1 }) },
  { name: "Só piano", levels: mix({ piano: 0.7 }) },
];

export const defaultLevels: Levels = PRESETS[0].levels;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

// quanto cada camada pesa na mistura final (equilíbrio de volume percebido)
const SCALE: Levels = { rain: 0.55, wind: 0.5, waves: 0.8, piano: 0.9, fire: 0.8, river: 0.5, crickets: 0.5, bowl: 0.9, focus: 0.55 };
const PENTA = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33]; // lá menor pentatônica

let ac: AudioContext | null = null;
let master: GainNode;
const layerGain = {} as Record<Layer, GainNode>;
let pianoBus: GainNode;
let levels: Levels = { ...defaultLevels };

let playing = false;
let sleepMin: number | null = null;
let token = 0;
let pumpTimer: ReturnType<typeof setInterval> | null = null;
let sleepAt: number | null = null; // instante (ms) em que desliga
let melody = 3;
let nextPianoAt = 0; // tempo do relógio de áudio da próxima nota
let nextBowlAt = 0;
let bellBus: GainNode;
let bowlBus: GainNode;
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

function rainBp(): BiquadFilterNode {
  const f = ac!.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 1500;
  return f;
}

/** Buffer mono com N eventos curtos espalhados em `secs` segundos (costura sem estalo na emenda). */
function scatter(
  c: AudioContext,
  secs: number,
  count: number,
  paint: (d: Float32Array, at: number, len: number) => void,
  _sparse = false
): AudioBuffer {
  void _sparse;
  const sr = c.sampleRate;
  const buf = c.createBuffer(1, Math.floor(sr * secs), sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < count; i++) {
    const len = Math.floor(sr * (0.012 + Math.random() * 0.03));
    const at = Math.floor(Math.random() * (d.length - len - 1));
    paint(d, at, len);
  }
  return buf;
}
function burst(d: Float32Array, at: number, len: number, amp: number, decay: number) {
  const a = amp * (0.35 + Math.random() * 0.65);
  for (let i = 0; i < len; i++) d[at + i] += (Math.random() * 2 - 1) * a * Math.pow(1 - i / len, decay);
}
function crickets(c: AudioContext): AudioBuffer {
  const sr = c.sampleRate;
  const secs = 12;
  const buf = c.createBuffer(1, sr * secs, sr);
  const d = buf.getChannelData(0);
  for (let voice = 0; voice < 3; voice++) {
    const f = 4100 + voice * 230 + Math.random() * 90;
    let t = Math.random() * 2;
    while (t < secs - 1) {
      const pulses = 3 + Math.floor(Math.random() * 3);
      for (let p = 0; p < pulses; p++) {
        const st = Math.floor((t + p * 0.075) * sr);
        const len = Math.floor(sr * 0.045);
        for (let i = 0; i < len && st + i < d.length; i++) {
          const env = Math.sin((Math.PI * i) / len);
          d[st + i] += Math.sin((2 * Math.PI * f * i) / sr) * env * 0.09;
        }
      }
      t += 1.1 + Math.random() * 1.4;
    }
  }
  return buf;
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

  // gotas de chuva e estalos de lareira são pré-renderizados em loop: nada depende de timers,
  // então o som não "falha" quando o navegador segura os timers em segundo plano.
  loopOf(c, scatter(c, 10, 55, (d, at, len) => burst(d, at, len, 0.5, 2))).connect(rainBp()).connect(layerGain.rain);

  const fireLp = c.createBiquadFilter();
  fireLp.type = "lowpass";
  fireLp.frequency.value = 380;
  const fireSwell = c.createGain();
  fireSwell.gain.value = 0.5;
  lfo(c, 0.13, 0.18, fireSwell.gain);
  loopOf(c, brown).connect(fireLp).connect(fireSwell).connect(layerGain.fire);
  loopOf(c, scatter(c, 12, 16, (d, at, len) => burst(d, at, len, 0.9, 4), true)).connect(layerGain.fire);

  // riacho: duas faixas de ruído que correm em velocidades diferentes
  const riverA = c.createBiquadFilter();
  riverA.type = "bandpass";
  riverA.frequency.value = 850;
  riverA.Q.value = 0.7;
  lfo(c, 0.21, 180, riverA.frequency);
  const riverB = c.createBiquadFilter();
  riverB.type = "bandpass";
  riverB.frequency.value = 1900;
  riverB.Q.value = 1.1;
  lfo(c, 0.33, 420, riverB.frequency);
  const riverBg = c.createGain();
  riverBg.gain.value = 0.55;
  loopOf(c, pink).connect(riverA).connect(layerGain.river);
  loopOf(c, pink).connect(riverB).connect(riverBg).connect(layerGain.river);

  // grilos: cantos de pulsos curtos em ~4,4 kHz, em loop
  loopOf(c, crickets(c)).connect(layerGain.crickets);

  // foco: ruído marrom suave e constante
  const focusLp = c.createBiquadFilter();
  focusLp.type = "lowpass";
  focusLp.frequency.value = 650;
  loopOf(c, brown).connect(focusLp).connect(layerGain.focus);

  // tigela tibetana (camada) e sinos da sessão de meditação (volume próprio)
  bowlBus = layerGain.bowl;
  bellBus = c.createGain();
  bellBus.gain.value = 0.9;
  bellBus.connect(master);

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

/** Nota de piano em tempo absoluto do relógio de áudio. */
function noteAt(freq: number, t: number, vel: number) {
  if (!ac) return;
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

/** Tigela tibetana: parciais inarmônicos com cauda longa. */
function bowlAt(t: number, vel: number, bus: AudioNode, base = 196) {
  if (!ac) return;
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vel, t + 0.03);
  env.gain.exponentialRampToValueAtTime(0.0001, t + 11);
  [[1, 1], [2.756, 0.45], [5.404, 0.2], [8.93, 0.08]].forEach(([mult, amp], i) => {
    const o = ac!.createOscillator();
    const g = ac!.createGain();
    o.type = "sine";
    o.frequency.value = base * mult;
    o.detune.value = i * 2.5; // batimento leve, como o metal de verdade
    g.gain.value = amp;
    o.connect(g).connect(env);
    o.start(t);
    o.stop(t + 11.2);
  });
  env.connect(bus);
}

/**
 * Agenda notas e tigelas com ~50 s de antecedência no relógio de áudio. O relógio de áudio
 * continua em segundo plano e com a tela bloqueada, ao contrário de setTimeout.
 */
function pump() {
  if (!ac || !playing) return;
  const horizon = ac.currentTime + 50;
  if (nextPianoAt < ac.currentTime) nextPianoAt = ac.currentTime + 0.3;
  while (nextPianoAt < horizon) {
    melody = Math.max(0, Math.min(PENTA.length - 1, melody + Math.round((Math.random() - 0.5) * 4)));
    noteAt(PENTA[melody], nextPianoAt, 0.16 + Math.random() * 0.1);
    if (Math.random() < 0.3) noteAt(PENTA[Math.max(0, melody - 2)], nextPianoAt + 0.22, 0.1);
    nextPianoAt += 1.8 + Math.random() * 3.8;
  }
  if (nextBowlAt < ac.currentTime) nextBowlAt = ac.currentTime + 2;
  while (nextBowlAt < horizon) {
    bowlAt(nextBowlAt, 0.32 + Math.random() * 0.12, bowlBus, Math.random() < 0.5 ? 196 : 174.6);
    nextBowlAt += 22 + Math.random() * 18;
  }
}

/** Agenda um toque de sino da meditação daqui a `seconds` (preciso mesmo com a tela apagada). */
export function ringBell(seconds: number, strong = 1) {
  const c = build();
  if (!c) return;
  bowlAt(c.currentTime + Math.max(0.05, seconds), 0.55 * strong, bellBus, 220);
}

/** Garante que o contexto esteja ativo (retoma se o sistema o tiver pausado). */
function ensureRunning() {
  if (!ac || !playing) return;
  if (ac.state !== "running") void ac.resume().catch(() => {});
  if (keepAlive && keepAlive.paused) void keepAlive.play().catch(() => {});
  pump();
  if (sleepAt !== null && Date.now() >= sleepAt) stop(8);
}

let hooked = false;
function hook() {
  if (hooked || typeof document === "undefined") return;
  hooked = true;
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && ensureRunning());
  window.addEventListener("pageshow", ensureRunning);
  window.addEventListener("focus", ensureRunning);
  try {
    const ms = navigator.mediaSession;
    if (ms) {
      ms.metadata = new MediaMetadata({ title: "Som ambiente", artist: "Enso" });
      ms.setActionHandler("play", () => start());
      ms.setActionHandler("pause", () => stop());
    }
  } catch {
    /* sem Media Session */
  }
}

function clearSchedulers() {
  if (pumpTimer) clearInterval(pumpTimer);
  pumpTimer = null;
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
  if (!c) return;
  hook();
  if (playing) {
    ensureRunning();
    return;
  }
  token++;
  playing = true;
  void c.resume();
  applyLevels();
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setTargetAtTime(1, c.currentTime, 0.9); // entra devagar
  clearSchedulers();
  nextPianoAt = 0;
  nextBowlAt = 0;
  pump();
  pumpTimer = setInterval(ensureRunning, 4000); // vigia: retoma se o sistema pausar
  try {
    if (navigator.mediaSession) navigator.mediaSession.playbackState = "playing";
  } catch {
    /* ok */
  }
  emit();
}

export function stop(fadeSeconds = 0.5) {
  if (!ac || !playing) return;
  const mine = ++token;
  playing = false;
  sleepMin = null;
  sleepAt = null;
  master.gain.setTargetAtTime(0, ac.currentTime, fadeSeconds / 3);
  emit();
  setTimeout(() => {
    if (mine !== token || !ac) return; // recomeçou nesse meio-tempo
    clearSchedulers();
    keepAlive?.pause();
    void ac.suspend();
    try {
      if (navigator.mediaSession) navigator.mediaSession.playbackState = "paused";
    } catch {
      /* ok */
    }
  }, fadeSeconds * 1000 + 600);
}

export function setLevel(layer: Layer, value: number) {
  levels = { ...levels, [layer]: value };
  applyLevels();
}

export const getLevels = (): Levels => ({ ...levels });

export function setLevels(next: Levels) {
  levels = { ...next };
  applyLevels();
}

/** Desliga sozinho depois de N minutos, com um fade longo. null cancela. Usa o relógio do sistema. */
export function setSleep(minutes: number | null) {
  sleepMin = minutes;
  sleepAt = minutes !== null && playing ? Date.now() + minutes * 60_000 : null;
  if (ac && playing && sleepAt !== null) {
    // o fade também fica agendado no relógio de áudio, então vale com a tela bloqueada
    const t = ac.currentTime + minutes! * 60;
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setValueAtTime(1, Math.max(ac.currentTime, t - 8));
    master.gain.linearRampToValueAtTime(0, t);
  } else if (ac && playing) {
    master.gain.cancelScheduledValues(ac.currentTime);
    master.gain.setTargetAtTime(1, ac.currentTime, 0.3);
  }
  emit();
}

export const getSleepAt = () => sleepAt;
