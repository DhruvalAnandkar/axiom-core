const STORAGE_KEY = "axiom-user-prefs";

export const PREF_DEFAULTS = {
  defaultCoach: true,
  soundEffects: true,
  readAloud: false,
  showOnboarding: true,
  reduceMotion: false,
  showParticles: true,
  autoOpenCoachModal: false,
  confirmNewShot: false,
  compactNav: false,
};

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function loadPreferences() {
  return { ...PREF_DEFAULTS, ...readRaw() };
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable
  }
}

export function resetPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
  return { ...PREF_DEFAULTS };
}
