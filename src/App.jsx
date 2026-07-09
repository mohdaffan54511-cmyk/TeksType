import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logo from "../TeksType.png";
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
  ]
};
const INFO_PAGES = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Introduction",
        text: [
          "This Privacy Policy explains how TypeTeks collects, uses, and protects information when you use our website.",
          "TypeTeks is a typing practice website designed to help users improve typing speed, accuracy, focus, and consistency.",
          "By using TypeTeks, you agree to this Privacy Policy."
        ],
      },
      {
        heading: "1. What Information Do We Collect?",
        text: [
          "TypeTeks does not require users to create an account, submit passwords, upload documents, or provide sensitive personal information.",
          "The website may store typing practice data in your own browser, such as best WPM, accuracy, score, selected mode, and recent history.",
          "This data is stored locally on your device using browser localStorage."
        ],
      },
      {
        heading: "2. How We Use This Information",
        text: [
          "We use local browser data only to improve your typing experience, show your best score, and display recent practice sessions."
        ],
      },
      {
        heading: "3. Local Storage",
        text: [
          "Your typing results are saved on your own device. TypeTeks does not sell your data.",
          "You can delete this data anytime by clearing your browser cache or site data."
        ],
      },
      {
        heading: "4. Third-Party Services",
        text: [
          "TypeTeks may be hosted using services such as Cloudflare. These services may process technical data for security and performance."
        ],
      },
      {
        heading: "5. Contact Us",
        text: [
          "If you have questions about this Privacy Policy, contact us at: contact@typeteks.online"
        ],
      },
    ],
  },

  terms: {
    title: "Terms of Use",
    sections: [
      {
        heading: "1. Use of Website",
        text: [
          "TypeTeks is provided as a typing practice tool for learning and productivity.",
          "By using this website, you agree to use it responsibly and not misuse, copy, attack, or disrupt the service."
        ],
      },
      {
        heading: "2. No Guarantee",
        text: [
          "We try to keep TypeTeks fast and useful, but we do not guarantee that the website will always be error-free or available."
        ],
      },
    ],
  },

  contact: {
    title: "Contact",
    sections: [
      {
        heading: "Get in Touch",
        text: [
          "Have feedback, suggestions, or partnership ideas?",
          "Email: contact@typeteks.online"
        ],
      },
    ],
  },

  support: {
    title: "Support",
    sections: [
      {
        heading: "Need Help?",
        text: [
          "Use Tab to restart a session, select your typing mode, choose time, and start typing.",
          "If sound does not work, make sure your browser tab is not muted and click the TEST SOUND button."
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
          "TypeTeks runs mainly inside your browser and does not ask for sensitive details like passwords, payment information, or private documents.",
          "The website is served through secure HTTPS hosting."
        ],
      },
    ],
  },
};
function makeText(mode) {
  const pool = WORDS[mode] || WORDS.words;
  const count = mode === "bigrams" ? 55 : mode === "trigrams" ? 48 : 42;
  const arr = [];

  for (let i = 0; i < count; i++) {
    arr.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return arr.join(" ");
}

function getAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function getWpm(correctChars, elapsedMs) {
  if (elapsedMs <= 0) return 0;
  const min = elapsedMs / 60000;
  return Math.round(correctChars / 5 / min);
}

function buildHeatmap(target, input, timings) {
  const map = {};

  for (let i = 1; i < input.length; i++) {
    const a = target[i - 1];
    const b = target[i];

    if (!a || !b || a === " " || b === " ") continue;

    const key = a + b;
    const correct = input[i] === target[i];

    if (!map[key]) {
      map[key] = {
        combo: key,
        count: 0,
        totalMs: 0,
        errors: 0,
      };
    }

    map[key].count++;
    map[key].totalMs += timings[i] || 0;

    if (!correct) {
      map[key].errors++;
    }
  }

  return Object.values(map)
    .map((x) => ({
      ...x,
      avgMs: Math.round(x.totalMs / x.count),
      errorRate: Math.round((x.errors / x.count) * 100),
    }))
    .sort((a, b) => b.avgMs + b.errorRate * 3 - (a.avgMs + a.errorRate * 3))
    .slice(0, 8);
}
const keySounds = [];
let soundReady = false;
let soundIndex = 0;

function prepareSounds() {
  if (soundReady) return;

  for (let i = 0; i < 8; i++) {
    const audio = new Audio("/sounds/key.mp3");
    audio.volume = 0.8;
    audio.preload = "auto";
    keySounds.push(audio);
  }

  soundReady = true;
}

function playClick(type, enabled = true) {
  if (!enabled) return;

  try {
    prepareSounds();

    const audio = keySounds[soundIndex % keySounds.length];
    soundIndex++;

    audio.currentTime = 0;
    audio.volume = type === "wrong" ? 1 : 0.8;
    audio.play();
  } catch (error) {
    console.log("Sound error:", error);
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

  const [sound, setSound] = useState(true);
  const [noBackspace, setNoBackspace] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [best, setBest] = useState(() => {
    return Number(localStorage.getItem("TypeTeks_best") || 0);
  });

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("TypeTeks_history") || "[]");
    } catch {
      return [];
    }
  });

  const [timings, setTimings] = useState({});

  const startTsRef = useRef(null);
  const lastKeyTsRef = useRef(null);
  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [mobileValue, setMobileValue] = useState("");
  const finishedRef = useRef(false);

  const liveWpm = useMemo(() => {
    if (!running && !finished) return 0;

    const usedMs =
      running && startTsRef.current
        ? Math.max(1, performance.now() - startTsRef.current)
        : duration * 1000;

    return getWpm(correctChars, usedMs);
  }, [correctChars, running, finished, duration, timeLeft]);

  const liveAcc = useMemo(() => {
    return getAccuracy(correctChars, totalKeystrokes);
  }, [correctChars, totalKeystrokes]);

  const heatmap = useMemo(() => {
    if (!finished) return [];
    return buildHeatmap(text, input, timings);
  }, [finished, text, input, timings]);

  const score = correctChars * 10 + maxStreak * 5 + liveWpm * 2;

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

  const reset = useCallback((nextMode = mode, nextDuration = duration) => {
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

    setTimeout(() => {
      appRef.current?.focus();
    }, 50);
  }, [mode, duration]);

  useEffect(() => {
    if (!running || finished) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((performance.now() - startTsRef.current) / 1000);
      const left = Math.max(0, duration - elapsed);

      setTimeLeft(left);

      if (left <= 0) {
        finishTest();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [running, finished, duration, finishTest]);
const processTypedKey = useCallback((key) => {
  if (!key) return;

  if (!running) {
    setRunning(true);
    startTsRef.current = performance.now();
    lastKeyTsRef.current = performance.now();
  }

  if (input.length >= text.length) return;

  const index = input.length;
  const expected = text[index];

  const now = performance.now();
  const delta = lastKeyTsRef.current ? now - lastKeyTsRef.current : 0;
  lastKeyTsRef.current = now;

  setTimings((prev) => ({
    ...prev,
    [index]: delta,
  }));

  const isCorrect = key === expected;

  setTotalKeystrokes((x) => x + 1);

  if (isCorrect) {
    setCorrectChars((x) => x + 1);
    setStreak((s) => {
      const next = s + 1;
      setMaxStreak((m) => Math.max(m, next));
      return next;
    });
    playClick("correct", sound);
  } else {
    setStreak(0);
    playClick("wrong", sound);
  }

  const nextInput = input + key;
  setInput(nextInput);

  if (nextInput.length >= text.length) {
    setTimeout(() => finishTest(), 50);
  }
}, [finishTest, input, running, sound, text]); 
  const handleKey = useCallback((e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === "Tab") {
      e.preventDefault();
      reset();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setRunning(false);
      return;
    }

    if (finishedRef.current) return;

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

  if (e.key === "Backspace") {
  e.preventDefault();

  if (!noBackspace) {
    setInput((prev) => prev.slice(0, -1));

    const removeIndex = input.length - 1;

    if (removeIndex >= 0) {
      const wasCorrect = input[removeIndex] === text[removeIndex];

      setTotalKeystrokes((x) => Math.max(0, x - 1));

      if (wasCorrect) {
        setCorrectChars((x) => Math.max(0, x - 1));
      }
    }
  }

  return;
}

if (e.key.length !== 1) return;

e.preventDefault();
processTypedKey(e.key);
 }, [input, noBackspace, processTypedKey, reset, text]);
const focusMobileInput = useCallback(() => {
  mobileInputRef.current?.focus();
}, []);

const handleMobileInput = useCallback((e) => {
  const value = e.target.value;
  if (!value) return;

  const lastChar = value[value.length - 1];
  processTypedKey(lastChar);

  setMobileValue("");
}, [processTypedKey]);

const handleMobileKeyDown = useCallback((e) => {
  if (e.key === "Backspace") {
    if (!noBackspace) {
      setInput((prev) => prev.slice(0, -1));
    }
    setMobileValue("");
  }
}, [noBackspace]);
  useEffect(() => {
    const node = appRef.current;
    if (!node) return;

    node.focus();
    node.addEventListener("keydown", handleKey);

    return () => {
      node.removeEventListener("keydown", handleKey);
    };
  }, [handleKey]);

  function charClass(i) {
    if (i === input.length && !finished) return "char current";
    if (i >= input.length) return "char muted";
    if (input[i] === text[i]) return "char correct";
    return "char wrong";
  }

  function renderTypingText() {
    let globalIndex = 0;
    const words = text.split(" ");

    return words.map((word, wordIndex) => {
      const letters = word.split("").map((ch) => {
        const index = globalIndex;
        globalIndex++;

        return (
          <span key={index} className={charClass(index)}>
            {ch}
          </span>
        );
      });

      const spaceIndex = globalIndex;
      globalIndex++;

      return (
        <span className="word" key={wordIndex}>
          {letters}
          {wordIndex < words.length - 1 && (
            <span className={charClass(spaceIndex)}>&nbsp;</span>
          )}
        </span>
      );
    });
  }

  return (
<main
  ref={appRef}
  tabIndex={0}
  className="app"
  onPointerDown={() => {
    prepareSounds();
    mobileInputRef.current?.focus();
  }}
>
      <style>{css}</style>
<textarea
  ref={mobileInputRef}
  className="mobile-keyboard-input"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck="false"
  inputMode="text"
  onKeyDown={handleKey}
  onInput={(e) => {
    e.currentTarget.value = "";
  }}
/>
      <div className="grid-bg" />

      <header className="topbar">
        <div className="brand">
          <img src={logo} alt=" TypeTeks Logo" className="logo-img" />
          <div>
            <div className="brand-title">TypeTeks</div>
            <div className="brand-sub"></div>
          </div>
        </div>

        <div className="top-actions">
          <span><kbd>Tab</kbd> restart</span>
          <span>·</span>
          <span><kbd>Esc</kbd> pause</span>
          <button className="settings-btn" onClick={() => setNoBackspace((v) => !v)}>
            {noBackspace ? "NO BACKSPACE" : "STANDARD"}
          </button>
        </div>
      </header>

      <section className={`hero ${running ? "fade" : ""}`}>
        <div>
          <div className="mini"> MICRO-BLITZ · {duration}S · {mode.toUpperCase()}</div>
          <h1>
            Type at the speed
            <br />
            of <span>thought.</span>
          </h1>
        </div>

       <div className="start-note">
  <b>LOCK IN. TYPE FAST.</b>
  <p>Every keystroke builds your speed  </p>
</div>
      </section>

      <section className={`controls ${running ? "hidden-soft" : ""}`}>
        <div className="row">
          <div className="label">CONTENT</div>

          {["words", "bigrams", "trigrams", "code", "business", "quotes"].map((m) => (
            <button
              key={m}
              onClick={() => reset(m, duration)}
              className={mode === m ? "active" : ""}
            >
              {m === "words" && "T WORDS"}
              {m === "bigrams" && "# BIGRAMS"}
              {m === "trigrams" && "▦ TRIGRAMS"}
              {m === "code" && "</> CODE"}
              {m === "business" && "▣ BUSINESS"}
              {m === "quotes" && "❞ QUOTES"}
            </button>
          ))}
        </div>

        <div className="row">
          <div className="label">◷ TIME</div>

         {[15, 30, 60, 300].map((t) => (
  <button
    key={t}
    onClick={() => reset(mode, t)}
    className={duration === t ? "active" : ""}
  >
    {t === 300 ? "5 min" : `${t}s`}
  </button>
))}

          <button onClick={() => setSound((v) => !v)}>
  {sound ? "SOUND ON" : "SOUND OFF"}
</button>

<button
  onClick={() => {
    prepareSounds();
    playClick("correct", true);
  }}
>
  TEST SOUND
</button>
</div>
</section>

      {!finished && (
        <section
  className="typing-wrap"
  onClick={() => {
    appRef.current?.focus();
    mobileInputRef.current?.focus();
  }}
>
          <div className="typing-text">{renderTypingText()}</div>
        </section>
      )}

      {!finished && (
        <button className="restart" onClick={() => reset()}>
           RESTART · <kbd>TAB</kbd>
        </button>
      )}

      {!running && !finished && (
        <section className="best-box">
          <div className="box-title">♜ PERSONAL BESTS</div>
          <div className="best-grid">
            <div>
              <span>Best WPM</span>
              <b>{best}</b>
            </div>
            <div>
              <span>Mode</span>
              <b>{mode}</b>
            </div>
            <div>
              <span>Time</span>
              <b>{duration}s</b>
            </div>
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
              <div className="mini">SESSION COMPLETE</div>
              <h2>{liveWpm} WPM</h2>
              <p>
                Accuracy {liveAcc}% · Score {score} · Best {Math.max(best, liveWpm)} WPM
              </p>
            </div>

            <button onClick={() => reset()}>NEW BLITZ</button>
          </div>

          <div className="stats">
            <div>
              <span>WPM</span>
              <b>{liveWpm}</b>
            </div>
            <div>
              <span>Accuracy</span>
              <b>{liveAcc}%</b>
            </div>
            <div>
              <span>Max Streak</span>
              <b>{maxStreak}</b>
            </div>
            <div>
              <span>Score</span>
              <b>{score}</b>
            </div>
          </div>

          <div className="heatmap">
            <h3>Slowest Letter Chunks</h3>

            {heatmap.length === 0 && <p>No heatmap data yet.</p>}

            {heatmap.map((item) => (
              <div className="heat-row" key={item.combo}>
                <b>{item.combo}</b>
                <div>
                  <span style={{ width: `${Math.min(100, item.avgMs / 4)}%` }} />
                </div>
                <small>{item.avgMs}ms · {item.errorRate}%</small>
              </div>
            ))}
          </div>

          <div className="history">
            <h3>Recent Sessions</h3>

            {history.length === 0 && <p>No history yet.</p>}

            {history.map((h, i) => (
              <div className="history-row" key={i}>
                <span>{h.date}</span>
                <b>{h.wpm} WPM</b>
                <small>{h.acc}% · {h.mode} · {h.duration}s</small>
              </div>
            ))}
          </div>
        </section>
      )}
          <footer className="footer">
  <nav className="footer-links" aria-label="Footer navigation">
    <button type="button" className="footer-link" onClick={() => setActivePage("contact")}>
      Contact
    </button>
    <button type="button" className="footer-link" onClick={() => setActivePage("support")}>
      Support
    </button>
    <button type="button" className="footer-link" onClick={() => setActivePage("terms")}>
      Terms
    </button>
    <button type="button" className="footer-link" onClick={() => setActivePage("security")}>
      Security
    </button>
    <button type="button" className="footer-link" onClick={() => setActivePage("privacy")}>
      Privacy
    </button>
  </nav>
</footer>

{activePage && (
  <section className="legal-overlay" onClick={() => setActivePage(null)}>
    <article className="legal-page" onClick={(e) => e.stopPropagation()}>
      <button className="legal-close" onClick={() => setActivePage(null)}>
        ×
      </button>

      <h2>{INFO_PAGES[activePage].title}</h2>

      {INFO_PAGES[activePage].sections.map((section, index) => (
        <div className="legal-section" key={index}>
          <h3>{section.heading}</h3>
          {section.text.map((paragraph, pIndex) => (
            <p key={pIndex}>{paragraph}</p>
          ))}
        </div>
      ))}
    </article>
  </section>
)}
  <div className="mobile-type-dock">
  <input
    ref={mobileInputRef}
    type="text"
    inputMode="text"
    autoCapitalize="off"
    autoCorrect="off"
    autoComplete="off"
    spellCheck={false}
    className="mobile-keyboard-input"
    placeholder="Tap here to type..."
    value={mobileValue}
    onChange={handleMobileInput}
    onKeyDown={handleMobileKeyDown}
  />

  <button
    type="button"
    className="mobile-focus-btn"
    onClick={focusMobileInput}
  >
    TYPE
  </button>
</div>
    </main>
  );
}

