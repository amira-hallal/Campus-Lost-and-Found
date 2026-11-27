import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import { useData } from "./DataContext";

const AuthContext = createContext(null);

// Accept { data: { token, user } } and also { token, user }
function readSession(payload) {
  const body = payload?.data ?? payload ?? {};
  return { token: body.token, user: body.user };
}

export function AuthProvider({ children }) {
  const { rememberUser } = useData();
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(() => Boolean(getToken()));
  const [sessionEnded, setSessionEnded] = useState(false);

  const signIn = useCallback(
    (token, user) => {
      setToken(token);
      setCurrentUser(user);
      setSessionEnded(false);
      rememberUser(user); // so "Posted by" shows your name right away
    },
    [rememberUser],
  );

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
  }, []);

  // A 401 on any request means the saved token is no longer valid
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      setSessionEnded(true);
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restore the session after a page refresh
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    api
      .get("/api/auth/me")
      .then(({ data }) => {
        if (cancelled) return;
        setCurrentUser(data);
        rememberUser(data);
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setAuthChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [rememberUser]);

  const login = async (email, password) => {
    try {
      const { token, user } = readSession(await api.post("/api/auth/login", { email: email.trim(), password }));
      signIn(token, user);
      return user;
    } catch (error) {
      if (error.status === 401) return null; // wrong email or password
      throw error;
    }
  };

  const register = async ({ name, email, password, role }) => {
    const body = { name: name.trim(), email: email.trim().toLowerCase(), password };
    if (role) body.role = role;
    const { token, user } = readSession(await api.post("/api/auth/register", body));
    signIn(token, user);
    return user;
  };

  const value = {
    currentUser,
    authChecking,
    sessionEnded,
    clearSessionEnded: () => setSessionEnded(false),
    login,
    logout,
    register,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
