import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";
import FAQ from "./FAQ";
import "./App.css";

const AuthModal = lazy(() => import("./AuthModal"));

const LANGUAGES = [
  { id: "english", name: "English" },
  { id: "english_1k", name: "English 1k" },
  { id: "english_commonly_misspelled", name: "Misspelled Words" },
  { id: "hindi", name: "Hindi" },
  { id: "hindi_1k", name: "Hindi 1k" },
  { id: "spanish", name: "Spanish" },
  { id: "spanish_1k", name: "Spanish 1k" },
  { id: "arabic", name: "Arabic" },
  { id: "french", name: "French" },
  { id: "french_1k", name: "French 1k" },
  { id: "german", name: "German" },
  { id: "german_1k", name: "German 1k" },
  { id: "russian", name: "Russian" },
  { id: "russian_1k", name: "Russian 1k" },
  { id: "portuguese", name: "Portuguese" },
  { id: "portuguese_1k", name: "Portuguese 1k" },
  { id: "bangla", name: "Bangla" },
  { id: "code_python", name: "Python Code" },
  { id: "code_python_1k", name: "Python 1k" },
  { id: "code_javascript", name: "JavaScript Code" },
];

const MODES = [
  "words",
  "hinglish",
  "business",
  "conversation",
  "quotes",
  "code",
  "bigrams",
  "trigrams",
  "custom",
];

const POOLS = {
  words: "home now even used said government once any to and know world number another something until without when right less school both there almost people system place group around because through while every important possible between business support future strong learn focus better growth skill progress".split(" "),
  bigrams: "th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le".split(" "),
  trigrams: "the ing and ion ent her tha nth was eth for hat his you ter ere all res ver not".split(" "),
  code: "const return function import export async await array object string number boolean component state effect promise server client render props value index".split(" "),
  business: "client report project meeting growth revenue profit budget invoice market sales target dashboard strategy analysis finance team planning success quality".split(" "),
  quotes: [
    "The quick brown fox jumps over the lazy dog.",
    "Small steps every day build big results tomorrow.",
    "Focus on progress, not on perfection.",
    "Discipline today creates freedom tomorrow."
  ],
  hinglish: [
    `Subah alarm baja, lekin maine snooze kar diya.\nPaanch minute baad alarm phir baja.\nMaine socha, thodi aur neend le leta hoon.\nAankh khuli to office ka time ho chuka tha.\nUs din meri speed typing me nahi, taiyaar hone me improve hui.`,
    `Main chai peene dukaan par gaya.\nChai wale bhaiya ne poocha, strong ya normal?\nMaine bola, strong bana do.\nUnhone poocha, kitni strong?\nMaine kaha, itni ki Monday bhi Sunday lagne lage.`
  ],
  conversation: [
    `Aman: Did you study today?\nRavi: Yes, I opened the book.\nAman: Then what happened?\nRavi: I fell asleep.\nAman: What about your goal?\nRavi: The goal is still there. My timing is just a little late.`,
    `Boss: Is the report complete?\nEmployee: Almost, sir.\nBoss: What does almost mean?\nEmployee: The file is open, my confidence is high, and the data is still loading.`
  ]
};

const LANGUAGE_POOLS = {
  hindi: "का के कि में है और से ने को इस पर यह भी कर दिए रहे हो गए हुआ अपने साथ तो या तक द्वारा बाद भारत लोग काम बात समय स्थान अधिकार जीवन नाम रूप प्रथम विषय कार्य समाज देश".split(" "),
  arabic: "من على إلى عن في كان هذا التي الذي مع ما لا الله كل بعد حتى بين ذلك عدم ليس حول إلا قبل قد جدا حيث هناك تكون وكان قال أكثر كما كان يعمل".split(" "),
  spanish: "que de no a la el es por un para con una los del las se como mas pero sus le ya este si porque esta entre cuando muy sin sobre tambien hasta".split(" "),
  french: "que de ne pas le la les un une du des et en pour etre il ce qui sur avec plus par se meme tout faire sa son".split(" "),
  german: "das ist du ich nicht die es und der sie fuer mit den dem ein eine sich auf auch als nach wie im um oder aus wenn nur noch bei mir vor".split(" "),
  russian: "что и в не на с он как я но все по его из за у так о от же сказать который один свой можно только чтобы еще был".split(" "),
  portuguese: "que de nao a o e um uma para com por os as do da se em como mais mas sua seu voce eu esta este sobre muito sem tambem meu ate".split(" "),
  bangla: "না এবং এই কি তার সে করে তারা কে আমি বা জন্য সাথে থেকে হয় ছিল যা হয়তো আমার কথা মানুষ কাজ তারা দেশ মন".split(" "),
  code_python: "def return import from class if else elif for while in try except with as lambda async await True False None print len range list dict set int str".split(" "),
  code_javascript: "const let var function return import export default async await if else for while switch case break try catch throw new class extends element".split(" "),
};

