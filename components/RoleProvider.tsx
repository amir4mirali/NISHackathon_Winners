"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, UserRole } from "@/lib/shared";

type RoleContextValue = {
  role: UserRole;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = (await response.json()) as { user: AuthUser | null };
      setCurrentUser(payload.user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = (await response.json()) as {
      user?: AuthUser;
      error?: string;
    };

    if (!response.ok || !payload.user) {
      return { ok: false, error: payload.error ?? "Login failed" };
    }

    setCurrentUser(payload.user);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({
      role: currentUser?.role ?? "resident",
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isLoading,
      login,
      logout,
      refreshSession,
    }),
    [currentUser, isLoading, login, logout, refreshSession],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}
