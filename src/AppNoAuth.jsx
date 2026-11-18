import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FAQ from "./FAQ";
import SocialFooter from "./SocialFooter";
import TypingResults from "./TypingResults";
import BlogSection from "./BlogSection";
import { getGuestHistory, getGuestStreak, saveGuestResult } from "./lib/guestStorage";
import { DEVELOPER_LANGUAGES, CODE_SNIPPETS } from "./data/developerSnippets";
import { playSwitchSound } from "./lib/soundEffects";
import "./App.css";
import "./typing-cursor.css";

const LANGUAGES = [
  ["english", "English"], ["english_1k", "English 1k"],
  ["english_commonly_misspelled", "Misspelled Words"], ["hindi", "Hindi"],
  ["hindi_1k", "Hindi 1k"], ["spanish", "Spanish"], ["spanish_1k", "Spanish 1k"],
  ["arabic", "Arabic"], ["french", "French"], ["french_1k", "French 1k"],
  ["german", "German"], ["german_1k", "German 1k"], ["russian", "Russian"],
  ["russian_1k", "Russian 1k"], ["portuguese", "Portuguese"],
  ["portuguese_1k", "Portuguese 1k"], ["bangla", "Bangla"],
];

const MODES = ["words", "code", "hinglish", "business", "conversation", "quotes", "bigrams", "trigrams", "custom"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const SWITCH_PROFILES = ["blue", "brown", "red"];

const WORDS = "home now even used said government once any to and know world number another something until without when right less school both there almost people system place group around because through while every important possible between business support future strong learn focus better growth skill progress".split(" ");

const POOLS = {
  words: WORDS,
  bigrams: "th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le".split(" "),
  trigrams: "the ing and ion ent her tha nth was eth for hat his you ter ere all res ver not".split(" "),
  business: "client report project meeting growth revenue profit budget invoice market sales target dashboard strategy analysis finance team planning success quality".split(" "),
  quotes: [
    "The quick brown fox jumps over the lazy dog.",
    "Small steps every day build big results tomorrow.",
    "Focus on progress, not on perfection.",
    "Discipline today creates freedom tomorrow."
  ],
  hinglish: [
    "Subah alarm baja, lekin maine snooze kar diya. Paanch minute baad alarm phir baja. Maine socha, thodi aur neend le leta hoon. Aankh khuli to office ka time ho chuka tha.",
    "Main chai peene dukaan par gaya. Chai wale bhaiya ne poocha, strong ya normal? Maine bola, strong bana do."
  ],
  conversation: [
    "Aman: Did you study today? Ravi: Yes, I opened the book. Aman: Then what happened? Ravi: I fell asleep.",
    "Boss: Is the report complete? Employee: Almost, sir. Boss: What does almost mean? Employee: The data is still loading."
  ],
};

const LANGUAGE_WORDS = {
  hindi: "का के कि में है और से ने को इस पर यह भी कर दिए रहे हो गए हुआ अपने साथ तो या",
  arabic: "من على إلى عن في كان هذا التي الذي مع ما لا الله كل بعد حتى بين ذلك",
  spanish: "que de no a la el es por un para con una los del las se como mas pero sus le ya este si",
  french: "que de ne pas le la les un une du des et en pour etre il ce qui sur avec plus",
  german: "das ist du ich nicht die es und der sie fuer mit den dem ein eine sich auf auch",
  russian: "что и в не на с он как я но все по его из за у так о от же сказать",
  portuguese: "que de nao a o e um uma para com por os as do da se em como mais mas sua",
  bangla: "না এবং এই কি তার সে করে তারা কে আমি বা জন্য সাথে থেকে হয় ছিল",
};

const pick = (items) => items[Math.floor(Math.random() * items.length)];

const makeText = (mode, lang, customWords = null, devLang = "javascript", devDiff = "beginner") => {
  if (mode === "code") {
    const list = CODE_SNIPPETS[devLang]?.[devDiff] || CODE_SNIPPETS.javascript.beginner;
    return pick(list);
  }
  if (customWords?.length) return Array.from({ length: 36 }, () => pick(customWords)).join(" ");
  if (mode === "custom") return "";
  if (["quotes", "hinglish", "conversation"].includes(mode)) return pick(POOLS[mode]);
  const langWords = LANGUAGE_WORDS[lang.replace(/_1k$/, "")];
  const pool = langWords ? langWords.split(" ") : (POOLS[mode] || WORDS);
  return Array.from({ length: mode === "bigrams" ? 50 : mode === "trigrams" ? 42 : 36 }, () => pick(pool)).join(" ");
};

export default function App() {
  const [language, setLanguage] = useState("english");
  const [mode, setMode] = useState("words");
  const [devLanguage, setDevLanguage] = useState("javascript");
  const [devDifficulty, setDevDifficulty] = useState("beginner");
  const [duration, setDuration] = useState(15);
  const [text, setText] = useState(() => makeText("words", "english"));
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [soundOn, setSoundOn] = useState(true);
  const [soundProfile, setSoundProfile] = useState("blue");
  const [noBackspace, setNoBackspace] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [customActive, setCustomActive] = useState(false);
  const [customError, setCustomError] = useState("");
  const [mobileFocused, setMobileFocused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestWpm, setBestWpm] = useState(() => Number(localStorage.getItem("Type Perfectly-best") || 0));
  const [history, setHistory] = useState(getGuestHistory);
  const [streak, setStreak] = useState(() => getGuestStreak().currentStreak);

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileBufferRef = useRef("");
  const startedAtRef = useRef(0);
  const savedRef = useRef(false);

  const customWords = useMemo(() => customDraft.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter(Boolean), [customDraft]);
  const textChars = useMemo(() => Array.from(text), [text]);
  const inputChars = useMemo(() => Array.from(input), [input]);
  const characterTokens = useMemo(() => Array.from(text.matchAll(/\s+|\S+/gu), (match) => ({
    value: match[0],
    start: Array.from(text.slice(0, match.index)).length,
    whitespace: /^\s+$/u.test(match[0]),
  })), [text]);

  const correctChars = useMemo(() => inputChars.reduce((count, char, index) => count + (char === textChars[index] ? 1 : 0), 0), [inputChars, textChars]);
  const accuracy = inputChars.length ? Math.round((correctChars / inputChars.length) * 100) : 100;
  const wpm = inputChars.length && elapsedMs >= 250 ? Math.round((correctChars / 5) / (Math.max(elapsedMs, 1) / 60000)) : 0;
  const sessionActive = running || mobileFocused;
  const languageName = mode === "code" ? `Code (${devLanguage})` : (LANGUAGES.find(([id]) => id === language)?.[1] || language);
  const typedWords = input.trim().split(/\s+/);
  const targetWords = text.trim().split(/\s+/);
  const correctWords = typedWords.filter((word, index) => word && word === targetWords[index]).length;

  const reset = useCallback((nextMode = mode, nextDuration = duration, nextLanguage = language, nextCustomWords = null, keepCustom = false, nextDevLang = devLanguage, nextDevDiff = devDifficulty) => {
    setMode(nextMode);
    setDuration(nextDuration);
    setLanguage(nextLanguage);
    setDevLanguage(nextDevLang);
    setDevDifficulty(nextDevDiff);
    setText(makeText(nextMode, nextLanguage, nextCustomWords, nextDevLang, nextDevDiff));
    setInput("");
    setRunning(false);
    setFinished(false);
    setTimeLeft(nextDuration);
    setElapsedMs(0);
    setMobileFocused(false);
    setCustomActive(nextMode === "custom" && keepCustom);
    setCustomError("");
    startedAtRef.current = 0;
    savedRef.current = false;
    mobileBufferRef.current = "";
    if (mobileInputRef.current) {
      mobileInputRef.current.value = "";
      mobileInputRef.current.blur();
    }
    requestAnimationFrame(() => appRef.current?.focus({ preventScroll: true }));
  }, [devDifficulty, devLanguage, duration, language, mode]);

  const finish = useCallback(() => {
    setElapsedMs(startedAtRef.current ? Math.min(duration * 1000, performance.now() - startedAtRef.current) : 0);
    setTimeLeft(0);
    setRunning(false);
    setFinished(true);
    setMobileFocused(false);
    mobileInputRef.current?.blur();
  }, [duration]);

  const typeCharacter = useCallback((character) => {
    if (!character || Array.from(character).length !== 1 || finished || inputChars.length >= textChars.length) return;
    if (!running) {
      startedAtRef.current = performance.now() - elapsedMs;
      setRunning(true);
    }
    if (soundOn && !window.matchMedia?.("(pointer: coarse)").matches) {
      playSwitchSound(soundProfile);
    }
    setInput((value) => Array.from(value).length < textChars.length ? value + character : value);
  }, [elapsedMs, finished, inputChars.length, running, soundOn, soundProfile, textChars.length]);

  const backspace = useCallback(() => {
    if (!finished && !noBackspace) {
      if (soundOn && !window.matchMedia?.("(pointer: coarse)").matches) {
        playSwitchSound(soundProfile);
      }
      setInput((value) => Array.from(value).slice(0, -1).join(""));
    }
  }, [finished, noBackspace, soundOn, soundProfile]);

  useEffect(() => {
    if (textChars.length && inputChars.length >= textChars.length && running && !finished) finish();
  }, [finish, finished, inputChars.length, running, textChars.length]);

  useEffect(() => { appRef.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    if (!running || finished) return undefined;
    let frame;
    const tick = (now) => {
      const elapsed = now - startedAtRef.current;
      setElapsedMs(elapsed);
      setTimeLeft(Math.ceil(Math.max(0, duration * 1000 - elapsed) / 1000));
      if (elapsed >= duration * 1000) { finish(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, finish, finished, running]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const nextBest = Math.max(bestWpm, wpm);
    setBestWpm(nextBest);
    localStorage.setItem("Type Perfectly-best", String(nextBest));
    const updatedHistory = saveGuestResult({
      wpm,
      accuracy,
      errors: Math.max(0, inputChars.length - correctChars),
      duration: duration === 300 ? "5 min" : `${duration}s`,
      mode: mode === "code" ? `code-${devLanguage}` : mode,
      language,
    });
    setHistory(updatedHistory);
    setStreak(getGuestStreak().currentStreak);
  }, [accuracy, bestWpm, correctChars, devLanguage, duration, finished, inputChars.length, language, mode, wpm]);

  const focusTyping = useCallback(() => {
    if (window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth <= 768) {
      setMobileFocused(true);
      mobileInputRef.current?.focus({ preventScroll: true });
    } else {
      appRef.current?.focus({ preventScroll: true });
    }
    document.querySelector(".practice-layout")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleKeyDown = useCallback((event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target instanceof HTMLButtonElement || target?.isContentEditable || target === mobileInputRef.current) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === "Tab") { event.preventDefault(); reset(); }
    else if (event.key === "Escape") {
      event.preventDefault();
      setRunning(false);
      setMobileFocused(false);
      mobileInputRef.current?.blur();
    } else if (event.key === "Backspace") { event.preventDefault(); backspace(); }
    else if (event.key === "Enter" && mode === "code") {
      event.preventDefault();
      typeCharacter("\n");
    } else if (Array.from(event.key).length === 1) {
      event.preventDefault();
      typeCharacter(event.key);
    }
  }, [backspace, mode, reset, typeCharacter]);

  const handleMobileInput = (event) => {
    const value = Array.from(event.currentTarget.value);
    const previous = Array.from(mobileBufferRef.current);
    if (value.length > previous.length) {
      for (const character of value.slice(previous.length)) typeCharacter(character);
    } else if (value.length < previous.length) {
      if (noBackspace) event.currentTarget.value = mobileBufferRef.current;
      else for (let index = 0; index < previous.length - value.length; index++) backspace();
    }
    mobileBufferRef.current = event.currentTarget.value;
    if (Array.from(mobileBufferRef.current).length > 40) {
      event.currentTarget.value = "";
      mobileBufferRef.current = "";
    }
  };

  const startCustom = () => {
    if (!customWords.length) { setCustomError("Please paste at least one valid word."); return; }
    reset("custom", duration, language, customWords, true);
  };

  const cycleSoundProfile = () => {
    const nextIdx = (SWITCH_PROFILES.indexOf(soundProfile) + 1) % SWITCH_PROFILES.length;
    const next = SWITCH_PROFILES[nextIdx];
    setSoundProfile(next);
    playSwitchSound(next);
  };

  return (
    <main
      ref={appRef}
      tabIndex={0}
      className={`app ${sessionActive ? "session-active" : ""} ${finished ? "result-active" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark"><img src="/TeksType.jpeg" alt="Type Perfectly logo" /></div>
          <div><div className="brand-title">Type Perfectly</div><div className="brand-subtitle">Typing Performance Lab</div></div>
        </div>
        <div className="top-actions">
          <span className={`streak-badge ${streak > 1 ? "fire" : ""}`} aria-label={`${streak} day practice streak`}>🔥 {streak} day streak</span>
          <button type="button" className="ghost-button" onClick={() => setShowAnalytics(true)}>📊 Analytics</button>
          <span className="key-hint"><kbd>Tab</kbd> Restart</span>
          <span className="key-hint"><kbd>Esc</kbd> Pause</span>
          <button type="button" className={`ghost-button ${noBackspace ? "active" : ""}`} onClick={() => setNoBackspace((value) => !value)}>{noBackspace ? "BACKSPACE OFF" : "BACKSPACE ON"}</button>
          <button type="button" className={`ghost-button ${soundOn ? "active" : ""}`} onClick={() => setSoundOn((value) => !value)}>{soundOn ? `🔊 SOUND ON` : "🔈 SOUND OFF"}</button>
          {soundOn && (
            <button type="button" className="ghost-button" onClick={cycleSoundProfile} title="Click to change switch type">
              SWITCH: {soundProfile.toUpperCase()}
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="eyebrow">FREE TYPING SPEED TEST</div>
          <h1>Free Typing Test Online<br /><span>Check Your WPM in 15 Seconds</span></h1>
          <p className="hero-description">Get instant WPM, accuracy and weak-key feedback with English, Hinglish, code and business typing practice.</p>
          <button type="button" className="hero-cta" onClick={focusTyping}>START FREE TYPING TEST</button>
          <div className="hero-trust">Free to use · No account required · Instant results</div>
        </div>
        <div className="hero-picture" role="img" aria-label="Purple Type Perfectly keyboard" />
      </section>

      <section className="controls">
        {mode === "code" ? (
          <>
            <div className="control-section">
              <div className="control-label">Code Language</div>
              <div className="button-strip">
                <div className="select-wrapper">
                  <select
                    className="lang-select"
                    value={devLanguage}
                    onChange={(e) => reset("code", duration, language, null, false, e.target.value, devDifficulty)}
                  >
                    {DEVELOPER_LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="control-section">
              <div className="control-label">Difficulty</div>
              <div className="button-strip">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    className={devDifficulty === diff ? "selected" : ""}
                    onClick={() => reset("code", duration, language, null, false, devLanguage, diff)}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="control-section">
            <div className="control-label">Language</div>
            <div className="button-strip">
              <div className="select-wrapper">
                <select className="lang-select" value={language} onChange={(event) => reset("words", duration, event.target.value)}>
                  {LANGUAGES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="control-section content-control">
          <div className="control-label">Content</div>
          <div className="button-strip">
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                className={mode === item ? "selected" : ""}
                onClick={() => reset(item, duration, language, null, false, devLanguage, devDifficulty)}
              >
                {item === "code" ? "⚡ CODE" : item.toUpperCase()}
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
                onClick={() => reset(mode, value, language, mode === "custom" && customActive ? customWords : null, customActive, devLanguage, devDifficulty)}
              >
                {value === 300 ? "5 MIN" : `${value}S`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="practice-layout">
        {finished ? (
          <TypingResults
            wpm={wpm}
            accuracy={accuracy}
            characters={inputChars.length}
            correctWords={correctWords}
            errors={Math.max(0, inputChars.length - correctChars)}
            time={duration}
            language={languageName}
            mode={mode}
            onTryAgain={() => reset()}
            onChangeTest={() => { reset(); document.querySelector(".controls")?.scrollIntoView({ behavior: "smooth" }); }}
          />
        ) : (
          <>
            <article className={`typing-card ${mode === "code" ? "code-editor-card" : ""}`}>
              <input ref={mobileInputRef} className="mobile-capture" type="text" aria-label="Typing input" inputMode="text" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} onFocus={() => setMobileFocused(true)} onBlur={() => setMobileFocused(false)} onInput={handleMobileInput} onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Backspace" && noBackspace) event.preventDefault(); }} />
              <div className="typing-card-header">
                <div>
                  <span>{duration === 300 ? "5 MIN" : `${duration}S`}</span>
                  <span>{mode === "code" ? `DEV / ${devLanguage.toUpperCase()} (${devDifficulty.toUpperCase()})` : `${language.toUpperCase()} / ${mode.toUpperCase()}`}</span>
                </div>
                {!(mode === "custom" && !customActive) && <button type="button" className="primary-button" onClick={focusTyping}>START TYPING</button>}
              </div>
              {mode === "custom" && !customActive ? (
                <div className="custom-practice-setup">
                  <textarea className="custom-practice-textarea" value={customDraft} rows={8} placeholder="Paste your custom vocabulary or text here..." onChange={(event) => { setCustomDraft(event.target.value); setCustomError(""); }} />
                  {customError && <p className="custom-practice-error" role="alert">{customError}</p>}
                  <button type="button" className="primary-button custom-start-button" onClick={startCustom}>START PRACTICE</button>
                </div>
              ) : (
                <>
                  <div className={`typing-text ${mode === "code" ? "code-font" : ""} ${language === "arabic" ? "rtl" : ""}`} dir={language === "arabic" ? "rtl" : "ltr"} role="textbox" aria-label="Typing practice text." tabIndex={0} onPointerDown={focusTyping}>
                    {characterTokens.map(({ value, start, whitespace }) => whitespace
                      ? <span className="typing-whitespace" key={`space-${start}`}>{value}</span>
                      : <span className="word-group" key={`word-${start}`}>{Array.from(value).map((character, offset) => {
                          const index = start + offset;
                          const className = index < inputChars.length ? (inputChars[index] === character ? "correct" : "wrong") : index === inputChars.length ? "current" : "upcoming";
                          return <span key={index} className={`char ${className}`}>{character}</span>;
                        })}</span>)}
                    {inputChars.length >= textChars.length && <span className="char current end-caret" aria-hidden="true">&#8203;</span>}
                  </div>
                  <div className="legend-row">
                    <span><i className="dot correct-dot" />Correct</span>
                    <span><i className="dot wrong-dot" />Wrong</span>
                    <span><i className="dot upcoming-dot" />Upcoming</span>
                    {mode === "code" && <span><kbd style={{ fontSize: "10px" }}>Enter</kbd> Next Line</span>}
                  </div>
                  <div className="typing-actions">
                    <button type="button" className="restart-button" onClick={() => reset()}>RESTART SESSION</button>
                  </div>
                </>
              )}
            </article>
            <aside className="stats-card">
              <div className="stats-title">Live Stats</div>
              <div className="stats-grid">
                <div><span>Time</span><strong>{timeLeft}s</strong></div>
                <div><span>WPM</span><strong>{wpm}</strong></div>
                <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
              </div>
              <div className="stats-title history-title">Best &amp; Recent</div>
              <div className="history-list">
                <p>Personal best: <strong>{bestWpm} WPM</strong></p>
                {history.slice(0, 5).map((item, index) => (
                  <p key={`${item.id}-${index}`}>{item.wpm} WPM · {item.accuracy}% · {item.mode}</p>
                ))}
              </div>
            </aside>
          </>
        )}
      </section>

      <div className="content-stack">
        <BlogSection onStartTyping={focusTyping} />
        <FAQ />
        <SocialFooter wpm={finished ? wpm : null} />
      </div>

      <AnalyticsDashboard
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        history={history}
        streak={streak}
        bestWpm={bestWpm}
      />
    </main>
  );
}
