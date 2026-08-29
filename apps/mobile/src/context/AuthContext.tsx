import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
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

// Store the auth token in the OS keychain/keystore (SecureStore). Falls back to
// AsyncStorage on web where SecureStore is unavailable.
async function getToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") return await AsyncStorage.getItem(TOKEN_KEY);
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function setToken(value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(TOKEN_KEY, value);
    return;
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, value);
  } catch {
    await AsyncStorage.setItem(TOKEN_KEY, value);
  }
}

async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [savedToken, savedUser] = await Promise.all([
        getToken(),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (savedToken && savedUser) {
        setTokenState(savedToken);
        setUser(JSON.parse(savedUser));
        apiClient.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      }
      setIsLoading(false);
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/api/auth/login", { email, password });
      const { token: newToken, user: newUser } = res.data;
      await setToken(newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setTokenState(newToken);
      setUser(newUser);
      return {};
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message || "Login failed" };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const res = await apiClient.post("/api/auth/signup", { name, email, password });
      const { token: newToken, user: newUser } = res.data;
      await setToken(newToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      setTokenState(newToken);
      setUser(newUser);
      return {};
    } catch (err: any) {
      return { error: err.response?.data?.error || err.message || "Sign up failed" };
    }
  };

  const signOut = async () => {
    await clearToken();
    await AsyncStorage.removeItem(USER_KEY);
    delete apiClient.defaults.headers.common.Authorization;
    setTokenState(null);
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
