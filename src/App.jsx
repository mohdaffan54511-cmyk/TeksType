import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ROBOTO_LINK_ID = "roboto-font-link";

const WORD_POOLS = {
  words: [
    "home", "now", "even", "used", "said", "government", "once", "any", "to", "and",
    "know", "world", "number", "another", "something", "until", "without", "my", "when",
    "right", "less", "school", "both", "there", "almost", "put", "be", "is", "people",
    "system", "place", "group", "against", "around", "because", "through", "while",
    "every", "important", "possible", "between", "business", "support", "future",
    "strong", "learn", "focus", "better", "growth", "skill"
  ],
  bigrams: [
    "th", "he", "in", "er", "an", "re", "on", "at", "en", "nd",
    "ti", "es", "or", "te", "of", "ed", "is", "it", "al", "ar",
    "st", "to", "nt", "ng", "se", "ha", "as", "ou", "io", "le"
  ],
  trigrams: [
    "the", "ing", "and", "ion", "ent", "her", "tha", "nth", "was", "eth",
    "for", "dth", "hat", "his", "you", "ter", "ere", "all", "res", "ver"
  ],
  code: [
    "const", "return", "function", "import", "export", "async", "await", "array",
    "object", "string", "number", "boolean", "component", "state", "effect",
    "promise", "server", "client", "render", "props", "value", "index"
  ],
  business: [
    "client", "report", "project", "meeting", "growth", "revenue", "profit",
    "budget", "invoice", "market", "sales", "target", "dashboard", "strategy",
    "analysis", "finance", "team", "planning", "success", "quality"
  ],
  quotes: [
    "The quick brown fox jumps over the lazy dog.",
    "Small steps every day build big results tomorrow.",
    "Focus on progress, not on perfection.",
    "Discipline today creates freedom tomorrow."
  ],
  hinglish: [
    "Subah office jaate waqt meri bus miss ho gayi. Main auto me baitha, lekin driver bhaiya ko bhi wahi bus pakadni thi, isliye unhone auto ko race car bana diya.",
    "Kal main chai lene gaya tha. Chai wale bhaiya ne poocha strong ya normal. Maine bola strong, kyunki meri neend aur problems dono normal se zyada thi.",
    "Mummy ne kaha mehmaan aa rahe hain, room saaf karo. Maine sab samaan bed ke neeche daal diya. Mehmaan ke bachche ne wahi jagah hide and seek ke liye choose kar li.",
    "Mera dost gym join karke pehle din hi protein shaker kharid laya. Exercise usne sirf itni ki bottle ko teen baar shake kiya.",
    "Ek baar main interview ke liye jaldi nikla, lekin raste me shirt par chai gir gayi. Interviewer ne poocha pressure handle kar lete ho? Maine kaha, sir aaj practical test dekar aaya hoon.",
    "Kal market me ek uncle bargaining kar rahe the. Dukandaar ne bola final price hai. Uncle bole, beta final to exam hota hai, price nahi.",
    "Main online meeting me serious face bana kar baitha tha. Tabhi peeche se mummy boli, pehle aloo ka packet le aao. Sab log chup rahe, phir manager ne kaha, meeting ke baad le aana.",
    "Mere dost ne kaha woh sirf ek samosa khayega. Do minute baad usne doosra samosa order karke bola, pehla to warm-up tha.",
    "Maine fridge khola aur kuch interesting nahi mila. Do minute baad phir khola, jaise fridge ne interval me naya content upload kar diya ho.",
    "Dost ne bola tension mat le, sab theek ho jayega. Maine poocha kaise? Bola, pata nahi, lekin dialogue motivational lagta hai.",
    "Ek baar main restaurant me English bolne gaya. Waiter ne poocha spicy? Maine confidence me bola yes very much. Pehla bite khate hi meri aankhon ne Hindi me complain kar di.",
    "Main padhne baitha hi tha ki room saaf karne ka motivation aa gaya. Room saaf hua, table set hui, chai bani, aur padhai kal ke liye shift ho gayi.",
    "Kabhi kabhi jeet talent se nahi, daily practice se hoti hai. Jo aadmi roz thoda thoda improve karta hai, wahi aage chal kar sabse strong ban jaata hai.",
    "Ek achha dost wahi hota hai jo tumhari speed slow ho tab bhi tumhara mazaak udaane ke bajaye bole, chal fir se start karte hain.",
    "Bravery hamesha loud nahi hoti. Kabhi kabhi bravery ka matlab hota hai kal phir se koshish karna, chahe aaj tum fail hi kyu na hue ho."
  ]
};