const css = `
:root {
  --blue: rgb(0, 80, 248);
  --green: rgb(208, 241, 0);
  --text: rgb(89, 96, 116);

  --dark: rgb(10, 10, 10);
  --dark-10: rgb(0, 16, 51);
  --dark-20: rgb(27, 37, 64);

  --white: rgb(255, 255, 255);
  --white-10: rgb(250, 250, 250);
  --white-20: rgb(237, 237, 237);
  --white-30: rgb(217, 217, 217);
  --white-40: rgb(199, 199, 199);

  --border-dark: rgba(0, 0, 0, 0.08);
  --border-white: rgba(255, 255, 255, 0.08);
}

* {
  box-sizing: border-box;
}

html {
  background: var(--dark);
}

body {
  margin: 0;
  background: var(--dark);
  overflow-x: hidden;
  overflow-y: auto;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.app {
  min-height: 100vh;
  color: var(--white);
  background:
    radial-gradient(circle at 20% 20%, rgba(0, 80, 248, 0.22), transparent 34%),
    radial-gradient(circle at 80% 10%, rgba(208, 241, 0, 0.12), transparent 28%),
    linear-gradient(135deg, var(--dark), var(--dark-10) 55%, var(--dark));
  font-family: "Helvetica Neue", Arial, sans-serif;
  outline: none;
  position: relative;
  padding: 0 7vw 120px;
  overflow-x: hidden;
  overflow-y: auto;
}

.grid-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.45;
}

.topbar {
  height: 86px;
  border-bottom: 1px solid var(--border-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
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
  display: block;
  border-radius: 14px;
  filter: drop-shadow(0 0 18px rgba(208, 241, 0, 0.22));
}
.brand-title {
  font-size: 23px;
  font-weight: 950;
  letter-spacing: -1px;
  color: var(--white);
}

.brand-sub,
.mini,
.label {
  color: var(--white-40);
  font-size: 12px;
  letter-spacing: 0.35em;
  font-weight: 800;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--white-40);
  font-size: 13px;
}

kbd {
  background: var(--dark-20);
  border: 1px solid var(--border-white);
  border-radius: 6px;
  padding: 4px 8px;
  color: var(--white-20);
}

.settings-btn {
  background: rgba(255,255,255,0.04);
  color: var(--white-20);
  border: 1px solid var(--border-white);
  padding: 12px 22px;
  letter-spacing: 0.25em;
  cursor: pointer;
  border-radius: 12px;
}

.settings-btn:hover {
  border-color: rgba(208, 241, 0, 0.5);
  color: var(--green);
}

.hero {
  margin-top: 64px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  transition: 0.25s ease;
  position: relative;
  z-index: 2;
}

.hero.fade {
  opacity: 0;
  transform: translateY(-12px);
  pointer-events: none;
  height: 0;
  margin: 0;
  overflow: hidden;
}

.hero h1 {
  font-size: clamp(50px, 6.5vw, 92px);
  line-height: 0.88;
  margin: 18px 0 0;
  letter-spacing: -6px;
  font-weight: 950;
  color: var(--white);
}

.hero h1 span {
  color: var(--green);
  text-shadow: 0 0 28px rgba(208, 241, 0, 0.45);
}

.start-note {
  color: var(--white-40);
  text-align: right;
  margin-bottom: 12px;
}

.start-note b {
  color: var(--white-20);
  letter-spacing: 0.35em;
  font-size: 12px;
}

.start-note p {
  color: var(--text);
  letter-spacing: 0.04em;
}

.controls {
  margin-top: 34px;
  border: 1px solid var(--border-white);
  padding: 18px;
  position: relative;
  z-index: 2;
  transition: 0.2s ease;
  background: rgba(27, 37, 64, 0.38);
  backdrop-filter: blur(18px);
  border-radius: 22px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
}

.hidden-soft {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-10px);
  height: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: 0;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin: 8px 0;
}

.label {
  width: 90px;
}

.controls button {
  background: rgba(10, 10, 10, 0.58);
  color: var(--white-40);
  border: 1px solid var(--border-white);
  padding: 12px 20px;
  letter-spacing: 0.22em;
  cursor: pointer;
  font-weight: 850;
  font-family: "Helvetica Neue", Arial, sans-serif;
  border-radius: 14px;
}

.controls button:hover {
  color: var(--white);
  border-color: rgba(255,255,255,0.22);
}

.controls button.active {
  color: var(--dark);
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 0 28px rgba(208, 241, 0, 0.22);
}

.typing-wrap {
  position: relative;
  z-index: 2;
  margin-top: 70px;
  max-width: 1120px;
  width: 100%;
  overflow: visible;
}

.typing-text {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: clamp(24px, 2.3vw, 34px);
  line-height: 1.65;
  color: rgba(255,255,255,0.28);
  font-weight: 750;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: normal;
  word-break: normal;
  letter-spacing: 0px;
  text-align: left;
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

.char.muted {
  color: rgba(255,255,255,0.28);
}

.char.correct {
  color: var(--white);
}

.char.wrong {
  color: #ff4b6e;
  background: rgba(255, 75, 110, 0.16);
  border-radius: 4px;
}

.char.current {
  color: var(--green);
}

.char.current::before {
  content: "";
  position: absolute;
  left: -4px;
  top: -5px;
  bottom: -5px;
  width: 3px;
  background: var(--blue);
  border-radius: 8px;
  box-shadow: 0 0 18px rgba(0, 80, 248, 0.9);
  animation: caret 0.8s infinite;
}

@keyframes caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.restart {
  margin-top: 44px;
  background: rgba(27, 37, 64, 0.55);
  color: var(--white-30);
  border: 1px solid var(--border-white);
  padding: 14px 18px;
  letter-spacing: 0.22em;
  cursor: pointer;
  position: relative;
  z-index: 2;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-weight: 800;
  border-radius: 14px;
}

.restart:hover {
  color: var(--green);
  border-color: rgba(208, 241, 0, 0.45);
}

.best-box {
  margin-top: 42px;
  border: 1px solid var(--border-white);
  background: rgba(27, 37, 64, 0.35);
  padding: 22px;
  position: relative;
  z-index: 2;
  border-radius: 22px;
}

.box-title {
  color: var(--white-40);
  letter-spacing: 0.3em;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 16px;
}

.best-grid,
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.best-grid div,
.stats div {
  background: rgba(10, 10, 10, 0.45);
  border: 1px solid var(--border-white);
  padding: 18px;
  border-radius: 18px;
}

.best-grid span,
.stats span {
  display: block;
  color: var(--text);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 800;
}

.best-grid b,
.stats b {
  font-size: 30px;
  color: var(--white);
}

.live-pill {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 16, 51, 0.9);
  border: 1px solid rgba(0, 80, 248, 0.45);
  color: var(--white);
  padding: 12px 22px;
  display: flex;
  gap: 28px;
  z-index: 5;
  box-shadow: 0 0 30px rgba(0, 80, 248, 0.18);
  font-weight: 900;
  border-radius: 999px;
}

.live-pill span:first-child {
  color: var(--green);
}

.results {
  position: relative;
  z-index: 2;
  margin-top: 52px;
  border: 1px solid var(--border-white);
  background: rgba(27, 37, 64, 0.42);
  padding: 28px;
  max-height: none;
  overflow: visible;
  border-radius: 26px;
}

.result-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
}

.result-head h2 {
  font-size: 70px;
  margin: 10px 0 0;
  letter-spacing: -4px;
  color: var(--green);
  font-weight: 950;
  text-shadow: 0 0 24px rgba(208, 241, 0, 0.25);
}

.result-head p {
  color: var(--white-40);
}

.result-head button {
  background: var(--blue);
  color: var(--white);
  border: none;
  padding: 15px 24px;
  font-weight: 950;
  cursor: pointer;
  border-radius: 16px;
  box-shadow: 0 0 28px rgba(0, 80, 248, 0.25);
}

.stats {
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 28px;
}

.heatmap,
.history {
  margin-top: 26px;
}

.heatmap h3,
.history h3 {
  color: var(--white);
  margin-bottom: 14px;
}

.heat-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  gap: 14px;
  align-items: center;
  margin-bottom: 10px;
}

.heat-row b {
  color: var(--green);
  font-size: 20px;
}

.heat-row div {
  height: 10px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
  border-radius: 999px;
}

.heat-row div span {
  display: block;
  height: 100%;
  background: var(--blue);
  border-radius: 999px;
}

.heat-row small {
  color: var(--white-40);
  text-align: right;
}

.history-row {
  display: grid;
  grid-template-columns: 1fr 120px 160px;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-white);
  color: var(--white-40);
}

.history-row b {
  color: var(--green);
}
.footer {
  position: relative;
  z-index: 2;
  width: 100%;
  margin-top: 80px;
  padding: 28px 0 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--border-white);
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(18px, 4vw, 46px);
  flex-wrap: wrap;
  text-align: center;
}

.footer-link {
  color: var(--white-40);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-link:hover {
  color: var(--green);
  transform: translateY(-1px);
}

.footer-link:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 5px;
  border-radius: 6px;
}
@media (max-width: 900px) {
  .footer {
    margin-top: 58px;
    padding-top: 24px;
  }

  .footer-links {
    gap: 14px 20px;
  }

  .footer-link {
    font-size: 12px;
    letter-spacing: 0.08em;
  }
  .app {
    padding: 0 22px 110px;
    overflow-y: auto;
  }

  .topbar {
    height: auto;
    padding: 18px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .top-actions {
    flex-wrap: wrap;
  }

  .hero {
    margin-top: 35px;
    display: block;
  }

  .hero h1 {
    font-size: 48px;
    letter-spacing: -2px;
  }

  .start-note {
    text-align: left;
    margin-top: 20px;
  }

  .typing-wrap {
    margin-top: 55px;
  }

  .typing-text {
    font-size: 25px;
    line-height: 1.65;
    letter-spacing: 0px;
  }

  .label {
    width: 100%;
  }

  .controls button {
    padding: 10px 12px;
    letter-spacing: 0.12em;
  }

  .best-grid,
  .stats {
    grid-template-columns: 1fr;
  }

  .result-head {
    display: block;
  }

  .result-head h2 {
    font-size: 52px;
  }

  .heat-row {
    grid-template-columns: 54px 1fr;
  }

  .heat-row small {
    grid-column: 1 / -1;
    text-align: left;
  }

  .history-row {
    grid-template-columns: 1fr;
  }

  .live-pill {
    width: calc(100% - 30px);
    justify-content: center;
    gap: 16px;
  }
}
@media (max-width: 600px) {
  .app {
    padding: 14px 14px 80px !important;
    min-height: auto !important;
    overflow-y: auto !important;
  }
  .topbar {
    padding: 18px 0 12px;
    gap: 16px;
  }

  .brand {
    width: 100%;
  }

  .logo-img {
    width: 56px;
    height: 56px;
  }

  .brand-title {
    font-size: 28px;
    letter-spacing: -1px;
  }

  .top-actions {
    width: 100%;
    justify-content: space-between;
    gap: 10px;
  }

  .key-hint {
    font-size: 14px;
  }

  .mode-pill {
    padding: 13px 20px;
    font-size: 14px;
    letter-spacing: 4px;
  }

  .hero {
    margin-top: 26px;
  }

  .mini {
    font-size: 12px;
    letter-spacing: 6px;
    line-height: 1.5;
  }

  .hero h1 {
    font-size: 44px;
    line-height: 0.95;
    letter-spacing: -2.5px;
    text-align: center;
  }

  .start-note {
    margin-top: 26px;
  }

  .start-note b {
    font-size: 12px;
    letter-spacing: 5px;
  }

  .start-note p {
    font-size: 18px;
  }

  .panel {
    margin-top: 36px;
    padding: 28px 20px;
    border-radius: 24px;
  }

  .panel-title {
    font-size: 13px;
    letter-spacing: 6px;
    margin-bottom: 20px;
  }

  .button-row {
    gap: 10px;
    justify-content: center;
  }

  .button-row button {
    padding: 12px 15px;
    font-size: 14px;
    letter-spacing: 2px;
    border-radius: 15px;
  }

  .typing-wrap {
    margin-top: 38px;
  }

  .typing-card {
    padding: 24px 18px;
    border-radius: 22px;
  }

  .typing-text {
    font-size: 23px;
    line-height: 1.7;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .stat-value {
    font-size: 30px;
  }
}
.legal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: #ffffff;
  color: #001033;
  overflow-y: auto;
  padding: 42px 70px;
}

.legal-page {
  max-width: 1200px;
  margin: 0 auto;
  background: #ffffff;
  color: #001033;
  font-family: Arial, Helvetica, sans-serif;
}

.legal-page h2 {
  font-size: 38px;
  line-height: 1.1;
  margin: 0 0 30px;
  color: #001033;
  letter-spacing: -1px;
}

.legal-section {
  margin-top: 34px;
}

.legal-section h3 {
  font-size: 18px;
  margin: 0 0 14px;
  color: #000;
  text-transform: uppercase;
  font-weight: 800;
}

.legal-section p {
  font-size: 18px;
  line-height: 1.55;
  margin: 12px 0;
  color: #000;
  font-weight: 500;
}

.legal-close {
  position: fixed;
  top: 22px;
  right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #001033;
  color: white;
  font-size: 28px;
  cursor: pointer;
}

.legal-close:hover {
  background: rgb(208, 241, 0);
  color: #001033;
}

.footer-link {
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

@media (max-width: 600px) {
  .legal-overlay {
    padding: 28px 18px;
  }

  .legal-page h2 {
    font-size: 32px;
  }

  .legal-section h3 {
    font-size: 15px;
  }

  .legal-section p {
    font-size: 15px;
    line-height: 1.6;
  }

  .legal-close {
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
    font-size: 24px;
  }
}
@media (max-width: 600px) {
  ...
}

.mobile-keyboard-input {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 46px;
  opacity: 0.01;
  border: none;
  outline: none;
  background: transparent;
  color: transparent;
  font-size: 16px;
  z-index: 20;
  resize: none;
}
.mobile-type-dock {
  display: none;
}

.mobile-keyboard-input {
  width: 100%;
}

.mobile-focus-btn {
  display: none;
}

@media (max-width: 900px) {
  .mobile-type-dock {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: calc(env(safe-area-inset-bottom) + 10px);
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(7, 18, 50, 0.96);
    backdrop-filter: blur(14px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
  }

  .mobile-keyboard-input {
    flex: 1;
    min-width: 0;
    height: 46px;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 14px;
    background: rgba(255,255,255,0.06);
    color: #ffffff;
    font-size: 16px;
    padding: 0 14px;
    outline: none;
    font-family: "Helvetica Neue", Arial, sans-serif;
  }

  .mobile-keyboard-input::placeholder {
    color: rgba(255,255,255,0.45);
  }

  .mobile-focus-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 46px;
    padding: 0 18px;
    border: none;
    border-radius: 14px;
    background: rgb(208, 241, 0);
    color: rgb(10, 10, 10);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.14em;
    cursor: pointer;
  }

  .best-box,
  .restart,
  .results,
  .footer {
    margin-bottom: 90px;
  }
}
`;

