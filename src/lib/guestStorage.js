const HISTORY_KEY = "tp_guest_history_v1";
const WEAK_KEYS_KEY = "tp_guest_weak_keys_v1";
const MAX_HISTORY_ITEMS = 25;

export function getGuestHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestResult({ wpm, accuracy, errors, duration, mode, language }) {
  try {
    const current = getGuestHistory();
    const entry = {
      id: Date.now(),
      wpm: Math.round(Number(wpm) || 0),
      accuracy: Math.round(Number(accuracy) || 0),
      errors: Number(errors) || 0,
      duration: duration || "15s",
      mode: mode || "words",
      language: language || "english",
      date: new Date().toISOString()
    };
    const updated = [entry, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getGuestWeakKeys() {
  try {
    const raw = localStorage.getItem(WEAK_KEYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordGuestMissedKey(char) {
  if (!char || char === " ") return;
  try {
    const current = getGuestWeakKeys();
    const key = char.toLowerCase();
    current[key] = (current[key] || 0) + 1;
    localStorage.setItem(WEAK_KEYS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

export function clearGuestData() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(WEAK_KEYS_KEY);
  } catch {
    // Ignore errors
  }
}
