"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { User, UserRole, USERS } from "@/lib/shared";

type RoleContextValue = {
  role: UserRole;
  currentUser: User;
  setRole: (role: UserRole) => void;
};

const DEFAULT_ROLE: UserRole = "resident";
const STORAGE_KEY = "alatau-role";

const getDefaultUser = (role: UserRole) =>
  USERS.find((user) => user.role === role) ?? USERS[0];

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window === "undefined") return DEFAULT_ROLE;
    const stored = window.localStorage.getItem(STORAGE_KEY) as UserRole | null;
    if (stored === "resident" || stored === "developer" || stored === "admin") {
      return stored;
    }
    return DEFAULT_ROLE;
  });

  const setRole = (nextRole: UserRole) => {
    setRoleState(nextRole);
    window.localStorage.setItem(STORAGE_KEY, nextRole);
  };

  const value = useMemo(
    () => ({
      role,
      currentUser: getDefaultUser(role),
      setRole,
    }),
    [role],
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
