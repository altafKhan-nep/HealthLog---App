import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Modal,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadow, radius } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../../components/Avatar";
import { ScreenHeader } from "../../components/ScreenHeader";

interface Visit {
  _id: string;
  hospitalId: { _id: string; name: string; location: string };
  visitDate: string;
  doctorName: string;
  tag: string;
  status: "processing" | "ready" | "failed";
  attachments: Array<{ fileUrl: string }>;
  extractedFields?: { plainLanguageSummary?: string };
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

export default function TimelineScreen({ navigation }: any) {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterHospital, setFilterHospital] = useState<string | null>(null);

  const fetchVisits = async () => {
    try {
      const res = await apiClient.get("/api/visits");
      setVisits(res.data);
    } catch (err) {
      console.error("Failed to fetch visits:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVisits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisits();
    setRefreshing(false);
  };

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      !search ||
      v.hospitalId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.doctorName?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || v.tag === filterTag;
    const matchesHospital = !filterHospital || v.hospitalId?._id === filterHospital;
    return matchesSearch && matchesTag && matchesHospital;
  });

  const latestVisit = visits[0];
  const latestSummary = latestVisit?.extractedFields?.plainLanguageSummary;

  const groupedByMonth = filteredVisits.reduce<Record<string, Visit[]>>((acc, visit) => {
    const d = new Date(visit.visitDate);
    const key = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(visit);
    return acc;
  }, {});

