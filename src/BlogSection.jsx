import { useEffect, useState } from "react";
import { BLOG_ARTICLES } from "./lib/blogArticles";

const BLOG_PATH = /^\/blog\/([^/]+)\/?$/;
const HOME_TITLE = "TypePerfectly | Free Online Typing Test (English, Hinglish & Business)";

function getSlugFromPath() {
  const match = window.location.pathname.match(BLOG_PATH);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function BlogSection({ onStartTyping }) {
  const [activeSlug, setActiveSlug] = useState(getSlugFromPath);
  const activeArticle = BLOG_ARTICLES.find((article) => article.slug === activeSlug);

  useEffect(() => {
    const syncRoute = () => setActiveSlug(getSlugFromPath());
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  useEffect(() => {
    const description = document.querySelector('meta[name="description"]');
    const originalDescription = description?.getAttribute("content");
    const originalTitle = document.title;

    if (activeArticle) {
      document.title = `${activeArticle.title} | TypePerfectly`;
      description?.setAttribute("content", activeArticle.metaDescription);
    } else {
      document.title = HOME_TITLE;
      if (description && originalDescription) description.setAttribute("content", originalDescription);
    }

    return () => {
      document.title = activeArticle ? originalTitle : HOME_TITLE;
      if (description && originalDescription) description.setAttribute("content", originalDescription);
    };
  }, [activeArticle]);

  const openArticle = (slug) => {
    window.history.pushState({}, "", `/blog/${encodeURIComponent(slug)}/`);
    setActiveSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeArticle = () => {
    window.history.pushState({}, "", "/");
    setActiveSlug(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (activeArticle) {
    return (
      <article className="blog-article-container" aria-labelledby="article-title">
        <nav className="blog-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={closeArticle}>Home</button>
          <span aria-hidden="true">/</span>
          <button type="button" onClick={closeArticle}>Blog</button>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{activeArticle.title}</span>
        </nav>

        <span className="blog-card-tag">{activeArticle.category}</span>
        <h1 id="article-title">{activeArticle.title}</h1>
        <div className="blog-meta">
          <span>By TypePerfectly Editorial</span> · <span>{activeArticle.readTime}</span>
        </div>

        {activeArticle.toc?.length > 0 && (
          <nav className="blog-toc" aria-label="Table of Contents">
            <strong>Table of Contents</strong>
            <ul>
              {activeArticle.toc.map((item) => (
                <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
              ))}
            </ul>
          </nav>
        )}

        <div className="blog-body">
          <p>{activeArticle.summary}</p>
          {activeArticle.sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`}>{section.heading}</h2>
              {section.body.map((paragraph, index) => <p key={`${section.id}-${index}`}>{paragraph}</p>)}
            </section>
          ))}
          {activeArticle.faqs?.length > 0 && (
            <section aria-labelledby="blog-faq-heading">
              <h2 id="blog-faq-heading">Frequently Asked Questions</h2>
              {activeArticle.faqs.map((faq, index) => (
                <div key={`faq-${index}`} className="blog-faq-item">
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        <div className="blog-cta-box">
          <h2>Ready to Test Your Typing Speed?</h2>
          <p>Practice immediately in English, Hinglish, or Business mode—no account or login required.</p>
          <button type="button" className="primary-button" onClick={() => {
            closeArticle();
            onStartTyping?.();
          }}>
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
          <span className="eyebrow">Typing Guides &amp; Tutorials</span>
          <h2 id="blog-heading">Practical Guides to Type Faster &amp; More Accurately</h2>
        </div>
      </div>
      <div className="blog-grid">
        {BLOG_ARTICLES.map((article) => (
          <article key={article.slug} className="blog-card">
            <div>
              <span className="blog-card-tag">{article.category} · {article.readTime}</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
            </div>
            <button type="button" className="blog-read-link" onClick={() => openArticle(article.slug)}>
              Read Full Guide →
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
