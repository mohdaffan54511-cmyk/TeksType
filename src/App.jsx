import { useCallback, useEffect, useMemo, useRef, useState } from "react";
const logo = "/TeksType.png";
const WORDS = {
  words: [
    "home", "now", "even", "used", "said", "government", "once", "any", "to", "and",
    "know", "world", "number", "another", "something", "until", "without", "my",
    "when", "right", "less", "school", "both", "there", "almost", "put", "be", "is",
    "people", "system", "place", "group", "against", "around", "because", "through",
    "while", "every", "important", "possible", "between", "business", "support"
  ],
  bigrams: [
    "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd",
    "ti", "es", "or", "te", "of", "ed", "is", "it", "al", "ar",
    "st", "to", "nt", "ng", "se", "ha", "as", "ou", "io", "le"
  ],
  trigrams: [
    "the", "and", "ing", "ion", "ent", "her", "tha", "nth", "was", "eth",
    "for", "dth", "hat", "his", "you", "ter", "ere", "all", "res", "ver"
  ],
  code: [
    "const", "return", "function", "import", "export", "async", "await", "array",
    "object", "string", "number", "boolean", "component", "state", "effect",
    "promise", "server", "client", "render", "props", "value", "index"
  ],
  business: [
    "client", "report", "project", "meeting", "growth", "revenue", "profit",
    "market", "sales", "strategy", "deadline", "invoice", "dashboard", "workflow",
    "summary", "proposal", "analysis", "support", "conversion", "follow"
  ],
  quotes: [
    "focus", "speed", "practice", "improve", "discipline", "clarity", "energy",
    "mindset", "momentum", "progress", "mastery", "habit", "vision", "action"
  ],
};

const INFO_PAGES = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Introduction",
        text: [
          "This Privacy Policy explains how TypeTeks handles information when you use our website.",
          "TypeTeks is a typing practice website designed to help users improve typing speed, accuracy, focus, and consistency.",
        ],
      },
      {
        heading: "Information we store",
        text: [
          "TypeTeks does not require an account and does not ask for passwords, payment information, or private documents.",
          "Best WPM, recent sessions, and preferences may be stored locally in your browser.",
        ],
      },
      {
        heading: "Local storage",
        text: [
          "Your typing progress is stored on your own device using browser localStorage.",
          "You can remove it at any time by clearing this site's browser data.",
        ],
      },
      {
        heading: "Contact",
        text: ["Questions can be sent to contact@typeteks.online."],
      },
    ],
  },
  terms: {
    title: "Terms of Use",
    sections: [
      {
        heading: "Use of TypeTeks",
        text: [
          "TypeTeks is provided as a typing practice tool for learning and productivity.",
          "Please use the website responsibly and do not attempt to disrupt or misuse the service.",
        ],
      },
      {
        heading: "Availability",
        text: [
          "We work to keep TypeTeks fast and reliable, but uninterrupted availability is not guaranteed.",
        ],
      },
    ],
  },
  contact: {
    title: "Contact",
    sections: [
      {
        heading: "Get in touch",
        text: [
          "Have feedback, suggestions, or partnership ideas?",
          "Email: contact@typeteks.online",
        ],
      },
    ],
  },
  support: {
    title: "Support",
    sections: [
      {
        heading: "Need help?",
        text: [
          "On mobile, tap the typing area to open the keyboard.",
          "On desktop, press Tab to restart and Esc to pause.",
        ],
      },
    ],
  },
  security: {
    title: "Security",
    sections: [
      {
        heading: "Security",
        text: [
          "TypeTeks runs mainly in your browser and does not request sensitive personal information.",
          "The website is delivered over secure HTTPS hosting.",
        ],
      },
    ],
  },
};

function makeText(mode) {
  const pool = WORDS[mode] || WORDS.words;
  const count = mode === "bigrams" ? 55 : mode === "trigrams" ? 48 : 42;
  return Array.from({ length: count }, () => pool[Math.floor(Math.random() * pool.length)]).join(" ");
}

function getAccuracy(correct, total) {
  return total === 0 ? 100 : Math.round((correct / total) * 100);
}

