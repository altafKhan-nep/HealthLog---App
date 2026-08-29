import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, typography, radius, spacing } from "../theme/tokens";

type BadgeVariant = "ready" | "processing" | "error" | "tag";

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
}

const config: Record<BadgeVariant, { bg: string; color: string }> = {
  ready: { bg: colors.statusReadyBg, color: colors.statusReady },
  processing: { bg: colors.statusProcessingBg, color: colors.statusProcessing },
  error: { bg: colors.statusErrorBg, color: colors.statusError },
  tag: { bg: colors.primaryLight, color: colors.primary },
};

export function Badge({ variant, label }: BadgeProps) {
  const c = config[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
  text: {
    ...typography.caption,
    fontWeight: "600",
  },
});
