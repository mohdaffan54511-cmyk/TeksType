import React, { useState, useEffect, useCallback } from 'react';
import './TypingResults.css';

/**
 * Custom hook for smooth requestAnimationFrame count-up
 */
const useCountUp = (endValue, duration = 900, enabled = true) => {
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
    const timer = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(timer);
  }, []);

  const animatedWpm = useCountUp(wpm, 1000, mounted);
  const animatedAccuracy = useCountUp(accuracy, 850, mounted);
  const animatedChars = useCountUp(characters, 750, mounted);
  const animatedErrors = useCountUp(errors, 600, mounted);
  const animatedWords = useCountUp(correctWords, 750, mounted);
  const animatedConsistency = useCountUp(consistency || 0, 850, mounted);

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const performanceRatio = Math.min(Math.max(wpm / 120, 0.05), 1);
  const strokeDashoffset = circumference - (mounted ? performanceRatio * circumference : 0);

  const getPerformanceFeedback = (speed) => {
    if (speed < 20) return 'Great start — keep practicing.';
    if (speed < 40) return 'Nice progress — keep building your rhythm.';
    if (speed < 60) return 'Good typing speed — accuracy comes first.';
    if (speed < 80) return "Strong typing — you're getting faster.";
    if (speed < 100) return 'Excellent typing speed!';
    return "Outstanding! That's seriously fast.";
  };

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

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast();
      });
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
    <div className={`tp-results-wrapper ${mounted ? 'tp-visible' : ''}`} role="region" aria-label="Typing test results">
      <div className={`tp-toast ${copiedToast ? 'tp-toast-show' : ''}`} aria-live="polite">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Result copied to clipboard!
      </div>

      <div className="tp-card">
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

        <div className="tp-hero-section">
          <div className="tp-gauge-container">
            <svg className="tp-gauge-svg" width="160" height="160" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="tpRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <circle
                className="tp-gauge-track"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="8"
              />
              <circle
                className="tp-gauge-value"
                cx="80"
                cy="80"
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

          <p className="tp-feedback-message">{getPerformanceFeedback(wpm)}</p>
        </div>

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

          {consistency !== null && (
            <div className="tp-stat-item">
              <span className="tp-stat-label">Consistency</span>
              <span className="tp-stat-value">{animatedConsistency}%</span>
            </div>
          )}
        </div>

        <div className="tp-actions-row">
          <button
            type="button"
            className="tp-btn tp-btn-primary"
            onClick={onTryAgain}
            aria-label="Try test again"
            autoFocus
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