// In-memory JSON cache to reduce network bandwidth
const jsonCache = new Map();

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

function extractWords(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.words)) return data.words;
  if (Array.isArray(data.default)) return data.default;
  return null;
}
function cleanCustomWords(value) {
  return value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}
function makeText(mode, selectedLang, customWords = null) {
  if (customWords && customWords.length > 0) {
    return Array.from({ length: 36 }, () => randomItem(customWords)).join(" ");
  }

  if (mode === "custom") {
    return "";
  }

  if (["quotes", "hinglish", "motivation", "conversation"].includes(mode)) {
    return randomItem(POOLS[mode] || POOLS.quotes);
  }

  const baseLangKey = selectedLang.replace("_1k", "");
  const langPool = LANGUAGE_POOLS[baseLangKey] || LANGUAGE_POOLS[selectedLang];
  if (langPool && langPool.length > 0) {
    return Array.from({ length: 36 }, () => randomItem(langPool)).join(" ");
  }

  const count = mode === "bigrams" ? 50 : mode === "trigrams" ? 42 : 36;
  const sourcePool = POOLS[mode] || POOLS.words;
  return Array.from({ length: count }, () => randomItem(sourcePool)).join(" ");
}

function accuracyOf(correct, total) {
  return total ? Math.round((correct / total) * 100) : 100;
}

function mobileLike() {
  return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth <= 768;
}

