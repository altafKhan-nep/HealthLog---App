import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, ActivityIndicator,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadow, radius, brand, ThemeColors } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { ScreenHeader } from "../../components/ScreenHeader";

interface Visit {
  _id: string;
  hospitalId: { _id: string; name: string; location: string };
  visitDate: string;
  doctorName: string;
  tag: string;
  status: "processing" | "ready" | "failed";
  attachments: Array<{ fileUrl: string }>;
  extractedFields?: {
    plainLanguageSummary?: string;
    diagnosis?: string | null;
    medication?: string | null;
  };
}

interface TrendsSummary {
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  statusLabel: string;
  statusType: "normal" | "high" | "low";
  readingCount: number;
}

const TAG_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  lab_test: { bg: "#E8F4F6", text: "#1B7A8C", icon: "flask-outline" },
  consultation: { bg: "#F0E8F6", text: "#7B3FA0", icon: "person-outline" },
  prescription: { bg: "#E8F6ED", text: "#2E7D4F", icon: "medical-outline" },
  vaccination: { bg: "#FDF3E0", text: "#D89B2A", icon: "shield-checkmark-outline" },
  surgery: { bg: "#FDECEB", text: "#C9483C", icon: "fitness-outline" },
  other: { bg: "#EDF2F4", text: "#5B6E75", icon: "document-text-outline" },
};

const tagLabels: Record<string, string> = {
  consultation: "Consultation",
  lab_test: "Lab Test",
  prescription: "Prescription",
  vaccination: "Vaccination",
  surgery: "Surgery",
  other: "Other",
};

function getGreeting(h: number) {
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}

function getGreetingIcon(h: number) {
  if (h >= 5 && h < 12) return "sunny-outline";
  if (h >= 12 && h < 17) return "partly-sunny-outline";
  if (h >= 17 && h < 21) return "moon-outline";
  return "moon-outline";
}

