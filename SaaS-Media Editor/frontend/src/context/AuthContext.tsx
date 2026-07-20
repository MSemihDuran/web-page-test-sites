import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  isSubscribed: boolean;
  createdAt: string;
  twoFactorEnabled: boolean;
  fullName: string;
  companyName: string | null;
  designPurpose: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (
    email: string, 
    password: string, 
    fullName: string, 
    companyName: string, 
    designPurpose: string, 
    isSubscribed?: boolean
  ) => Promise<void>;
  logout: () => void;
  toggleSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('saas_editor_token') || sessionStorage.getItem('saas_editor_token')
  );
  const [loading, setLoading] = useState(true);

  // Configure global axios header for all authenticated requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('saas_editor_token');
      sessionStorage.removeItem('saas_editor_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user data on startup
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        // Clear token if invalid
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const tokenVal = response.data.token;
      
      if (rememberMe) {
        localStorage.setItem('saas_editor_token', tokenVal);
      } else {
        sessionStorage.setItem('saas_editor_token', tokenVal);
      }
      
      setToken(tokenVal);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (
    email: string, 
    password: string, 
    fullName: string, 
    companyName: string, 
    designPurpose: string, 
    isSubscribed = false
  ) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { 
        email, 
        password, 
        fullName,
        companyName,
        designPurpose,
        isSubscribed 
      });
      setToken(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const toggleSubscription = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/toggle-subscription`);
      setUser(response.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to toggle subscription');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, toggleSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
