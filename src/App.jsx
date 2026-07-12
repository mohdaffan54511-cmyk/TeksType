import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const CONTENT_MODES = [
  "words",
  "bigrams",
  "trigrams",
  "code",
  "business",
  "quotes",
  "hinglish",
  "motivation",
  "conversation",
];

const TEXT_POOLS = {
  words: [
    "home", "now", "even", "used", "said", "government", "once", "any", "to", "and",
    "know", "world", "number", "another", "something", "until", "without", "when", "right",
    "less", "school", "both", "there", "almost", "people", "system", "place", "group", "around",
    "because", "through", "while", "every", "important", "possible", "between", "business",
    "support", "future", "strong", "learn", "focus", "better", "growth", "skill", "progress",
  ],
  bigrams: [
    "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd", "ti", "es", "or", "te",
    "of", "ed", "is", "it", "al", "ar", "st", "to", "nt", "ng", "se", "ha", "as", "ou",
    "io", "le",
  ],
  trigrams: [
    "the", "ing", "and", "ion", "ent", "her", "tha", "nth", "was", "eth", "for", "hat",
    "his", "you", "ter", "ere", "all", "res", "ver", "not",
  ],
  code: [
    "const", "return", "function", "import", "export", "async", "await", "array", "object",
    "string", "number", "boolean", "component", "state", "effect", "promise", "server", "client",
    "render", "props", "value", "index",
  ],
  business: [
    "client", "report", "project", "meeting", "growth", "revenue", "profit", "budget", "invoice",
    "market", "sales", "target", "dashboard", "strategy", "analysis", "finance", "team", "planning",
    "success", "quality",
  ],
  quotes: [
    "The quick brown fox jumps over the lazy dog.",
    "Small steps every day build big results tomorrow.",
    "Focus on progress, not on perfection.",
    "Discipline today creates freedom tomorrow.",
  ],
  hinglish: [
    "Subah office jaate waqt meri bus miss ho gayi. Main auto me baitha, lekin driver bhaiya ko bhi wahi bus pakadni thi, isliye unhone auto ko race car bana diya.",
    "Kal main chai lene gaya tha. Chai wale bhaiya ne poocha strong ya normal. Maine bola strong, kyunki meri neend aur problems dono normal se zyada thi.",
    "Mummy ne kaha mehmaan aa rahe hain, room saaf karo. Maine sab samaan bed ke neeche daal diya. Mehmaan ke bachche ne wahi jagah hide and seek ke liye choose kar li.",
    "Mera dost gym join karke pehle din hi protein shaker kharid laya. Exercise usne sirf itni ki bottle ko teen baar shake kiya.",
    "Mere dost ne kaha woh sirf ek samosa khayega. Do minute baad usne doosra samosa order karke bola, pehla to warm-up tha.",
    "Maine fridge khola aur kuch interesting nahi mila. Do minute baad phir khola, jaise fridge ne interval me naya content upload kar diya ho.",
  ],
  motivation: [
    "Aaj ka kaam chhota ho sakta hai, lekin progress chhoti nahi hoti. Roz ek step lo. Discipline mood ka wait nahi karta.",
    "Mujhe laga motivation aayegi, phir main start karunga. Baad me samjha, start karne se motivation aati hai. Bas pehla step lo.",
    "Bravery ka matlab darr na hona nahi hai. Darr ke baad bhi sahi kaam karna hi asli strength hai.",
    "Failure tumhari story ka end nahi hota. Woh bas next chapter ko better likhne ka feedback hota hai.",
  ],
  conversation: [
    "Aman: Bhai, aaj padhai ki? Ravi: Haan, kitab kholi thi. Aman: Phir? Ravi: Neend aa gayi. Aman: Goal ka kya hua? Ravi: Goal wahi hai, timing thodi late chal rahi hai.",
    "Mummy: Market ja rahe ho? Main: Haan. Mummy: Dhaniya le aana. Main: Theek hai. Ek ghante baad main chips aur cold drink le aaya. Mummy: Dhaniya? Main: Woh list me invisible tha kya?",
    "Boss: Report complete hai? Employee: Almost. Boss: Almost ka matlab? Employee: File open hai, confidence high hai, aur data abhi loading me hai.",
    "Dost: Gym kab se start karega? Main: Monday se. Dost: Kaunsa Monday? Main: Jo motivation ke baad aata hai.",
  ],
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeText(mode) {
  if (["quotes", "hinglish", "motivation", "conversation"].includes(mode)) {
    return randomItem(TEXT_POOLS[mode]);
  }

  const pool = TEXT_POOLS[mode] || TEXT_POOLS.words;
  const count = mode === "bigrams" ? 50 : mode === "trigrams" ? 42 : 36;
  return Array.from({ length: count }, () => randomItem(pool)).join(" ");
}

function calculateAccuracy(correct, total) {
  return total === 0 ? 100 : Math.round((correct / total) * 100);
}

function isMobileLike() {
  return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth <= 768;
}

let audioContext = null;

function playTone(correct, enabled) {
  if (!enabled) return;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(correct ? 520 : 150, now);
    gain.gain.setValueAtTime(correct ? 0.025 : 0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } catch {
    // Typing must continue even if audio is unavailable.
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
  const [soundOn, setSoundOn] = useState(true);
  const [noBackspace, setNoBackspace] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [bestWpm, setBestWpm] = useState(() => Number(localStorage.getItem("typeteks-best") || 0));
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("typeteks-history") || "[]");
    } catch {
      return [];
    }
  });

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileBufferRef = useRef("");
  const typingTextRef = useRef(null);
  const currentCharRef = useRef(null);
  const savedRef = useRef(false);

  const correctChars = useMemo(() => {
    let correct = 0;
    for (let index = 0; index < input.length; index += 1) {
      if (input[index] === text[index]) correct += 1;
    }
    return correct;
  }, [input, text]);

  const accuracy = calculateAccuracy(correctChars, input.length);
  const elapsedSeconds = Math.max(1, duration - timeLeft);
  const liveWpm = input.length === 0 ? 0 : Math.round(correctChars / 5 / (elapsedSeconds / 60));
  const score = correctChars * 10 + liveWpm * 2;
  const sessionActive = mobileFocused || running || input.length > 0;

  const weakKeys = useMemo(() => {
    const errors = {};
    for (let index = 0; index < input.length; index += 1) {
      if (input[index] !== text[index]) {
        const expected = text[index] === " " ? "space" : text[index]?.toLowerCase();
        if (expected) errors[expected] = (errors[expected] || 0) + 1;
      }
    }

    return Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [input, text]);

  const resetSession = useCallback(
    (nextMode = mode, nextDuration = duration) => {
      setMode(nextMode);
      setDuration(nextDuration);
      setText(makeText(nextMode));
      setInput("");
      setRunning(false);
      setFinished(false);
      setTimeLeft(nextDuration);
      setMobileFocused(false);
      savedRef.current = false;
      mobileBufferRef.current = "";

      if (mobileInputRef.current) {
        mobileInputRef.current.value = "";
        mobileInputRef.current.blur();
      }

      requestAnimationFrame(() => appRef.current?.focus({ preventScroll: true }));
    },
    [duration, mode]
  );

  const finishSession = useCallback(() => {
    setRunning(false);
    setFinished(true);
    setMobileFocused(false);
    mobileInputRef.current?.blur();
  }, []);

  useEffect(() => {
    appRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!running || finished) return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [finished, running]);

  useEffect(() => {
    if (running && timeLeft === 0) finishSession();
  }, [finishSession, running, timeLeft]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;

    const nextBest = Math.max(bestWpm, liveWpm);
    setBestWpm(nextBest);
    localStorage.setItem("typeteks-best", String(nextBest));

    const entry = {
      wpm: liveWpm,
      accuracy,
      mode,
      duration,
      score,
      date: new Date().toLocaleString(),
    };

    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 6);
      localStorage.setItem("typeteks-history", JSON.stringify(next));
      return next;
    });
  }, [accuracy, bestWpm, duration, finished, liveWpm, mode, score]);

  useEffect(() => {
    const container = typingTextRef.current;
    const current = currentCharRef.current;
    if (!container || !current) return;

    const top = current.offsetTop;
    const bottom = top + current.offsetHeight;
    const visibleTop = container.scrollTop + 18;
    const visibleBottom = container.scrollTop + container.clientHeight - 18;

    if (top < visibleTop) container.scrollTop = Math.max(0, top - 18);
    if (bottom > visibleBottom) container.scrollTop += bottom - visibleBottom;
  }, [input.length]);

  const processCharacter = useCallback(
    (character) => {
      if (!character || character.length !== 1 || finished) return;

      setInput((previous) => {
        if (previous.length >= text.length) return previous;

        if (!running) setRunning(true);

        const expected = text[previous.length];
        playTone(character === expected, soundOn);

        const next = previous + character;
        if (next.length >= text.length) {
          window.setTimeout(finishSession, 0);
        }
        return next;
      });
    },
    [finishSession, finished, running, soundOn, text]
  );

  const removeCharacter = useCallback(() => {
    if (finished || noBackspace) return;
    setInput((previous) => previous.slice(0, -1));
  }, [finished, noBackspace]);

  const focusTyping = useCallback(() => {
    if (isMobileLike()) {
      setMobileFocused(true);
      const inputElement = mobileInputRef.current;
      if (!inputElement) return;

      try {
        inputElement.focus({ preventScroll: true });
      } catch {
        inputElement.focus();
      }
    } else {
      appRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const handleDesktopKeyDown = useCallback(
    (event) => {
      if (event.target instanceof HTMLButtonElement || event.target === mobileInputRef.current) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;

      if (event.key === "Tab") {
        event.preventDefault();
        resetSession();
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setRunning(false);
        setMobileFocused(false);
        mobileInputRef.current?.blur();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        removeCharacter();
        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();
        processCharacter(event.key);
      }
    },
    [processCharacter, removeCharacter, resetSession]
  );

  const handleMobileInput = useCallback(
    (event) => {
      const value = event.currentTarget.value;
      const previous = mobileBufferRef.current;

      if (value.length > previous.length) {
        const added = value.slice(previous.length);
        for (const character of added) processCharacter(character);
      } else if (value.length < previous.length) {
        if (noBackspace) {
          event.currentTarget.value = previous;
          return;
        }

        const removedCount = previous.length - value.length;
        for (let index = 0; index < removedCount; index += 1) removeCharacter();
      }

      mobileBufferRef.current = event.currentTarget.value;

      if (mobileBufferRef.current.length > 40) {
        event.currentTarget.value = "";
        mobileBufferRef.current = "";
      }
    },
    [noBackspace, processCharacter, removeCharacter]
  );

  const handleMobileKeyDown = useCallback(
    (event) => {
      event.stopPropagation();
      if (event.key === "Backspace" && noBackspace) event.preventDefault();
    },
    [noBackspace]
  );

  function renderTypingText() {
    return text.split("").map((character, index) => {
      let className = "char upcoming";
      if (index < input.length) className = input[index] === character ? "char correct" : "char wrong";
      if (index === input.length && !finished) className = "char current";

      return (
        <span
          key={`${index}-${character}`}
          ref={index === input.length ? currentCharRef : null}
          className={className}
        >
          {character}
        </span>
      );
    });
  }

  const durationLabel = duration === 300 ? "5 MIN" : `${duration}S`;

  return (
    <main
      ref={appRef}
      tabIndex={0}
      className={`app ${sessionActive ? "session-active" : ""}`}
      onKeyDown={handleDesktopKeyDown}
    >
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark" aria-hidden="true">
            <span>T</span>
            <img
              src="/TeksType.png"
              alt=""
              onError={(event) => event.currentTarget.remove()}
            />
          </div>
          <div>
            <div className="brand-title">TypeTeks</div>
            <div className="brand-subtitle">Typing Performance Lab</div>
          </div>
        </div>

        <div className="top-actions">
          <span className="key-hint"><kbd>Tab</kbd> Restart</span>
          <span className="key-hint"><kbd>Esc</kbd> Pause</span>
          <button
            type="button"
            className={`ghost-button ${noBackspace ? "active" : ""}`}
            onClick={() => setNoBackspace((previous) => !previous)}
          >
            {noBackspace ? "NO BACKSPACE" : "STANDARD"}
          </button>
          <button
            type="button"
            className={`ghost-button ${soundOn ? "active" : ""}`}
            onClick={() => setSoundOn((previous) => !previous)}
          >
            {soundOn ? "SOUND ON" : "SOUND OFF"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="eyebrow">MICRO-BLITZ · {durationLabel} · {mode.toUpperCase()}</div>
          <h1>
            Type at the speed
            <br />
            of <span>thought.</span>
          </h1>
          <p>Build rhythm, accuracy, and confidence with focused typing sessions.</p>
        </div>

        <div className="hero-picture">
  <img
    src="/typing-hero.png"
    alt="Purple TypeTeks keyboard"
  />
</div>
      </section>

      <section className="controls" aria-label="Typing controls">
        <div className="control-section content-control">
          <div className="control-label">Content</div>
          <div className="button-strip">
            {CONTENT_MODES.map((item) => (
              <button
                key={item}
                type="button"
                className={mode === item ? "selected" : ""}
                onClick={() => resetSession(item, duration)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <div className="control-label">Time</div>
          <div className="button-strip time-buttons">
            {[15, 30, 60, 300].map((value) => (
              <button
                key={value}
                type="button"
                className={duration === value ? "selected" : ""}
                onClick={() => resetSession(mode, value)}
              >
                {value === 300 ? "5 MIN" : `${value}S`}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section audio-control">
          <div className="control-label">Audio</div>
          <div className="button-strip">
            <button type="button" onClick={() => playTone(true, true)}>TEST SOUND</button>
          </div>
        </div>
      </section>

      <section className="practice-layout">
        <article className="typing-card">
          <input
            ref={mobileInputRef}
            className="mobile-capture"
            type="text"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="Mobile typing input"
            onFocus={() => setMobileFocused(true)}
            onBlur={() => setMobileFocused(false)}
            onInput={handleMobileInput}
            onKeyDown={handleMobileKeyDown}
          />

          <div className="typing-card-header">
            <div>
              <span>{durationLabel}</span>
              <span>{mode.toUpperCase()}</span>
            </div>
            <button type="button" className="primary-button" onClick={focusTyping}>
              TAP TO TYPE
            </button>
          </div>

          <div
            ref={typingTextRef}
            className="typing-text"
            role="textbox"
            aria-label="Typing practice text"
            onPointerDown={focusTyping}
          >
            {renderTypingText()}
          </div>

          <div className="legend-row">
            <span><i className="dot correct-dot" />Correct</span>
            <span><i className="dot wrong-dot" />Wrong</span>
            <span><i className="dot upcoming-dot" />Upcoming</span>
          </div>

          <div className="typing-actions">
            <button type="button" className="restart-button" onClick={() => resetSession()}>
              RESTART SESSION
            </button>
          </div>
        </article>

        <aside className="stats-card">
          <div className="stats-title">Live Stats</div>
          <div className="stats-grid">
            <div><span>Time</span><strong>{timeLeft}s</strong></div>
            <div><span>WPM</span><strong>{liveWpm}</strong></div>
            <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
          </div>

          {finished && (
            <div className="finished-box">
              <strong>Session complete!</strong>
              <span>Score: {score}</span>
              <button type="button" onClick={() => resetSession()}>NEW SESSION</button>
            </div>
          )}
        </aside>
      </section>

      <section className="insights-grid">
        <article className="insight-card">
          <div className="insight-title">Personal Best</div>
          <div className="big-number">{bestWpm}</div>
          <span>Best WPM</span>
        </article>

        <article className="insight-card history-card">
          <div className="insight-title">Recent Sessions</div>
          {history.length === 0 ? (
            <p>No completed sessions yet.</p>
          ) : (
            history.map((item, index) => (
              <div className="history-row" key={`${item.date}-${index}`}>
                <span>{item.mode}</span>
                <strong>{item.wpm} WPM</strong>
                <span>{item.accuracy}%</span>
              </div>
            ))
          )}
        </article>

        <article className="insight-card">
          <div className="insight-title">Needs Practice</div>
          {weakKeys.length === 0 ? (
            <p>Type a session to discover weak keys.</p>
          ) : (
            weakKeys.map(([key, count]) => (
              <div className="weak-row" key={key}>
                <strong>{key}</strong>
                <div><span style={{ width: `${Math.min(100, count * 24)}%` }} /></div>
                <small>{count}</small>
              </div>
            ))
          )}
        </article>
      </section>

      <footer className="footer">
        <div>© 2026 TypeTeks. All rights reserved.</div>
        <nav>
          <a href="mailto:contact@typeteks.online">Contact</a>
          <a href="#support">Support</a>
          <a href="#privacy">Privacy</a>
        </nav>
      </footer>
    </main>
  );
}
