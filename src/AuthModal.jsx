import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";
import "./auth.css";

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const isLogin = mode === "login";
  const loading = status === "loading";

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();

    if (!supabaseConfigured || !supabase) {
      setStatus("error");
      setMessage(
        "Login is not configured yet. Check the Supabase variables in Cloudflare."
      );
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
        setMessage(
          "Account created. Please check your email and confirm your account."
        );
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
      setMessage(
        error?.message || "Authentication failed. Please try again."
      );
    }
  };

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "signup" : "login"
    );

    setPassword("");
    setMessage("");
    setStatus("idle");
  };

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="auth-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-description"
      >
        <div className="auth-card-glow" aria-hidden="true" />

        <button
          type="button"
          className="auth-close"
          onClick={onClose}
          aria-label="Close login window"
        >
          ×
        </button>

        <div className="auth-brand-mark">
          <img
            src="/TeksType.jpeg"
            alt="Type Perfectly logo"
          />
        </div>

        <p className="auth-eyebrow">
          TYPE PERFECTLY ACCOUNT
        </p>

        <h2 id="auth-title" className="auth-title">
          {isLogin
            ? "Continue to use Type Perfectly"
            : "Create your account"}
        </h2>

        <p id="auth-description" className="auth-description">
          {isLogin
            ? "Welcome back! Enter your details to continue improving your typing."
            : "Save your best WPM, recent sessions and typing progress across devices."}
        </p>

        {!supabaseConfigured && (
          <div
            className="auth-config-warning"
            role="status"
          >
            Supabase variables are missing. Complete the setup before testing
            login.
          </div>
        )}

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>Email address</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Enter your email"
              required
              autoFocus
              disabled={loading}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                isLogin ? "current-password" : "new-password"
              }
              placeholder="Minimum 8 characters"
              minLength={8}
              required
              disabled={loading}
            />
          </label>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "PLEASE WAIT..."
              : isLogin
              ? "LOG IN"
              : "CREATE ACCOUNT"}
          </button>
        </form>

        {message && (
          <p
            className={`auth-message ${status}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <p className="auth-switch-copy">
          {isLogin
            ? "Not registered yet?"
            : "Already have an account?"}{" "}

          <button
            type="button"
            className="auth-switch"
            onClick={switchMode}
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>

        <button
          type="button"
          className="auth-guest"
          onClick={onClose}
        >
          CONTINUE AS GUEST
        </button>

        <small className="auth-legal">
          By continuing, you agree to the{" "}
          <a href="/terms.html">Terms</a> and{" "}
          <a href="/privacy.html">Privacy Policy</a>.
        </small>
      </section>
    </div>
  );
}
