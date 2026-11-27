import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { createMockAuthService, type AuthService, type AuthSession } from "./mockAuthService";

// The session is kept in memory for WBS-2.3a. Secure storage between app
// launches (FR-03, "stay signed in") is part of WBS-2.3b.

type AuthContextValue = {
  service: AuthService;
  session: AuthSession | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ service, children }: PropsWithChildren<{ service?: AuthService }>) {
  const [defaultService] = useState(() => service ?? createMockAuthService());
  const [session, setSession] = useState<AuthSession | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      service: service ?? defaultService,
      session,
      signIn: setSession,
      signOut: () => setSession(null),
    }),
    [service, defaultService, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside an AuthProvider");
  return value;
}
