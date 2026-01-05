'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      fetch(`${apiBase}/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Invalid token');
        })
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          router.push('/login');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const login = async (username: string, password: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const register = async (username: string, password: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Protected route check
  useEffect(() => {
    const publicPaths = ['/login', '/register'];
    if (!isLoading && !user && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