  const months = Object.keys(groupedByMonth);
  const uniqueHospitals = [...new Set(visits.map((v) => `${v.hospitalId?._id}|${v.hospitalId?.name}`))].map((s) => {
    const [id, name] = s.split("|");
    return { id, name };
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={months}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            <ScreenHeader title="HealthLog" />

            {latestSummary && (
              <TouchableOpacity style={[styles.insightCard, shadow.sm]}>
                <View style={styles.insightHeader}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                  <Text style={styles.insightLabel}>LATEST INSIGHTS</Text>
                  <Text style={styles.insightDate}>Today</Text>
                </View>
                <Text style={styles.insightText} numberOfLines={3}>{latestSummary}</Text>
                <View style={styles.insightButton}>
                  <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                  <Text style={styles.insightButtonText}>Read Full Summary</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              {visits.length > 3 && (
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.viewAll}>View All →</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reports..."
                placeholderTextColor={colors.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterBtn}>
                <Ionicons name="options" size={20} color={filterTag || filterHospital ? colors.primary : colors.textSecondary} />
                {(filterTag || filterHospital) && <View style={styles.filterDot} />}
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No reports yet"
            message="Add your first hospital report to start tracking your health history"
            actionLabel="Add First Report"
            onAction={() => navigation.navigate("AddReport")}
          />
        }
        renderItem={({ item: month }) => (
          <View>
            <Text style={styles.monthHeader}>{month}</Text>
            {groupedByMonth[month].map((visit) => {
              const tagStyle = TAG_COLORS[visit.tag] || TAG_COLORS.other;
              return (
                <TouchableOpacity
                  key={visit._id}
                  style={[styles.card, shadow.sm]}
                  onPress={() => navigation.navigate("VisitDetail", { visitId: visit._id })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardIcon, { backgroundColor: tagStyle.bg }]}>
                    <Ionicons name={tagStyle.icon as any} size={20} color={tagStyle.text} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.hospitalName} numberOfLines={1}>
                        {visit.hospitalId?.name || "Unknown Hospital"}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        visit.status === "ready" && styles.statusReady,
                        visit.status === "processing" && styles.statusProcessing,
                        visit.status === "failed" && styles.statusFailed,
                      ]}>
                        <View style={[
                          styles.statusDot,
                          visit.status === "ready" && styles.dotReady,
                          visit.status === "processing" && styles.dotProcessing,
                          visit.status === "failed" && styles.dotFailed,
                        ]} />
                        <Text style={[
                          styles.statusText,
                          visit.status === "ready" && styles.textReady,
                          visit.status === "processing" && styles.textProcessing,
                          visit.status === "failed" && styles.textFailed,
                        ]}>
                          {visit.status === "ready" ? "Ready" : visit.status === "processing" ? "Processing" : "Failed"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardDate}>
                      {new Date(visit.visitDate).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                      {visit.doctorName ? ` • ${visit.doctorName}` : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.fab, shadow.lg]}
        onPress={() => navigation.navigate("AddReport")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={colors.textInverse} />
      </TouchableOpacity>

      <Modal visible={showFilter} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Reports</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>By Type</Text>
            <View style={styles.filterChips}>
              {Object.entries(tagLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, filterTag === key && styles.filterChipActive]}
                  onPress={() => setFilterTag(filterTag === key ? null : key)}
                >
                  <Text style={[styles.filterChipText, filterTag === key && styles.filterChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {uniqueHospitals.length > 0 && (
              <>
                <Text style={styles.filterLabel}>By Hospital</Text>
                <View style={styles.filterChips}>
                  {uniqueHospitals.map((h: any) => (
                    <TouchableOpacity
                      key={h.id}
                      style={[styles.filterChip, filterHospital === h.id && styles.filterChipActive]}
                      onPress={() => setFilterHospital(filterHospital === h.id ? null : h.id)}
                    >
                      <Text style={[styles.filterChipText, filterHospital === h.id && styles.filterChipTextActive]}>
                        {h.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.modalFooter}>
              <Button
                title="Clear Filters"
                onPress={() => { setFilterTag(null); setFilterHospital(null); }}
                variant="ghost"
              />
              <Button title="Apply" onPress={() => setShowFilter(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 100 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { ...typography.heading, color: colors.textPrimary },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
  },
  insightCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border,
  },
  insightHeader: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm,
  },
  insightLabel: { ...typography.label, color: colors.primary, flex: 1 },
  insightDate: { ...typography.caption, color: colors.textSecondary },
  insightText: { ...typography.body, color: colors.textPrimary, marginBottom: spacing.md, lineHeight: 22 },
  insightButton: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    backgroundColor: colors.primaryLight, padding: spacing.sm, borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  insightButtonText: { ...typography.label, color: colors.primary },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.subheading, color: colors.textPrimary },
  viewAll: { ...typography.label, color: colors.primary },
  searchRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1, paddingVertical: 12, marginLeft: spacing.sm, fontSize: 16, color: colors.textPrimary,
  },
  filterBtn: { padding: spacing.sm, position: "relative" },
  filterDot: {
    position: "absolute", top: 6, right: 6, width: 6, height: 6,
    borderRadius: 3, backgroundColor: colors.primary,
  },
  monthHeader: {
    ...typography.label, color: colors.textSecondary, marginTop: spacing.lg,
    marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5,
  },
  card: {
    flexDirection: "row", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hospitalName: { ...typography.bodyMedium, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
  statusReady: { backgroundColor: colors.statusReadyBg },
  statusProcessing: { backgroundColor: colors.statusProcessingBg },
  statusFailed: { backgroundColor: colors.statusErrorBg },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  dotReady: { backgroundColor: colors.statusReady },
  dotProcessing: { backgroundColor: colors.statusProcessing },
  dotFailed: { backgroundColor: colors.statusError },
  statusText: { ...typography.caption, fontWeight: "600" },
  textReady: { color: colors.statusReady },
  textProcessing: { color: colors.statusProcessing },
  textFailed: { color: colors.statusError },
  cardDate: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  fab: {
    position: "absolute", right: spacing.lg, bottom: spacing.lg,
    width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: spacing.lg, maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg,
  },
  modalTitle: { ...typography.subheading, color: colors.textPrimary },
  filterLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.md },
  filterChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  filterChipText: { ...typography.caption, color: colors.textSecondary },
  filterChipTextActive: { color: colors.primary, fontWeight: "600" },
  modalFooter: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
});
