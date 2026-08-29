import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../api/client";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "healthlog_token";
const USER_KEY = "healthlog_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const savedUser = await AsyncStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        apiClient.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[auth] signing in with:", email, "baseURL:", apiClient.defaults.baseURL);
      const res = await apiClient.post("/api/auth/login", { email, password });
      console.log("[auth] login success:", res.data.user?.name);
      const { token: newToken, user: newUser } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
      return {};
    } catch (err: any) {
      console.log("[auth] login error:", err.message, err.code, err.response?.status, err.response?.data);
      return { error: err.response?.data?.error || err.message || "Login failed" };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      console.log("[auth] signing up:", name, email);
      const res = await apiClient.post("/api/auth/signup", { name, email, password });
      console.log("[auth] signup success:", res.data.user?.name);
      const { token: newToken, user: newUser } = res.data;
      await AsyncStorage.setItem(TOKEN_KEY, newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);
      return {};
    } catch (err: any) {
      console.log("[auth] signup error:", err.message, err.code, err.response?.status, err.response?.data);
      return { error: err.response?.data?.error || err.message || "Sign up failed" };
    }
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    delete apiClient.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, signIn, signUp, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
