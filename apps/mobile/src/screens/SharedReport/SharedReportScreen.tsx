import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, shadow, radius, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE_URL } from "../../api/client";

interface Visit {
  _id: string;
  hospitalId: { name: string; location: string };
  visitDate: string;
  doctorName: string;
  tag: string;
  status: string;
  attachments: Array<{ fileUrl: string; fileType: string }>;
  extractedFields: {
    diagnosis: string | null;
    medication: string | null;
    plainLanguageSummary: string | null;
    testResults: Array<{
      testName: string;
      value: number;
      unit: string;
      referenceRange: string;
    }>;
  };
}

const tagLabels: Record<string, string> = {
  consultation: "Consultation",
  lab_test: "Lab Test",
  prescription: "Prescription",
  vaccination: "Vaccination",
  surgery: "Surgery",
  other: "Other",
};

export default function SharedReportScreen({ route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { token } = route.params;
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedVisits();
  }, []);

  const fetchSharedVisits = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/share-links/public/${token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load report");
        return;
      }

      setVisits(data.visits || []);
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.statusError} />
        </View>
        <Text style={styles.errorTitle}>Unable to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (visits.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No visits found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
        <Text style={styles.bannerText}>Shared Health Report</Text>
      </View>

      {visits.map((visit) => (
        <View key={visit._id} style={styles.visitSection}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Ionicons name="medical-outline" size={24} color={colors.primary} />
              <Text style={styles.hospitalName}>{visit.hospitalId?.name}</Text>
            </View>
            <Text style={styles.date}>
              {new Date(visit.visitDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{tagLabels[visit.tag] || visit.tag}</Text>
              </View>
              {visit.doctorName && (
                <View style={styles.doctorBadge}>
                  <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.doctorText}>{visit.doctorName}</Text>
                </View>
              )}
            </View>
          </View>

          {visit.extractedFields?.plainLanguageSummary && (
            <View style={[styles.section, styles.summaryCard]}>
              <Text style={styles.sectionTitle}>What this report means</Text>
              <Text style={styles.summaryText}>{visit.extractedFields.plainLanguageSummary}</Text>
            </View>
          )}

          {visit.extractedFields?.testResults?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Results</Text>
              {visit.extractedFields.testResults.map((test, i) => {
                const refParts = test.referenceRange?.split("-").map(Number) || [];
                let valueColor = colors.textPrimary;
                if (refParts.length === 2 && !isNaN(refParts[0]) && !isNaN(refParts[1])) {
                  if (test.value < refParts[0]) valueColor = colors.statusProcessing;
                  else if (test.value > refParts[1]) valueColor = colors.statusError;
                  else valueColor = colors.statusReady;
                }
                return (
                  <View key={i} style={[styles.testRow, shadow.sm]}>
                    <View style={styles.testInfo}>
                      <Text style={styles.testName}>{test.testName}</Text>
                      {test.referenceRange && (
                        <Text style={styles.testRange}>Ref: {test.referenceRange} {test.unit}</Text>
                      )}
                    </View>
                    <Text style={[styles.testValue, { color: valueColor }]}>
                      {test.value} {test.unit}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {visit.extractedFields?.diagnosis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Diagnosis</Text>
              <Text style={styles.bodyText}>{visit.extractedFields.diagnosis}</Text>
            </View>
          )}

          {visit.extractedFields?.medication && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medication</Text>
              <Text style={styles.bodyText}>{visit.extractedFields.medication}</Text>
            </View>
          )}

          {visit.attachments?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Attached Documents</Text>
              {visit.attachments.map((att, i) => (
                <Image key={i} source={{ uri: att.fileUrl }} style={styles.attachment} resizeMode="cover" />
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.footerText}>This is a one-time shared report from HealthLog</Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.statusErrorBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: "600",
  },
  visitSection: {
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  hospitalName: {
    ...typography.heading,
    color: colors.textPrimary,
    flex: 1,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  tagText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "capitalize",
  },
  doctorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
  },
  doctorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.card,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  testRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  testRange: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testValue: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: spacing.md,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  attachment: {
    width: "100%",
    height: 300,
    borderRadius: radius.card,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
