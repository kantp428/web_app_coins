"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth-types";
import { useLogout } from "@/hooks/use-logout";

type AuthContextValue = {
  user: AuthUser;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  logoutError: string;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
// The server verifies the cookie before supplying this public profile.
// Hooks refresh the server route after cookie changes.
export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const { logout, loading, error } = useLogout();
  return (
    <AuthContext.Provider
      value={{ user, logout, isLoggingOut: loading, logoutError: error }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
