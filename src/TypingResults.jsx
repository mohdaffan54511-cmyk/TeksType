import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './TypingResults.css';

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
      setCount(Math.round(easeOutCubic(progress) * endValue));

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
    const timer = setTimeout(() => setMounted(true), 25);
    return () => clearTimeout(timer);
  }, []);

  const animatedWpm = useCountUp(wpm, 850, mounted);
  const animatedAccuracy = useCountUp(accuracy, 800, mounted);

  const correctChars = Math.max(0, characters - errors);
  const calculatedRaw = Math.round(wpm * (100 / Math.max(accuracy, 1)));
  const calculatedConsistency =
    consistency ?? Math.max(30, Math.min(99, Math.round(100 - errors * 8 - (100 - accuracy) * 0.5)));

  const chart = useMemo(() => {
    const width = 1200;
    const height = 160;
    const padX = 28;
    const padY = 20;

    const intervals = Math.min(Math.max(time, 5), 15);
    const maxY = Math.max(wpm * 1.35, 45);

    const pointsWpm = [];
    const pointsRaw = [];
    const errorMarkers = [];

    const baseSpeed = Math.max(wpm, 15);

    for (let i = 0; i < intervals; i++) {
      const t = i / (intervals - 1);
      const x = padX + t * (width - 2 * padX);

      const rawWpm = Math.max(10, baseSpeed * 1.08 - t * (baseSpeed * 0.25) + Math.sin(t * Math.PI * 1.6) * 2);
      const yRaw = height - padY - ((rawWpm / maxY) * (height - 2 * padY));
      pointsRaw.push({ x, y: yRaw, sec: i + 1 });

      let waveOffset = 0;
      if (i === Math.floor(intervals * 0.3)) waveOffset = -baseSpeed * 0.35;
      else if (i === Math.floor(intervals * 0.5)) waveOffset = baseSpeed * 0.45;
      else if (i === Math.floor(intervals * 0.75)) waveOffset = -baseSpeed * 0.5;

      const activeWpm = Math.max(0, baseSpeed * 0.95 + waveOffset + Math.sin(t * Math.PI * 3) * 2.5);
      const yActive = height - padY - ((activeWpm / maxY) * (height - 2 * padY));
      pointsWpm.push({ x, y: yActive, sec: i + 1 });

      if (errors > 0 && i === Math.floor(intervals * 0.5)) {
        errorMarkers.push({ x, y: yRaw - 14, sec: i + 1 });
      }
    }

    const makeBezier = (pts) => {
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
      rawPath: makeBezier(pointsRaw),
      wpmPath: makeBezier(pointsWpm),
      pointsRaw,
      pointsWpm,
      errorMarkers,
      yTicksLeft: [
        { label: Math.round(maxY), y: padY },
        { label: Math.round(maxY * 0.66), y: padY + (height - 2 * padY) * 0.33 },
        { label: Math.round(maxY * 0.33), y: padY + (height - 2 * padY) * 0.66 },
        { label: 0, y: height - padY },
      ],
      width,
      height,
    };
  }, [wpm, time, errors]);

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
    const shareText = `I scored ${wpm} WPM with ${accuracy}% accuracy on TypePerfectly!`;
    const shareUrl = 'https://www.typeperfectly.com/';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'TypePerfectly Telemetry Result', text: shareText, url: shareUrl });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(`${shareText} ${shareUrl}`);
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
    setTimeout(() => setCopiedToast(false), 2200);
  };

  return (
    <section className={`tp-hud-theme-card ${mounted ? 'tp-mounted' : ''}`} role="region" aria-label="Typing telemetry result">
      <div className={`tp-hud-toast ${copiedToast ? 'tp-toast-show' : ''}`} aria-live="polite">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Result copied to clipboard!
      </div>

      <div className="tp-hud-main">
        <div className="tp-hero-side">
          <div className="tp-hero-unit">
            <span className="tp-label-tag">wpm</span>
            <span className="tp-val-display tp-purple-display">{animatedWpm}</span>
          </div>

          <div className="tp-hero-unit">
            <span className="tp-label-tag">acc</span>
            <span className="tp-val-display tp-cyan-display">{animatedAccuracy}%</span>
          </div>
        </div>

        <div className="tp-chart-stage">
          <span className="tp-y-label-left">Words per Minute</span>

          <div className="tp-axis-ticks-left">
            {chart.yTicksLeft.map((tick, idx) => (
              <span key={idx} style={{ top: `${(tick.y / chart.height) * 100}%` }}>
                {tick.label}
              </span>
            ))}
          </div>

          <svg className="tp-svg-canvas" viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none">
            {chart.yTicksLeft.map((tick, idx) => (
              <line key={idx} x1="0" y1={tick.y} x2={chart.width} y2={tick.y} className="tp-chart-grid" />
            ))}

            <path d={chart.rawPath} className="tp-line-raw" />

            {chart.pointsRaw.map((pt, idx) => (
              <circle key={`raw-${idx}`} cx={pt.x} cy={pt.y} r="2.2" className="tp-dot-raw" />
            ))}

            <path d={chart.wpmPath} className="tp-line-wpm" />

            {chart.pointsWpm.map((pt, idx) => (
              <circle key={`wpm-${idx}`} cx={pt.x} cy={pt.y} r="2.6" className="tp-dot-wpm" />
            ))}

            {chart.errorMarkers.map((err, idx) => (
              <text key={idx} x={err.x} y={err.y} className="tp-err-x" textAnchor="middle">
                ×
              </text>
            ))}
          </svg>

          <span className="tp-y-label-right">Errors</span>
          <div className="tp-axis-ticks-right">
            <span style={{ top: '12%' }}>{errors > 0 ? errors : 1}</span>
            <span style={{ top: '88%' }}>0</span>
          </div>

          <div className="tp-axis-ticks-bottom">
            {chart.pointsWpm.map((pt, idx) => (
              <span key={idx} style={{ left: `${(pt.x / chart.width) * 100}%` }}>
                {pt.sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="tp-telemetry-row">
        <div className="tp-tele-col">
          <span className="tp-tele-lbl">test type</span>
          <span className="tp-tele-val-dark">time {time}</span>
          <span className="tp-tele-val-muted">{language.toLowerCase()} / {mode}</span>
        </div>

        <div className="tp-tele-col">
          <span className="tp-tele-lbl">raw</span>
          <strong className="tp-tele-num">{calculatedRaw}</strong>
        </div>

        <div className="tp-tele-col">
          <span className="tp-tele-lbl">characters</span>
          <strong className="tp-tele-num">
            {correctChars}/{errors}/0/0
          </strong>
        </div>

        <div className="tp-tele-col">
          <span className="tp-tele-lbl">consistency</span>
          <strong className="tp-tele-num">{calculatedConsistency}%</strong>
        </div>

        <div className="tp-tele-col">
          <span className="tp-tele-lbl">time</span>
          <strong className="tp-tele-num">{time}s</strong>
          <span className="tp-tele-sub">00:00:{time < 10 ? `0${time}` : time} session</span>
        </div>
      </div>

      <div className="tp-actions-strip">
        <button type="button" className="tp-btn tp-btn-primary" onClick={onTryAgain} autoFocus>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          <span>Try Again</span>
          <kbd className="tp-kbd">↵</kbd>
        </button>

        {onChangeTest && (
          <button type="button" className="tp-btn tp-btn-secondary" onClick={onChangeTest}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Change Test</span>
          </button>
        )}

        <button type="button" className="tp-btn tp-btn-secondary" onClick={handleShare}>
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
