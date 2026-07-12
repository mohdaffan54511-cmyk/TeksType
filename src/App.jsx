import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const MODES = ["words", "bigrams", "trigrams", "code", "business", "quotes", "hinglish", "motivation", "conversation"];

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
  `Subah alarm baja, lekin maine snooze kar diya.
Paanch minute baad alarm phir baja.
Maine socha, thodi aur neend le leta hoon.
Aankh khuli to office ka time ho chuka tha.
Us din meri speed typing me nahi, taiyaar hone me improve hui.`,

  `Main chai peene dukaan par gaya.
Chai wale bhaiya ne poocha, strong ya normal?
Maine bola, strong bana do.
Unhone poocha, kitni strong?
Maine kaha, itni ki Monday bhi Sunday lagne lage.`,

  `Kal main padhai karne baitha.
Table saaf ki, notebook nikali, aur pen rakha.
Phir maine phone sirf ek minute ke liye check kiya.
Ek ghante baad bhi main reels dekh raha tha.
Padhai ne mujhe dekha aur chup-chaap kal par chali gayi.`,

  `Mummy ne bola, market se dhaniya le aana.
Main chips, biscuit, aur cold drink le aaya.
Mummy ne poocha, dhaniya kahan hai?
Maine bag ko dobara check kiya.
Dhaniya meri memory ki tarah missing tha.`,

  `Mera dost gym join karke bahut excited tha.
Usne shoes, bottle, aur protein shaker kharida.
Pehle din usne sirf mirror selfie li.
Doosre din body pain ka excuse bana diya.
Teesre din bola, Monday se properly start karunga.`,

  `Ek chhota step bhi progress hota hai.
Har din perfect hona zaroori nahi hai.
Bas rukna nahi chahiye.
Galti se seekho aur dobara try karo.
Daily practice tumhe kal se better banati hai.`,

  `Main interview dene gaya tha.
Interviewer ne poocha, pressure handle kar sakte ho?
Maine confidence se kaha, bilkul.
Tabhi mera phone loud ringtone ke saath baj gaya.
Maine bola, sir practical test thoda jaldi start ho gaya.`,

  `Kabhi kabhi motivation nahi aati.
Iska matlab ye nahi ki kaam rok do.
Pehle chhota sa action lo.
Action se confidence banta hai.
Aur confidence se bade goals complete hote hain.`,

  `Main fridge khol kar kuch tasty dhoondh raha tha.
Fridge me wahi purani cheezein thi.
Do minute baad maine fridge phir khola.
Jaise andar kisi ne naya food upload kar diya ho.
Fridge bhi meri umeed dekh kar confuse ho gaya.`,

  `Ek achha insaan banna bhi success hai.
Kisi ki help karna weakness nahi hoti.
Kindness aur bravery saath chal sakti hain.
Strong wahi hai jo dusron ka respect karta hai.
Achha character hamesha yaad rakha jaata hai.`
],
  motivation: [
    "Aaj ka kaam chhota ho sakta hai, lekin progress chhoti nahi hoti. Roz ek step lo.",
    "Start karne se motivation aati hai. Bas pehla step lo aur daily improve karo.",
    "Failure tumhari story ka end nahi hota. Woh next chapter ko better likhne ka feedback hota hai."
  ],
  conversation: [
    "Aman: Bhai, aaj padhai ki? Ravi: Haan, kitab kholi thi. Aman: Phir? Ravi: Neend aa gayi.",
    "Boss: Report complete hai? Employee: Almost. Boss: Almost ka matlab? Employee: File open hai aur confidence high hai.",
    "Dost: Gym kab se start karega? Main: Monday se. Dost: Kaunsa Monday? Main: Jo motivation ke baad aata hai."
  ]
};

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

function makeText(mode) {
  if (["quotes", "hinglish", "motivation", "conversation"].includes(mode)) return randomItem(POOLS[mode]);
  const count = mode === "bigrams" ? 50 : mode === "trigrams" ? 42 : 36;
  return Array.from({ length: count }, () => randomItem(POOLS[mode] || POOLS.words)).join(" ");
}

function accuracyOf(correct, total) {
  return total ? Math.round((correct / total) * 100) : 100;
}

function mobileLike() {
  return window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth <= 768;
}