function injectRobotoFont() {
  if (document.getElementById(ROBOTO_LINK_ID)) return;

  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";

  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "anonymous";

  const link = document.createElement("link");
  link.id = ROBOTO_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap";

  document.head.appendChild(pre1);
  document.head.appendChild(pre2);
  document.head.appendChild(link);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeText(mode) {
  if (mode === "quotes") {
    return randomFrom(WORD_POOLS.quotes);
  }

  if (mode === "hinglish") {
    return randomFrom(WORD_POOLS.hinglish);
  }

  const pool = WORD_POOLS[mode] || WORD_POOLS.words;
  const count =
    mode === "bigrams" ? 40 :
    mode === "trigrams" ? 30 :
    mode === "code" ? 28 :
    mode === "business" ? 28 :
    36;

  return Array.from(
    { length: count },
    () => pool[Math.floor(Math.random() * pool.length)]
  ).join(" ");
}

function getAccuracy(correct, total) {
  return total === 0 ? 100 : Math.round((correct / total) * 100);
}

function App() {
  const [mode, setMode] = useState("words");
  const [duration, setDuration] = useState(15);
  const [text, setText] = useState(makeText("words"));
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [typingActive, setTypingActive] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [bestWpm, setBestWpm] = useState(() => {
    return Number(localStorage.getItem("typeteks-best-wpm") || 0);
  });
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("typeteks-history") || "[]");
    } catch {
      return [];
    }
  });

  const hiddenInputRef = useRef(null);
  const inputBufferRef = useRef("");
  const startRef = useRef(0);

  useEffect(() => {
    injectRobotoFont();
  }, []);

  const correctChars = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < input.length; i += 1) {
      if (input[i] === text[i]) correct += 1;
    }
    return correct;
  }, [input, text]);

  const accuracy = getAccuracy(correctChars, input.length);

  const elapsedSeconds = useMemo(() => {
    const raw = duration - timeLeft;
    return raw <= 0 ? (running ? 1 : 0) : raw;
  }, [duration, timeLeft, running]);

  const liveWpm = useMemo(() => {
    if (correctChars === 0) return 0;
    const minutes = Math.max(elapsedSeconds, 1) / 60;
    return Math.round(correctChars / 5 / minutes);
  }, [correctChars, elapsedSeconds]);

  const slowChunks = useMemo(() => {
    return [
      { label: "th", ms: 286 },
      { label: "re", ms: 249 },
      { label: "on", ms: 244 },
      { label: "ng", ms: 210 },
      { label: "st", ms: 198 }
    ];
  }, []);

  const resetSession = useCallback(
    (nextMode = mode, nextDuration = duration) => {
      setText(makeText(nextMode));
      setInput("");
      setRunning(false);
      setFinished(false);
      setTimeLeft(nextDuration);
      setTypingActive(false);
      inputBufferRef.current = "";
      startRef.current = 0;

      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = "";
        hiddenInputRef.current.blur();
      }
    },
    [mode, duration]
  );

  useEffect(() => {
    resetSession(mode, duration);
  }, [mode, duration, resetSession]);

  useEffect(() => {
    if (!running || finished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, finished]);

  useEffect(() => {
    if (!finished) return;

    const finalWpm = liveWpm;
    const newBest = Math.max(bestWpm, finalWpm);
    if (newBest !== bestWpm) {
      setBestWpm(newBest);
      localStorage.setItem("typeteks-best-wpm", String(newBest));
    }

    const nextHistory = [
      {
        wpm: finalWpm,
        acc: accuracy,
        mode,
        duration,
        date: new Date().toLocaleString()
      },
      ...history
    ].slice(0, 4);

    setHistory(nextHistory);
    localStorage.setItem("typeteks-history", JSON.stringify(nextHistory));
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const processChar = useCallback(
    (char) => {
      if (finished) return;

      if (!running) {
        setRunning(true);
        setTypingActive(true);
        startRef.current = Date.now();
      }

      setInput((prev) => {
        if (prev.length >= text.length) return prev;
        const next = prev + char;

        if (next.length >= text.length) {
          setRunning(false);
          setFinished(true);
        }

        return next;
      });
    },
    [finished, running, text.length]
  );

  const processBackspace = useCallback(() => {
    if (finished) return;
    setInput((prev) => prev.slice(0, -1));
  }, [finished]);

  const focusTyping = useCallback(() => {
    setTypingActive(true);
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.focus();
      }
    }, 50);
  }, []);

  const handleHiddenInput = useCallback(
    (e) => {
      const value = e.target.value;
      const previous = inputBufferRef.current;

      if (value.length < previous.length) {
        processBackspace();
      } else if (value.length > previous.length) {
        const added = value.slice(previous.length);
        for (const ch of added) {
          processChar(ch);
        }
      }

      inputBufferRef.current = value;

      if (value.length > 16) {
        e.target.value = "";
        inputBufferRef.current = "";
      }
    },
    [processBackspace, processChar]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        resetSession();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        setRunning(false);
        setTypingActive(false);
        if (hiddenInputRef.current) hiddenInputRef.current.blur();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        processBackspace();
      }
    },
    [processBackspace, resetSession]
  );

  const renderTypingText = () => {
    return text.split("").map((char, index) => {
      let className = "char upcoming";

      if (index < input.length) {
        className = input[index] === char ? "char correct" : "char wrong";
      } else if (index === input.length) {
        className = "char current";
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  const css = `
:root {
  --bg: #f6f1ff;
  --card: rgba(255,255,255,0.82);
  --white: #ffffff;
  --ink: #17112c;
  --ink-soft: #6a6388;
  --purple-100: #efe8ff;
  --purple-200: #e1d4ff;
  --purple-400: #9e72ff;
  --purple-500: #7f52ff;
  --purple-600: #6c43f1;
  --purple-700: #4a2dc9;
  --purple-900: #24115d;
  --border: rgba(108,67,241,0.12);
  --shadow: 0 18px 44px rgba(77, 43, 189, 0.12);
  --shadow-strong: 0 24px 50px rgba(77, 43, 189, 0.18);
  --correct: #7f52ff;
  --wrong: #ff4d7a;
  --upcoming: #b7b3c8;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.6), rgba(255,255,255,0.6)),
    linear-gradient(90deg, rgba(127,82,255,0.05) 1px, transparent 1px),
    linear-gradient(rgba(127,82,255,0.05) 1px, transparent 1px),
    var(--bg);
  background-size: auto, 120px 120px, 120px 120px, auto;
  color: var(--ink);
  font-family: "Roboto", Arial, sans-serif;
  overflow-x: hidden;
}

button,
input {
  font-family: "Roboto", Arial, sans-serif;
}

.app {
  width: min(1280px, calc(100% - 32px));
  margin: 12px auto 24px;
  padding: 16px;
  border-radius: 28px;
  background: rgba(255,255,255,0.34);
  backdrop-filter: blur(8px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 14px 18px;
  border-bottom: 1px solid rgba(108,67,241,0.12);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: var(--white);
  font-size: 28px;
  font-weight: 900;
  background: linear-gradient(135deg, var(--purple-400), var(--purple-700));
  box-shadow: var(--shadow-strong);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.brand-sub {
  color: var(--ink-soft);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 700;
}

.top-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.desktop-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-soft);
  font-size: 14px;
}

.hint-key {
  padding: 6px 9px;
  border-radius: 10px;
  background: rgba(108,67,241,0.08);
  color: var(--purple-700);
  font-weight: 700;
  font-size: 12px;
}

.settings-btn {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.84);
  color: var(--purple-900);
  border-radius: 14px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow);
}

.settings-btn.active {
  color: var(--white);
  border-color: transparent;
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 480px);
  gap: 26px;
  align-items: center;
  padding: 28px 18px 18px;
}

.hero-copy-wrap {
  padding: 10px;
}

.eyebrow {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(108,67,241,0.28);
  color: var(--purple-700);
  font-weight: 700;
  font-size: 14px;
}

.hero h1 {
  margin: 18px 0 12px;
  font-size: clamp(48px, 7vw, 76px);
  line-height: 0.95;
  letter-spacing: -0.05em;
  font-weight: 900;
}

.hero h1 span {
  color: var(--purple-500);
}

.hero-copy {
  max-width: 620px;
  color: var(--ink-soft);
  font-size: 18px;
  line-height: 1.55;
}

.hero-image-card {
  width: 100%;
  max-width: 500px;
  justify-self: end;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-image-card img {
  width: 100%;
  height: auto;
  max-height: 360px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 28px 40px rgba(91, 61, 240, 0.25));
}

.controls {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.9fr;
  gap: 18px;
  padding: 18px;
  margin: 6px 12px 16px;
  border-radius: 24px;
  background: var(--card);
  border: 1px solid rgba(255,255,255,0.86);
  box-shadow: var(--shadow);
}

.control-block {
  min-width: 0;
}

.label {
  margin-bottom: 10px;
  color: var(--purple-700);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.control-buttons button {
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.84);
  color: var(--purple-900);
  border-radius: 14px;
  padding: 12px 16px;
  min-width: 110px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow);
}

.control-buttons button.active {
  color: var(--white);
  border-color: transparent;
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
}

.typing-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  gap: 18px;
  padding: 0 12px;
  align-items: start;
}

.typing-shell {
  background: var(--card);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.88);
  box-shadow: var(--shadow);
}

.typing-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.typing-mode {
  color: var(--purple-700);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.tap-btn {
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
  color: var(--white);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.typing-text {
  min-height: 230px;
  text-align: left;
  font-size: clamp(27px, 3vw, 42px);
  line-height: 1.72;
  letter-spacing: 0.04em;
  color: var(--upcoming);
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.char.correct {
  color: var(--ink);
}

.char.wrong {
  color: var(--wrong);
  background: rgba(255, 77, 122, 0.12);
  border-radius: 6px;
}

.char.current {
  color: var(--purple-500);
  position: relative;
}

.char.current::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 0.08em;
  bottom: 0.08em;
  width: 3px;
  border-radius: 999px;
  background: rgba(127,82,255,0.45);
}

.typing-legend {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 18px;
  color: var(--ink-soft);
  font-size: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.correct {
  background: var(--correct);
}

.dot.wrong {
  background: var(--wrong);
}

.dot.upcoming {
  background: #c9c7d8;
}

.restart {
  margin-top: 18px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--purple-500), var(--purple-700));
  color: var(--white);
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: var(--shadow-strong);
}

.stats-card,
.best-box,
.history-box,
.heat-box {
  background: var(--card);
  border-radius: 24px;
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.88);
  box-shadow: var(--shadow);
}

.stats-card {
  display: grid;
  gap: 14px;
}

.stat-row {
  padding: 10px 0;
  border-bottom: 1px solid rgba(108,67,241,0.12);
}

.stat-row:last-child {
  border-bottom: 0;
}

.stat-title {
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-value {
  margin-top: 6px;
  font-size: 20px;
  color: var(--purple-600);
  font-weight: 900;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1.1fr;
  gap: 18px;
  padding: 18px 12px 0;
}

.section-title {
  margin: 0 0 14px;
  color: var(--purple-700);
  font-size: 15px;
  font-weight: 800;
}

.best-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.best-item {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,0.84);
  border: 1px solid var(--border);
}

.best-item span {
  display: block;
  font-size: 12px;
  color: var(--ink-soft);
  margin-bottom: 8px;
}

.best-item b {
  font-size: 18px;
  color: var(--purple-900);
}

.session-row {
  display: grid;
  grid-template-columns: 1.4fr 0.6fr 0.6fr 0.6fr;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(108,67,241,0.1);
  font-size: 14px;
}

.session-row:last-child {
  border-bottom: 0;
}

.heat-row {
  display: grid;
  grid-template-columns: 42px 1fr 70px;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.heat-track {
  height: 10px;
  border-radius: 999px;
  background: rgba(108,67,241,0.12);
  overflow: hidden;
}

.heat-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--purple-400), var(--purple-700));
}

.footer {
  margin-top: 18px;
  padding: 18px 16px;
  border-radius: 20px;
  color: var(--white);
  background: linear-gradient(135deg, var(--purple-500), var(--purple-900));
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.mobile-keyboard-input {
  position: fixed;
  left: 1px;
  top: 1px;
  width: 2px;
  height: 2px;
  opacity: 0.01;
  border: 0;
  padding: 0;
  font-size: 16px;
  color: transparent;
  background: transparent;
  caret-color: transparent;
  z-index: 9999;
}

@media (max-width: 1100px) {
  .controls {
    grid-template-columns: 1fr;
  }

  .typing-layout {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    grid-template-columns: 1fr;
  }

  .hero-image-card {
    justify-self: center;
  }
}

@media (max-width: 768px) {
  .app {
    width: calc(100% - 16px);
    padding: 10px;
    margin: 8px auto 16px;
    border-radius: 24px;
  }

  .topbar {
    padding: 10px 10px 14px;
  }

  .brand-sub,
  .desktop-hint {
    display: none;
  }

  .brand-title {
    font-size: 20px;
  }

  .top-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .settings-btn {
    padding: 10px 14px;
    font-size: 13px;
  }

  .hero {
    padding: 20px 8px 10px;
    gap: 14px;
  }

  .hero h1 {
    font-size: clamp(42px, 12vw, 64px);
  }

  .hero-copy {
    font-size: 16px;
  }

  .hero-image-card {
    max-width: 100%;
    margin-top: 8px;
  }

  .hero-image-card img {
    max-height: 220px;
  }

  .controls {
    margin: 6px 4px 12px;
    padding: 14px;
    border-radius: 20px;
  }

  .control-buttons button {
    flex: 1 1 calc(50% - 10px);
    min-width: 0;
    padding: 11px 10px;
  }

  .typing-layout {
    padding: 0 4px;
  }

  .typing-shell {
    padding: 16px;
    border-radius: 20px;
  }

  .typing-text {
    min-height: 300px;
    font-size: clamp(24px, 7vw, 32px);
    line-height: 1.65;
    text-align: left;
  }

  .bottom-grid {
    padding: 14px 4px 0;
  }

  .best-grid {
    grid-template-columns: 1fr;
  }

  .session-row {
    grid-template-columns: 1fr 0.6fr 0.6fr;
  }

  .session-row div:last-child {
    display: none;
  }

  .footer {
    margin: 14px 4px 0;
    flex-direction: column;
  }

  .app.typing-active .hero,
  .app.typing-active .controls,
  .app.typing-active .bottom-grid,
  .app.typing-active .footer {
    display: none;
  }

  .app.typing-active .typing-layout {
    padding-top: 6px;
  }

  .app.typing-active .topbar {
    padding-bottom: 8px;
  }

  .app.typing-active .top-actions {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo-box {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }

  .brand-title {
    font-size: 18px;
  }

  .eyebrow {
    font-size: 12px;
    padding: 7px 11px;
  }

  .hero h1 {
    font-size: 54px;
  }

  .typing-topline {
    align-items: flex-start;
  }

  .tap-btn {
    width: 100%;
  }

  .stats-card {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .stat-row {
    border-bottom: 0;
    border-right: 1px solid rgba(108,67,241,0.12);
    padding-right: 8px;
  }

  .stat-row:last-child {
    border-right: 0;
  }
}
`;

  return (
    <>
      <style>{css}</style>

      <main className={`app ${typingActive ? "typing-active" : ""}`}>
        <header className="topbar">
          <div className="brand">
            <div className="logo-box">T</div>
            <div className="brand-copy">
              <h1 className="brand-title">TypeTeks</h1>
              <div className="brand-sub">Typing Performance Lab</div>
            </div>
          </div>

          <div className="top-actions">
            <div className="desktop-hint">
              <span className="hint-key">Tab</span> Restart
            </div>
            <div className="desktop-hint">
              <span className="hint-key">Esc</span> Pause
            </div>
            <button className="settings-btn">STANDARD</button>
            <button
              className={`settings-btn ${soundOn ? "active" : ""}`}
              type="button"
              onClick={() => setSoundOn((prev) => !prev)}
            >
              {soundOn ? "SOUND ON" : "SOUND OFF"}
            </button>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy-wrap">
            <div className="eyebrow">
              MICRO-BLITZ • {duration}s • {mode.toUpperCase()}
            </div>

            <h1>
              Type at the
              <br />
              speed of <span>thought.</span>
            </h1>

            <p className="hero-copy">
              Every keystroke builds your speed.
              <br />
              Focus. Type. Improve.
            </p>
          </div>

          <div className="hero-image-card">
            <img
              src="/typing-hero.png"
              alt="Purple 3D typing keyboard"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </section>

        <section className="controls">
          <div className="control-block">
            <div className="label">Content</div>
            <div className="control-buttons">
              {["words", "bigrams", "trigrams", "code", "business", "quotes", "hinglish"].map((item) => (
                <button
                  key={item}
                  className={mode === item ? "active" : ""}
                  type="button"
                  onClick={() => setMode(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <div className="label">Time</div>
            <div className="control-buttons">
              {[15, 30, 60, 300].map((item) => (
                <button
                  key={item}
                  className={duration === item ? "active" : ""}
                  type="button"
                  onClick={() => setDuration(item)}
                >
                  {item === 300 ? "5 min" : `${item}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <div className="label">Audio</div>
            <div className="control-buttons">
              <button
                className={soundOn ? "active" : ""}
                type="button"
                onClick={() => setSoundOn((prev) => !prev)}
              >
                {soundOn ? "SOUND ON" : "SOUND OFF"}
              </button>
              <button type="button" onClick={() => alert("Test sound later add kar sakte ho.")}>
                TEST SOUND
              </button>
            </div>
          </div>
        </section>

        <section className="typing-layout">
          <div className="typing-shell" onClick={focusTyping}>
            <div className="typing-topline">
              <div className="typing-mode">
                {duration === 300 ? "5 MIN" : `${duration}s`} {mode.toUpperCase()}
              </div>

              <button className="tap-btn" type="button" onClick={focusTyping}>
                TAP TO TYPE
              </button>
            </div>

            <div className="typing-text">{renderTypingText()}</div>

            <div className="typing-legend">
              <div className="legend-item">
                <span className="dot correct" />
                Correct
              </div>
              <div className="legend-item">
                <span className="dot wrong" />
                Wrong
              </div>
              <div className="legend-item">
                <span className="dot upcoming" />
                Upcoming
              </div>
            </div>

            <button className="restart" type="button" onClick={() => resetSession()}>
              RESTART • TAB
            </button>
          </div>

          <aside className="stats-card">
            <div className="stat-row">
              <div className="stat-title">Time Left</div>
              <div className="stat-value">
                {duration === 300 && timeLeft > 59
                  ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`
                  : `${timeLeft}s`}
              </div>
            </div>

            <div className="stat-row">
              <div className="stat-title">WPM</div>
              <div className="stat-value">{liveWpm}</div>
            </div>

            <div className="stat-row">
              <div className="stat-title">Accuracy</div>
              <div className="stat-value">{accuracy}%</div>
            </div>
          </aside>
        </section>

        <section className="bottom-grid">
          <div className="best-box">
            <h3 className="section-title">Personal Bests</h3>
            <div className="best-grid">
              <div className="best-item">
                <span>Best WPM</span>
                <b>{bestWpm || 0}</b>
              </div>
              <div className="best-item">
                <span>Accuracy</span>
                <b>{accuracy}%</b>
              </div>
              <div className="best-item">
                <span>Mode</span>
                <b>{mode}</b>
              </div>
            </div>
          </div>

          <div className="history-box">
            <h3 className="section-title">Recent Sessions</h3>
            {history.length === 0 ? (
              <div style={{ color: "#6a6388", fontSize: "14px" }}>No sessions yet.</div>
            ) : (
              history.map((item, index) => (
                <div className="session-row" key={`${item.date}-${index}`}>
                  <div>{item.date}</div>
                  <div>{item.wpm} WPM</div>
                  <div>{item.acc}%</div>
                  <div>{item.mode}</div>
                </div>
              ))
            )}
          </div>

          <div className="heat-box">
            <h3 className="section-title">Slowest Letter Chunks</h3>
            {slowChunks.map((item) => (
              <div className="heat-row" key={item.label}>
                <strong>{item.label}</strong>
                <div className="heat-track">
                  <div
                    className="heat-fill"
                    style={{ width: `${Math.min(item.ms / 4, 100)}%` }}
                  />
                </div>
                <span>{item.ms}ms</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="footer">
          <div>© 2025 TypeTeks. All rights reserved.</div>
          <div className="footer-links">
            <span>Contact</span>
            <span>Support</span>
            <span>Terms</span>
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </footer>

        <input
          ref={hiddenInputRef}
          className="mobile-keyboard-input"
          type="text"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          onFocus={() => setTypingActive(true)}
          onBlur={() => {}}
          onInput={handleHiddenInput}
          onKeyDown={handleKeyDown}
        />
      </main>
    </>
  );
}

export default App;
