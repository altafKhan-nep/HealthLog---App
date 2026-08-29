import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, shadow, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";

const TAGS = [
  { key: "consultation", label: "Consultation", icon: "chatbubble-ellipses-outline" as const },
  { key: "lab_test", label: "Lab Test", icon: "flask-outline" as const },
  { key: "prescription", label: "Prescription", icon: "medkit-outline" as const },
  { key: "vaccination", label: "Vaccination", icon: "shield-checkmark-outline" as const },
  { key: "surgery", label: "Surgery", icon: "medical-outline" as const },
  { key: "other", label: "Other", icon: "ellipsis-horizontal-outline" as const },
];

interface FileItem {
  id: string;
  uri: string;
  base64: string | null;
  name: string | null;
  type: "image" | "pdf";
  size: number;
}

export default function Step5Confirm({ navigation, route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { visitData } = route.params;
  const [saving, setSaving] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>(visitData?.tag || "other");
  const files: FileItem[] = visitData?.files || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Step 1: Create the visit
      const visitRes = await apiClient.post("/api/visits", {
        hospitalId: visitData.hospitalId,
        doctorName: visitData.doctorName || "",
        visitDate: visitData.visitDate,
        reason: visitData.reason || "",
        tag: selectedTag,
      });

      const visitId = visitRes.data._id;

      // Step 2: Batch upload all files
      if (files.length > 0) {
        const batchFiles = files
          .filter((f) => f.base64)
          .map((f) => ({
            imageBase64: f.base64,
            mimeType: f.type === "pdf" ? "application/pdf" : "image/jpeg",
            name: f.name || undefined,
            size: f.size || undefined,
          }));
        if (batchFiles.length > 0) {
          await apiClient.post(`/api/visits/${visitId}/attachments/batch`, { files: batchFiles });
        }
      }

      Alert.alert("Success", `${files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} uploaded. ` : ""}Report saved!`, [
        { text: "OK", onPress: () => navigation.navigate("Main") },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ProgressBar current={5} total={5} />
      <Text style={styles.title}>Review and save</Text>

      <View style={[styles.card, shadow.sm]}>
        <View style={styles.row}>
          <Ionicons name="business-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Hospital</Text>
            <Text style={styles.rowValue}>{visitData.hospitalName || "Not selected"}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Doctor</Text>
            <Text style={styles.rowValue}>{visitData.doctorName || "Not specified"}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Date</Text>
            <Text style={styles.rowValue}>
              {visitData.visitDate
                ? new Date(visitData.visitDate).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "Not selected"}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="attach-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Files</Text>
            <Text style={styles.rowValue}>
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? "s" : ""} (${files.filter((f) => f.type === "image").length} photo${files.filter((f) => f.type === "image").length !== 1 ? "s" : ""}, ${files.filter((f) => f.type === "pdf").length} PDF${files.filter((f) => f.type === "pdf").length !== 1 ? "s" : ""})`
                : "No files attached"}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Report Type</Text>
      <View style={styles.tagGrid}>
        {TAGS.map((tag) => {
          const isActive = selectedTag === tag.key;
          return (
            <TouchableOpacity
              key={tag.key}
              style={[styles.tagChip, isActive && styles.tagChipActive]}
              onPress={() => setSelectedTag(tag.key)}
            >
              <Ionicons name={tag.icon} size={18} color={isActive ? colors.textInverse : colors.primary} />
              <Text style={[styles.tagLabel, isActive && styles.tagLabelActive]}>{tag.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
        <Button title="Save Report" onPress={handleSave} loading={saving} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm, gap: spacing.md },
  rowContent: { flex: 1 },
  rowLabel: { ...typography.caption, color: colors.textSecondary },
  rowValue: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.divider },
  sectionTitle: {
    ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm,
  },
  tagGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg,
  },
  tagChip: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  tagChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  tagLabel: { ...typography.label, color: colors.primary },
  tagLabelActive: { color: colors.textInverse },
  footer: { gap: spacing.sm },
});
