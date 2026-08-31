import React from 'react';
import './PublisherContent.css';

export default function PublisherContent() {
  const guideTopics = [
    {
      badge: 'STANDARDIZED METRIC',
      num: '01',
      title: 'What is WPM and How is it Measured?',
      content: (
        <>
          <p>
            <strong>WPM (Words Per Minute)</strong> is the universal benchmark for keystroke velocity. In standardized typing tests, a standard "word" is calculated as exactly <strong>5 keystrokes</strong>, including spaces, capitalizations, and punctuation.
          </p>
          <p>
            There is an essential distinction between <strong>Gross WPM</strong> (your raw typing speed regardless of mistakes) and <strong>Net WPM</strong> (your actual productive speed after deducting error penalties). While high Gross WPM looks impressive, Net WPM reflects true real-world output.
          </p>
        </>
      ),
    },
    {
      badge: 'QUALITY OVER SPEED',
      num: '02',
      title: 'Why Accuracy Always Trumps Raw Velocity',
      content: (
        <>
          <p>
            Typing at 90 WPM with 88% accuracy is significantly slower than typing at a steady 65 WPM with 99% accuracy. Every mistake forces a cognitive reset: you must pause, press the Backspace key multiple times, re-type the letters, and regain your rhythm.
          </p>
          <p>
            Aiming for a strict <strong>97–99% accuracy baseline</strong> allows muscle memory to form seamless movement sequences without micro-hesitations. Speed naturally follows precision.
          </p>
        </>
      ),
    },
    {
      badge: 'BIOMECHANICS',
      num: '03',
      title: 'Foundations of Touch Typing Technique',
      content: (
        <>
          <p>
            Touch typing is motor memory executed without visual reliance on the physical keyboard. Anchor your index fingers on the tactile ridges of the <strong>F</strong> and <strong>J</strong> keys (the Home Row).
          </p>
          <ul className="tp-guide-list">
            <li><strong>Curved Fingers:</strong> Keep your fingertips resting lightly on the keys, like playing a piano.</li>
            <li><strong>Floating Wrists:</strong> Never rest your palms heavily on the desk while typing; keep them elevated.</li>
            <li><strong>Eyes on Screen:</strong> Resist looking down at your hands even when hitting complex symbols.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'TRAINING DRILL',
      num: '04',
      title: 'The 15-Minute High-Retention Daily Protocol',
      content: (
        <>
          <p>
            Consistent short sessions build stronger neural pathways than sporadic long sessions. Structure your daily training with this 15-minute protocol:
          </p>
          <ol className="tp-guide-steps">
            <li><strong>Warm-up (3 min):</strong> Slow 15s sessions focusing strictly on 100% accuracy.</li>
            <li><strong>Core Flow (4 min):</strong> 60s word list tests building sustained cadence.</li>
            <li><strong>Complexity (4 min):</strong> Practice code syntax, business jargon, or bigrams/trigrams.</li>
            <li><strong>Speed Sprint (2 min):</strong> High-pace bursts pushing beyond your comfort zone.</li>
            <li><strong>Telemetry Review (2 min):</strong> Inspect error logs and focus on troublesome finger pairs.</li>
          </ol>
        </>
      ),
    },
    {
      badge: 'SESSION MODES',
      num: '05',
      title: 'Selecting the Right Benchmark Duration',
      content: (
        <>
          <p>
            Different test durations train distinct neurological capabilities:
          </p>
          <ul className="tp-guide-list">
            <li><strong>15 Seconds:</strong> Trains fast-twitch finger acceleration and explosive typing bursts.</li>
            <li><strong>30 & 60 Seconds:</strong> Measures realistic daily typing flow and balanced consistency.</li>
            <li><strong>5 Minutes:</strong> Tests deep cognitive stamina, mental endurance, and preparation for official government/clerical exams.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'VOCABULARY DRILLS',
      num: '06',
      title: 'Expanding Beyond Basic Word Lists',
      content: (
        <>
          <p>
            Typing only common top-200 word pools creates false confidence. Real-world writing involves unpredictable character transitions.
          </p>
          <p>
            Rotate through <strong>Bigrams & Trigrams</strong> to master frequent letter clusters, practice <strong>Code Syntax</strong> for brackets and camelCase identifiers, and use <strong>Hinglish/Conversational</strong> modes to mirror authentic communication.
          </p>
        </>
      ),
    },
    {
      badge: 'MULTILINGUAL',
      num: '07',
      title: 'Multilingual Touch Typing Mastery',
      content: (
        <>
          <p>
            TypePerfectly provides complete native layout support for international scripts:
          </p>
          <ul className="tp-guide-list">
            <li><strong>Hindi (Devanagari):</strong> Practice InScript layouts for government data entry and transcription exams.</li>
            <li><strong>Arabic (RTL):</strong> Full right-to-left layout synchronization and cursive character tracking.</li>
            <li><strong>European Languages:</strong> Specialized dictionaries featuring accented vowels and unique grammatical characters for Spanish, French, German, and Portuguese.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'ANALYTICS',
      num: '08',
      title: 'Decoding Your Telemetry Results',
      content: (
        <>
          <p>
            Evaluate your progress through holistic telemetry rather than a single isolated WPM number:
          </p>
          <ul className="tp-guide-list">
            <li><strong>Velocity Curve:</strong> Look for flat, stable trajectories over time without sharp downward spikes.</li>
            <li><strong>Consistency Score:</strong> Measures how uniform your keystroke timing is. A score above 75% indicates smooth finger transitions.</li>
            <li><strong>Error Clustering:</strong> Notice if mistakes occur after long words or on specific pinky/ring finger keys.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'REAL-WORLD IMPACT',
      num: '09',
      title: 'Transforming Speed into Professional Productivity',
      content: (
        <>
          <p>
            Increasing your typing speed from 35 WPM to 70 WPM cuts your active writing time in half. For developers, writers, students, and executives, typing becomes transparent: your keyboard no longer bottlenecks your thoughts.
          </p>
          <p>
            Fluid typing conserves valuable mental bandwidth, allowing you to focus entirely on code architecture, compelling prose, and high-impact communication.
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="tp-learning-center" aria-labelledby="tp-learning-title">
      {/* Header Area */}
      <div className="tp-learning-header">
        <span className="tp-learning-pill">TYPING LEARNING CENTER</span>
        <h2 id="tp-learning-title" className="tp-learning-heading">
          Master Touch Typing, <span>Speed & Technique</span>
        </h2>
        <p className="tp-learning-subheading">
          Actionable frameworks, biomechanical fundamentals, and telemetry insights to build effortless typing cadence.
        </p>
      </div>

      {/* 3-Column Topic Cards Grid */}
      <div className="tp-learning-grid">
        {guideTopics.map((item, index) => (
          <article key={index} className="tp-guide-card">
            <div className="tp-guide-meta">
              <span className="tp-guide-badge">{item.badge}</span>
              <span className="tp-guide-num">{item.num}</span>
            </div>
            <h3 className="tp-guide-title">{item.title}</h3>
            <div className="tp-guide-body">{item.content}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
