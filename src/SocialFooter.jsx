export default function SocialFooter({ wpm = null }) {
  const websiteUrl = "https://www.typeperfectly.com/";

  const shareText = wpm
    ? `I just scored ${wpm} WPM on Type Perfectly!`
    : "Practice English, Hinglish, code and business typing on Type Perfectly!";

  const encodedUrl = encodeURIComponent(websiteUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Type Perfectly",
          text: shareText,
          url: websiteUrl,
        });
      } else {
        await navigator.clipboard.writeText(websiteUrl);
        alert("Website link copied!");
      }
    } catch {
      // User cancelled sharing
    }
  };

  return (
    <footer className="social-footer">
      <div className="social-footer-top">
        <a href="/" className="social-brand">
          <img src="/TeksType.jpeg" alt="Type Perfectly" />
          <span>Type Perfectly</span>
        </a>

        <div className="social-share">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
          >
            X
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            in
          </a>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Instagram"
          >
            ◎
          </a>

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share Type Perfectly"
          >
            ↗
          </button>
        </div>
      </div>

      <div className="social-footer-bottom">
        <span>© 2026 Type Perfectly. All rights reserved.</span>

        <nav aria-label="Legal links">
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/disclaimer.html">Disclaimer</a>
        </nav>
      </div>
    </footer>
  );
}
