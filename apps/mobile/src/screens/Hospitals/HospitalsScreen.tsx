import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, shadow, radius } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { EmptyState } from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../../components/Avatar";
import { ScreenHeader } from "../../components/ScreenHeader";

interface Hospital {
  _id: string;
  name: string;
  location: string;
  type: string;
  visitCount: number;
  lastVisitDate: string;
}

const HOSPITAL_ICONS: Record<string, string> = {
  hospital: "medical-outline",
  clinic: "fitness-outline",
};

export default function HospitalsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [visitedHospitals, setVisitedHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hospitalVisits, setHospitalVisits] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchVisitedHospitals();
    }, [])
  );

  const fetchVisitedHospitals = async () => {
    try {
      const res = await apiClient.get("/api/hospitals/visited");
      setVisitedHospitals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectHospital = async (hospital: Hospital) => {
    setSelectedHospital(hospital);
    try {
      const res = await apiClient.get(`/api/hospitals/${hospital._id}/visits`);
      setHospitalVisits(res.data.visits);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedHospital) {
    const groupedByMonth: Record<string, any[]> = {};
    hospitalVisits.forEach((visit: any) => {
      const date = new Date(visit.visitDate);
      const monthKey = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groupedByMonth[monthKey]) groupedByMonth[monthKey] = [];
      groupedByMonth[monthKey].push(visit);
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedHospital(null); setHospitalVisits([]); }}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedHospital.name}</Text>
            {selectedHospital.location ? (
              <Text style={styles.headerSubtitle}>{selectedHospital.location}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.recordsCount}>{selectedHospital.visitCount} Records</Text>
          </View>
        </View>

        {hospitalVisits.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No visits at this hospital"
            message="Add a report from this hospital to see it here"
          />
        ) : (
          <FlatList
            data={Object.keys(groupedByMonth)}
            keyExtractor={(month) => month}
            contentContainerStyle={styles.list}
            renderItem={({ item: month }) => (
              <View style={styles.monthSection}>
                <Text style={styles.monthHeader}>{month}</Text>
                {groupedByMonth[month].map((item: any) => {
                  const tagLabels: Record<string, string> = {
                    consultation: "Consultation",
                    lab_test: "Lab Test",
                    prescription: "Prescription",
                    vaccination: "Vaccination",
                    surgery: "Surgery",
                    other: "Other",
                  };
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[styles.visitCard, shadow.sm]}
                      onPress={() => navigation.navigate("VisitDetail", { visitId: item._id })}
                    >
                      <View style={styles.visitIconContainer}>
                        <Ionicons name="medical-outline" size={20} color={colors.textInverse} />
                      </View>
                      <View style={styles.visitContent}>
                        <Text style={styles.visitDoctorName}>{item.doctorName || "Unknown Provider"}</Text>
                        <Text style={styles.visitTag}>{tagLabels[item.tag] || item.tag}</Text>
                        <View style={styles.visitDateBadge}>
                          <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                          <Text style={styles.visitDateText}>
                            {new Date(item.visitDate).toLocaleDateString("en-US", {
                              month: "short", day: "numeric",
                            })} - {new Date(item.visitDate).toLocaleTimeString("en-US", {
                              hour: "numeric", minute: "2-digit",
                            })}
                          </Text>
                        </View>
                        {item.extractedFields?.plainLanguageSummary && (
                          <Text style={styles.visitDescription} numberOfLines={2}>
                            {item.extractedFields.plainLanguageSummary}
                          </Text>
                        )}
                        <View style={styles.chipRow}>
                          <View style={[styles.chip, styles.chipCompleted]}>
                            <Ionicons name="checkmark-circle-outline" size={14} color={colors.statusReady} />
                            <Text style={[styles.chipText, { color: colors.statusReady }]}>Completed</Text>
                          </View>
                          {item.extractedFields?.testResults?.length > 0 && (
                            <View style={[styles.chip, styles.chipNotes]}>
                              <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                              <Text style={[styles.chipText, { color: colors.primary }]}>Results Available</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Hospitals" />

      <TouchableOpacity style={[styles.findProviderCard, shadow.sm]}>
        <View style={styles.findProviderContent}>
          <Text style={styles.findProviderTitle}>Find Provider</Text>
          <Text style={styles.findProviderDesc}>Browse connected healthcare facilities.</Text>
        </View>
        <View style={styles.findProviderIcon}>
          <Ionicons name="search" size={24} color={colors.textInverse} />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {visitedHospitals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="business-outline" size={48} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No hospitals yet</Text>
            <Text style={styles.emptyMessage}>
              Your visited hospitals will appear here once you add your first report
            </Text>
            <TouchableOpacity
              style={[styles.addButton, shadow.sm]}
              onPress={() => navigation.navigate("AddReport")}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.textInverse} />
              <Text style={styles.addButtonText}>Add Your First Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          visitedHospitals.map((item) => {
            const icon = HOSPITAL_ICONS[item.type] || "business-outline";
            return (
              <TouchableOpacity key={item._id} style={[styles.card, shadow.sm]} onPress={() => selectHospital(item)}>
                <View style={styles.cardIcon}>
                  <Ionicons name={icon as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardMeta}>
                    <View style={[styles.metaDot, { backgroundColor: colors.primary }]} />
                    {` ${item.visitCount} Record${item.visitCount !== 1 ? "s" : ""} Stored`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerCenter: { flex: 1, marginHorizontal: spacing.md },
  headerRight: {},
  headerTitle: { ...typography.heading, color: colors.textPrimary },
  headerSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  title: { ...typography.heading, color: colors.textPrimary },
  recordsCount: { ...typography.label, color: colors.primary },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
  },
  findProviderCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  findProviderContent: { flex: 1 },
  findProviderTitle: { ...typography.subheading, color: colors.textPrimary },
  findProviderDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  findProviderIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  scrollContent: { paddingBottom: spacing.xxl },
  list: { paddingBottom: spacing.xl },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginRight: spacing.md,
  },
  cardContent: { flex: 1 },
  cardName: { ...typography.bodyMedium, color: colors.textPrimary },
  cardMeta: {
    ...typography.caption, color: colors.textSecondary, marginTop: 4,
    flexDirection: "row", alignItems: "center",
  },
  metaDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  monthSection: { marginBottom: spacing.md },
  monthHeader: {
    ...typography.label, color: colors.textSecondary, textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: spacing.sm, paddingHorizontal: spacing.xs,
  },
  visitCard: {
    flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.card,
    padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border,
  },
  visitIconContainer: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginRight: spacing.md,
  },
  visitContent: { flex: 1 },
  visitDoctorName: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: "600" },
  visitTag: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  visitDateBadge: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs,
    backgroundColor: colors.divider, paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, alignSelf: "flex-start",
  },
  visitDateText: { ...typography.caption, color: colors.textSecondary, fontSize: 11 },
  visitDescription: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 18 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full,
  },
  chipCompleted: { backgroundColor: colors.statusReadyBg },
  chipNotes: { backgroundColor: colors.primaryLight },
  chipText: { ...typography.caption, fontWeight: "500" },
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
  emptyContainer: {
    alignItems: "center", justifyContent: "center", paddingTop: spacing.xxl * 2,
  },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.lg,
  },
  emptyTitle: { ...typography.subheading, color: colors.textPrimary, marginBottom: spacing.sm },
  emptyMessage: {
    ...typography.body, color: colors.textSecondary, textAlign: "center",
    marginBottom: spacing.lg, paddingHorizontal: spacing.xl,
  },
  addButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.card, padding: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  addButtonText: { ...typography.button, color: colors.textInverse },
});
