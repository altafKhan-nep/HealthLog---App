import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors as lightColors, darkColors, ThemeMode } from "../theme/tokens";

const STORAGE_KEY = "healthlog.theme.mode";

// Auto (by time) schedule: light between sunrise and sunset, dark otherwise.
// Default boundaries (minutes since midnight): sunrise 06:00, sunset 20:00.
const SUNRISE_MIN = 6 * 60;
const SUNSET_MIN = 20 * 60;

function isDarkByTime(date: Date): boolean {
  const mins = date.getHours() * 60 + date.getMinutes();
  return mins < SUNRISE_MIN || mins >= SUNSET_MIN;
}

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof lightColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system" || stored === "auto") {
          setModeState(stored);
        }
      })
      .catch(() => {});
  }, []);

  // Keep `now` fresh so "auto" mode flips at sunrise/sunset while the app is open.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const isDark = useMemo(() => {
    if (mode === "system") return systemScheme === "dark";
    if (mode === "dark") return true;
    if (mode === "light") return false;
    // auto: follow the time-of-day schedule
    return isDarkByTime(now);
  }, [mode, systemScheme, now]);

  const colors = isDark ? darkColors : lightColors;

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo(
    () => ({ mode, isDark, colors, setMode }),
    [mode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
