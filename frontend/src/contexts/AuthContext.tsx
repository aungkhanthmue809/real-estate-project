import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authAPI, userAPI } from '../utils/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { email?: string; phone?: string; avatar?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'urbannest-token';
const USER_KEY = 'urbannest-user';

function toSessionUser(data: { id: number; username: string; email: string; phone: string; role: 'USER' | 'ADMIN'; avatar?: string }): User {
  return { id: data.id, username: data.username, email: data.email, phone: data.phone, role: data.role, avatar: data.avatar };
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = loadStoredUser();

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (storedUser) setUser(storedUser);

    authAPI.me()
      .then((res) => {
        const current: User = toSessionUser(res.data);
        setUser(current);
        localStorage.setItem(USER_KEY, JSON.stringify(current));
      })
      .catch((err) => {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authAPI.login({ username, password });
    const data = res.data;
    localStorage.setItem(TOKEN_KEY, data.token);
    const sessionUser = toSessionUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const register = async (username: string, email: string, password: string, phone: string) => {
    const res = await authAPI.register({ username, email, password, phone });
    const data = res.data;
    localStorage.setItem(TOKEN_KEY, data.token);
    const sessionUser = toSessionUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateProfile = async (data: { email?: string; phone?: string; avatar?: string }) => {
    if (!user) return;
    await userAPI.updateProfile({ email: data.email, phone: data.phone, avatar: data.avatar });
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await userAPI.changePassword(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
