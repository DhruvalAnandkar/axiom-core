import { useState } from "react";
import { useAuth } from "../context/AuthProvider.jsx";

const INPUT_CLASS =
  "w-full rounded-lg border border-axiom-border bg-axiom-bg/60 px-3 py-2 text-sm text-axiom-text placeholder:text-axiom-muted/60 focus:border-axiom-green/50 focus:outline-none";

/** Sign in / create account form; calls onDone() after a successful auth. */
export default function AuthForm({ onDone }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="mb-4 flex rounded-lg border border-axiom-border p-0.5">
        {[
          { id: "login", label: "Sign in" },
          { id: "register", label: "Create account" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setMode(t.id);
              setError(null);
            }}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              mode === t.id ? "bg-axiom-green/15 text-axiom-green" : "text-axiom-muted hover:text-axiom-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {mode === "register" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            maxLength={24}
            required
            className={INPUT_CLASS}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          autoComplete="email"
          className={INPUT_CLASS}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "Password (6+ characters)" : "Password"}
          required
          minLength={mode === "register" ? 6 : 1}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className={INPUT_CLASS}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-lg bg-gradient-to-r from-axiom-green to-axiom-green-dim px-4 py-2 text-sm font-semibold text-axiom-bg transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
