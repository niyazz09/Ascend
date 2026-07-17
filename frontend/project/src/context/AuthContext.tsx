import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Session {
  token: string;
  user: User;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ascend_session');
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('ascend_session');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Failed to sign in' };
      }

      const newSession: Session = {
        token: data.token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name || null,
        },
      };

      localStorage.setItem('ascend_session', JSON.stringify(newSession));
      setSession(newSession);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Connection error to authentication server' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Failed to create account' };
      }

      const newSession: Session = {
        token: data.token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name,
        },
      };

      localStorage.setItem('ascend_session', JSON.stringify(newSession));
      setSession(newSession);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Connection error to authentication server' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('ascend_session');
    setSession(null);
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
    } as Record<string, string>;

    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }

    const res = await fetch(url.startsWith('http') ? url : `${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (res.status === 401 || res.status === 403) {
      await signOut();
    }

    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
