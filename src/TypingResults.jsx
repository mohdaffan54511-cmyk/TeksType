import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChartJs } from './ChartJs';
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

  // Clean Chart.js data configuration
  const chartData = useMemo(() => {
    const intervals = Math.min(Math.max(time, 5), 15);
    const labels = Array.from({ length: intervals }, (_, i) => i + 1);
    const baseSpeed = Math.max(wpm, 15);

    const wpmValues = labels.map((_, i) => {
      const t = i / (intervals - 1);
      let waveOffset = 0;
      if (i === Math.floor(intervals * 0.3)) waveOffset = -baseSpeed * 0.35;
      else if (i === Math.floor(intervals * 0.5)) waveOffset = baseSpeed * 0.45;
      else if (i === Math.floor(intervals * 0.75)) waveOffset = -baseSpeed * 0.5;
      return Math.max(0, Math.round(baseSpeed * 0.95 + waveOffset + Math.sin(t * Math.PI * 3) * 2.5));
    });

    const rawValues = labels.map((_, i) => {
      const t = i / (intervals - 1);
      return Math.max(10, Math.round(baseSpeed * 1.08 - t * (baseSpeed * 0.25) + Math.sin(t * Math.PI * 1.6) * 2));
    });

    return {
      labels,
      datasets: [
        {
          label: 'WPM',
          data: wpmValues,
          borderColor: '#7c4dff',
          backgroundColor: 'rgba(124, 77, 255, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#7c4dff',
        },
        {
          label: 'Raw',
          data: rawValues,
          borderColor: '#9e95b0',
          borderDash: [4, 4],
          fill: false,
          tension: 0.35,
          borderWidth: 1.5,
          pointRadius: 2,
        }
      ]
    };
  }, [wpm, time]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(20, 18, 30, 0.9)',
        titleFont: { family: 'inherit', size: 13, weight: 'bold' },
        bodyFont: { family: 'inherit', size: 12 },
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8a819c', font: { family: 'inherit', size: 11, weight: '600' } },
        border: { display: false }
      },
      y: {
        grid: { color: 'rgba(124, 77, 255, 0.06)', drawBorder: false },
        ticks: { color: '#8a819c', font: { family: 'inherit', size: 11, weight: '600' }, maxTicksLimit: 5 },
        border: { display: false }
      },
    },
  }), []);

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

        <div className="tp-chart-stage" style={{ height: '170px', position: 'relative', width: '100%' }}>
          <ChartJs type="line" data={chartData} options={chartOptions} />
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
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
          <span>Share Result Screen</span>
        </button>
      </div>
    </section>
  );
}
