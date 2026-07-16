import AdvancedTypingEnhancer from "./AdvancedTypingEnhancer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const MODES = ["words", "bigrams", "trigrams", "code", "business", "quotes", "hinglish", "conversation"];

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
  conversation: [
  `Aman: Did you study today?
Ravi: Yes, I opened the book.
Aman: Then what happened?
Ravi: I fell asleep.
Aman: What about your goal?
Ravi: The goal is still there. My timing is just a little late.`,

  `Boss: Is the report complete?
Employee: Almost, sir.
Boss: What does almost mean?
Employee: The file is open, my confidence is high, and the data is still loading.
Boss: Confidence does not complete a report.
Employee: Understood, sir. I will message you only after finishing it.`,

  `Friend: When will you start going to the gym?
Me: From Monday.
Friend: Which Monday?
Me: The one that comes after motivation.
Friend: Do not wait for motivation. Start with ten minutes today.
Me: You are right. A small start is still a start.`,

  `Teacher: Why did you fail the exam?
Student: I started preparing too late.
Teacher: What will you do now?
Student: I will turn my mistake into a lesson, not an excuse.
Teacher: That attitude will take you forward.`,

  `Father: Earning money is important, but saving money is important too.
Son: How much should I save?
Father: Save a small part of your income regularly.
Son: What difference will a small amount make?
Father: Small savings become strong security over time.`,

  `Mother: Put your phone aside for a while.
Son: Just five minutes.
Mother: Why do those five minutes never end?
Son: Because time moves faster on the phone.
Mother: And opportunities in real life do not wait.`,

  `Friend: Why are you always so quiet?
Me: I feel people will judge my English.
Friend: You will improve only by making mistakes.
Me: But it feels embarrassing.
Friend: Temporary embarrassment is better than permanent fear.`,

  `Interviewer: Tell me about yourself.
Candidate: I am hardworking.
Interviewer: Can you give me an example?
Candidate: I divided a difficult project into small daily tasks and completed it before the deadline.
Interviewer: Good. Examples are more powerful than claims.`,

  `Customer: Your price is a little high.
Freelancer: I understand.
Customer: Can you offer a discount?
Freelancer: Instead of reducing the price, I can adjust the project scope.
Customer: That is a professional answer.
Freelancer: Clear value and clear scope protect both sides.`,

  `Manager: Why did you not speak in the meeting?
Employee: I had an idea, but I lacked confidence.
Manager: Do not wait for the perfect sentence.
Employee: How should I begin?
Manager: Just say, I have one suggestion.`,

  `Brother: Everyone is moving ahead of me.
Sister: You are seeing their results, not their struggles.
Brother: Then what should I do?
Sister: Focus on your own pace and keep your direction right.
Brother: Less comparison, more consistency.`,

  `Doctor: Do you exercise?
Patient: I do not have time.
Doctor: How long do you use your phone?
Patient: Around three hours.
Doctor: Time is not missing. Priority is missing.
Patient: I will start with a thirty-minute walk today.`,

  `Friend: Why do you want everything to be perfect?
Me: I do not like failure.
Friend: You do not even start because of perfection.
Me: Then what should I do?
Friend: Make the first version imperfect, then improve it.`,

  `Teacher: What is the difference between knowledge and wisdom?
Student: Knowledge means information.
Teacher: And wisdom?
Student: Using the right information at the right time.
Teacher: Excellent. Knowing is not enough. Applying matters too.`,

  `Father: Do not reply immediately when you are angry.
Son: What if the other person is wrong?
Father: Being right and speaking in the right way are different things.
Son: So I should calm down first?
Father: Yes. A calm mind makes better decisions.`,

  `Client: I need this project urgently.
Freelancer: What is the deadline?
Client: Tomorrow morning.
Freelancer: To maintain quality, I need the exact files and requirements now.
Client: Okay.
Freelancer: Even urgent work needs clarity.`,

  `Friend: What is your biggest goal?
Me: I want to become successful.
Friend: What does success mean to you?
Me: Financial freedom, supporting my family, and meaningful work.
Friend: When the definition is clear, the direction becomes clear too.`,

  `Mother: You look worried.
Son: I have too much work.
Mother: Do not try to do everything at once.
Son: Then what should I do?
Mother: Choose the most important task and complete it first.`,

  `Colleague: Are you upset because of the feedback?
Employee: A little.
Colleague: Do not treat feedback as an insult.
Employee: But the tone was harsh.
Colleague: Ignore the tone and take the useful point.
Employee: That is difficult, but helpful.`,

  `Friend: Nobody helped you?
Me: No.
Friend: Then why do you help others?
Me: Because their behavior does not decide my character.
Friend: That is real strength.`,

  `Student: I understand English, but I cannot speak it.
Teacher: How much do you speak every day?
Student: Almost zero.
Teacher: Speaking cannot improve without speaking practice.
Student: I will speak for five minutes every day.`,

  `Boss: Why are you late?
Employee: There was traffic.
Boss: There is traffic every day.
Employee: You are right, sir. I should leave earlier.
Boss: Taking responsibility is the first step toward improvement.`,

  `Friend: How do you deal with negative people?
Me: I do not answer every comment.
Friend: Why?
Me: Winning every argument is not necessary.
Friend: Protecting your peace is also intelligence.`,

  `Father: Do not choose a career by looking only at salary.
Son: What else should I consider?
Father: Skill growth, demand, interest, and future opportunities.
Son: So I should think about long-term growth too.
Father: Exactly.`,

  `Customer: I do not understand what service you provide.
Freelancer: I convert messy Excel data into clean reports and dashboards.
Customer: How will that help me?
Freelancer: It will save your time and help you make faster decisions.
Customer: Now the value is clear.`,

  `Friend: How do you work a little every day?
Me: I do not wait for the right mood.
Friend: Does it not feel boring?
Me: It does, but I still follow the routine.
Friend: That is probably what discipline means.`,

  `Teacher: Is smart work better or hard work?
Student: Smart work.
Teacher: Can smart work succeed without hard work?
Student: Probably not.
Teacher: Right. The best results come from both.`,

  `Brother: I cannot afford an expensive course.
Sister: Use free resources.
Brother: Can I learn properly for free?
Sister: Yes, but you must bring your own discipline.
Brother: So consistency matters more than the resource.`,

  `Friend: Are you afraid of failure?
Me: Yes.
Friend: Not starting also leads to failure.
Me: How?
Friend: The opportunity ends before you even try.
Me: Then taking a calculated risk is better.`,

  `Manager: Your presentation is very simple.
Employee: Is that a problem?
Manager: No. A simple presentation is easier to understand.
Employee: I removed unnecessary text.
Manager: Good communication means being clear, not speaking more.`,

  `Child: How can I become a good person?
Father: Tell the truth, give respect, and admit your mistakes.
Child: Is that all?
Father: It sounds simple, but doing it every day is difficult.
Child: I will start practicing today.`,

  `Friend: How did your confidence improve?
Me: I stopped avoiding difficult situations.
Friend: Did your fear disappear?
Me: No, but I learned to act despite the fear.
Friend: That is real confidence.`,

  `Employee: Sir, I made a mistake.
Boss: Why did you not hide it?
Employee: Hiding it could have made the problem worse.
Boss: Good. The mistake is serious, but honesty matters.
Employee: I have also prepared a plan to fix it.`,

  `Friend: What is the most important life skill?
Me: Probably communication.
Friend: Why?
Me: Knowledge becomes useful only when you can explain it clearly.
Friend: What about listening?
Me: Listening is half of communication.`,

  `Mother: Having fewer resources does not mean you are less capable.
Son: But starting is difficult.
Mother: A difficult beginning does not decide your future.
Son: Should I begin with whatever I have?
Mother: Yes. Start small, but start today.`
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

let keySoundPool = [];
let keySoundIndex = 0;

function playTone(correct, enabled) {
  if (!enabled) return;

  try {
    if (keySoundPool.length === 0) {
      keySoundPool = Array.from({ length: 6 }, () => {
        const audio = new Audio("/public_sound.mp3");
        audio.preload = "auto";
        audio.volume = 0.35;
        return audio;
      });
    }

    const sound = keySoundPool[keySoundIndex];
    keySoundIndex = (keySoundIndex + 1) % keySoundPool.length;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch {
    // Typing continues even if sound cannot play
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
  const [bestWpm, setBestWpm] = useState(() => Number(localStorage.getItem("Type Perfectly-best") || 0));
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("Type Perfectly-history") || "[]"); }
    catch { return []; }
  });

  const appRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileBufferRef = useRef("");
  const savedRef = useRef(false);
  const musicRef = useRef(null);
  const correctChars = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < input.length; i += 1) if (input[i] === text[i]) correct += 1;
    return correct;
  }, [input, text]);

  const accuracy = accuracyOf(correctChars, input.length);
  const elapsed = Math.max(1, duration - timeLeft);
  const wpm = input.length ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
  const score = correctChars * 10 + wpm * 2;
 const sessionActive = mobileFocused || running;

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

  if (musicRef.current) {
    musicRef.current.pause();
    musicRef.current.currentTime = 0;
  }

  requestAnimationFrame(() =>
    appRef.current?.focus({ preventScroll: true })
  );
}, [duration, mode]);

 const finishSession = useCallback(() => {
  setRunning(false);
  setFinished(true);
  setMobileFocused(false);
  mobileInputRef.current?.blur();

  if (musicRef.current) {
    musicRef.current.pause();
    musicRef.current.currentTime = 0;
  }
}, []);
const toggleSound = useCallback(() => {
  setSoundOn((current) => {
    const next = !current;

    if (musicRef.current) {
      if (!next) {
        musicRef.current.pause();
      } else if (running && !finished) {
        musicRef.current.volume = 0.80;
        musicRef.current.play().catch(() => {});
      }
    }

    return next;
  });
}, [finished, running]);
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
    localStorage.setItem("Type Perfectly-best", String(nextBest));
    const entry = { mode, wpm, accuracy, duration, score, date: new Date().toLocaleString() };
    setHistory((previous) => {
      const next = [entry, ...previous].slice(0, 6);
      localStorage.setItem("Type Perfectly-history", JSON.stringify(next));
      return next;
    });
  }, [accuracy, bestWpm, duration, finished, mode, score, wpm]);

