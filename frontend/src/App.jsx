import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentProvider } from "./context/AgentProvider.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { PreferencesProvider } from "./context/PreferencesProvider.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import ToastProvider from "./components/ToastProvider.jsx";
import AppEnhancements from "./features/workspace-addons/AppEnhancements.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import WorkspacePage from "./pages/WorkspacePage.jsx";
import DocsPage from "./pages/DocsPage.jsx";
import Navbar from "./components/Navbar.jsx";

const LazyCameraRoute = lazy(() => import("./routes/LazyCameraRoute.jsx"));
const WatchPage = lazy(() => import("./pages/WatchPage.jsx"));
const LearnPage = lazy(() => import("./pages/LearnPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const ShortcutsPage = lazy(() => import("./pages/ShortcutsPage.jsx"));
const HelpPage = lazy(() => import("./pages/HelpPage.jsx"));

function Shell({ children }) {
  return (
    <div className="axiom-gradient-bg min-h-screen">
      <Navbar />
      {children}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/workspace"
            element={
              <RequireAuth>
                <WorkspacePage />
              </RequireAuth>
            }
          />
          <Route
            path="/camera"
            element={
              <RequireAuth>
                <Suspense fallback={null}>
                  <LazyCameraRoute />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/watch"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <WatchPage />
                </Suspense>
              </Shell>
            }
          />
          <Route
            path="/learn"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <LearnPage />
                </Suspense>
              </Shell>
            }
          />
          <Route path="/docs" element={<Shell><DocsPage /></Shell>} />
          <Route
            path="/settings"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <SettingsPage />
                </Suspense>
              </Shell>
            }
          />
          <Route
            path="/profile"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <ProfilePage />
                </Suspense>
              </Shell>
            }
          />
          <Route
            path="/shortcuts"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <ShortcutsPage />
                </Suspense>
              </Shell>
            }
          />
          <Route
            path="/help"
            element={
              <Shell>
                <Suspense fallback={null}>
                  <HelpPage />
                </Suspense>
              </Shell>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <PreferencesProvider>
      <AgentProvider>
        <div className="axiom-pwa-shell min-h-screen">
          <div className="axiom-particles" aria-hidden="true" />
          <BrowserRouter>
            <AnimatedRoutes />
            <AppEnhancements />
          </BrowserRouter>
        </div>
        <ToastProvider />
      </AgentProvider>
      </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
