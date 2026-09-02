import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase";
import "./auth.css";

export default function AuthModal({
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
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
            data: {
              full_name: name.trim(),
            },
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

  // Google Login Handler function
  const handleGoogleLogin = async () => {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error) {
      setStatus("error");
      setMessage(
        error?.message || "Google authentication failed. Please try again."
      );
      setStatus("idle");
    }
  };

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === "login" ? "signup" : "login"
    );

    setName("");
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
          {/* Name field (Only shown during Sign Up) */}
          {!isLogin && (
            <label className="auth-field">
              <span>Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                placeholder="Enter your name"
                required={!isLogin}
                autoFocus
                disabled={loading}
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email address</span>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="Enter your email"
              required
              autoFocus={isLogin}
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

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px",
            marginTop: "12px",
            marginBottom: "4px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "#ffffff",
            color: "#1f2937",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#4285F4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#FBBC05" d="M5.84 9.91c-.22.66-.35 1.36-.35 2.09s.13 1.43.35 2.09l3.66 2.84c.32-1.8 1.58-3.32 3.32-4.14V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
          </svg>
          Continue with Google
        </button>

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