function getWpm(correctChars, elapsedMs) {
  if (elapsedMs <= 0) return 0;
  return Math.round(correctChars / 5 / (elapsedMs / 60000));
}

function buildHeatmap(target, input, timings) {
  const map = {};

  for (let i = 1; i < input.length; i += 1) {
    const a = target[i - 1];
    const b = target[i];
    if (!a || !b || a === " " || b === " ") continue;

    const key = a + b;
    const correct = input[i] === target[i];

    if (!map[key]) {
      map[key] = { combo: key, count: 0, totalMs: 0, errors: 0 };
    }

    map[key].count += 1;
    map[key].totalMs += timings[i] || 0;
    if (!correct) map[key].errors += 1;
  }

  return Object.values(map)
    .map((item) => ({
      ...item,
      avgMs: Math.round(item.totalMs / item.count),
      errorRate: Math.round((item.errors / item.count) * 100),
    }))
    .sort((a, b) => b.avgMs + b.errorRate * 3 - (a.avgMs + a.errorRate * 3))
    .slice(0, 8);
}

let audioContext = null;

function unlockAudio() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch {
    // Audio is optional.
  }
}

function playClick(type, enabled) {
  if (!enabled) return;

  try {
    unlockAudio();
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(type === "wrong" ? 155 : 560, now);
    gain.gain.setValueAtTime(type === "wrong" ? 0.06 : 0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } catch {
    // Keep typing even if sound cannot play.
  }
}

export default function App() {
  const [mode, setMode] = useState("words");
  const [duration, setDuration] = useState(15);
  const [text, setText] = useState(() => makeText("words"));
  const [input, setInput] = useState("");

  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const [correctChars, setCorrectChars] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const [soundOn, setSoundOn] = useState(true);
  const [noBackspace, setNoBackspace] = useState(false);
  const [activePage, setActivePage] = useState(null);

  const [best, setBest] = useState(() => Number(localStorage.getItem("TypeTeks_best") || 0));
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("TypeTeks_history") || "[]");
    } catch {
      return [];
    }
  });
  const [timings, setTimings] = useState({});

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileRawRef = useRef("");
  const musicRef = useRef(null);
  const startTsRef = useRef(null);
  const lastKeyTsRef = useRef(null);
  const finishedRef = useRef(false);

  const liveWpm = useMemo(() => {
    if (!running && !finished) return 0;
    const usedMs =
      running && startTsRef.current
        ? Math.max(1, performance.now() - startTsRef.current)
        : duration * 1000;
    return getWpm(correctChars, usedMs);
  }, [correctChars, duration, finished, running, timeLeft]);

  const liveAcc = useMemo(
    () => getAccuracy(correctChars, totalKeystrokes),
    [correctChars, totalKeystrokes]
  );

  const heatmap = useMemo(
    () => (finished ? buildHeatmap(text, input, timings) : []),
    [finished, input, text, timings]
  );

  const score = correctChars * 10 + maxStreak * 5 + liveWpm * 2;

  const focusTyping = useCallback(() => {
    unlockAudio();

    if (window.matchMedia("(pointer: coarse)").matches) {
      try {
        mobileInputRef.current?.focus({ preventScroll: true });
      } catch {
        mobileInputRef.current?.focus();
      }
    } else {
      appRef.current?.focus();
    }
  }, []);

  const finishTest = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    setRunning(false);
    setFinished(true);

    const elapsed = startTsRef.current
      ? Math.max(1, performance.now() - startTsRef.current)
      : duration * 1000;

    const finalWpm = getWpm(correctChars, elapsed);

    setBest((oldBest) => {
      const nextBest = Math.max(oldBest, finalWpm);
      localStorage.setItem("TypeTeks_best", String(nextBest));
      return nextBest;
    });

    const entry = {
      wpm: finalWpm,
      acc: liveAcc,
      mode,
      duration,
      score,
      date: new Date().toLocaleString(),
    };

    setHistory((oldHistory) => {
      const nextHistory = [entry, ...oldHistory].slice(0, 6);
      localStorage.setItem("TypeTeks_history", JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, [correctChars, duration, liveAcc, mode, score]);

  const reset = useCallback(
    (nextMode = mode, nextDuration = duration) => {
      setMode(nextMode);
      setDuration(nextDuration);
      setText(makeText(nextMode));
      setInput("");
      setRunning(false);
      setFinished(false);
      finishedRef.current = false;
      setTimeLeft(nextDuration);
      setCorrectChars(0);
      setTotalKeystrokes(0);
      setStreak(0);
      setMaxStreak(0);
      setTimings({});

      startTsRef.current = null;
      lastKeyTsRef.current = null;
      mobileRawRef.current = "";

      if (mobileInputRef.current) {
        mobileInputRef.current.value = "";
      }

      setTimeout(focusTyping, 80);
    },
    [duration, focusTyping, mode]
  );

  useEffect(() => {
    if (!running || finished) return undefined;

    const timer = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startTsRef.current) / 1000);
      const left = Math.max(0, duration - elapsed);
      setTimeLeft(left);

      if (left <= 0) {
        finishTest();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [duration, finishTest, finished, running]);

  const removeLastChar = useCallback(() => {
    setInput((previous) => {
      if (!previous.length) return previous;

      const removeIndex = previous.length - 1;
      const wasCorrect = previous[removeIndex] === text[removeIndex];

      setTotalKeystrokes((value) => Math.max(0, value - 1));
      if (wasCorrect) {
        setCorrectChars((value) => Math.max(0, value - 1));
      }

      return previous.slice(0, -1);
    });
  }, [text]);

  const processTypedKey = useCallback(
    (key) => {
      if (!key || key.length !== 1 || finishedRef.current) return;

      setInput((previous) => {
        if (previous.length >= text.length) return previous;

        if (!startTsRef.current) {
          setRunning(true);
          startTsRef.current = performance.now();
          lastKeyTsRef.current = performance.now();
        }

        const index = previous.length;
        const expected = text[index];
        const now = performance.now();
        const delta = lastKeyTsRef.current ? now - lastKeyTsRef.current : 0;
        lastKeyTsRef.current = now;

        setTimings((oldTimings) => ({ ...oldTimings, [index]: delta }));
        setTotalKeystrokes((value) => value + 1);

        const isCorrect = key === expected;

        if (isCorrect) {
          setCorrectChars((value) => value + 1);
          setStreak((value) => {
            const next = value + 1;
            setMaxStreak((maxValue) => Math.max(maxValue, next));
            return next;
          });
          playClick("correct", soundOn);
        } else {
          setStreak(0);
          playClick("wrong", soundOn);
        }

        const nextInput = previous + key;

        if (nextInput.length >= text.length) {
          setTimeout(finishTest, 50);
        }

        return nextInput;
      });
    },
    [finishTest, soundOn, text]
  );

  const handleDesktopKey = useCallback(
    (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key === "Tab") {
        event.preventDefault();
        reset();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setRunning(false);
        return;
      }

      if (finishedRef.current) return;

      if (event.key === "Backspace") {
        event.preventDefault();
        if (!noBackspace) removeLastChar();
        return;
      }

      if (event.key.length !== 1) return;

      event.preventDefault();
      processTypedKey(event.key);
    },
    [noBackspace, processTypedKey, removeLastChar, reset]
  );

  const handleMobileInput = useCallback(
    (event) => {
      const value = event.currentTarget.value;
      const previousValue = mobileRawRef.current;

      if (value.length > previousValue.length) {
        const added = value.slice(previousValue.length);
        for (const character of added) {
          processTypedKey(character);
        }
      } else if (value.length < previousValue.length && !noBackspace) {
        const count = previousValue.length - value.length;
        for (let i = 0; i < count; i += 1) {
          removeLastChar();
        }
      }

      mobileRawRef.current = value;
    },
    [noBackspace, processTypedKey, removeLastChar]
  );

  const handleMobileKeyDown = useCallback(
    (event) => {
      event.stopPropagation();
      if (event.key === "Backspace" && noBackspace) {
        event.preventDefault();
      }
    },
    [noBackspace]
  );

  useEffect(() => {
    const node = appRef.current;
    if (!node) return undefined;

    node.focus();
    node.addEventListener("keydown", handleDesktopKey);

    return () => node.removeEventListener("keydown", handleDesktopKey);
  }, [handleDesktopKey]);

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
    };
  }, []);

  function charClass(index) {
    if (index === input.length && !finished) return "char current";
    if (index >= input.length) return "char muted";
    return input[index] === text[index] ? "char correct" : "char wrong";
  }

  function renderTypingText() {
    let globalIndex = 0;

    return text.split(" ").map((word, wordIndex, words) => {
      const letters = word.split("").map((character) => {
        const index = globalIndex;
        globalIndex += 1;

        return (
          <span key={index} className={charClass(index)}>
            {character}
          </span>
        );
      });

      const spaceIndex = globalIndex;
      globalIndex += 1;

      return (
        <span className="word" key={`${word}-${wordIndex}`}>
          {letters}
          {wordIndex < words.length - 1 && (
            <span className={charClass(spaceIndex)}>&nbsp;</span>
          )}
        </span>
      );
    });
  }

  const modeLabel = duration === 300 ? "5 MIN" : `${duration}S`;

  return (
    <main
      ref={appRef}
      tabIndex={0}
      className={`app ${running || input.length > 0 ? "typing-active" : ""}`}
      onPointerDown={focusTyping}
    >
      <style>{css}</style>

      <input
        ref={mobileInputRef}
        className="mobile-keyboard-input"
        type="text"
        inputMode="text"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        onInput={handleMobileInput}
        onKeyDown={handleMobileKeyDown}
        aria-label="Mobile typing input"
      />

      <div className="grid-bg" />

      <header className="topbar">
        <div className="brand">
          <img src={logo} alt="TypeTeks logo" className="logo-img" />
          <div>
            <div className="brand-title">TypeTeks</div>
            <div className="brand-sub">Typing performance lab</div>
          </div>
        </div>

        <div className="top-actions">
          <span className="desktop-hint"><kbd>Tab</kbd> restart</span>
          <span className="desktop-hint"><kbd>Esc</kbd> pause</span>

          <button
            className="settings-btn"
            type="button"
            onClick={() => setNoBackspace((value) => !value)}
          >
            {noBackspace ? "NO BACKSPACE" : "STANDARD"}
          </button>

        </div>
      </header>

      <section className={`hero ${running ? "fade" : ""}`}>
        <div>
          <div className="eyebrow">MICRO-BLITZ · {modeLabel} · {mode.toUpperCase()}</div>
          <h1>
            Type at the speed
            <br />
            of <span>thought.</span>
          </h1>
          <p className="hero-copy">
            Build rhythm, accuracy, and speed with focused typing sessions.
          </p>
        </div>

        <div className="hero-card">
          <span>LIVE GOAL</span>
          <strong>Flow without friction.</strong>
          <small>Tap the text and start typing.</small>
        </div>
      </section>

      <section className={`controls ${running ? "hidden-soft" : ""}`}>
        <div className="control-group">
          <div className="label">CONTENT</div>
          <div className="control-buttons">
            {["words", "bigrams", "trigrams", "code", "business", "quotes"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => reset(item, duration)}
                className={mode === item ? "active" : ""}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <div className="label">TIME</div>
          <div className="control-buttons">
            {[15, 30, 60, 300].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => reset(mode, value)}
                className={duration === value ? "active" : ""}
              >
                {value === 300 ? "5 MIN" : `${value}S`}
              </button>
            ))}

            <button type="button" onClick={() => setSoundOn((value) => !value)}>
              {soundOn ? "SOUND ON" : "SOUND OFF"}
            </button>

            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playClick("correct", true);
              }}
            >
              TEST SOUND
            </button>
          </div>
        </div>
      </section>

      {!finished && (
        <section className="typing-shell" onClick={focusTyping}>
          <div className="typing-topline">
            <span>{modeLabel}</span>
            <span>{mode.toUpperCase()}</span>
            <button type="button" onClick={focusTyping}>TAP TO TYPE</button>
          </div>
          <div className="typing-text">{renderTypingText()}</div>
        </section>
      )}

      {!finished && (
        <button className="restart" type="button" onClick={() => reset()}>
          RESTART SESSION
        </button>
      )}

      {!running && !finished && (
        <section className="best-box">
          <div className="section-title">PERSONAL BESTS</div>
          <div className="best-grid">
            <div><span>Best WPM</span><b>{best}</b></div>
            <div><span>Mode</span><b>{mode}</b></div>
            <div><span>Time</span><b>{modeLabel}</b></div>
          </div>
        </section>
      )}

      {running && (
        <div className="live-pill">
          <span>{timeLeft}s</span>
          <span>{liveWpm} WPM</span>
          <span>{liveAcc}%</span>
        </div>
      )}

      {finished && (
        <section className="results">
          <div className="result-head">
            <div>
              <div className="eyebrow">SESSION COMPLETE</div>
              <h2>{liveWpm} WPM</h2>
              <p>Accuracy {liveAcc}% · Score {score} · Best {Math.max(best, liveWpm)} WPM</p>
            </div>
            <button type="button" onClick={() => reset()}>NEW BLITZ</button>
          </div>

          <div className="stats">
            <div><span>WPM</span><b>{liveWpm}</b></div>
            <div><span>Accuracy</span><b>{liveAcc}%</b></div>
            <div><span>Max Streak</span><b>{maxStreak}</b></div>
            <div><span>Score</span><b>{score}</b></div>
          </div>

          <div className="results-grid">
            <div className="heatmap">
              <h3>Slowest letter chunks</h3>
              {heatmap.length === 0 && <p>No heatmap data yet.</p>}
              {heatmap.map((item) => (
                <div className="heat-row" key={item.combo}>
                  <b>{item.combo}</b>
                  <div><span style={{ width: `${Math.min(100, item.avgMs / 4)}%` }} /></div>
                  <small>{item.avgMs}ms · {item.errorRate}%</small>
                </div>
              ))}
            </div>

            <div className="history">
              <h3>Recent sessions</h3>
              {history.length === 0 && <p>No history yet.</p>}
              {history.map((item, index) => (
                <div className="history-row" key={`${item.date}-${index}`}>
                  <span>{item.date}</span>
                  <b>{item.wpm} WPM</b>
                  <small>{item.acc}% · {item.mode}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        <div>
          <strong>TypeTeks</strong>
          <span>Practice with focus. Improve with proof.</span>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          {["contact", "support", "terms", "security", "privacy"].map((page) => (
            <button
              type="button"
              className="footer-link"
              key={page}
              onClick={() => setActivePage(page)}
            >
              {page}
            </button>
          ))}
        </nav>
      </footer>

      {activePage && (
        <section className="legal-overlay" onClick={() => setActivePage(null)}>
          <article className="legal-page" onClick={(event) => event.stopPropagation()}>
            <button className="legal-close" type="button" onClick={() => setActivePage(null)}>
              ×
            </button>
            <h2>{INFO_PAGES[activePage].title}</h2>

            {INFO_PAGES[activePage].sections.map((section) => (
              <div className="legal-section" key={section.heading}>
                <h3>{section.heading}</h3>
                {section.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}
          </article>
        </section>
      )}
    </main>
  );
}

const css = `
:root {
  --lavender-50: #f7f3ff;
  --lavender-100: #efe7ff;
  --lavender-200: #ddccff;
  --purple-400: #8b5cf6;
  --purple-500: #6f4df6;
  --purple-600: #5b3df0;
  --purple-700: #4a23cf;
  --violet-900: #180a38;
  --ink: #151129;
  --ink-soft: #625b79;
  --white: #ffffff;
  --line: rgba(74, 35, 207, 0.14);
  --shadow: 0 24px 70px rgba(54, 31, 123, 0.18);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--lavender-50);
}

body {
  margin: 0;
  background: var(--lavender-50);
  color: var(--ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

button,
input {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

.app {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  padding: 0 clamp(18px, 5vw, 78px) 90px;
  background:
    radial-gradient(circle at 10% 5%, rgba(139, 92, 246, 0.18), transparent 28%),
    radial-gradient(circle at 92% 8%, rgba(111, 77, 246, 0.16), transparent 30%),
    linear-gradient(180deg, #fcfaff 0%, #f7f3ff 48%, #f1eaff 100%);
  outline: none;
}

.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.28;
  background-image:
    linear-gradient(rgba(74, 35, 207, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 35, 207, 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
}

.mobile-keyboard-input {
  position: fixed;
  left: 50%;
  bottom: 0;
  width: 1px;
  height: 1px;
  opacity: 0.001;
  border: 0;
  padding: 0;
  font-size: 16px;
  z-index: -1;
}

.topbar {
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.9);
  position: relative;
  z-index: 2;
}

.topbar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(91,61,240,0.42), transparent);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-img {
  width: 58px;
  height: 58px;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 16px 28px rgba(74,35,207,0.22);
  background: var(--white);
}

.brand-title {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.brand-sub {
  margin-top: 3px;
  color: var(--ink-soft);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 700;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.desktop-hint {
  color: var(--ink-soft);
  font-size: 12px;
}

kbd {
  border: 1px solid var(--line);
  background: rgba(255,255,255,0.8);
  color: var(--purple-700);
  padding: 5px 8px;
  border-radius: 8px;
  box-shadow: 0 6px 14px rgba(74,35,207,0.08);
}

.settings-btn {
  border: 1px solid rgba(74,35,207,0.16);
  color: var(--purple-700);
  background: rgba(255,255,255,0.78);
  padding: 11px 16px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(74,35,207,0.08);
  transition: 0.2s ease;
}

.settings-btn:hover {
  transform: translateY(-2px);
  border-color: var(--purple-500);
}


.hero {
  padding: 72px 0 34px;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.6fr);
  gap: 36px;
  align-items: end;
  position: relative;
  z-index: 2;
  transition: 0.25s ease;
}

.hero.fade {
  opacity: 0;
  transform: translateY(-12px);
  height: 0;
  padding: 0;
  overflow: hidden;
  pointer-events: none;
}

.eyebrow {
  color: var(--purple-600);
  font-weight: 850;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.hero h1 {
  margin: 18px 0 16px;
  font-size: clamp(54px, 7vw, 104px);
  line-height: 0.88;
  letter-spacing: -0.065em;
  font-weight: 950;
  color: var(--ink);
}

.hero h1 span {
  background: linear-gradient(135deg, var(--purple-400), var(--purple-700));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 10px 26px rgba(91,61,240,0.2));
}

.hero-copy {
  max-width: 620px;
  color: var(--ink-soft);
  font-size: 18px;
  line-height: 1.65;
}

.hero-card {
  padding: 24px;
  border-radius: 24px;
  color: var(--white);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0)),
    linear-gradient(135deg, var(--purple-600), var(--violet-900));
  box-shadow: 0 28px 60px rgba(74,35,207,0.26);
  transform: perspective(800px) rotateY(-5deg) rotateX(3deg);
  border: 1px solid rgba(255,255,255,0.2);
}

.hero-card span,
.hero-card small {
  display: block;
  color: rgba(255,255,255,0.72);
}

.hero-card span {
  font-size: 11px;
  letter-spacing: 0.18em;
}

.hero-card strong {
  display: block;
  margin: 14px 0 8px;
  font-size: 24px;
}

.controls {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 18px;
  padding: 22px;
  border: 1px solid rgba(255,255,255,0.88);
  border-radius: 28px;
  background: rgba(255,255,255,0.74);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow);
}

.hidden-soft {
  opacity: 0;
  height: 0;
  overflow: hidden;
  padding: 0;
  margin: 0;
  pointer-events: none;
  border: 0;
}

.control-group {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 16px;
  align-items: center;
}

.label {
  color: var(--purple-700);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-buttons button {
  border: 1px solid rgba(74,35,207,0.12);
  color: var(--ink-soft);
  background: var(--white);
  padding: 11px 16px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(74,35,207,0.08);
  transition: 0.2s ease;
}

.control-buttons button:hover {
  transform: translateY(-2px);
  color: var(--purple-700);
}

.control-buttons button.active {
  color: var(--white);
  border-color: transparent;
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
  box-shadow: 0 14px 28px rgba(91,61,240,0.28);
}

.typing-shell {
  margin-top: 34px;
  position: relative;
  z-index: 2;
  padding: clamp(24px, 4vw, 46px);
  border-radius: 30px;
  border: 1px solid rgba(255,255,255,0.9);
  background:
    linear-gradient(145deg, rgba(255,255,255,0.94), rgba(244,238,255,0.88));
  box-shadow: var(--shadow);
  cursor: text;
}

.typing-topline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  color: var(--purple-600);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.13em;
}

.typing-topline button {
  margin-left: auto;
  border: 0;
  color: var(--white);
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
}

.typing-text {
  color: rgba(21,17,41,0.28);
  font-size: clamp(26px, 3.1vw, 42px);
  line-height: 1.65;
  letter-spacing: -0.03em;
  font-weight: 800;
  user-select: none;
  -webkit-user-select: none;
}

.word {
  display: inline-block;
  white-space: nowrap;
}

.char {
  position: relative;
  transition: color 0.04s linear, background 0.04s linear;
}

.char.correct {
  color: var(--ink);
}

.char.wrong {
  color: #ef476f;
  background: rgba(239,71,111,0.12);
  border-radius: 5px;
}

.char.current {
  color: var(--purple-600);
}

.char.current::before {
  content: "";
  position: absolute;
  left: -3px;
  top: -5px;
  bottom: -5px;
  width: 3px;
  border-radius: 999px;
  background: var(--purple-500);
  box-shadow: 0 0 16px rgba(111,77,246,0.55);
  animation: caret 0.8s infinite;
}

@keyframes caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.restart {
  display: block;
  margin: 26px auto 0;
  border: 1px solid rgba(74,35,207,0.14);
  color: var(--purple-700);
  background: rgba(255,255,255,0.82);
  padding: 13px 18px;
  border-radius: 14px;
  font-weight: 850;
  cursor: pointer;
}

.best-box,
.results {
  position: relative;
  z-index: 2;
  margin-top: 28px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow);
}

.section-title {
  margin-bottom: 16px;
  color: var(--purple-700);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.best-grid,
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.best-grid div,
.stats div {
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff, #f1eaff);
  border: 1px solid rgba(74,35,207,0.1);
  box-shadow: 0 14px 28px rgba(74,35,207,0.1);
}

.best-grid span,
.stats span {
  display: block;
  color: var(--ink-soft);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  margin-bottom: 8px;
}

.best-grid b,
.stats b {
  font-size: 30px;
  color: var(--ink);
}

.live-pill {
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  gap: 20px;
  padding: 12px 18px;
  border-radius: 999px;
  color: var(--white);
  background: linear-gradient(135deg, var(--purple-600), var(--violet-900));
  box-shadow: 0 18px 40px rgba(74,35,207,0.3);
  font-weight: 850;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.result-head h2 {
  margin: 10px 0 6px;
  font-size: clamp(54px, 7vw, 86px);
  letter-spacing: -0.06em;
  color: var(--purple-700);
}

.result-head p {
  color: var(--ink-soft);
}

.result-head button {
  border: 0;
  color: var(--white);
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
  padding: 14px 20px;
  border-radius: 14px;
  font-weight: 850;
  cursor: pointer;
}

.stats {
  grid-template-columns: repeat(4, 1fr);
  margin-top: 24px;
}

.results-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 24px;
  margin-top: 26px;
}

.heatmap,
.history {
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(145deg, #ffffff, #f4efff);
  border: 1px solid rgba(74,35,207,0.1);
}

.heatmap h3,
.history h3 {
  margin-top: 0;
  color: var(--ink);
}

.heat-row {
  display: grid;
  grid-template-columns: 52px 1fr 110px;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}

.heat-row b {
  color: var(--purple-700);
}

.heat-row div {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--lavender-200);
}

.heat-row div span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--purple-400), var(--purple-700));
}

.heat-row small,
.history-row {
  color: var(--ink-soft);
}

.history-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.history-row small {
  grid-column: 1 / -1;
}

.footer {
  margin-top: 54px;
  padding-top: 28px;
  border-top: 1px solid rgba(74,35,207,0.13);
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
}

.footer > div {
  display: grid;
  gap: 5px;
}

.footer > div span {
  color: var(--ink-soft);
  font-size: 13px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.footer-link {
  border: 0;
  color: var(--purple-700);
  background: transparent;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 850;
  cursor: pointer;
}

.legal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow-y: auto;
  padding: 40px;
  background: rgba(24,10,56,0.48);
  backdrop-filter: blur(12px);
}

.legal-page {
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(28px, 5vw, 56px);
  border-radius: 28px;
  background: var(--white);
  box-shadow: 0 40px 90px rgba(24,10,56,0.34);
  position: relative;
}

.legal-page h2 {
  margin-top: 0;
  font-size: clamp(38px, 5vw, 62px);
  letter-spacing: -0.04em;
  color: var(--ink);
}

.legal-section {
  margin-top: 28px;
}

.legal-section h3 {
  color: var(--purple-700);
}

.legal-section p {
  color: var(--ink-soft);
  line-height: 1.7;
}

.legal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  color: var(--white);
  background: var(--purple-700);
  font-size: 26px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .topbar {
    padding: 16px 0;
    align-items: flex-start;
    flex-direction: column;
  }

  .top-actions {
    justify-content: flex-start;
  }

  .hero {
    grid-template-columns: 1fr;
    padding-top: 48px;
  }

  .hero-card {
    transform: none;
  }

  .control-group {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .app {
    min-height: 100dvh;
    padding: 0 16px 78px;
  }

  .topbar {
    min-height: auto;
  }

  .brand-sub,
  .desktop-hint {
    display: none;
  }

  .logo-img {
    width: 48px;
    height: 48px;
  }

  .brand-title {
    font-size: 24px;
  }

  .top-actions {
    width: 100%;
    gap: 8px;
  }

  .settings-btn {
    flex: 1;
    min-width: 138px;
    padding: 11px 12px;
  }

  .hero {
    padding-top: 40px;
  }

  .hero h1 {
    font-size: clamp(48px, 15vw, 70px);
  }

  .hero-copy {
    font-size: 16px;
  }

  .hero-card {
    display: none;
  }

  .controls {
    padding: 18px;
    border-radius: 22px;
  }

  .control-buttons button {
    flex: 1 1 calc(50% - 10px);
    padding: 11px 10px;
  }

  .typing-shell {
    margin-top: 22px;
    padding: 20px 18px 28px;
    border-radius: 22px;
  }

  .typing-topline {
    margin-bottom: 18px;
  }

  .typing-topline button {
    display: inline-flex;
  }

  .typing-text {
    font-size: clamp(25px, 8vw, 34px);
    line-height: 1.58;
  }

  .app.typing-active .hero,
  .app.typing-active .controls,
  .app.typing-active .best-box,
  .app.typing-active .footer {
    display: none;
  }

  .app.typing-active .topbar {
    flex-direction: row;
    align-items: center;
  }

  .app.typing-active .brand-sub,
  .app.typing-active .top-actions {
    display: none;
  }

  .app.typing-active .typing-shell {
    margin-top: 24px;
  }

  .best-grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .result-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .heat-row {
    grid-template-columns: 42px 1fr;
  }

  .heat-row small {
    grid-column: 1 / -1;
  }

  .live-pill {
    width: calc(100% - 26px);
    justify-content: center;
    bottom: 12px;
  }

  .legal-overlay {
    padding: 14px;
  }

  .legal-page {
    padding: 28px 20px;
    border-radius: 22px;
  }
}
`;
