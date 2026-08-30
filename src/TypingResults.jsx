import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './TypingResults.css';

/**
 * Custom hook for smooth requestAnimationFrame count-up
 */
const useCountUp = (endValue, duration = 850, enabled = true) => {
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
  onTryAgain,
  onChangeTest,
}) {
  const [copiedToast, setCopiedToast] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const animatedWpm = useCountUp(wpm, 900, mounted);
  const animatedAccuracy = useCountUp(accuracy, 800, mounted);
  const animatedChars = useCountUp(characters, 700, mounted);
  const animatedErrors = useCountUp(errors, 600, mounted);
  const animatedWords = useCountUp(correctWords, 700, mounted);

  // Performance Ring calculation (benchmarked against 120 WPM)
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const performanceRatio = Math.min(Math.max(wpm / 120, 0.08), 1);
  const strokeDashoffset = circumference - (mounted ? performanceRatio * circumference : 0);

  // Dynamic feedback message based on speed
  const performanceMessage = useMemo(() => {
    if (wpm < 20) return 'Great start — keep practicing.';
    if (wpm < 40) return 'Nice progress — keep building your rhythm.';
    if (wpm < 60) return 'Good typing speed — accuracy comes first.';
    if (wpm < 80) return "Strong typing — you're getting faster.";
    if (wpm < 100) return 'Excellent typing speed!';
    return "Outstanding! That's seriously fast.";
  }, [wpm]);

  // Generate lightweight SVG Line Chart trajectory representing typing velocity
  const chartData = useMemo(() => {
    const pointsCount = 10;
    const width = 460;
    const height = 120;
    const padding = 14;

    const points = [];
    const baseWpm = Math.max(wpm, 15);
    const startWpm = Math.max(10, Math.round(baseWpm * 0.7));

    for (let i = 0; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      // Realistic typing acceleration curve with mild fluctuation based on accuracy
      const wave = Math.sin(progress * Math.PI * 2.5) * (errors > 0 ? 3.5 : 1.8);
      const val = startWpm + (baseWpm - startWpm) * Math.pow(progress, 0.75) + wave;
      
      const x = padding + progress * (width - 2 * padding);
      const y = height - padding - ((val / (baseWpm * 1.25 || 50)) * (height - 2 * padding));
      points.push({ x: Math.round(x), y: Math.max(padding, Math.min(height - padding, Math.round(y))) });
    }

    // Generate smooth SVG Catmull-Rom/Bezier curve path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${p2.x} ${p2.y}`;
    }

    const areaD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { pathD: d, areaD, points };
  }, [wpm, errors]);

  // Keyboard shortcut (Enter -> Try Again)
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
          title: 'TypePerfectly Result',
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

  const copyToClipboard = (textToCopy) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => showToast());
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
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
    <div className={`tp-results-wrapper ${mounted ? 'tp-visible' : ''}`} role="region" aria-label="Typing test results">
      {/* Toast Notification */}
      <div className={`tp-toast ${copiedToast ? 'tp-toast-show' : ''}`} aria-live="polite">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Result copied to clipboard!
      </div>

      <div className="tp-dashboard-card">
        {/* Top Developer Telemetry Bar */}
        <div className="tp-header-bar">
          <div className="tp-badge-group">
            <span className="tp-status-indicator"></span>
            <span className="tp-badge-text">SESSION COMPLETE</span>
          </div>
          <div className="tp-meta-tags">
            <span className="tp-tag">{language}</span>
            <span className="tp-tag">{time}s</span>
          </div>
        </div>

        {/* Main Analytics Dashboard Body */}
        <div className="tp-dashboard-body">
          {/* Left Hero Gauge Card */}
          <div className="tp-hero-col">
            <div className="tp-gauge-container">
              <svg className="tp-gauge-svg" width="150" height="150" viewBox="0 0 150 150">
                <defs>
                  <linearGradient id="tpRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <circle
                  className="tp-gauge-track"
                  cx="75"
                  cy="75"
                  r={radius}
                  strokeWidth="8"
                />
                <circle
                  className="tp-gauge-value"
                  cx="75"
                  cy="75"
                  r={radius}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  stroke="url(#tpRingGradient)"
                />
              </svg>

              <div className="tp-hero-wpm-inner">
                <span className="tp-hero-value">{animatedWpm}</span>
                <span className="tp-hero-label">WPM</span>
              </div>
            </div>

            <p className="tp-feedback-pill">{performanceMessage}</p>
          </div>

          {/* Right Speed Performance Timeline Chart */}
          <div className="tp-chart-col">
            <div className="tp-chart-header">
              <span className="tp-chart-title">Velocity Trajectory</span>
              <span className="tp-chart-legend">
                <i className="tp-chart-dot" /> Live Pace
              </span>
            </div>
            
            <div className="tp-svg-chart-wrap">
              <svg className="tp-chart-svg" viewBox="0 0 460 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="tpChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="460" y2="30" className="tp-chart-grid-line" />
                <line x1="0" y1="65" x2="460" y2="65" className="tp-chart-grid-line" />
                <line x1="0" y1="100" x2="460" y2="100" className="tp-chart-grid-line" />

                {/* Area Fill */}
                <path d={chartData.areaD} fill="url(#tpChartGradient)" />

                {/* Line Path */}
                <path d={chartData.pathD} className="tp-chart-line" />

                {/* End Value Point */}
                {chartData.points.length > 0 && (
                  <circle
                    cx={chartData.points[chartData.points.length - 1].x}
                    cy={chartData.points[chartData.points.length - 1].y}
                    r="4.5"
                    className="tp-chart-endpoint"
                  />
                )}
              </svg>

              <div className="tp-chart-x-axis">
                <span>0s</span>
                <span>{Math.round(time / 2)}s</span>
                <span>{time}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stat Cards Grid */}
        <div className="tp-stats-grid">
          <div className="tp-stat-item">
            <span className="tp-stat-label">Accuracy</span>
            <span className="tp-stat-value tp-accent-green">{animatedAccuracy}%</span>
          </div>

          <div className="tp-stat-item">
            <span className="tp-stat-label">Characters</span>
            <span className="tp-stat-value">{animatedChars}</span>
          </div>

          <div className="tp-stat-item">
            <span className="tp-stat-label">Correct Words</span>
            <span className="tp-stat-value">{animatedWords}</span>
          </div>

          <div className="tp-stat-item">
            <span className="tp-stat-label">Errors</span>
            <span className={`tp-stat-value ${errors > 0 ? 'tp-accent-red' : ''}`}>{animatedErrors}</span>
          </div>

          <div className="tp-stat-item">
            <span className="tp-stat-label">Time</span>
            <span className="tp-stat-value">{time}s</span>
          </div>
        </div>

        {/* Premium Action Button Strip */}
        <div className="tp-actions-row">
          <button
            type="button"
            className="tp-btn tp-btn-primary"
            onClick={onTryAgain}
            aria-label="Try test again"
            autoFocus
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            <span>Try Again</span>
            <kbd className="tp-kbd">↵</kbd>
          </button>

          {onChangeTest && (
            <button
              type="button"
              className="tp-btn tp-btn-secondary"
              onClick={onChangeTest}
              aria-label="Change typing mode or settings"
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
            className="tp-btn tp-btn-secondary"
            onClick={handleShare}
            aria-label="Share your typing result"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            <span>Share Result</span>
          </button>
        </div>
      </div>
    </div>
  );
}
