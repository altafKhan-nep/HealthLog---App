import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, typography, ThemeColors } from "../theme/tokens";
import { useTheme } from "../context/ThemeContext";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {current} of {total}
      </Text>
      <View style={styles.track}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < current ? styles.dotFilled : styles.dotEmpty,
              i === current - 1 && styles.dotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotEmpty: {
    backgroundColor: colors.border,
  },
  dotCurrent: {
    width: 48,
  },
});
