import { useCallback, useEffect, useState } from "react";
import { useAgent } from "../context/AgentProvider.jsx";
import { usePreferences } from "../context/PreferencesProvider.jsx";
import Navbar, { ConnectionBadge } from "../components/Navbar.jsx";
import BilliardsTable from "../components/BilliardsTable.jsx";
import CoachPanel from "../components/CoachPanel.jsx";
import StageTimeline from "../components/StageTimeline.jsx";
import TelemetryModal from "../components/TelemetryModal.jsx";

export default function WorkspacePage() {
  const {
    packets,
    connected,
    vectorData,
    shotSolution,
    coachNarrative,
    computeShot,
    clearPackets,
    resetShot,
  } = useAgent();
  const { prefs } = usePreferences();

  const [withCoach, setWithCoach] = useState(() => prefs.defaultCoach);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPacket, setModalPacket] = useState(null);

  const onComputeShot = useCallback(
    (shot) => {
      clearPackets();
      computeShot(shot);
    },
    [clearPackets, computeShot],
  );

  const onNewShot = useCallback(() => {
    resetShot();
    clearPackets();
  }, [resetShot, clearPackets]);

  const onSelectPacket = useCallback((packet) => {
    setModalPacket(packet);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (prefs.autoOpenCoachModal && coachNarrative) setModalOpen(true);
  }, [prefs.autoOpenCoachModal, coachNarrative]);

  const narrative =
    modalPacket?.payload?.coach_narrative ??
    coachNarrative ??
    modalPacket?.payload?.research ??
    modalPacket?.message;

  return (
    <div className="axiom-gradient-bg flex h-screen flex-col overflow-hidden">
      <Navbar
        right={
          <div className="flex items-center gap-2">
            {coachNarrative && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-lg bg-axiom-green/15 px-2.5 py-1 text-[11px] font-medium text-axiom-green"
              >
                Coach analysis
              </button>
            )}
            <ConnectionBadge connected={connected} count={packets.length} />
          </div>
        }
      />
      {!connected && (
        <div className="shrink-0 bg-amber-500/10 py-1 text-center text-[11px] text-amber-300">
          Broker offline — start backend on :3001
        </div>
      )}
      <StageTimeline packets={packets} withCoach={withCoach} onSelectPacket={onSelectPacket} />
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <BilliardsTable
            vectorData={vectorData}
            shotSolution={shotSolution}
            onComputeShot={onComputeShot}
            onNewShot={onNewShot}
            withCoach={withCoach}
            onWithCoachChange={setWithCoach}
          />
        </div>
        <CoachPanel withCoach={withCoach} />
      </div>
      <TelemetryModal
        open={modalOpen}
        title="AI Coach Analysis"
        narrative={narrative}
        packet={modalPacket}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
