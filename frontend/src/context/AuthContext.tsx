import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiUrl } from '../utils/api';

export type UserRole = 'member' | 'librarian' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      // Check if we believe the user is logged in
      const isLogged = localStorage.getItem("is_user_logged_in") === "true";
      if (!isLogged) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token might be expired or invalid
          localStorage.removeItem("is_user_logged_in");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("is_user_logged_in", "true");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("is_user_logged_in");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
