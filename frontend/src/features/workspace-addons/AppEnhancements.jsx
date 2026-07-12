import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import SilentErrorBoundary from "../shared/SilentErrorBoundary.jsx";
import PwaBootstrap from "../pwa/PwaBootstrap.jsx";

const SpokenCoachAddon = lazy(() => import("../spoken-coach/SpokenCoachAddon.jsx"));
const WorkspaceShotAddons = lazy(() => import("../workspace-shots/WorkspaceShotAddons.jsx"));

export default function AppEnhancements() {
  const { pathname } = useLocation();
  const onWorkspace = pathname === "/workspace";

  return (
    <>
      <SilentErrorBoundary>
        <PwaBootstrap />
      </SilentErrorBoundary>
      {onWorkspace && (
        <>
          <SilentErrorBoundary>
            <Suspense fallback={null}>
              <SpokenCoachAddon />
            </Suspense>
          </SilentErrorBoundary>
          <SilentErrorBoundary>
            <Suspense fallback={null}>
              <WorkspaceShotAddons />
            </Suspense>
          </SilentErrorBoundary>
        </>
      )}
    </>
  );
}