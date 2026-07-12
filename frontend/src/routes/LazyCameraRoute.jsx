import { lazy, Suspense } from "react";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

const CameraPage = lazy(() => import("../pages/camera/CameraPage.jsx"));

function CameraFallback() {
  return (
    <div className="axiom-gradient-bg flex min-h-screen items-center justify-center p-8 text-sm text-axiom-muted">
      Loading camera setup…
    </div>
  );
}

export default function LazyCameraRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<CameraFallback />}>
        <CameraPage />
      </Suspense>
    </ErrorBoundary>
  );
}
