import { useCallback, useEffect, useRef } from "react";
import { markdownToSpeech } from "./markdownToSpeech.js";

function speechSupported() {
  try {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  } catch {
    return false;
  }
}

/* Prefer the most natural English voice available (Edge/Chrome ship
   "Natural"/"Online" neural voices); fall back to any en-* voice. */
function pickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices() ?? [];
    const en = voices.filter((v) => v.lang?.startsWith("en"));
    return (
      en.find((v) => /natural/i.test(v.name)) ??
      en.find((v) => /online|neural|google/i.test(v.name)) ??
      en[0] ??
      null
    );
  } catch {
    return null;
  }
}

export function useSpeechNarration(enabled, text) {
  const spokenRef = useRef("");

  const cancel = useCallback(() => {
    try {
      if (!speechSupported()) return;
      window.speechSynthesis.cancel();
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    if (!enabled || !text || !speechSupported()) return;
    if (spokenRef.current === text) return;

    // The narrative arrives in stages (instant draft → LLM draft → +verdict).
    // If the new text extends what we already spoke, speak only the new tail
    // instead of restarting from the top.
    const prev = spokenRef.current;
    const delta = prev && text.startsWith(prev) ? text.slice(prev.length) : null;
    const speech = markdownToSpeech(delta ?? text);
    spokenRef.current = text;
    if (!speech) return;

    try {
      if (!delta) window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(speech);
      utter.rate = 1.04;
      utter.pitch = 1;
      const voice = pickVoice();
      if (voice) utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Unsupported or blocked — silently no-op.
    }

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // no-op
      }
    };
  }, [enabled, text]);

  useEffect(() => {
    if (!enabled) {
      spokenRef.current = "";
      cancel();
    }
  }, [enabled, cancel]);

  return { supported: speechSupported(), cancel };
}
