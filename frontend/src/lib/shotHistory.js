const KEY = "axiom-shot-history";
const MAX = 30;

export function loadShotHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendShotHistory(entry) {
  try {
    const prev = loadShotHistory();
    const next = [{ ...entry, at: new Date().toISOString() }, ...prev].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadShotHistory();
  }
}

export function clearShotHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // no-op
  }
}
