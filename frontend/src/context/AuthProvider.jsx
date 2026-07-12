import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_URL } from "../lib/config.js";

const TOKEN_KEY = "axiom-token";
const AuthContext = createContext(null);

async function api(path, { token, ...init } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error(
      `Cannot reach the server at ${API_URL}. Is the backend running on port 3001?`,
    );
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const persist = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    try {
      if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      // storage unavailable — session-only auth
    }
  }, []);

  // Resume the session on load.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api("/api/auth/me", { token })
      .then((body) => {
        if (!cancelled) setUser(body.user);
      })
      .catch(() => {
        if (!cancelled) persist(null, null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email, password) => {
      const body = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      persist(body.token, body.user);
    },
    [persist],
  );

  const register = useCallback(
    async (name, email, password) => {
      const body = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      persist(body.token, body.user);
    },
    [persist],
  );

  const logout = useCallback(() => persist(null, null), [persist]);

  // Fire-and-forget stat sync; server response refreshes the local copy.
  const bumpStat = useCallback(
    (key) => {
      if (!token) return;
      api("/api/user/stats", { token, method: "POST", body: JSON.stringify({ key }) })
        .then((body) => setUser(body.user))
        .catch(() => {});
    },
    [token],
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, bumpStat }),
    [user, loading, login, register, logout, bumpStat],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
