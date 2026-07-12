import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { Camera, RotateCcw } from "lucide-react";
import Navbar, { ConnectionBadge } from "../../components/Navbar.jsx";
import { useAgent } from "../../context/AgentProvider.jsx";
import { usePreferences } from "../../context/PreferencesProvider.jsx";
import { shotVerdict } from "../../lib/shotVerdict.js";
import { useAimClickSequence, usePendingShotEffect } from "../../hooks/useAimClickSequence.js";
import CameraAimSurface from "./CameraAimSurface.jsx";

const AutoDetectPanel = lazy(() => import("./AutoDetectPanel.jsx"));

export default function CameraPage() {
  const {
    connected,
    packets,
    vectorData,
    shotSolution,
    coachNarrative,
    computeShot,
    clearPackets,
    resetShot,
  } = useAgent();
  const { prefs } = usePreferences();

  const [photoUrl, setPhotoUrl] = useState(null);
  const [withCoach, setWithCoach] = useState(() => prefs.defaultCoach);
  const fileRef = useRef(null);
  const { aim, stepGuide, handleTableClick, setPositions, reset, clearPending } = useAimClickSequence();
  const [markersEnabled, setMarkersEnabled] = useState(false);
  // Shot state lives in the shared AgentProvider; only show results for
  // shots computed on this route, never stale Workspace state.
  const [localShot, setLocalShot] = useState(false);

  const onComputeShot = useCallback(
    (shot) => {
      clearPackets();
      setLocalShot(true);
      computeShot(shot);
    },
    [clearPackets, computeShot],
  );

  usePendingShotEffect(aim, (shot) => {
    onComputeShot(shot);
    clearPending();
  }, withCoach);

  const onFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    reset();
    resetShot();
    clearPackets();
    setMarkersEnabled(false);
    setLocalShot(false);
  }, [reset, resetShot, clearPackets]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const hasResult = localShot && vectorData.length > 0;
  const verdict = localShot ? shotVerdict(shotSolution) : null;

  const gatedClick = useCallback(
    (point) => {
      if (hasResult) return;
      handleTableClick(point);
    },
    [hasResult, handleTableClick],
  );

  const onDetected = useCallback(
    (positions) => {
      setPositions({
        cue_ball: positions.cue_ball,
        object_ball: positions.object_ball,
        pocket: null,
      });
      setMarkersEnabled(true);
    },
    [setPositions],
  );

  const onMarkerDrag = useCallback(
    (kind, point) => {
      setPositions({
        cue_ball: kind === "cue" ? point : aim.cue_ball,
        object_ball: kind === "object" ? point : aim.object_ball,
        pocket: aim.pocket,
      });
    },
    [aim.cue_ball, aim.object_ball, aim.pocket, setPositions],
  );

  return (
    <div className="axiom-gradient-bg flex min-h-screen flex-col">
      <Navbar
        right={<ConnectionBadge connected={connected} count={packets.length} />}
      />
      <div className="border-b border-axiom-border bg-axiom-panel/40 px-4 py-2.5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-sm font-semibold text-axiom-text">
            <Camera className="h-4 w-4 text-axiom-green" />
            Camera Setup
          </h1>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFile}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="min-h-[44px] rounded-lg border border-axiom-green/40 bg-axiom-green/10 px-3 py-2 text-[11px] font-medium text-axiom-green transition hover:bg-axiom-green/20"
          >
            {photoUrl ? "Retake / Choose Photo" : "Open Camera or Gallery"}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => {
                reset();
                resetShot();
                clearPackets();
                setMarkersEnabled(false);
                setLocalShot(false);
              }}
              className="flex min-h-[44px] items-center gap-1 rounded-lg border border-axiom-border bg-axiom-surface px-3 py-2 text-[11px] text-axiom-muted transition hover:border-axiom-green/40 hover:text-axiom-text"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear taps
            </button>
          )}
          <label className="ml-auto flex min-h-[44px] cursor-pointer items-center gap-1.5 text-[11px] text-axiom-muted">
            <input
              type="checkbox"
              checked={withCoach}
              onChange={(e) => setWithCoach(e.target.checked)}
              className="accent-axiom-green"
            />
            AI Coach
          </label>
        </div>
        {photoUrl && !hasResult && (
          <div className="mx-auto mt-3 max-w-4xl">
            <Suspense fallback={null}>
              <AutoDetectPanel
                photoUrl={photoUrl}
                disabled={hasResult}
                onDetected={onDetected}
              />
            </Suspense>
          </div>
        )}
      </div>

      {!photoUrl ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Camera className="h-12 w-12 text-axiom-green/50" />
          <p className="text-sm text-axiom-muted">
            Capture a photo of your table, then tap cue ball, object ball, and pocket.
          </p>
        </div>
      ) : (
        <CameraAimSurface
          photoUrl={photoUrl}
          aim={aim}
          stepGuide={hasResult ? "Shot computed — overlay matches physics space" : stepGuide}
          vectorData={localShot ? vectorData : []}
          onSurfaceClick={gatedClick}
          markers={markersEnabled ? { cue_ball: aim.cue_ball, object_ball: aim.object_ball } : null}
          onMarkerDrag={markersEnabled ? onMarkerDrag : undefined}
        />
      )}

      {verdict && hasResult && (
        <div
          className={`shrink-0 px-4 py-3 text-center text-sm font-semibold ${
            verdict.ok
              ? "border-t border-axiom-success/30 bg-axiom-success/15 text-axiom-success"
              : "border-t border-amber-500/30 bg-amber-500/15 text-amber-200"
          }`}
        >
          {verdict.text}
        </div>
      )}

      {localShot && coachNarrative && (
        <div className="shrink-0 border-t border-axiom-border bg-axiom-panel/50 px-4 py-3 text-xs text-axiom-muted">
          {coachNarrative}
        </div>
      )}
    </div>
  );
}
