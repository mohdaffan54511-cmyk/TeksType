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
    aria-label="Share on Twitter"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.95 4.57c-.89.39-1.83.65-2.83.77a4.93 4.93 0 0 0 2.17-2.72 9.86 9.86 0 0 1-3.13 1.2A4.92 4.92 0 0 0 11.64 7.2a13.97 13.97 0 0 1-10.15-5.15 4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.62v.06a4.93 4.93 0 0 0 3.95 4.83 4.95 4.95 0 0 1-2.22.08 4.93 4.93 0 0 0 4.6 3.42A9.88 9.88 0 0 1 1 18.49c-.4 0-.79-.02-1.18-.07A13.94 13.94 0 0 0 7.55 20.7c9.14 0 14.14-7.57 14.14-14.14v-.64a10.1 10.1 0 0 0 2.48-2.57z" />
    </svg>
  </a>

  <a
    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Share on LinkedIn"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.1 20.45H3.54V8.98H7.1v11.47z" />
    </svg>
  </a>

  <a
    href="https://www.instagram.com/"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Open Instagram"
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  </a>

  <button
    type="button"
    onClick={handleShare}
    aria-label="Share Type Perfectly"
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 5h5v5" />
      <path d="M19 5 10 14" />
      <path d="M19 13v6H5V5h6" />
    </svg>
  </button>
</div>
    </footer>
  );
}
