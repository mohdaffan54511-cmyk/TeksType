import React, { useState, useEffect } from "react";
import { BLOG_ARTICLES } from "./lib/blogArticles";

export default function BlogSection({ onStartTyping }) {
  const [activeSlug, setActiveSlug] = useState(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/blog\/([^/]+)\/?$/);
    return match ? match[1] : null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/blog\/([^/]+)\/?$/);
      setActiveSlug(match ? match[1] : null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openArticle = (slug) => {
    window.history.pushState({}, "", `/blog/${slug}/`);
    setActiveSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeArticle = () => {
    window.history.pushState({}, "", "/");
    setActiveSlug(null);
  };

  const activeArticle = BLOG_ARTICLES.find((a) => a.slug === activeSlug);

  // Dynamically update document title and meta description when viewing an article
  useEffect(() => {
    if (activeArticle) {
      document.title = `${activeArticle.title} | TypePerfectly`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", activeArticle.metaDescription);
    } else {
      document.title = "TypePerfectly | Free Online Typing Test (English, Hinglish & Business)";
    }
  }, [activeArticle]);

  if (activeArticle) {
    return (
      <article className="blog-article-container" aria-labelledby="article-title">
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={closeArticle}>Home</button>
          <span>/</span>
          <button type="button" onClick={closeArticle}>Blog</button>
          <span>/</span>
          <span aria-current="page">{activeArticle.title}</span>
        </nav>

        <span className="blog-card-tag">{activeArticle.category}</span>
        <h1 id="article-title">{activeArticle.title}</h1>
        <div className="blog-meta">
          <span>By TypePerfectly Editorial</span> · <span>{activeArticle.readTime}</span>
        </div>

        {activeArticle.toc && activeArticle.toc.length > 0 && (
          <nav className="blog-toc" aria-label="Table of Contents">
            <strong>Table of Contents</strong>
            <ul>
              {activeArticle.toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="blog-body">
          <p>{activeArticle.summary}</p>
          {activeArticle.sections.map((sec) => (
            <section key={sec.id} id={sec.id}>
              <h2>{sec.heading}</h2>
              {sec.body.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </section>
          ))}

          {activeArticle.faqs && activeArticle.faqs.length > 0 && (
            <section>
              <h2>Frequently Asked Questions</h2>
              {activeArticle.faqs.map((faq, idx) => (
                <div key={idx} style={{ marginBottom: "16px" }}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="blog-cta-box">
          <h2 style={{ marginTop: 0 }}>Ready to Test Your Typing Speed?</h2>
          <p style={{ marginBottom: "16px", color: "var(--muted)" }}>
            Practice immediately in English, Hinglish, or Business mode—no account or login required.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              closeArticle();
              if (onStartTyping) onStartTyping();
            }}
          >
            Start Free Typing Test
          </button>
        </div>
      </article>
    );
  }

  return (
    <section className="blog-section" id="blog" aria-labelledby="blog-heading">
      <div className="blog-header">
        <div>
          <span className="eyebrow">Typing Guides & Tutorials</span>
          <h2 id="blog-heading">Practical Guides to Type Faster & More Accurately</h2>
        </div>
      </div>

      <div className="blog-grid">
        {BLOG_ARTICLES.map((article) => (
          <article key={article.slug} className="blog-card">
            <div>
              <span className="blog-card-tag">
                {article.category} · {article.readTime}
              </span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
            </div>
            <button
              type="button"
              className="blog-read-link"
              onClick={() => openArticle(article.slug)}
            >
              Read Full Guide →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