export default function App() {
  const [selectedLang, setSelectedLang] = useState("english");
  const [langWords, setLangWords] = useState(null);
  const [mode, setMode] = useState("words");
  
  const [customInput, setCustomInput] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [customError, setCustomError] = useState("");
  
  const [duration, setDuration] = useState(15);
  const [text, setText] = useState(() => makeText("words", "english"));
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [soundOn, setSoundOn] = useState(false);
  const [noBackspace, setNoBackspace] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [cloudSaveStatus, setCloudSaveStatus] = useState("idle");
  const [bestWpm, setBestWpm] = useState(() => Number(localStorage.getItem("Type Perfectly-best") || 0));
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("Type Perfectly-history") || "[]"); }
    catch { return []; }
  });

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileBufferRef = useRef("");
  const lastMobileLineRef = useRef(-1);
  const textContainerRef = useRef(null);
  const activeCharRef = useRef(null);

  const [caretPos, setCaretPos] = useState({
  x: 0,
  y: 0,
  height: 0,
  ready: false,
});
  const savedRef = useRef(false);
  const cloudSavedRef = useRef(false);
  const startedAtRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Audio Pool inside Ref to prevent scope leaks
  const audioPoolRef = useRef([]);
  const audioIndexRef = useRef(0);

  useEffect(() => {
    audioPoolRef.current = Array.from({ length: 6 }, () => {
      const audio = new Audio("/public_sound.mp3");
      audio.preload = "auto";
      audio.volume = 0.35;
      return audio;
    });
  }, []);

  const playTone = useCallback(() => {
    if (!soundOn || mobileLike() || audioPoolRef.current.length === 0) return;
    try {
      const sound = audioPoolRef.current[audioIndexRef.current];
      audioIndexRef.current = (audioIndexRef.current + 1) % audioPoolRef.current.length;
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch {
      // Audio playback catch
    }
  }, [soundOn]);

  const resetSession = useCallback(
  (
    nextMode = mode,
    nextDuration = duration,
    nextWords = langWords,
    nextLang = selectedLang,
    options = {}
  ) => {
    const { keepCustomActive = false } = options;

    setMode(nextMode);
    setDuration(nextDuration);
    setText(makeText(nextMode, nextLang, nextWords));
    setInput("");
    setRunning(false);
    setFinished(false);
    setTimeLeft(nextDuration);
    setElapsedMs(0);
    setMobileFocused(false);

    setIsCustomActive(
      nextMode === "custom" && keepCustomActive
    );

    if (nextMode !== "custom" || !keepCustomActive) {
      setCustomError("");
    }

    startedAtRef.current = 0;
    savedRef.current = false;
    cloudSavedRef.current = false;
    mobileBufferRef.current = "";
    lastMobileLineRef.current = -1;

    setCloudSaveStatus("idle");

    if (mobileInputRef.current) {
      mobileInputRef.current.value = "";
      mobileInputRef.current.blur();
    }

    requestAnimationFrame(() => {
      appRef.current?.focus({
        preventScroll: true,
      });
    });
  },
  [duration, mode, langWords, selectedLang]
);

  const startCustomPractice = useCallback(() => {
    const words = cleanCustomWords(customInput);

    if (words.length === 0) {
      setCustomError("Please paste at least one valid word.");
      return;
    }

    setCustomError("");
    setLangWords(null);

    resetSession(
      "custom",
      duration,
      words,
      selectedLang,
      { keepCustomActive: true }
    );
  }, [customInput, duration, selectedLang, resetSession]);

  const restartCurrentSession = useCallback(() => {
    if (mode === "custom" && isCustomActive) {
      const words = cleanCustomWords(customInput);

      if (words.length === 0) {
        setIsCustomActive(false);
        setCustomError("Please paste at least one valid word.");
        return;
      }

      resetSession(
        "custom",
        duration,
        words,
        selectedLang,
        { keepCustomActive: true }
      );
      return;
    }

    resetSession();
  }, [
    mode,
    isCustomActive,
    customInput,
    duration,
    selectedLang,
    resetSession,
  ]);

  const changeDuration = useCallback((nextDuration) => {
    if (mode === "custom") {
      const words = isCustomActive
        ? cleanCustomWords(customInput)
        : null;

      resetSession(
        "custom",
        nextDuration,
        words,
        selectedLang,
        {
          keepCustomActive:
            isCustomActive && Boolean(words?.length),
        }
      );
      return;
    }

    resetSession(
      mode,
      nextDuration,
      langWords,
      selectedLang
    );
  }, [
    mode,
    isCustomActive,
    customInput,
    langWords,
    selectedLang,
    resetSession,
  ]);

  // Fetch JSON with in-memory cache
  useEffect(() => {
    if (selectedLang === "english") {
      setLangWords(null);
      resetSession("words", duration, null, "english");
      return;
    }

    if (jsonCache.has(selectedLang)) {
      const words = jsonCache.get(selectedLang);
      setLangWords(words);
      resetSession("words", duration, words, selectedLang);
      return;
    }

    let active = true;
    fetch(`/${selectedLang}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const words = extractWords(data);
        if (words && words.length > 0) {
          jsonCache.set(selectedLang, words);
          setLangWords(words);
          resetSession("words", duration, words, selectedLang);
        } else {
          setLangWords(null);
          resetSession("words", duration, null, selectedLang);
        }
      })
      .catch((err) => {
        console.warn(`Fallback active for ${selectedLang}:`, err.message);
        if (active) {
          setLangWords(null);
          resetSession("words", duration, null, selectedLang);
        }
      });

    return () => { active = false; };
  }, [selectedLang]);

  const handleLanguageChange = (newLang) => {
    setIsCustomActive(false);
    setCustomError("");
    setSelectedLang(newLang);
    setMode("words");
  };

  const correctChars = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < input.length; i += 1) {
      if (input[i] === text[i]) correct += 1;
    }
    return correct;
  }, [input, text]);

  const accuracy = accuracyOf(correctChars, input.length);
  const elapsedMinutes = Math.max(elapsedMs, 1) / 60000;
  const wpm = input.length && elapsedMs >= 250
    ? Math.round((correctChars / 5) / elapsedMinutes)
    : 0;
  const score = correctChars * 10 + wpm * 2;
  const sessionActive = mobileFocused || running;
  const isRTL = selectedLang === "arabic";

  const finishSession = useCallback(() => {
    const preciseElapsed = startedAtRef.current
      ? Math.min(duration * 1000, performance.now() - startedAtRef.current)
      : 0;

    setElapsedMs(preciseElapsed);
    setTimeLeft(0);
    setRunning(false);
    setFinished(true);
    setMobileFocused(false);
    mobileInputRef.current?.blur();
  }, [duration]);

  // Pure Keystroke Handlers
  const processCharacter = useCallback((character) => {
    if (!character || character.length !== 1 || finished) return;

    if (!running) {
      startedAtRef.current = performance.now() - elapsedMs;
      setRunning(true);
    }

    setInput((previous) => {
      if (previous.length >= text.length) return previous;
      playTone();
      return previous + character;
    });
  }, [elapsedMs, finished, playTone, running, text.length]);

  const removeCharacter = useCallback(() => {
    if (!finished && !noBackspace) {
      setInput((previous) => previous.slice(0, -1));
    }
  }, [finished, noBackspace]);

  // Clean Declarative Trigger for Session Completion (Fixes state updater side-effect)
  useEffect(() => {
    if (text.length > 0 && input.length >= text.length && running && !finished) {
      finishSession();
    }
  }, [input.length, text.length, running, finished, finishSession]);

  useEffect(() => { appRef.current?.focus({ preventScroll: true }); }, []);

  // Supabase Auth Listener
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return undefined;
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Could not read auth session:", error.message);
        return;
      }
      setUser(data.session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // High-precision Timer
  useEffect(() => {
    if (!running || finished) return undefined;

    let frameId = 0;
    let lastUpdate = 0;

    const updateTimer = (now) => {
      const elapsed = now - startedAtRef.current;

      if (now - lastUpdate >= 250) {
        setElapsedMs(elapsed);
        const remainingMs = Math.max(0, duration * 1000 - elapsed);
        setTimeLeft(Math.ceil(remainingMs / 1000));
        lastUpdate = now;
      }

      if (elapsed >= duration * 1000) {
        finishSession();
        return;
      }

      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [duration, finishSession, finished, running]);

  // Local Storage Saver
  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const nextBest = Math.max(bestWpm, wpm);
    setBestWpm(nextBest);
    localStorage.setItem("Type Perfectly-best", String(nextBest));
    const entry = { mode, wpm, accuracy, duration, score, date: new Date().toLocaleString() };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 6);
      localStorage.setItem("Type Perfectly-history", JSON.stringify(next));
      return next;
    });
  }, [accuracy, bestWpm, duration, finished, mode, score, wpm]);

  // Supabase Cloud Saver
  useEffect(() => {
    if (!finished || !user || !supabase || cloudSavedRef.current) return;

    cloudSavedRef.current = true;
    setCloudSaveStatus("saving");

    const saveSession = async () => {
      const { error } = await supabase.from("typing_sessions").insert({
        mode,
        duration_seconds: duration,
        wpm,
        accuracy,
        score,
        characters: input.length,
      });

      if (error) {
        console.error("Cloud session save failed:", error.message);
        cloudSavedRef.current = false;
        setCloudSaveStatus("error");
        return;
      }

      setCloudSaveStatus("saved");
    };

    saveSession();
  }, [accuracy, duration, finished, input.length, mode, score, user, wpm]);

  const focusTyping = useCallback(() => {
    if (mobileLike()) {
      setMobileFocused(true);
      const target = mobileInputRef.current;
      if (!target) return;
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    } else {
      appRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const handleDesktopKeyDown = useCallback((event) => {
    const target = event.target;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLButtonElement ||
      target?.isContentEditable ||
      target === mobileInputRef.current
    ) {
      return;
    }

    if (event.ctrlKey || event.altKey || event.metaKey) return;

    if (event.key === "Tab") {
      event.preventDefault();
      restartCurrentSession();
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
  }, [processCharacter, removeCharacter, restartCurrentSession]);

  const handleMobileInput = useCallback((event) => {
    const value = event.currentTarget.value;
    const previous = mobileBufferRef.current;

    if (value.length > previous.length) {
      for (const character of value.slice(previous.length)) {
        processCharacter(character);
      }
    } else if (value.length < previous.length) {
      if (noBackspace) {
        event.currentTarget.value = previous;
      } else {
        for (let i = 0; i < previous.length - value.length; i += 1) {
          removeCharacter();
        }
      }
    }

    mobileBufferRef.current = event.currentTarget.value;

    if (mobileBufferRef.current.length > 40) {
      event.currentTarget.value = "";
      mobileBufferRef.current = "";
    }
  }, [noBackspace, processCharacter, removeCharacter]);
 useEffect(() => {
  if (!mobileLike()) return undefined;

  const frame = requestAnimationFrame(() => {
    const typingBox = document.querySelector(".typing-text");
    const currentCharacter = typingBox?.querySelector(".char.current");

    if (!typingBox) return;

    if (input.length === 0) {
      lastMobileLineRef.current = -1;
      typingBox.scrollTop = 0;
      return;
    }

    if (!currentCharacter) return;

    const typingRect = typingBox.getBoundingClientRect();
const currentRect = currentCharacter.getBoundingClientRect();

const currentLine =
  currentRect.top -
  typingRect.top +
  typingBox.scrollTop;

    if (currentLine === lastMobileLineRef.current) return;

    lastMobileLineRef.current = currentLine;

    typingBox.scrollTo({
      top: Math.max(0, currentLine - typingBox.clientHeight * 0.32),
      behavior: "smooth",
    });
  });

  return () => cancelAnimationFrame(frame);
}, [input.length]);
  useLayoutEffect(() => {
  const container = textContainerRef.current;
  const activeCharacter = activeCharRef.current;

  if (!container || !activeCharacter || finished) {
    setCaretPos((previous) => ({
      ...previous,
      ready: false,
    }));
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const characterRect = activeCharacter.getBoundingClientRect();

  setCaretPos({
    x:
      characterRect.left -
      containerRect.left +
      container.scrollLeft,

    y:
      characterRect.top -
      containerRect.top +
      container.scrollTop,

    height: characterRect.height,
    ready: true,
  });
}, [input.length, text, finished, isRTL]);
  const logout = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Logout failed:", error.message);
  }, []);

  const durationLabel = duration === 300 ? "5 MIN" : `${duration}S`;

  return (
    <main
      ref={appRef}
      tabIndex={0}
      className={`app ${sessionActive ? "session-active" : ""} ${finished ? "result-active" : ""}`}
      onKeyDown={handleDesktopKeyDown}
    >
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark">
            <img src="/TeksType.jpeg" alt="Type Perfectly logo" />
          </div>
          <div>
            <div className="brand-title">Type Perfectly</div>
            <div className="brand-subtitle">Typing Performance Lab</div>
          </div>
        </div>
        <div className="top-actions">
          <span className="key-hint"><kbd>Tab</kbd> Restart</span>
          <span className="key-hint"><kbd>Esc</kbd> Pause</span>
          <button type="button" className={`ghost-button ${noBackspace ? "active" : ""}`} onClick={() => setNoBackspace((val) => !val)}>
            {noBackspace ? "BACKSPACE OFF" : "BACKSPACE ON"}
          </button>
          <button type="button" className={`ghost-button ${soundOn ? "active" : ""}`} onClick={() => setSoundOn((val) => !val)}>
            {soundOn ? "SOUND ON" : "SOUND OFF"}
          </button>
          {user ? (
            <button type="button" className="ghost-button auth-header-button active" onClick={logout} title={user.email || "Signed in"}>
              LOG OUT
            </button>
          ) : (
            <button type="button" className="ghost-button auth-header-button" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>
              LOG IN
            </button>
          )}
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="eyebrow">FREE TYPING SPEED TEST</div>
          <h1>
            Free Typing Test Online<br />
            <span>Check Your WPM in 15 Seconds</span>
          </h1>
          <p className="hero-description">
            Get instant WPM, accuracy and weak-key feedback with English, Hinglish, code and business typing practice.
          </p>
          <button type="button" className="hero-cta" onClick={focusTyping}>
            START FREE TYPING TEST
          </button>
          <div className="hero-trust">Free to use · No account required · Instant results</div>
        </div>
        <div className="hero-picture" role="img" aria-label="Purple Type Perfectly keyboard" />
      </section>

      <section className="controls">
        <div className="control-section">
          <div className="control-label">Language</div>
          <div className="button-strip">
            <div className="select-wrapper">
              <select className="lang-select" value={selectedLang} onChange={(e) => handleLanguageChange(e.target.value)}>
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="control-section content-control">
          <div className="control-label">Content</div>
          <div className="button-strip">
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                className={mode === item ? "selected" : ""}
                onClick={() => {
                  setLangWords(null);
                  resetSession(
                    item,
                    duration,
                    null,
                    selectedLang,
                    { keepCustomActive: false }
                  );
                }}
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
                onClick={() => changeDuration(value)}
              >
                {value === 300 ? "5 MIN" : `${value}S`}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="practice-layout">
        <article className="typing-card">
          <input
            ref={mobileInputRef}
            className="mobile-capture"
            type="text"
            aria-label="Typing input"
            inputMode="text"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            onFocus={() => setMobileFocused(true)}
            onBlur={() => setMobileFocused(false)}
            onInput={handleMobileInput}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Backspace" && noBackspace) event.preventDefault();
            }}
          />

          <div className="typing-card-header">
            <div>
              <span>{durationLabel}</span>
              <span>{selectedLang.toUpperCase()} / {mode.toUpperCase()}</span>
            </div>
            {!finished && !(mode === "custom" && !isCustomActive) && (
              <button type="button" className="primary-button" onClick={focusTyping}>
                START TYPING
              </button>
            )}
          </div>

          {mode === "custom" && !isCustomActive ? (
            <div className="custom-practice-setup">
              <textarea
                className="custom-practice-textarea"
                value={customInput}
                rows={8}
                placeholder="Paste your custom vocabulary or text here..."
                onChange={(event) => {
                  setCustomInput(event.target.value);
                  if (customError) setCustomError("");
                }}
              />

              {customError && (
                <p className="custom-practice-error" role="alert">
                  {customError}
                </p>
              )}

              <button
                type="button"
                className="primary-button custom-start-button"
                onClick={startCustomPractice}
              >
                START PRACTICE
              </button>
            </div>
          ) : (
            <>
          <div
            ref={textContainerRef}
            className={`typing-text ${isRTL ? "rtl" : ""}`}
            dir={isRTL ? "rtl" : "ltr"}
            role="textbox"
            aria-label="Typing practice text."
            tabIndex={0}
            onPointerDown={focusTyping}
          >
           {!finished && caretPos.ready && (
  <span
    className="floating-caret"
    aria-hidden="true"
    style={{
     height: `${caretPos.height * 0.82}px`,
transform: `translate3d(
  ${caretPos.x}px,
  ${caretPos.y + caretPos.height * 0.09}px,
  0
)`,
    }}
  />
)} 
            {Array.from(text.matchAll(/\S+|\s+/g)).map((match) => {
              const chunk = match[0];
              const wordStartIndex = match.index ?? 0;
              const isWhitespace = /^\s+$/.test(chunk);

              const characters = typeof Intl !== "undefined" && Intl.Segmenter
                ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(chunk), (s) => s.segment)
                : Array.from(chunk);

              let currentOffset = 0;

              return (
                <span
                  key={`${wordStartIndex}-${chunk}`}
                  className={isWhitespace ? "space-group" : "word-group"}
                >
                  {characters.map((character) => {
                    const index = wordStartIndex + currentOffset;
                    const charLength = character.length;
                    currentOffset += charLength;

                    let className = "char upcoming";

                    if (index < input.length) {
                      className =
                        input.slice(index, index + charLength) === character
                          ? "char correct"
                          : "char wrong";
                    } else if (index <= input.length && input.length < index + charLength && !finished) {
                      className = "char current";
                    }

                   const isActive =
  index <= input.length &&
  input.length < index + charLength &&
  !finished;

return (
  <span
    key={index}
    ref={isActive ? activeCharRef : null}
    className={className}
  >
    {character}
  </span>
);
                  })}
                </span>
              );
            })}
          </div>

          <div className="legend-row">
            <span><i className="dot correct-dot" />Correct</span>
            <span><i className="dot wrong-dot" />Wrong</span>
            <span><i className="dot upcoming-dot" />Upcoming</span>
          </div>

          {!finished && (
            <div className="typing-actions">
              <button type="button" className="restart-button" onClick={restartCurrentSession}>
                RESTART SESSION
              </button>
            </div>
          )}
            </>
          )}
        </article>

        <aside className="stats-card">
          <div className="stats-title">Live Stats</div>
          <div className="stats-grid">
            <div>
              <span>Time</span>
              <strong>{finished ? durationLabel : `${timeLeft}s`}</strong>
            </div>
            <div>
              <span>WPM</span>
              <strong>{wpm}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>
          </div>

          {finished && (
            <div className="finished-box">
              <strong>Great job!</strong>
              <span>{wpm} WPM · {accuracy}% Accuracy</span>
              <span>Score: {score}</span>

              <button type="button" onClick={restartCurrentSession}>
                TRY AGAIN
              </button>

              {!user ? (
                <button type="button" className="save-progress-button" onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
                  CREATE FREE ACCOUNT TO SAVE THIS SCORE
                </button>
              ) : (
                <small className={`cloud-save-status ${cloudSaveStatus}`} role="status">
                  {cloudSaveStatus === "saving" && "Saving to your account..."}
                  {cloudSaveStatus === "saved" && "Saved to your account"}
                  {cloudSaveStatus === "error" && "Cloud save failed. Try again later."}
                  {cloudSaveStatus === "idle" && "Your result will be saved automatically."}
                </small>
              )}
            </div>
          )}
        </aside>
      </section>

      {finished && (
        <section className="result-dashboard" role="dialog" aria-modal="true" aria-labelledby="result-dashboard-title">
          <div className="result-dashboard-card">
            <p className="result-dashboard-label">TEST COMPLETE</p>
            <h2 id="result-dashboard-title">Your Typing Result</h2>
            <p className="result-dashboard-subtitle">
              {selectedLang.toUpperCase()} · {mode.toUpperCase()} · {durationLabel}
            </p>

            <div className="result-dashboard-stats">
              <div><span>WPM</span><strong>{wpm}</strong></div>
              <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
              <div><span>Score</span><strong>{score}</strong></div>
            </div>

            <div className="result-dashboard-actions">
              <button type="button" onClick={restartCurrentSession}>
                TRY AGAIN
              </button>
              {!user && (
                <button type="button" className="result-save-button" onClick={() => { setAuthMode("signup"); setAuthOpen(true); }}>
                  CREATE FREE ACCOUNT
                </button>
              )}
            </div>
          </div>
        </section>
      )}
      <FAQ />
      <footer className="footer">
        <div>© 2026 Type Perfectly. All rights reserved.</div>

        <nav aria-label="Legal and information links">
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/disclaimer.html">Disclaimer</a>

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScFhnHdXB3dWVWBhEPFfkQKQz3Xzs23UXhCYOqp7O0Q3mMXQg/viewform"
            target="_blank"
            rel="noopener noreferrer"
          >
            Feedback
          </a>
        </nav>
      </footer>

      {authOpen && (
        <Suspense fallback={null}>
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
        </Suspense>
      )}
    </main>
  );
}
