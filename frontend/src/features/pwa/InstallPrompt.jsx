import { useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "axiom-pwa-install-dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, [dismissed]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // ignore
    } finally {
      setDeferred(null);
      setVisible(false);
    }
  }, [deferred]);

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-axiom-border bg-axiom-panel/95 p-3 shadow-lg backdrop-blur sm:left-auto sm:right-4"
      role="dialog"
      aria-label="Add to Home Screen"
    >
      <Download className="h-5 w-5 shrink-0 text-axiom-green" />
      <div className="min-w-0 flex-1 text-xs">
        <p className="font-semibold text-axiom-text">Add Axiom to Home Screen</p>
        <p className="text-axiom-muted">Quick access like a native app.</p>
      </div>
      <button
        type="button"
        onClick={install}
        className="min-h-[44px] shrink-0 rounded-lg bg-axiom-green px-3 text-xs font-bold text-axiom-bg"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-axiom-muted hover:text-axiom-text"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
