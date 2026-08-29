import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { colors, spacing, typography, radius, shadow, ThemeColors } from "../theme/tokens";
import { useTheme } from "../context/ThemeContext";

interface TrendCardProps {
  icon: string;
  label: string;
  value: number;
  unit: string;
  subtitle: string;
  statusLabel: string;
  statusType: "normal" | "high" | "low";
  sparklineData: number[];
  onPress?: () => void;
}

function MiniSparkline({ data, color, styles }: { data: number[]; color: string; styles: any }) {
  if (data.length < 2) return <View style={styles.sparklineEmpty} />;
  const w = 100;
  const h = 40;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const lastPoint = points[points.length - 1];

  return (
    <Svg width={w} height={h}>
      <Path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={lastPoint.x} cy={lastPoint.y} r={4} fill={color} stroke="#fff" strokeWidth={2} />
    </Svg>
  );
}

export function TrendCard({
  icon,
  label,
  value,
  unit,
  subtitle,
  statusLabel,
  statusType,
  sparklineData,
  onPress,
}: TrendCardProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const STATUS_CONFIG = {
    normal: { color: colors.statusReady, bg: colors.statusReadyBg },
    high: { color: colors.statusError, bg: colors.statusErrorBg },
    low: { color: colors.statusProcessing, bg: colors.statusProcessingBg },
  };
  const statusConfig = STATUS_CONFIG[statusType];

  return (
    <TouchableOpacity
      style={[styles.card, shadow.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Ionicons name={icon as any} size={22} color={statusConfig.color} />
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.badge, { backgroundColor: statusConfig.bg }]}>
          <View style={[styles.badgeDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.badgeText, { color: statusConfig.color }]}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <View>
          <Text style={[styles.value, { color: statusConfig.color }]}>{value}</Text>
          <Text style={styles.unit}>{unit} {subtitle}</Text>
        </View>
        <MiniSparkline data={sparklineData} color={statusConfig.color} styles={styles} />
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.sm,
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: "600",
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sparklineEmpty: {
    width: 100,
    height: 40,
  },
});
