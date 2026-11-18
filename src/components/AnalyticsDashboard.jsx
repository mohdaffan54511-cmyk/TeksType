import { useMemo } from "react";

export default function AnalyticsDashboard({ isOpen, onClose, history = [], streak = 0, bestWpm = 0 }) {
  if (!isOpen) return null;

  const stats = useMemo(() => {
    if (!history.length) {
      return { totalSessions: 0, totalTimeMinutes: 0, avgWpm: 0, avgAccuracy: 0 };
    }
    const totalSessions = history.length;
    const totalSeconds = history.reduce((acc, item) => {
      const dur = item.duration || "15s";
      return acc + (dur.includes("min") ? 300 : parseInt(dur, 10) || 15);
    }, 0);
    const totalWpm = history.reduce((acc, item) => acc + (Number(item.wpm) || 0), 0);
    const totalAcc = history.reduce((acc, item) => acc + (Number(item.accuracy) || 0), 0);

    return {
      totalSessions,
      totalTimeMinutes: Math.round((totalSeconds / 60) * 10) / 10,
      avgWpm: Math.round(totalWpm / totalSessions),
      avgAccuracy: Math.round(totalAcc / totalSessions),
    };
  }, [history]);

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <div className="analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-header">
          <div>
            <h2 className="analytics-title">Performance Analytics</h2>
            <p className="analytics-subtitle">Real metrics from your practice history</p>
          </div>
          <button type="button" className="analytics-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="analytics-kpi-grid">
          <div className="kpi-card">
            <span className="kpi-label">Total Sessions</span>
            <strong className="kpi-value">{stats.totalSessions}</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Highest Speed</span>
            <strong className="kpi-value highlight-purple">{bestWpm} WPM</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Average Speed</span>
            <strong className="kpi-value">{stats.avgWpm} WPM</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Average Accuracy</span>
            <strong className="kpi-value highlight-green">{stats.avgAccuracy}%</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Time Spent</span>
            <strong className="kpi-value">{stats.totalTimeMinutes} min</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Current Streak</span>
            <strong className="kpi-value highlight-orange">🔥 {streak}</strong>
          </div>
        </div>

        <div className="analytics-section">
          <h3 className="analytics-section-title">Recent Session Logs</h3>
          {history.length === 0 ? (
            <div className="analytics-empty">No sessions recorded yet.</div>
          ) : (
            <div className="table-responsive">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>WPM</th>
                    <th>Accuracy</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td><span className="badge-mode">{(row.mode || "words").toUpperCase()}</span></td>
                      <td className="bold-wpm">{row.wpm}</td>
                      <td>{row.accuracy}%</td>
                      <td>{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
