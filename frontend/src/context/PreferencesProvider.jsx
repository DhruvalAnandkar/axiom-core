import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loadPreferences,
  PREF_DEFAULTS,
  resetPreferences,
  savePreferences,
} from "../lib/userPreferences.js";
import { appendShotHistory, clearShotHistory } from "../lib/shotHistory.js";

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [prefs, setPrefs] = useState(loadPreferences);

  const setPref = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    const next = resetPreferences();
    setPrefs(next);
    return next;
  }, []);

  const clearLocalData = useCallback(() => {
    clearShotHistory();
    try {
      localStorage.removeItem("axiom-onboarded");
      localStorage.removeItem("axiom-pwa-install-dismissed");
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("axiom-force-reduce-motion", prefs.reduceMotion);
    document.documentElement.classList.toggle("axiom-hide-particles", !prefs.showParticles);
    document.documentElement.classList.toggle("axiom-compact-nav", prefs.compactNav);
  }, [prefs.reduceMotion, prefs.showParticles, prefs.compactNav]);

  useEffect(() => {
    try {
      if (prefs.showOnboarding) localStorage.removeItem("axiom-onboarded");
      else localStorage.setItem("axiom-onboarded", "1");
    } catch {
      // no-op
    }
  }, [prefs.showOnboarding]);

  useEffect(() => {
    const onShot = (e) => {
      const d = e.detail ?? {};
      appendShotHistory({
        made: Boolean(d.made),
        scratched: Boolean(d.scratched),
        cutAngle: d.cutAngle ?? null,
      });
    };
    window.addEventListener("axiom-shot-taken", onShot);
    return () => window.removeEventListener("axiom-shot-taken", onShot);
  }, []);

  const value = useMemo(
    () => ({ prefs, setPref, resetAll, clearLocalData, defaults: PREF_DEFAULTS }),
    [prefs, setPref, resetAll, clearLocalData],
  );

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
