import { getSettings } from "./storage";
import { speakLang } from "./i18n";

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!canSpeak()) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.lang = speakLang();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function speakIfEnabled(text: string): void {
  if (getSettings().voice) speak(text);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}

type RecogCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

export function canListen(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean((window as unknown as { SpeechRecognition?: RecogCtor; webkitSpeechRecognition?: RecogCtor }).SpeechRecognition
    || (window as unknown as { webkitSpeechRecognition?: RecogCtor }).webkitSpeechRecognition);
}

export function startListening(onResult: (text: string) => void, onStatus?: (s: string) => void): () => void {
  const w = window as unknown as { SpeechRecognition?: RecogCtor; webkitSpeechRecognition?: RecogCtor };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) {
    onStatus?.("unavailable");
    return () => undefined;
  }
  const recog = new Ctor();
  recog.lang = speakLang();
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  recog.onstart = () => onStatus?.("listening");
  recog.onerror = () => onStatus?.("error");
  recog.onend = () => onStatus?.("idle");
  recog.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript ?? "";
    if (text) onResult(text);
  };
  try {
    recog.start();
  } catch {
    onStatus?.("error");
  }
  return () => {
    try {
      recog.stop();
    } catch {
      /* ignore */
    }
  };
}