function daysUntilExpiry(date: string) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function TimelineScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [trends, setTrends] = useState<TrendsSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchData = async () => {
    try {
      const [visitsRes, trendsRes] = await Promise.all([
        apiClient.get("/api/visits"),
        apiClient.get("/api/trends/summary").catch(() => ({ data: [] })),
      ]);
      setVisits(visitsRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const thisMonth = visits.filter((v) => {
    const d = new Date(v.visitDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const uniqueHospitals = new Set(visits.map((v) => v.hospitalId?._id)).size;

  const latestVisit = visits[0];
  const latestInsight = latestVisit?.extractedFields?.plainLanguageSummary;
  const latestDiagnosis = latestVisit?.extractedFields?.diagnosis;
  const latestMedication = latestVisit?.extractedFields?.medication;

  const abnormalTests = trends.filter((t) => t.statusType !== "normal").slice(0, 3);
  const normalTests = trends.filter((t) => t.statusType === "normal").slice(0, 3);

  const recentVisits = visits.slice(0, 5);

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={
        <View style={styles.container}>
          {/* Header */}
          <ScreenHeader title="HealthLog" />

          {/* Greeting Card */}
          <View style={[styles.greetingCard, shadow.sm]}>
            <View style={styles.greetingAccentTop} />
            <View style={styles.greetingCardRow}>
              <View style={styles.greetingLeft}>
                <View style={styles.greetingIconRow}>
                  <Ionicons
                    name={getGreetingIcon(now.getHours()) as any}
                    size={15}
                    color={brand.textOnBrand}
                  />
                  <Text style={styles.greeting}>{getGreeting(now.getHours())}</Text>
                </View>
                <Text style={styles.userName}>{firstName}</Text>
                <Text style={styles.greetingDate}>
                  {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
                <View style={styles.greetingStatusRow}>
                  <Ionicons name="pulse" size={14} color={brand.textOnBrand} />
                  <Text style={styles.greetingStatus}>
                    {visits.length > 0 ? "Here's your health overview" : "Start tracking your health"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.avatarWrap}>
                {user?.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {user?.name ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U"}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarEdit}>
                  <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, shadow.sm]}>
              <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{visits.length}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={[styles.statCard, shadow.sm]}>
              <View style={[styles.statIcon, { backgroundColor: colors.accentHospitalBg }]}>
                <Ionicons name="business" size={20} color={colors.accentHospital} />
              </View>
              <Text style={styles.statValue}>{uniqueHospitals}</Text>
              <Text style={styles.statLabel}>Hospitals</Text>
            </View>
            <View style={[styles.statCard, shadow.sm]}>
              <View style={[styles.statIcon, { backgroundColor: colors.statusProcessingBg }]}>
                <Ionicons name="calendar" size={20} color={colors.statusProcessing} />
              </View>
              <Text style={styles.statValue}>{thisMonth.length}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          {/* AI Insights */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={18} color={colors.primary} />
                <Text style={styles.sectionTitle}>AI Health Insights</Text>
              </View>
              <Text style={styles.sectionDate}>Latest</Text>
            </View>

            {visits.length === 0 ? (
              <TouchableOpacity
                style={[styles.insightEmpty, shadow.sm]}
                onPress={() => navigation.navigate("AddReport")}
                activeOpacity={0.7}
              >
                <View style={styles.insightEmptyIcon}>
                  <Ionicons name="sparkles" size={22} color={colors.primary} />
                </View>
                <View style={styles.insightEmptyContent}>
                  <Text style={styles.insightEmptyTitle}>Personalized insights coming soon</Text>
                  <Text style={styles.insightEmptyText}>
                    Add your first report and our AI will summarize your diagnosis, medication and test results here.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </TouchableOpacity>
            ) : !latestDiagnosis && !latestMedication && abnormalTests.length === 0 ? (
              <View style={[styles.insightProcessing, shadow.sm]}>
                <View style={styles.insightProcessingIcon}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
                <View style={styles.insightEmptyContent}>
                  <Text style={styles.insightEmptyTitle}>Analyzing your report</Text>
                  <Text style={styles.insightEmptyText}>
                    AI is processing your latest report. Check back shortly for your health summary.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={[styles.insightCard, shadow.sm]}>
                  {latestDiagnosis && (
                    <View style={styles.insightRow}>
                      <View style={[styles.insightDot, { backgroundColor: colors.statusError }]} />
                      <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>Diagnosis</Text>
                        <Text style={styles.insightValue} numberOfLines={2}>{latestDiagnosis}</Text>
                      </View>
                    </View>
                  )}

                  {latestDiagnosis && latestMedication && <View style={styles.insightDivider} />}

                  {latestMedication && (
                    <View style={styles.insightRow}>
                      <View style={[styles.insightDot, { backgroundColor: colors.statusReady }]} />
                      <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>Medication</Text>
                        <Text style={styles.insightValue} numberOfLines={2}>{latestMedication}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {abnormalTests.length > 0 && (
                  <View style={[styles.alertCard, shadow.sm]}>
                    <View style={styles.alertHeader}>
                      <Ionicons name="warning" size={16} color={colors.statusError} />
                      <Text style={styles.alertTitle}>Needs Attention</Text>
                    </View>
                    {abnormalTests.map((test, i) => (
                      <View key={i} style={styles.alertRow}>
                        <Text style={styles.alertTestName}>{test.testName}</Text>
                        <View style={styles.alertValueRow}>
                          <Text style={[styles.alertValue, { color: test.statusType === "high" ? colors.statusError : colors.statusProcessing }]}>
                            {test.value} {test.unit}
                          </Text>
                          <View style={[styles.alertBadge, { backgroundColor: test.statusType === "high" ? colors.statusErrorBg : colors.statusProcessingBg }]}>
                            <Text style={[styles.alertBadgeText, { color: test.statusType === "high" ? colors.statusError : colors.statusProcessing }]}>
                              {test.statusLabel}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {abnormalTests.length === 0 && normalTests.length > 0 && (
                  <View style={[styles.okCard, shadow.sm]}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.statusReady} />
                    <Text style={styles.okText}>
                      All {normalTests.length} tracked tests are within normal range
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.actionCard, shadow.sm]}
                onPress={() => navigation.navigate("AddReport")}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="add-circle" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Add Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionCard, shadow.sm]}
                onPress={() => navigation.navigate("Trends")}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.accentHospitalBg }]}>
                  <Ionicons name="analytics" size={24} color={colors.accentHospital} />
                </View>
                <Text style={styles.actionLabel}>View Trends</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionCard, shadow.sm]}
                onPress={() => navigation.navigate("CareCircle")}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.accentCareBg }]}>
                  <Ionicons name="people" size={24} color={colors.accentCare} />
                </View>
                <Text style={styles.actionLabel}>Care Circle</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Reports */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              {visits.length > 5 && (
                <TouchableOpacity onPress={() => navigation.navigate("Hospitals")}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              )}
            </View>

            {recentVisits.length === 0 ? (
              <TouchableOpacity
                style={[styles.emptyCard, shadow.sm]}
                onPress={() => navigation.navigate("AddReport")}
              >
                <Ionicons name="document-text-outline" size={40} color={colors.border} />
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptySubtitle}>Add your first hospital report to start tracking</Text>
                <View style={styles.emptyButton}>
                  <Ionicons name="add" size={16} color={colors.primary} />
                  <Text style={styles.emptyButtonText}>Add First Report</Text>
                </View>
              </TouchableOpacity>
            ) : (
              recentVisits.map((visit) => {
                const tagStyle = TAG_COLORS[visit.tag] || TAG_COLORS.other;
                return (
                  <TouchableOpacity
                    key={visit._id}
                    style={[styles.visitCard, shadow.sm]}
                    onPress={() => navigation.navigate("VisitDetail", { visitId: visit._id })}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.visitIcon, { backgroundColor: tagStyle.bg }]}>
                      <Ionicons name={tagStyle.icon as any} size={20} color={tagStyle.text} />
                    </View>
                    <View style={styles.visitContent}>
                      <View style={styles.visitTop}>
                        <Text style={styles.visitHospital} numberOfLines={1}>
                          {visit.hospitalId?.name || "Unknown Hospital"}
                        </Text>
                        <View style={[
                          styles.statusBadge,
                          visit.status === "ready" && styles.statusReady,
                          visit.status === "processing" && styles.statusProcessing,
                        ]}>
                          <View style={[
                            styles.statusDot,
                            visit.status === "ready" && styles.dotReady,
                            visit.status === "processing" && styles.dotProcessing,
                          ]} />
                          <Text style={[
                            styles.statusText,
                            visit.status === "ready" && styles.textReady,
                            visit.status === "processing" && styles.textProcessing,
                          ]}>
                            {visit.status === "ready" ? "Ready" : "Processing"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.visitMeta}>
                        {new Date(visit.visitDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                        {visit.doctorName ? ` · ${visit.doctorName}` : ""}
                      </Text>
                      <View style={styles.visitTag}>
                        <Text style={[styles.visitTagText, { color: tagStyle.text, backgroundColor: tagStyle.bg }]}>
                          {tagLabels[visit.tag] || "Other"}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.border} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      }
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  greetingCard: {
    backgroundColor: brand.primary,
    borderRadius: radius.card,
    padding: spacing.md,
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  greetingAccentTop: {
    position: "absolute", top: -40, right: -20,
    width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)",
  },
  greetingCardRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  },
  greetingLeft: { flex: 1, paddingRight: spacing.md },
  greetingIconRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs,
  },
  greeting: {
    ...typography.caption, color: brand.textOnBrand, textTransform: "uppercase",
    letterSpacing: 1, fontWeight: "600",
  },
  userName: { ...typography.heading, color: colors.textInverse, marginTop: 2 },
  greetingDate: { ...typography.body, color: brand.textOnBrand, marginTop: 2 },
  greetingStatusRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm,
  },
  greetingStatus: { ...typography.caption, color: brand.textOnBrand, flexShrink: 1 },
  avatarWrap: { position: "relative" },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: colors.textInverse },
  avatarPlaceholder: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.textInverse,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitials: { fontSize: 22, fontWeight: "700", color: brand.primary },
  avatarEdit: {
    position: "absolute", bottom: -4, right: -4,
    width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: brand.primary,
  },
  insightEmptyIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  insightEmptyContent: { flex: 1, gap: 2 },
  insightEmptyTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  insightEmptyText: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
  insightEmpty: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  insightProcessing: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  insightProcessingIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },

  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  statIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.heading, fontSize: 28, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  section: { marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  sectionTitle: { ...typography.subheading, color: colors.textPrimary },
  sectionDate: { ...typography.caption, color: colors.textSecondary },

  insightCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  insightRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  insightContent: { flex: 1 },
  insightLabel: { ...typography.caption, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  insightValue: { ...typography.body, color: colors.textPrimary, marginTop: 2, lineHeight: 22 },
  insightDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },

  alertCard: {
    backgroundColor: colors.statusErrorBg, borderRadius: radius.card, padding: spacing.md,
    marginTop: spacing.sm, borderWidth: 1, borderColor: colors.statusErrorBg,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
  alertTitle: { ...typography.label, color: colors.statusError },
  alertRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.xs,
  },
  alertTestName: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1 },
  alertValueRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  alertValue: { ...typography.bodyMedium, fontWeight: "700" },
  alertBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  alertBadgeText: { ...typography.caption, fontWeight: "600" },

  okCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.statusReadyBg, borderRadius: radius.card, padding: spacing.md,
    marginTop: spacing.sm, borderWidth: 1, borderColor: colors.statusReadyBg,
  },
  okText: { ...typography.bodyMedium, color: colors.statusReady, flex: 1 },

  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center",
    marginBottom: spacing.sm,
  },
  actionLabel: { ...typography.caption, color: colors.textPrimary, fontWeight: "600", textAlign: "center" },

  viewAll: { ...typography.label, color: colors.primary },

  emptyCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl,
    alignItems: "center", borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
  },
  emptyTitle: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: spacing.md },
  emptySubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center" },
  emptyButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    marginTop: spacing.md, backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
  },
  emptyButtonText: { ...typography.label, color: colors.primary },

  visitCard: {
    flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
    alignItems: "center",
  },
  visitIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center",
    marginRight: spacing.md,
  },
  visitContent: { flex: 1 },
  visitTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  visitHospital: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  visitMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  visitTag: { flexDirection: "row", marginTop: spacing.xs },
  visitTagText: { ...typography.caption, fontWeight: "600", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, overflow: "hidden" },

  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
  statusReady: { backgroundColor: colors.statusReadyBg },
  statusProcessing: { backgroundColor: colors.statusProcessingBg },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotReady: { backgroundColor: colors.statusReady },
  dotProcessing: { backgroundColor: colors.statusProcessing },
  statusText: { ...typography.caption, fontWeight: "600" },
  textReady: { color: colors.statusReady },
  textProcessing: { color: colors.statusProcessing },
});
