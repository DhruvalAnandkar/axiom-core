export function registerServiceWorker() {
  try {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failure must never block app load.
      });
    });
  } catch {
    // Silently ignore — app shell loads without PWA.
  }
}
