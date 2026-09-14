import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '../features/auth/api';
import type { AuthUser, LoginInput, RegisterInput } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(input: LoginInput) {
    const loggedInUser = await loginRequest(input);
    setUser(loggedInUser);
  }

  async function register(input: RegisterInput) {
    const newUser = await registerRequest(input);
    setUser(newUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