let audioContext;
function playTone(correct, enabled) {
  if (!enabled) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    oscillator.frequency.value = correct ? 520 : 150;
    gain.gain.setValueAtTime(correct ? 0.025 : 0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.055);
  } catch {
    // Typing continues even when audio is unavailable.
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
    try { return JSON.parse(localStorage.getItem("typeteks-history") || "[]"); }
    catch { return []; }
  });

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileBufferRef = useRef("");
  const savedRef = useRef(false);

  const correctChars = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < input.length; i += 1) if (input[i] === text[i]) correct += 1;
    return correct;
  }, [input, text]);

  const accuracy = accuracyOf(correctChars, input.length);
  const elapsed = Math.max(1, duration - timeLeft);
  const wpm = input.length ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
  const score = correctChars * 10 + wpm * 2;
  const sessionActive = mobileFocused || running || input.length > 0;

  const weakKeys = useMemo(() => {
    const errors = {};
    for (let i = 0; i < input.length; i += 1) {
      if (input[i] !== text[i]) {
        const key = text[i] === " " ? "space" : text[i]?.toLowerCase();
        if (key) errors[key] = (errors[key] || 0) + 1;
      }
    }
    return Object.entries(errors).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [input, text]);

  const resetSession = useCallback((nextMode = mode, nextDuration = duration) => {
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
  }, [duration, mode]);

  const finishSession = useCallback(() => {
    setRunning(false);
    setFinished(true);
    setMobileFocused(false);
    mobileInputRef.current?.blur();
  }, []);

  useEffect(() => { appRef.current?.focus({ preventScroll: true }); }, []);

  useEffect(() => {
    if (!running || finished) return undefined;
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [finished, running]);

  useEffect(() => {
    if (running && timeLeft === 0) finishSession();
  }, [finishSession, running, timeLeft]);

  useEffect(() => {
    if (!finished || savedRef.current) return;
    savedRef.current = true;
    const nextBest = Math.max(bestWpm, wpm);
    setBestWpm(nextBest);
    localStorage.setItem("typeteks-best", String(nextBest));
    const entry = { mode, wpm, accuracy, duration, score, date: new Date().toLocaleString() };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 6);
      localStorage.setItem("typeteks-history", JSON.stringify(next));
      return next;
    });
  }, [accuracy, bestWpm, duration, finished, mode, score, wpm]);

  const processCharacter = useCallback((character) => {
    if (!character || character.length !== 1 || finished) return;
    setInput((previous) => {
      if (previous.length >= text.length) return previous;
      if (!running) setRunning(true);
      playTone(character === text[previous.length], soundOn);
      const next = previous + character;
      if (next.length >= text.length) window.setTimeout(finishSession, 0);
      return next;
    });
  }, [finishSession, finished, running, soundOn, text]);

  const removeCharacter = useCallback(() => {
    if (!finished && !noBackspace) setInput((previous) => previous.slice(0, -1));
  }, [finished, noBackspace]);

  const focusTyping = useCallback(() => {
    if (mobileLike()) {
      setMobileFocused(true);
      const target = mobileInputRef.current;
      if (!target) return;
      try { target.focus({ preventScroll: true }); }
      catch { target.focus(); }
    } else {
      appRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const handleDesktopKeyDown = useCallback((event) => {
    if (event.target instanceof HTMLButtonElement || event.target === mobileInputRef.current) return;
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === "Tab") { event.preventDefault(); resetSession(); return; }
    if (event.key === "Escape") { event.preventDefault(); setRunning(false); setMobileFocused(false); mobileInputRef.current?.blur(); return; }
    if (event.key === "Backspace") { event.preventDefault(); removeCharacter(); return; }
    if (event.key.length === 1) { event.preventDefault(); processCharacter(event.key); }
  }, [processCharacter, removeCharacter, resetSession]);

  const handleMobileInput = useCallback((event) => {
    const value = event.currentTarget.value;
    const previous = mobileBufferRef.current;
    if (value.length > previous.length) {
      for (const character of value.slice(previous.length)) processCharacter(character);
    } else if (value.length < previous.length) {
      if (noBackspace) event.currentTarget.value = previous;
      else for (let i = 0; i < previous.length - value.length; i += 1) removeCharacter();
    }
    mobileBufferRef.current = event.currentTarget.value;
    if (mobileBufferRef.current.length > 40) {
      event.currentTarget.value = "";
      mobileBufferRef.current = "";
    }
  }, [noBackspace, processCharacter, removeCharacter]);

  const durationLabel = duration === 300 ? "5 MIN" : `${duration}S`;

  return (
    <main ref={appRef} tabIndex={0} className={`app ${sessionActive ? "session-active" : ""}`} onKeyDown={handleDesktopKeyDown}>
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark"><span>T</span><img src="/TeksType.png" alt="" onError={(event) => event.currentTarget.remove()} /></div>
          <div><div className="brand-title">TypeTeks</div><div className="brand-subtitle">Typing Performance Lab</div></div>
        </div>
        <div className="top-actions">
          <span className="key-hint"><kbd>Tab</kbd> Restart</span>
          <span className="key-hint"><kbd>Esc</kbd> Pause</span>
          <button type="button" className={`ghost-button ${noBackspace ? "active" : ""}`} onClick={() => setNoBackspace((value) => !value)}>{noBackspace ? "NO BACKSPACE" : "STANDARD"}</button>
          <button type="button" className={`ghost-button ${soundOn ? "active" : ""}`} onClick={() => setSoundOn((value) => !value)}>{soundOn ? "SOUND ON" : "SOUND OFF"}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="eyebrow">MICRO-BLITZ · {durationLabel} · {mode.toUpperCase()}</div>
          <h1>Type at the speed<br />of <span>thought.</span></h1>
          <p>Build rhythm, accuracy, and confidence with focused typing sessions.</p>
        </div>
        <div className="hero-picture"><img src="/typing-hero.png" alt="Purple TypeTeks keyboard" /></div>
      </section>

      <section className="controls">
        <div className="control-section content-control"><div className="control-label">Content</div><div className="button-strip">{MODES.map((item) => <button key={item} type="button" className={mode === item ? "selected" : ""} onClick={() => resetSession(item, duration)}>{item.toUpperCase()}</button>)}</div></div>
        <div className="control-section"><div className="control-label">Time</div><div className="button-strip time-buttons">{[15, 30, 60, 300].map((value) => <button key={value} type="button" className={duration === value ? "selected" : ""} onClick={() => resetSession(mode, value)}>{value === 300 ? "5 MIN" : `${value}S`}</button>)}</div></div>
        <div className="control-section"><div className="control-label">Audio</div><div className="button-strip"><button type="button" onClick={() => playTone(true, true)}>TEST SOUND</button></div></div>
      </section>

      <section className="practice-layout">
        <article className="typing-card">
          <input ref={mobileInputRef} className="mobile-capture" type="text" inputMode="text" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} onFocus={() => setMobileFocused(true)} onBlur={() => setMobileFocused(false)} onInput={handleMobileInput} onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Backspace" && noBackspace) event.preventDefault(); }} />
          <div className="typing-card-header"><div><span>{durationLabel}</span><span>{mode.toUpperCase()}</span></div><button type="button" className="primary-button" onClick={focusTyping}>TAP TO TYPE</button></div>
          <div className="typing-text" role="textbox" onPointerDown={focusTyping}>{text.split("").map((character, index) => {
            let className = "char upcoming";
            if (index < input.length) className = input[index] === character ? "char correct" : "char wrong";
            if (index === input.length && !finished) className = "char current";
            return <span key={`${index}-${character}`} className={className}>{character}</span>;
          })}</div>
          <div className="legend-row"><span><i className="dot correct-dot" />Correct</span><span><i className="dot wrong-dot" />Wrong</span><span><i className="dot upcoming-dot" />Upcoming</span></div>
          <div className="typing-actions"><button type="button" className="restart-button" onClick={() => resetSession()}>RESTART SESSION</button></div>
        </article>

        <aside className="stats-card">
          <div className="stats-title">Live Stats</div>
          <div className="stats-grid"><div><span>Time</span><strong>{timeLeft}s</strong></div><div><span>WPM</span><strong>{wpm}</strong></div><div><span>Accuracy</span><strong>{accuracy}%</strong></div></div>
          {finished && <div className="finished-box"><strong>Session complete!</strong><span>Score: {score}</span><button type="button" onClick={() => resetSession()}>NEW SESSION</button></div>}
        </aside>
      </section>

      <section className="insights-grid">
        <article className="insight-card"><div className="insight-title">Personal Best</div><div className="big-number">{bestWpm}</div><span>Best WPM</span></article>
        <article className="insight-card history-card"><div className="insight-title">Recent Sessions</div>{history.length ? history.map((item, index) => <div className="history-row" key={`${item.date}-${index}`}><span>{item.mode}</span><strong>{item.wpm} WPM</strong><span>{item.accuracy}%</span></div>) : <p>No completed sessions yet.</p>}</article>
        <article className="insight-card"><div className="insight-title">Needs Practice</div>{weakKeys.length ? weakKeys.map(([key, count]) => <div className="weak-row" key={key}><strong>{key}</strong><div><span style={{ width: `${Math.min(100, count * 24)}%` }} /></div><small>{count}</small></div>) : <p>Type a session to discover weak keys.</p>}</article>
      </section>

      <footer className="footer"><div>© 2026 TypeTeks. All rights reserved.</div><nav><a href="mailto:contact@typeteks.online">Contact</a><a href="#support">Support</a><a href="#privacy">Privacy</a></nav></footer>
    </main>
  );
}
