import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./advanced-typing.css";

const KEYBOARD_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["z","x","c","v","b","n","m"],
];

const CHUNK_WORDS = [
  "the","and","that","with","from","this","have","your","about","would",
  "there","their","which","focus","better","growth","future","through",
  "progress","strong","learn","business","client","report","typing"
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readLiveStat(label) {
  const cards = [...document.querySelectorAll(".stats-grid > div")];
  const card = cards.find((item) =>
    item.querySelector("span")?.textContent?.trim().toLowerCase() === label.toLowerCase()
  );
  const raw = card?.querySelector("strong")?.textContent || "0";
  return Number(raw.replace(/[^\d.]/g, "")) || 0;
}

function Sparkline({ data }) {
  const points = useMemo(() => {
    if (!data?.length) return "0,120 640,120";
    const width = 640;
    const height = 220;
    const max = Math.max(10, ...data.map((item) => item.wpm));
    return data
      .map((item, index) => {
        const x = data.length === 1 ? 0 : (index / (data.length - 1)) * width;
        const y = height - (item.wpm / max) * (height - 24);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [data]);

  return (
    <div className="tp-chart-wrap">
      <svg viewBox="0 0 640 220" role="img" aria-label="WPM speed by second">
        <defs>
          <linearGradient id="tpLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c4dff" />
            <stop offset="100%" stopColor="#d2b5ff" />
          </linearGradient>
          <linearGradient id="tpArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8c5cff" stopOpacity=".36" />
            <stop offset="100%" stopColor="#8c5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[44, 88, 132, 176].map((y) => (
          <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="rgba(255,255,255,.08)" />
        ))}
        <polyline points={`0,220 ${points} 640,220`} fill="url(#tpArea)" stroke="none" />
        <polyline points={points} fill="none" stroke="url(#tpLine)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="tp-chart-axis">
        <span>Start</span>
        <span>Live WPM fluctuation</span>
        <span>Finish</span>
      </div>
    </div>
  );
}

function Heatmap({ stats }) {
  const maxHeat = Math.max(
    1,
    ...Object.values(stats).map((item) => {
      const attempts = Math.max(1, item.attempts || 0);
      const errorRate = (item.errors || 0) / attempts;
      const latency = (item.totalLatency || 0) / attempts;
      return errorRate * 100 + Math.max(0, latency - 140) / 7;
    })
  );

  return (
    <>
      <div className="tp-keyboard">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div className="tp-key-row" key={rowIndex}>
            {row.map((key) => {
              const item = stats[key] || {};
              const attempts = Math.max(1, item.attempts || 0);
              const score =
                ((item.errors || 0) / attempts) * 100 +
                Math.max(0, ((item.totalLatency || 0) / attempts) - 140) / 7;
              const heat = clamp(score / maxHeat, 0, 1);
              const background =
                heat === 0
                  ? "rgba(255,255,255,.06)"
                  : `rgba(255, ${Math.round(142 - heat * 92)}, 45, ${0.35 + heat * 0.58})`;
              return (
                <div
                  key={key}
                  className="tp-heat-key"
                  title={`${key.toUpperCase()} • ${Math.round(heat * 100)}% heat`}
                  style={{
                    background,
                    boxShadow: heat > 0.28
                      ? `0 0 ${10 + heat * 22}px rgba(255,68,35,${heat * 0.68})`
                      : "none",
                  }}
                >
                  {key.toUpperCase()}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="tp-heat-legend">
        <span>Strong</span><div /><span>Needs practice</span>
      </div>
    </>
  );
}

function Dashboard({ result, history, keyStats, onRetry, onClose }) {
  const share = () => {
    const text = `I just unlocked a 50x flow state on Type Perfectly at ${result.wpm} WPM with ${result.accuracy}% accuracy! Can you beat me? https://typeperfectly.com`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return createPortal(
    <div className="tp-result-overlay" role="dialog" aria-modal="true">
      <section className="tp-result-dashboard">
        <button className="tp-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <header className="tp-result-header">
          <span>SESSION COMPLETE</span>
          <h2>Your performance</h2>
          <p>Review your speed, accuracy, flow and the keys that need more practice.</p>
        </header>

        <div className="tp-main-stats">
          <article><span>FINAL WPM</span><strong>{result.wpm}</strong><small>Words per minute</small></article>
          <article><span>RAW ACCURACY</span><strong>{result.accuracy}%</strong><small>Correct keystrokes</small></article>
          <article><span>CHARACTERS</span><strong>{result.characters}</strong><small>Total characters typed</small></article>
        </div>

        <div className="tp-dashboard-grid">
          <article className="tp-glass-panel">
            <div className="tp-panel-title"><span>FLOW GRAPH</span><h3>WPM by second</h3></div>
            <Sparkline data={history} />
          </article>
          <article className="tp-glass-panel">
            <div className="tp-panel-title"><span>KEY ANALYSIS</span><h3>Error and latency heatmap</h3></div>
            <Heatmap stats={keyStats} />
          </article>
        </div>

        <div className="tp-actions">
          <button type="button" className="tp-retry" onClick={onRetry}>↻ Retry Session <kbd>Esc</kbd></button>
          <button type="button" className="tp-share" onClick={share}>↗ Share to Twitter/X</button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default function AdvancedTypingEnhancer() {
  const [contentMount, setContentMount] = useState(null);
  const [typingMount, setTypingMount] = useState(null);
  const [chunking, setChunking] = useState(false);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [blastId, setBlastId] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [result, setResult] = useState({ wpm: 0, accuracy: 100, characters: 0 });
  const [wpmHistory, setWpmHistory] = useState([]);
  const [keyStats, setKeyStats] = useState({});

  const chunkRef = useRef({ index: 0, typed: "" });
  const lastKeyTimeRef = useRef(performance.now());
  const previousFinishedRef = useRef(false);

  useEffect(() => {
    const findMounts = () => {
      setContentMount(document.querySelector(".content-control .button-strip"));
      setTypingMount(document.querySelector(".typing-card"));
    };
    findMounts();
    const observer = new MutationObserver(findMounts);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("tp-chunking-active", chunking);
    return () => document.documentElement.classList.remove("tp-chunking-active");
  }, [chunking]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const finished = Boolean(document.querySelector(".finished-box"));
      if (finished && !previousFinishedRef.current) {
        setResult({
          wpm: readLiveStat("WPM"),
          accuracy: readLiveStat("Accuracy"),
          characters:
            document.querySelectorAll(".typing-text .char.correct, .typing-text .char.wrong").length ||
            Object.values(keyStats).reduce((sum, item) => sum + (item.attempts || 0), 0),
        });
        setDashboardOpen(true);
      }
      previousFinishedRef.current = finished;

      const time = readLiveStat("Time");
      const wpm = readLiveStat("WPM");
      if (!finished && (time > 0 || wpm > 0)) {
        setWpmHistory((previous) => {
          if (previous.length && previous.at(-1).wpm === wpm) return previous;
          return [...previous, { second: previous.length + 1, wpm }].slice(-300);
        });
      }
    }, 350);
    return () => window.clearInterval(interval);
  }, [keyStats]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

      if (dashboardOpen && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        retry();
        return;
      }

      if (!chunking) {
        if (event.key.length !== 1) return;
        const expected = document.querySelector(".typing-text .char.current")?.textContent || "";
        const now = performance.now();
        const latency = now - lastKeyTimeRef.current;
        lastKeyTimeRef.current = now;
        const key = (expected || event.key).toLowerCase();
        if (!/[a-z]/.test(key)) return;
        setKeyStats((previous) => {
          const item = previous[key] || { attempts: 0, errors: 0, totalLatency: 0 };
          return {
            ...previous,
            [key]: {
              attempts: item.attempts + 1,
              errors: item.errors + (event.key.toLowerCase() === expected.toLowerCase() ? 0 : 1),
              totalLatency: item.totalLatency + latency,
            },
          };
        });
        return;
      }

      if (event.key === "Backspace" || event.key === " " || event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.key.length !== 1) return;

      event.preventDefault();
      event.stopPropagation();

      const word = CHUNK_WORDS[chunkRef.current.index % CHUNK_WORDS.length];
      const expected = word[chunkRef.current.typed.length];
      const pressed = event.key.toLowerCase();
      const now = performance.now();
      const latency = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (expected && /[a-z]/.test(expected)) {
        setKeyStats((previous) => {
          const item = previous[expected] || { attempts: 0, errors: 0, totalLatency: 0 };
          return {
            ...previous,
            [expected]: {
              attempts: item.attempts + 1,
              errors: item.errors + (pressed === expected ? 0 : 1),
              totalLatency: item.totalLatency + latency,
            },
          };
        });
      }

      if (pressed !== expected) {
        setErrorFlash(true);
        window.setTimeout(() => setErrorFlash(false), 110);
        return;
      }

      const next = chunkRef.current.typed + pressed;
      chunkRef.current.typed = next;
      setTyped(next);

      if (next.length === word.length) {
        chunkRef.current.typed = "";
        chunkRef.current.index = (chunkRef.current.index + 1) % CHUNK_WORDS.length;
        requestAnimationFrame(() => {
          setTyped("");
          setChunkIndex(chunkRef.current.index);
          setBlastId((value) => value + 1);
        });
      }
    };

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [chunking, dashboardOpen]);

  const toggleChunking = () => {
    const next = !chunking;
    chunkRef.current = { index: 0, typed: "" };
    setChunkIndex(0);
    setTyped("");
    setBlastId((value) => value + 1);
    setChunking(next);
    setDashboardOpen(false);
    setWpmHistory([]);
    setKeyStats({});
    lastKeyTimeRef.current = performance.now();
    document.querySelector(".restart-button")?.click();
  };

  const retry = () => {
    setDashboardOpen(false);
    setWpmHistory([]);
    setKeyStats({});
    previousFinishedRef.current = false;
    lastKeyTimeRef.current = performance.now();
    document.querySelector(".restart-button")?.click();
  };

  const chunkWord = CHUNK_WORDS[chunkIndex % CHUNK_WORDS.length];

  return (
    <>
      {contentMount && createPortal(
        <button
          type="button"
          className={chunking ? "selected tp-chunk-button" : "tp-chunk-button"}
          onClick={toggleChunking}
        >
          50× CHUNKING
        </button>,
        contentMount
      )}

      {typingMount && chunking && createPortal(
        <div className="tp-chunk-stage" onPointerDown={() => document.querySelector(".app")?.focus()}>
          <div className="tp-chunk-label"><strong>50×</strong> MUSCLE-MEMORY CHUNKING</div>
          <div key={blastId} className={`tp-chunk-word ${errorFlash ? "tp-chunk-error" : ""}`}>
            {chunkWord.split("").map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={
                  index < typed.length ? "done" :
                  index === typed.length ? "current" : ""
                }
              >
                {letter}
              </span>
            ))}
          </div>
          <p>No backspace. Keep your momentum.</p>
          <small>Word {chunkIndex + 1}</small>
        </div>,
        typingMount
      )}

      {dashboardOpen && (
        <Dashboard
          result={result}
          history={wpmHistory}
          keyStats={keyStats}
          onRetry={retry}
          onClose={() => setDashboardOpen(false)}
        />
      )}
    </>
  );
}
