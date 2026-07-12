import { useCallback, useState } from "react";
import { Sparkles } from "lucide-react";
import { loadOpenCv } from "./autoDetect/opencvLoader.js";
import { detectBallsFromPhoto } from "./autoDetect/detectBalls.js";

export default function AutoDetectPanel({ photoUrl, disabled, onDetected, onUnavailable }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const runDetect = useCallback(async () => {
    if (!photoUrl || loading) return;
    setLoading(true);
    setMessage("Loading vision library…");
    try {
      const cv = await loadOpenCv();
      setMessage("Scanning for balls…");
      const result = await detectBallsFromPhoto(photoUrl, cv);
      if (!result) {
        setMessage("Auto-detect unavailable — tap manually");
        onUnavailable?.();
        return;
      }
      onDetected(result);
      setMessage("Suggestions placed — drag to correct, then tap pocket.");
    } catch {
      setMessage("Auto-detect unavailable — tap manually");
      onUnavailable?.();
    } finally {
      setLoading(false);
    }
  }, [photoUrl, loading, onDetected, onUnavailable]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={disabled || loading || !photoUrl}
        onClick={runDetect}
        className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-2 text-[11px] text-axiom-text transition hover:border-axiom-green/40 disabled:opacity-50"
      >
        <Sparkles className="h-3.5 w-3.5 text-axiom-green" />
        {loading ? "Detecting…" : "Try Auto-Detect (beta)"}
      </button>
      {message && <span className="text-[11px] text-axiom-muted">{message}</span>}
    </div>
  );
}
