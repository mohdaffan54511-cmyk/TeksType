const HISTORY_KEY = "tp_guest_history_v1";
const WEAK_KEYS_KEY = "tp_guest_weak_keys_v1";
const STREAK_KEY = "tp_guest_streak_v1";
const MAX_HISTORY_ITEMS = 25;

export function getGuestHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getGuestStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    return raw ? JSON.parse(raw) : { currentStreak: 0, lastActiveDate: null };
  } catch {
    return { currentStreak: 0, lastActiveDate: null };
  }
}

function updateGuestStreak() {
  try {
    const streak = getGuestStreak();
    const today = new Date().toISOString().slice(0, 10);
    if (streak.lastActiveDate === today) return streak;

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    streak.currentStreak = streak.lastActiveDate === yesterdayKey ? streak.currentStreak + 1 : 1;
    streak.lastActiveDate = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
    return streak;
  } catch {
    return getGuestStreak();
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
      date: new Date().toISOString(),
    };
    const updated = [entry, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    updateGuestStreak();
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
    // Ignore storage quota errors in private browsing.
  }
}

export function clearGuestData() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(WEAK_KEYS_KEY);
    localStorage.removeItem(STREAK_KEY);
  } catch {
    // Ignore storage errors.
  }
}
