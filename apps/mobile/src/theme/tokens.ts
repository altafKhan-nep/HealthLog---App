export const colors = {
  primary: "#1B7A8C",
  primaryDark: "#125A67",
  primaryLight: "#E8F4F6",
  background: "#F4F8FA",
  surface: "#FFFFFF",
  textPrimary: "#12242B",
  textSecondary: "#5B6E75",
  textInverse: "#FFFFFF",
  border: "#DCE6E9",
  divider: "#EDF2F4",

  statusReady: "#2E9E5B",
  statusReadyBg: "#E8F7EE",
  statusProcessing: "#D89B2A",
  statusProcessingBg: "#FDF3E0",
  statusError: "#C9483C",
  statusErrorBg: "#FDECEB",

  shadow: "rgba(18, 36, 43, 0.08)",
  overlay: "rgba(18, 36, 43, 0.5)",

  darkBackground: "#000000",
  darkSurface: "#1C1C1E",
  darkSurfaceAlt: "#2C2C2E",
  darkBorder: "#3A3A3C",
  darkText: "#FFFFFF",
  darkTextSecondary: "#A8A8AD",
  darkTextMuted: "#6E6E73",

  accentHospital: "#2E7D4F",
  accentHospitalBg: "#E8F6ED",
  accentTrend: "#2E7D4F",
  accentTrendBg: "#E8F6ED",
  accentCare: "#7B3FA0",
  accentCareBg: "#F0E8F6",
};

export const darkColors = {
  primary: "#37A6BC",
  primaryDark: "#58C2D6",
  primaryLight: "#1E3B45",
  background: "#101418",
  surface: "#1A2024",
  textPrimary: "#E8F0F3",
  textSecondary: "#9AA7AD",
  textInverse: "#FFFFFF",
  border: "#2A3238",
  divider: "#232A30",

  statusReady: "#4CC07A",
  statusReadyBg: "#1C3329",
  statusProcessing: "#E0A83A",
  statusProcessingBg: "#332919",
  statusError: "#E06A5C",
  statusErrorBg: "#332021",

  shadow: "rgba(0, 0, 0, 0.4)",
  overlay: "rgba(0, 0, 0, 0.6)",

  darkBackground: "#000000",
  darkSurface: "#1C1C1E",
  darkSurfaceAlt: "#2C2C2E",
  darkBorder: "#3A3A3C",
  darkText: "#FFFFFF",
  darkTextSecondary: "#A8A8AD",
  darkTextMuted: "#6E6E73",

  accentHospital: "#5BDA8F",
  accentHospitalBg: "#1C3329",
  accentTrend: "#5BDA8F",
  accentTrendBg: "#1C3329",
  accentCare: "#B78AF0",
  accentCareBg: "#2A2140",
};

export type ThemeMode = "light" | "dark" | "system" | "auto";
export type ThemeColors = typeof colors;

export const brand = {
  primary: "#1B7A8C",
  primaryDark: "#125A67",
  light: "#E8F4F6",
  textOnBrand: "#EAF4F6",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  card: 16,
  lg: 24,
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600" as const,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: "500" as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
};
