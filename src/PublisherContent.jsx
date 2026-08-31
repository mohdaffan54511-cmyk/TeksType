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
            <strong>WPM (Words Per Minute)</strong> is the universal standard for keystroke velocity. One standardized word equals exactly <strong>5 keystrokes</strong>, including spaces and punctuation.
          </p>
          <p>
            <strong>Gross WPM</strong> measures total raw keystrokes, while <strong>Net WPM</strong> deducts uncorrected errors to reflect true real-world productivity.
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
            Typing at 90 WPM with 88% accuracy is slower than a steady 65 WPM at 99% accuracy. Every mistake breaks flow, forcing repeated Backspace presses and cognitive reset.
          </p>
          <p>
            Target a strict <strong>97–99% accuracy baseline</strong> so finger movements become second nature without micro-hesitations.
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
            Touch typing relies entirely on tactile motor memory. Always anchor your index fingers on the home row bumps (<strong>F</strong> and <strong>J</strong> keys).
          </p>
          <ul className="tp-guide-list">
            <li><strong>Curved Fingers:</strong> Rest fingertips lightly, like playing piano.</li>
            <li><strong>Elevated Wrists:</strong> Keep wrists floating slightly above the desk.</li>
            <li><strong>Eyes on Screen:</strong> Never look down at the physical keyboard.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'TRAINING PROTOCOL',
      num: '04',
      title: 'The 15-Minute High-Retention Daily Routine',
      content: (
        <>
          <p>
            Short, focused daily practice creates stronger neural pathways than irregular long sessions:
          </p>
          <ol className="tp-guide-steps">
            <li><strong>Warm-up (3 min):</strong> Slow tests aiming for 100% accuracy.</li>
            <li><strong>Core Flow (4 min):</strong> 60s word list tests building rhythm.</li>
            <li><strong>Complexity (4 min):</strong> Code syntax or business terms.</li>
            <li><strong>Sprint (2 min):</strong> High-speed burst training.</li>
            <li><strong>Review (2 min):</strong> Inspect error logs and weak fingers.</li>
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
            <li><strong>15 Seconds:</strong> Explosive burst speed and finger twitch reflexes.</li>
            <li><strong>30 & 60 Seconds:</strong> Realistic sustained pacing and work cadence.</li>
            <li><strong>5 Minutes:</strong> Deep focus, stamina, and exam preparation.</li>
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
            Practicing only simple top-100 words creates false confidence. Real typing requires handling complex character transitions.
          </p>
          <p>
            Rotate through <strong>Bigrams & Trigrams</strong> for letter clusters, <strong>Code Syntax</strong> for symbols and camelCase, and <strong>Hinglish</strong> for natural conversation.
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
            TypePerfectly supports complete native Unicode layouts:
          </p>
          <ul className="tp-guide-list">
            <li><strong>Hindi (Devanagari):</strong> InScript practice for government exams.</li>
            <li><strong>Arabic (RTL):</strong> Full right-to-left layout synchronization.</li>
            <li><strong>European Languages:</strong> Accents for Spanish, French, German, and Portuguese.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'TELEMETRY HUD',
      num: '08',
      title: 'Decoding Your Telemetry Results',
      content: (
        <>
          <p>
            Evaluate your progress using holistic dashboard metrics:
          </p>
          <ul className="tp-guide-list">
            <li><strong>Velocity Curve:</strong> Look for flat, stable trajectories over time.</li>
            <li><strong>Consistency Score:</strong> Measures rhythm uniformity (aim for 75%+).</li>
            <li><strong>Error Markers:</strong> Identify keys causing finger hesitation.</li>
          </ul>
        </>
      ),
    },
    {
      badge: 'WORKPLACE IMPACT',
      num: '09',
      title: 'Transforming Speed into Professional Output',
      content: (
        <>
          <p>
            Increasing speed from 35 to 70 WPM cuts writing time in half. Your keyboard stops being a bottleneck between your mind and the screen.
          </p>
          <p>
            Fluid typing conserves cognitive energy for problem solving, code architecture, and high-impact communication.
          </p>
        </>
      ),
    },
  ];

  return (
    <section className="tp-learning-section" aria-labelledby="tp-learning-title">
      <div className="tp-learning-header">
        <span className="tp-learning-pill">TYPING LEARNING CENTER</span>
        <h2 id="tp-learning-title" className="tp-learning-title">
          Master Touch Typing, <span>Speed & Technique</span>
        </h2>
        <p className="tp-learning-subtitle">
          Actionable frameworks, biomechanical fundamentals, and telemetry insights to build effortless typing cadence.
        </p>
      </div>

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
