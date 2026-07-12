import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2, VolumeX } from "lucide-react";
import { useAgent } from "../../context/AgentProvider.jsx";
import { usePreferences } from "../../context/PreferencesProvider.jsx";
import { useSpeechNarration } from "./useSpeechNarration.js";

function findMuteButton() {
  try {
    return document.querySelector(
      '[aria-label="Mute sound effects"], [aria-label="Unmute sound effects"]',
    );
  } catch {
    return null;
  }
}

export default function ReadAloudControl() {
  const { coachNarrative } = useAgent();
  const { prefs } = usePreferences();
  const [readAloud, setReadAloud] = useState(() => prefs.readAloud);
  const [container, setContainer] = useState(null);
  const { supported } = useSpeechNarration(readAloud, coachNarrative);

  const resolve = useCallback(() => {
    const mute = findMuteButton();
    setContainer(mute ? mute.parentElement : null);
  }, []);

  useEffect(() => {
    resolve();
    const obs = new MutationObserver(resolve);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [resolve]);

  if (!supported || !container) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => setReadAloud((v) => !v)}
      className="flex items-center gap-1 rounded-lg border border-axiom-border bg-axiom-surface px-2 py-1 text-[11px] text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-text"
      aria-label={readAloud ? "Disable read aloud" : "Enable read aloud"}
      title={readAloud ? "Read aloud on" : "Read aloud off"}
    >
      {readAloud ? <Volume2 className="h-3.5 w-3.5 text-axiom-green" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span>{readAloud ? "Reading" : "Read Aloud"}</span>
      {readAloud && !coachNarrative && (
        <span className="text-axiom-muted/60">…</span>
      )}
    </button>,
    container,
  );
}
