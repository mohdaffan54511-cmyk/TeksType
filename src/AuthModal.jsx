import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";
import "./auth.css";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();

    if (!supabaseConfigured || !supabase) {
      setStatus("error");
      setMessage("Login is not configured yet. Add the Supabase variables in Cloudflare.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.session) {
          onClose();
          return;
        }

        setStatus("success");
        setMessage("Account created. Check your email and confirm your account.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      onClose();
    } catch (error) {
      setStatus("error");
      setMessage(error?.message || "Authentication failed. Please try again.");
    } finally {
      setStatus((current) => (current === "loading" ? "idle" : current));
    }
  };

  const loading = status === "loading";

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="auth-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
      >
        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close login window"
        >
          ×
        </button>

        <span className="auth-eyebrow">OPTIONAL ACCOUNT</span>
        <h2 id="auth-title">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p id="auth-description">
          Save your best WPM, typing sessions and progress across devices.
        </p>

        {!supabaseConfigured && (
          <div className="auth-config-warning" role="status">
            Supabase variables are missing. Complete the setup guide before testing login.
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "PLEASE WAIT..."
              : mode === "login"
                ? "LOG IN"
                : "CREATE ACCOUNT"}
          </button>
        </form>

        {message && (
          <p className={`auth-message ${status}`} role="status" aria-live="polite">
            {message}
          </p>
        )}

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode((current) => (current === "login" ? "signup" : "login"));
            setMessage("");
            setStatus("idle");
          }}
        >
          {mode === "login"
            ? "New here? Create an account"
            : "Already have an account? Log in"}
        </button>

        <button type="button" className="auth-guest" onClick={onClose}>
          CONTINUE AS GUEST
        </button>

        <small className="auth-legal">
          By continuing, you agree to the <a href="/terms.html">Terms</a> and{" "}
          <a href="/privacy.html">Privacy Policy</a>.
        </small>
      </section>
    </div>
  );
}
