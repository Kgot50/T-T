import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken } from '../lib/api-client';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContacts: EmergencyContact[];
  guardianMode: boolean;
  accessibilitySettings: AccessibilitySettings;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface AccessibilitySettings {
  highContrast: boolean;
  textToSpeech: boolean;
  speechToText: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setAuthToken(token);
      loadUserFromToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserFromToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setUser(result.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      if (result.success && result.data) {
        const { token, user } = result.data;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name || '',
          phone: userData.phone || '',
          emergencyContacts: userData.emergencyContacts || [],
        }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      if (result.success && result.data) {
        const { token, user } = result.data;
        localStorage.setItem('authToken', token);
        setAuthToken(token);
        setUser(user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        return;
      }

      const result = await response.json();
      if (result.success && result.data) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
