import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authApi, type AuthTokens, type UserInfo } from "@/lib/api";

interface AuthContextType {
  tokens: AuthTokens | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGuest: () => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKENS_KEY = "duomath-tokens";

function loadTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthTokens | null) {
  if (tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(TOKENS_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(loadTokens);
  const [user, setUser] = useState<UserInfo | null>(null);

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const u = await authApi.me(accessToken);
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (tokens?.accessToken) {
      void fetchUser(tokens.accessToken);
    } else {
      setUser(null);
    }
  }, [tokens, fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const newTokens = await authApi.login(email, password);
    setTokens(newTokens);
    saveTokens(newTokens);
  }, []);

  const loginGuest = useCallback(async () => {
    const newTokens = await authApi.loginGuest();
    setTokens(newTokens);
    saveTokens(newTokens);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const newTokens = await authApi.register(email, password, name);
    setTokens(newTokens);
    saveTokens(newTokens);
  }, []);

  const logout = useCallback(async () => {
    if (tokens?.refreshToken) {
      try {
        await authApi.logout(tokens.refreshToken);
      } catch {
        // ignore logout API errors
      }
    }
    setTokens(null);
    saveTokens(null);
    setUser(null);
  }, [tokens]);

  return (
    <AuthContext.Provider
      value={{
        tokens,
        user,
        isAuthenticated: !!tokens?.accessToken,
        login,
        loginGuest,
        register,
        logout,
        accessToken: tokens?.accessToken ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
