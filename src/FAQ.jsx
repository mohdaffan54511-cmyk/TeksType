import { useState } from "react";
import "./FAQ.css";

const FAQS = [
  {
    question:
      "What is TypePerfectly and how does it help improve typing speed?",
    answer:
      "TypePerfectly is a free online typing test and typing practice tool. It measures your typing speed in WPM and accuracy, then lets you repeat focused sessions in English, Hindi, Urdu, Arabic, and other supported languages to build speed, rhythm, and consistency.",
  },
  {
    question:
      "Does TypePerfectly support typing tests in multiple languages?",
    answer:
      "Yes. TypePerfectly offers multi-language typing tests in English, Hindi, Urdu, Arabic, Spanish, French, German, Russian, Portuguese, Bangla, and more. Right-to-left (RTL) languages such as Arabic and Urdu use RTL text direction with seamless cursor support.",
  },
  {
    question:
      "How is Words Per Minute (WPM) and accuracy calculated across different languages?",
    answer:
      "TypePerfectly calculates WPM by dividing the number of correct typed characters by five and then by the elapsed minutes. Accuracy is the number of correct matching characters divided by all typed characters, multiplied by 100. The same formula is used across supported writing systems so English, Hindi, and RTL typing test results stay consistent.",
  },
  {
    question:
      "Is TypePerfectly completely free to use for all languages?",
    answer:
      "Yes. TypePerfectly's typing tests and typing practice modes are free for every supported language. You can start without an account; creating a free account is optional and only helps you save your progress.",
  },
  {
    question: "How does the Right-to-Left (RTL) typing feature work?",
    answer:
      "When you select Arabic or Urdu, TypePerfectly displays the practice text from right to left and positions the active cursor for natural RTL typing. WPM, accuracy, error highlighting, and live feedback continue to update normally as you type.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section className="faq" aria-labelledby="faq-title">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <div className="faq-heading">
        <p className="faq-eyebrow">TYPEPERFECTLY HELP CENTER</p>
        <h2 id="faq-title">
          Frequently Asked <span>Questions</span>
        </h2>
        <p className="faq-intro">
          Quick answers about multi-language typing tests, WPM, accuracy, and
          right-to-left typing practice.
        </p>
      </div>

      <div className="faq-list">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          const answerId = `faq-answer-${index}`;

          return (
            <article className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
              <h3>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>

              <div
                id={answerId}
                className="faq-answer-grid"
                role="region"
                aria-hidden={!isOpen}
              >
                <div className="faq-answer-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
