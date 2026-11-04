"use client";

/** Fala o nome do app com a voz do aparelho (offline na maioria dos celulares). */
export function speakEnso(lang: "pt" | "ja" = "pt"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(lang === "pt" ? "Ên-sô" : "えんそう");
    u.lang = lang === "pt" ? "pt-BR" : "ja-JP";
    u.rate = 0.7;
    u.pitch = 1;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(u.lang.toLowerCase().slice(0, 2)));
    if (voice) u.voice = voice;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}
