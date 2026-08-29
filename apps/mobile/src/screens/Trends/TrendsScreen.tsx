import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, Pressable,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Line, Text as SvgText, G } from "react-native-svg";
import { spacing, typography, radius, shadow, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { ScreenHeader } from "../../components/ScreenHeader";
import { TrendCard } from "../../components/TrendCard";

interface TestName {
  name: string;
  count: number;
}

interface TrendSummary {
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  statusLabel: string;
  statusType: "normal" | "high" | "low";
  sparklineData: number[];
  readingCount: number;
}

interface TrendPoint {
  date: string;
  value: number;
  unit: string;
  referenceRange: string;
  hospitalName: string;
  hospitalId: string;
}

const HOSPITAL_COLORS = [
  "#1B7A8C", "#C9483C", "#2E7D4F", "#D89B2A", "#7B3FA0",
  "#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444",
];

const TEST_ICONS: Record<string, string> = {
  "blood pressure": "heart-outline",
  "glucose": "water-outline",
  "cholesterol": "heart-outline",
  "hemoglobin": "water-outline",
  "vitamin d": "sunny-outline",
  "resting hr": "heart-outline",
};

function getTestIcon(testName: string) {
  const lower = testName.toLowerCase();
  for (const [key, val] of Object.entries(TEST_ICONS)) {
    if (lower.includes(key)) return val;
  }
  return "pulse-outline";
}

function getStatus(value: number, referenceRange: string): { label: string; color: string; bg: string } {
  const { colors } = useTheme();
  if (!referenceRange) return { label: "Unknown", color: colors.textSecondary, bg: colors.divider };
  const parts = referenceRange.split("-").map(Number);
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return { label: "Unknown", color: colors.textSecondary, bg: colors.divider };
  const [min, max] = parts;
  if (value >= min && value <= max) return { label: "Normal", color: colors.statusReady, bg: colors.statusReadyBg };
  if (value < min) return { label: "Low", color: "#D89B2A", bg: "#FDF3E0" };
  return { label: "High", color: colors.statusError, bg: colors.statusErrorBg };
}

function FullChart({ data, hospitalColors }: { data: TrendPoint[]; hospitalColors: Map<string, string> }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const chartWidth = 340;
  const chartHeight = 200;
  const padding = { top: 20, right: 25, bottom: 35, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.85;
  const maxVal = Math.max(...values) * 1.15;
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth,
    y: padding.top + plotHeight - ((d.value - minVal) / range) * plotHeight,
    color: hospitalColors.get(d.hospitalId) || colors.primary,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minVal + (i / yTicks) * range;
    const y = padding.top + plotHeight - (i / yTicks) * plotHeight;
    return { val: Math.round(val), y };
  });

  const refLow = data[0]?.referenceRange ? Number(data[0].referenceRange.split("-")[0]) : null;
  const refHigh = data[0]?.referenceRange ? Number(data[0].referenceRange.split("-")[1]) : null;

  let refLowY: number | null = null;
  let refHighY: number | null = null;
  if (refLow !== null && refHigh !== null && !isNaN(refLow) && !isNaN(refHigh)) {
    refLowY = padding.top + plotHeight - ((refLow - minVal) / range) * plotHeight;
    refHighY = padding.top + plotHeight - ((refHigh - minVal) / range) * plotHeight;
  }

  const monthLabels = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("en-US", { month: "short" });
  });

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartWidth} height={chartHeight}>
        {yLines.map((tick, i) => (
          <G key={i}>
            <Line
              x1={padding.left} y1={tick.y}
              x2={chartWidth - padding.right} y2={tick.y}
              stroke={colors.border} strokeWidth={1} strokeDasharray="4,4"
            />
            <SvgText
              x={padding.left - 10} y={tick.y + 4}
              fontSize={11} fill={colors.textSecondary} textAnchor="end"
            >
              {tick.val}
            </SvgText>
          </G>
        ))}

        {refLowY !== null && refHighY !== null && (
          <>
            <Line
              x1={padding.left} y1={refHighY}
              x2={chartWidth - padding.right} y2={refHighY}
              stroke="#F59E0B" strokeWidth={1} strokeDasharray="6,4" opacity={0.5}
            />
            <Line
              x1={padding.left} y1={refLowY}
              x2={chartWidth - padding.right} y2={refLowY}
              stroke="#F59E0B" strokeWidth={1} strokeDasharray="6,4" opacity={0.5}
            />
          </>
        )}

        <Path d={pathD} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={5} fill={p.color} stroke="#fff" strokeWidth={2} />
        ))}

        {points.map((p, i) => (
          <SvgText
            key={`label-${i}`}
            x={p.x} y={chartHeight - 10}
            fontSize={10} fill={colors.textSecondary} textAnchor="middle"
          >
            {monthLabels[i]}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export default function TrendsScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<TrendSummary[]>([]);
  const [testNames, setTestNames] = useState<TestName[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchSummaries();
      fetchTestNames();
    }, [])
  );

  const fetchSummaries = async () => {
    try {
      const res = await apiClient.get("/api/trends/summary");
      setSummaries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTestNames = async () => {
    try {
      const res = await apiClient.get("/api/trends");
      setTestNames(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectTest = async (name: string) => {
    setSelectedTest(name);
    setShowDropdown(false);
    try {
      const res = await apiClient.get(`/api/trends/${encodeURIComponent(name)}`);
      setTrendData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getHospitalColor = (hospitalId: string) => {
    const uniqueHospitals = [...new Set(trendData.map((d) => d.hospitalId))];
    const idx = uniqueHospitals.indexOf(hospitalId);
    return HOSPITAL_COLORS[idx % HOSPITAL_COLORS.length];
  };

  const hospitalColorMap = new Map(
    [...new Set(trendData.map((d) => d.hospitalId))].map((id, i) => [id, HOSPITAL_COLORS[i % HOSPITAL_COLORS.length]])
  );

  const uniqueHospitals = [...new Set(trendData.map((d) => d.hospitalId))];
  const hospitalNameMap = new Map(trendData.map((d) => [d.hospitalId, d.hospitalName]));

  const latest = trendData[trendData.length - 1];
  const status = latest ? getStatus(latest.value, latest.referenceRange) : null;

  if (selectedTest) {
    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => { setSelectedTest(null); setTrendData([]); }}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>HealthLog</Text>
          <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.fieldLabel}>Selected Metric</Text>
          <TouchableOpacity
            style={[styles.dropdown, shadow.sm]}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownText}>{selectedTest}</Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {latest && (
            <View style={[styles.trendSummaryCard, shadow.sm]}>
              <View style={styles.trendSummaryHeader}>
                <View>
                  <Text style={styles.trendSummaryTitle}>6 Month Trend</Text>
                  {latest.referenceRange && (
                    <Text style={styles.trendSummaryRange}>
                      Optimal Range: {latest.referenceRange} {latest.unit}
                    </Text>
                  )}
                </View>
                <View style={styles.trendSummaryRight}>
                  <Text style={[styles.trendSummaryValue, status ? { color: status.color } : undefined]}>
                    {latest.value}
                  </Text>
                  {status && (
                    <Text style={[styles.trendSummaryStatus, { color: status.color }]}>
                      {status.label} - Latest
                    </Text>
                  )}
                </View>
              </View>

              {trendData.length >= 2 ? (
                <FullChart data={trendData} hospitalColors={hospitalColorMap} />
              ) : (
                <View style={styles.singleReading}>
                  <View style={styles.singleReadingIcon}>
                    <Ionicons name="analytics-outline" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.singleReadingText}>1 reading recorded</Text>
                </View>
              )}

              {uniqueHospitals.length > 1 && (
                <View style={styles.legend}>
                  {uniqueHospitals.map((hId, i) => (
                    <View key={hId} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: HOSPITAL_COLORS[i % HOSPITAL_COLORS.length] }]} />
                      <Text style={styles.legendText}>{hospitalNameMap.get(hId)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.readingsSection}>
            <Text style={styles.sectionTitle}>Recent Readings</Text>
            {trendData.length === 0 ? (
              <Text style={styles.noReadings}>No readings available</Text>
            ) : (
              trendData.slice().reverse().map((item, i) => {
                const dotColor = getHospitalColor(item.hospitalId);
                const itemStatus = getStatus(item.value, item.referenceRange);
                const testIcon = getTestIcon(selectedTest || "");
                const iconBg = itemStatus.color + "15";
                return (
                  <View key={i} style={[styles.readingRow, shadow.sm]}>
                    <View style={[styles.readingIcon, { backgroundColor: iconBg }]}>
                      <Ionicons name={testIcon as any} size={20} color={itemStatus.color} />
                    </View>
                    <View style={styles.readingContent}>
                      <Text style={styles.readingDate}>
                        {new Date(item.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </Text>
                      <View style={styles.readingHospitalRow}>
                        <View style={[styles.readingHospitalDot, { backgroundColor: dotColor }]} />
                        <Text style={styles.readingHospital}>{item.hospitalName}</Text>
                      </View>
                    </View>
                    <View style={styles.readingRight}>
                      <Text style={styles.readingValue}>{item.value}</Text>
                      <View style={[styles.statusBadgeSmall, { backgroundColor: itemStatus.bg }]}>
                        <Text style={[styles.statusTextSmall, { color: itemStatus.color }]}>{itemStatus.label}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        <Modal visible={showDropdown} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
            <View style={[styles.modalContent, shadow.lg]}>
              <Text style={styles.modalTitle}>Select Metric</Text>
              {testNames.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.modalItem, selectedTest === item.name && styles.modalItemSelected]}
                  onPress={() => selectTest(item.name)}
                >
                  <Text style={[styles.modalItemText, selectedTest === item.name && styles.modalItemTextSelected]}>
                    {item.name}
                  </Text>
                  {selectedTest === item.name && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="HealthLog" />

      <View style={styles.trendHeader}>
        <View style={styles.trendHeaderIcon}>
          <Ionicons name="trending-up" size={22} color={colors.primary} />
        </View>
        <Text style={styles.trendTitle}>My Trends</Text>
      </View>

      {summaries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bar-chart" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>More Data Needed</Text>
            <Text style={styles.emptyMessage}>
              Trend will appear once there's more than one reading. Add reports with test results to see your health trends.
            </Text>
            <TouchableOpacity
              style={styles.addReadingButton}
              onPress={() => navigation.navigate("AddReport")}
            >
              <Ionicons name="add" size={20} color={colors.textInverse} />
              <Text style={styles.addReadingText}>Add Reading</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => item.testName}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TrendCard
              icon={getTestIcon(item.testName)}
              label={item.testName}
              value={item.value}
              unit={item.unit}
              subtitle={item.readingCount > 1 ? `Latest of ${item.readingCount}` : "Latest"}
              statusLabel={item.statusLabel}
              statusType={item.statusType}
              sparklineData={item.sparklineData}
              onPress={() => selectTest(item.testName)}
            />
          )}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  detailHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, paddingTop: spacing.xxl + spacing.md, paddingBottom: spacing.md,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  detailTitle: { ...typography.heading, color: colors.primary },
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.sm },
  dropdown: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  dropdownText: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  trendSummaryCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  trendSummaryHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  trendSummaryTitle: { ...typography.subheading, color: colors.textPrimary },
  trendSummaryRange: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  trendSummaryRight: { alignItems: "flex-end" },
  trendSummaryValue: { fontSize: 36, fontWeight: "700", color: colors.textPrimary },
  trendSummaryStatus: { ...typography.caption, fontWeight: "600", marginTop: 2 },
  chartContainer: { alignItems: "center", marginTop: spacing.sm },
  singleReading: { alignItems: "center", paddingVertical: spacing.xl },
  singleReadingIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  singleReadingText: { ...typography.body, color: colors.textSecondary },
  legend: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.md,
    marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.divider,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...typography.caption, color: colors.textSecondary },
  readingsSection: { marginTop: spacing.sm },
  sectionTitle: { ...typography.subheading, color: colors.textPrimary, marginBottom: spacing.md },
  noReadings: { ...typography.body, color: colors.textSecondary, textAlign: "center", paddingVertical: spacing.lg },
  readingRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  readingIcon: {
    width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
    marginRight: spacing.md,
  },
  readingContent: { flex: 1 },
  readingDate: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: "600" },
  readingHospitalRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  readingHospitalDot: { width: 6, height: 6, borderRadius: 3 },
  readingHospital: { ...typography.caption, color: colors.textSecondary },
  readingRight: { alignItems: "flex-end", gap: 4 },
  readingValue: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  statusBadgeSmall: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: spacing.sm + 2, paddingVertical: 4, borderRadius: radius.full,
  },
  statusTextSmall: { ...typography.caption, fontWeight: "600", fontSize: 12 },
  trendHeader: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  trendHeaderIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  trendTitle: { ...typography.heading, color: colors.textPrimary },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  emptyContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  emptyIconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  emptyTitle: { ...typography.subheading, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyMessage: { ...typography.body, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.lg },
  addReadingButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.card, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  addReadingText: { ...typography.button, color: colors.textInverse },
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    width: "80%", maxHeight: "60%",
  },
  modalTitle: { ...typography.subheading, color: colors.textPrimary, marginBottom: spacing.md },
  modalItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  modalItemSelected: { backgroundColor: colors.primaryLight, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  modalItemText: { ...typography.body, color: colors.textPrimary },
  modalItemTextSelected: { color: colors.primary, fontWeight: "600" },
});