const processCharacter = useCallback((character) => {
  if (!character || character.length !== 1 || finished) return;

if (!running && soundOn && musicRef.current) {
    musicRef.current.volume = 0.90;
    musicRef.current.play().catch(() => {});
  }

  setInput((previous) => {
    if (previous.length >= text.length) return previous;

    if (!running) setRunning(true);

    playTone(character === text[previous.length], soundOn);

    const next = previous + character;

    if (next.length >= text.length) {
      window.setTimeout(finishSession, 0);
    }

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
          <div><div className="brand-title">Type Perfectly</div><div className="brand-subtitle">Typing Performance Lab</div></div>
        </div>
        <div className="top-actions">
          <span className="key-hint"><kbd>Tab</kbd> Restart</span>
          <span className="key-hint"><kbd>Esc</kbd> Pause</span>
          <button type="button" className={`ghost-button ${noBackspace ? "active" : ""}`} onClick={() => setNoBackspace((value) => !value)}>{noBackspace ? "NO BACKSPACE" : "STANDARD"}</button>
         <button type="button" className={`ghost-button ${soundOn ? "active" : ""}`} onClick={toggleSound}>{soundOn ? "SOUND ON" : "SOUND OFF"}</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy-wrap">
          <div className="eyebrow">MICRO-BLITZ · {durationLabel} · {mode.toUpperCase()}</div>
         <h1>Type at the speed<br />of <span>thought.</span></h1>

<h2 className="hero-seo-title">
  Free Online Typing Test and Typing Practice
</h2>

<p>
  Test your typing speed, improve accuracy, and practice English,
  Hinglish, code, business words, quotes, bigrams, and trigrams with
  live WPM tracking.
</p>
        </div>
        <div className="hero-picture"><img src="/typing-hero.png" alt="Purple Type Perfectly keyboard" /></div>
      </section>

      <section className="controls">
        <div className="control-section content-control"><div className="control-label">Content</div><div className="button-strip">{MODES.map((item) => <button key={item} type="button" className={mode === item ? "selected" : ""} onClick={() => resetSession(item, duration)}>{item.toUpperCase()}</button>)}</div></div>
        <div className="control-section"><div className="control-label">Time</div><div className="button-strip time-buttons">{[15, 30, 60, 300].map((value) => <button key={value} type="button" className={duration === value ? "selected" : ""} onClick={() => resetSession(mode, value)}>{value === 300 ? "5 MIN" : `${value}S`}</button>)}</div></div>
      </section>

      <section className="practice-layout">
        <article className="typing-card">
          <input ref={mobileInputRef} className="mobile-capture" type="text" inputMode="text" autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} onFocus={() => setMobileFocused(true)} onBlur={() => setMobileFocused(false)} onInput={handleMobileInput} onKeyDown={(event) => { event.stopPropagation(); if (event.key === "Backspace" && noBackspace) event.preventDefault(); }} />

          <div className="typing-card-header">
  <div>
    <span>{durationLabel}</span>
    <span>{mode.toUpperCase()}</span>
  </div>

  {!finished && (
    <button
      type="button"
      className="primary-button"
      onClick={focusTyping}
    >
      TAP TO TYPE
    </button>
  )}
</div>
          <div className="typing-text" role="textbox" onPointerDown={focusTyping}>{text.split("").map((character, index) => {
            let className = "char upcoming";
            if (index < input.length) className = input[index] === character ? "char correct" : "char wrong";
            if (index === input.length && !finished) className = "char current";
            return <span key={`${index}-${character}`} className={className}>{character}</span>;
          })}</div>
          <div className="legend-row"><span><i className="dot correct-dot" />Correct</span><span><i className="dot wrong-dot" />Wrong</span><span><i className="dot upcoming-dot" />Upcoming</span></div>
         {!finished && (
  <div className="typing-actions">
    <button
      type="button"
      className="restart-button"
      onClick={() => resetSession()}
    >
      RESTART SESSION
    </button>
  </div>
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

    <button type="button" onClick={() => resetSession()}>
      TRY AGAIN
    </button>
  </div>
)}
        </aside>
      </section>

      <section className="insights-grid">
        <article className="insight-card"><div className="insight-title">Personal Best</div><div className="big-number">{bestWpm}</div><span>Best WPM</span></article>
        <article className="insight-card history-card"><div className="insight-title">Recent Sessions</div>{history.length ? history.map((item, index) => <div className="history-row" key={`${item.date}-${index}`}><span>{item.mode}</span><strong>{item.wpm} WPM</strong><span>{item.accuracy}%</span></div>) : <p>No completed sessions yet.</p>}</article>
        <article className="insight-card"><div className="insight-title">Needs Practice</div>{weakKeys.length ? weakKeys.map(([key, count]) => <div className="weak-row" key={key}><strong>{key}</strong><div><span style={{ width: `${Math.min(100, count * 24)}%` }} /></div><small>{count}</small></div>) : <p>Type a session to discover weak keys.</p>}</article>
      </section>

      <footer className="footer">
  <div>© 2026 Type Perfectly. All rights reserved.</div>

  <nav>
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

<AdvancedTypingEnhancer />

<audio
  ref={musicRef}
  src="/background-music.mp3"
  loop
  preload="auto"
/>

</main>
);
}
