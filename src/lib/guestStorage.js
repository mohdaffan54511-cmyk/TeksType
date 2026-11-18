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

// Export data in JSON format
export const exportDataAsJSON = () => {
  const data = {
    bestWpm: localStorage.getItem("Type Perfectly-best") || 0,
    streak: getGuestStreak(),
    history: getGuestHistory(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tekstype-data-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export session logs in CSV format for Excel
export const exportDataAsCSV = () => {
  const history = getGuestHistory();
  if (!history || !history.length) return false;

  const headers = ["Session ID", "Mode", "Language", "WPM", "Accuracy (%)", "Errors", "Duration", "Date"];
  const rows = history.map((item) => {
    const rawDate = item.date || item.timestamp;
    const formattedDate = rawDate ? new Date(rawDate).toLocaleString("en-IN") : "";
    return [
      `"${item.id || ""}"`,
      `"${item.mode || ""}"`,
      `"${item.language || ""}"`,
      item.wpm || 0,
      item.accuracy || 0,
      item.errors || 0,
      `"${item.duration || ""}"`,
      `"${formattedDate}"`,
    ];
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const a = document.createElement("a");
  a.href = encodedUri;
  a.download = `tekstype-sessions-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  return true;
};
