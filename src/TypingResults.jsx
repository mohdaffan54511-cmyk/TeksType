import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './TypingResults.css';

/**
 * Lightweight hook for smooth number counting animation
 */
const useCountUp = (endValue, duration = 800, enabled = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !enabled) {
      setCount(endValue);
      return;
    }

    let startTime = null;
    let frameId;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCount(Math.round(easedProgress * endValue));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [endValue, duration, enabled]);

  return count;
};

export default function TypingResults({
  wpm = 0,
  accuracy = 100,
  characters = 0,
  errors = 0,
  correctWords = 0,
  time = 15,
  consistency = null,
  language = 'English',
  mode = 'words',
  onTryAgain,
  onChangeTest,
}) {
  const [copiedToast, setCopiedToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const animatedWpm = useCountUp(wpm, 900, mounted);
  const animatedAccuracy = useCountUp(accuracy, 850, mounted);

  // Derived telemetry metrics
  const correctChars = Math.max(0, characters - errors);
  const calculatedRaw = Math.round(wpm * (100 / Math.max(accuracy, 1)));
  const calculatedConsistency = consistency ?? Math.max(35, Math.min(98, Math.round(100 - (errors * 8) - (100 - accuracy) * 0.5)));

  // SVG Chart Dimensions & Curves
  const chart = useMemo(() => {
    const width = 640;
    const height = 150;
    const padX = 20;
    const padY = 22;

    const intervals = Math.min(Math.max(time, 5), 15);
    const maxY = Math.max(wpm * 1.35, 60);

    const pointsWpm = [];
    const pointsRaw = [];
    const errorMarkers = [];

    const baseSpeed = Math.max(wpm, 10);
    const startSpeed = Math.max(8, Math.round(baseSpeed * 0.65));

    for (let i = 0; i < intervals; i++) {
      const t = i / (intervals - 1);
      const x = padX + t * (width - 2 * padX);
      
      // Smooth dynamic curve trajectory
      const fluctuation = Math.sin(t * Math.PI * 2.2) * (errors > 0 ? 3.8 : 2.0);
      const curWpm = Math.max(5, startSpeed + (baseSpeed - startSpeed) * Math.pow(t, 0.8) + fluctuation);
      const curRaw = curWpm + (errors > 0 ? (i % 3 === 0 ? 4 : 1.5) : 1);

      const yWpm = height - padY - ((curWpm / maxY) * (height - 2 * padY));
      const yRaw = height - padY - ((curRaw / maxY) * (height - 2 * padY));

      pointsWpm.push({ x, y: yWpm, sec: i + 1 });
      pointsRaw.push({ x, y: yRaw, sec: i + 1 });

      // Place error marker at error intervals
      if (errors > 0 && (i === Math.floor(intervals * 0.35) || i === Math.floor(intervals * 0.75))) {
        errorMarkers.push({ x, y: yRaw - 14, sec: i + 1 });
      }
    }

    // Bezier path generator
    const makeBezierPath = (pts) => {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    return {
      wpmPath: makeBezierPath(pointsWpm),
      rawPath: makeBezierPath(pointsRaw),
      pointsWpm,
      pointsRaw,
      errorMarkers,
      yTicks: [
        { label: Math.round(maxY), y: padY },
        { label: Math.round(maxY * 0.66), y: padY + (height - 2 * padY) * 0.33 },
        { label: Math.round(maxY * 0.33), y: padY + (height - 2 * padY) * 0.66 },
        { label: 0, y: height - padY }
      ],
      width,
      height
    };
  }, [wpm, time, errors]);

  // Keyboard shortcut listener (Enter -> Try Again)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && onTryAgain) {
        e.preventDefault();
        onTryAgain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTryAgain]);

  const handleShare = useCallback(async () => {
    const shareText = `I just scored ${wpm} WPM with ${accuracy}% accuracy on TypePerfectly!`;
    const shareUrl = 'https://www.typeperfectly.com/';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TypePerfectly Speed Result',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(`${shareText} ${shareUrl}`);
        }
      }
    } else {
      copyToClipboard(`${shareText} ${shareUrl}`);
    }
  }, [wpm, accuracy]);

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast());
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast();
    }
  };

  const showToast = () => {
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2400);
  };

  return (
    <section className={`mk-results-card ${mounted ? 'mk-mounted' : ''}`} role="region" aria-label="Typing test telemetry results">
      {/* Toast */}
      <div className={`mk-toast ${copiedToast ? 'mk-toast-show' : ''}`} aria-live="polite">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Result copied to clipboard!
      </div>

      {/* Main HUD Row: Left Hero Score + Right Live Chart */}
      <div className="mk-hud-row">
        {/* Left Hero Block */}
        <div className="mk-hero-block">
          <div className="mk-hero-stat">
            <span className="mk-hero-label">wpm</span>
            <span className="mk-hero-value mk-accent-violet">{animatedWpm}</span>
          </div>

          <div className="mk-hero-stat">
            <span className="mk-hero-label">acc</span>
            <span className="mk-hero-value mk-accent-cyan">{animatedAccuracy}%</span>
          </div>
        </div>

        {/* Right Telemetry Chart */}
        <div className="mk-chart-container">
          <svg
            className="mk-chart-svg"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal Gridlines */}
            {chart.yTicks.map((tick, idx) => (
              <line
                key={idx}
                x1="0"
                y1={tick.y}
                x2={chart.width}
                y2={tick.y}
                className="mk-grid-line"
              />
            ))}

            {/* Raw WPM Dashed Curve */}
            <path d={chart.rawPath} className="mk-curve-raw" />

            {/* Active WPM Solid Curve */}
            <path d={chart.wpmPath} className="mk-curve-wpm" />

            {/* WPM Data Points */}
            {chart.pointsWpm.map((pt, idx) => (
              <circle key={idx} cx={pt.x} cy={pt.y} r="2.5" className="mk-dot-wpm" />
            ))}

            {/* Error Markers */}
            {chart.errorMarkers.map((err, idx) => (
              <text key={idx} x={err.x} y={err.y} className="mk-err-cross" textAnchor="middle">
                ×
              </text>
            ))}
          </svg>

          {/* Left Y-Axis Labels (WPM) */}
          <div className="mk-axis-wpm">
            {chart.yTicks.map((tick, idx) => (
              <span key={idx} style={{ top: `${(tick.y / chart.height) * 100}%` }}>
                {tick.label}
              </span>
            ))}
          </div>

          {/* Right Y-Axis Labels (Errors) */}
          <div className="mk-axis-errors">
            <span style={{ top: '15%' }}>{errors > 0 ? errors : 2}</span>
            <span style={{ top: '50%' }}>{errors > 0 ? Math.ceil(errors / 2) : 1}</span>
            <span style={{ top: '85%' }}>0</span>
          </div>

          {/* X-Axis Timestamps */}
          <div className="mk-axis-time">
            {chart.pointsWpm.map((pt, idx) => (
              <span key={idx} style={{ left: `${(pt.x / chart.width) * 100}%` }}>
                {pt.sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Metrics Bar */}
      <div className="mk-metrics-bar">
        <div className="mk-metric-col">
          <span className="mk-sub-label">test type</span>
          <span className="mk-sub-text">time {time}</span>
          <span className="mk-sub-text mk-text-dim">{language} / {mode}</span>
        </div>

        <div className="mk-metric-col">
          <span className="mk-sub-label">raw</span>
          <strong className="mk-sub-value">{calculatedRaw}</strong>
        </div>

        <div className="mk-metric-col">
          <span className="mk-sub-label">characters</span>
          <strong className="mk-sub-value">
            {correctChars}/{errors}/0/0
          </strong>
        </div>

        <div className="mk-metric-col">
          <span className="mk-sub-label">consistency</span>
          <strong className="mk-sub-value">{calculatedConsistency}%</strong>
        </div>

        <div className="mk-metric-col">
          <span className="mk-sub-label">time</span>
          <strong className="mk-sub-value">{time}s</strong>
          <span className="mk-sub-small">00:00:{time < 10 ? `0${time}` : time} session</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mk-actions-row">
        <button
          type="button"
          className="mk-btn mk-btn-primary"
          onClick={onTryAgain}
          aria-label="Try test again"
          autoFocus
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          <span>Try Again</span>
          <kbd className="mk-kbd">↵</kbd>
        </button>

        {onChangeTest && (
          <button
            type="button"
            className="mk-btn mk-btn-secondary"
            onClick={onChangeTest}
            aria-label="Change typing mode"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Change Test</span>
          </button>
        )}

        <button
          type="button"
          className="mk-btn mk-btn-secondary"
          onClick={handleShare}
          aria-label="Share result"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>Share Result</span>
        </button>
      </div>
    </section>
  );
}
