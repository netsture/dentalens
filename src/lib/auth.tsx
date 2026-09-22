import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type DemoUser = {
  email: string;
  name: string;
  role: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "dentsaas_demo_user";

const DEMO_ACCOUNTS = [
  { email: "admin@dentsaas.com", password: "demo123", name: "Samir Admin", role: "Administrator" },
  { email: "doctor@dentsaas.com", password: "demo123", name: "Dr. Rollins", role: "Doctor" },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(() => loadUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(email, password) {
        await new Promise((r) => setTimeout(r, 500));
        const match = DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!match) throw new Error("Invalid email or password. Use demo credentials.");
        const next = { email: match.email, name: match.name, role: match.role };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next);
      },
      logout() {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.map(({ email, password, role }) => ({
  email,
  password,
  role,
}));
