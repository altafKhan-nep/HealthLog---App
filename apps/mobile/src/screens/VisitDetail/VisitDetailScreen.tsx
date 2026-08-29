import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { spacing, typography, shadow, radius, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";
import { Button } from "../../components/Button";
import { Badge } from "../../components/Badge";
import { copyToClipboard, shareContent } from "../../utils/platform";

interface VisitDetail {
  _id: string;
  hospitalId: { name: string; location: string };
  visitDate: string;
  doctorName: string;
  tag: string;
  status: string;
  attachments: Array<{ fileUrl: string; fileType: string; name?: string; size?: number; createdAt?: string }>;
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

function renderSummary(summary: string) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const lines = summary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[•\-\*]\s*/, ""));

  if (lines.length <= 1 && !summary.includes("•")) {
    return <Text style={styles.summaryText}>{summary}</Text>;
  }

  return (
    <View style={styles.summaryList}>
      {lines.map((line, i) => (
        <View key={i} style={styles.summaryBulletRow}>
          <View style={styles.summaryBulletDot} />
          <Text style={styles.summaryText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null) return "Size unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function VisitDetailScreen({ route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation<any>();
  const { visitId } = route.params;
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(1440); // 24h default
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [doctorDraft, setDoctorDraft] = useState("");
  const [savingDoctor, setSavingDoctor] = useState(false);

  const fetchVisit = async () => {
    try {
      const res = await apiClient.get(`/api/visits/${visitId}`);
      setVisit(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitId]);

  const deleteAttachment = async (index: number) => {
    Alert.alert(
      "Delete this report?",
      "Are you sure you want to delete this document? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/api/visits/${visitId}/attachments/${index}`);
              await fetchVisit();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.error || "Failed to delete document");
            }
          },
        },
      ]
    );
  };

  const deleteVisit = () => {
    Alert.alert(
      "Delete this visit?",
      "Are you sure you want to delete this visit and all its documents? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/api/visits/${visitId}`);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.error || "Failed to delete visit");
            }
          },
        },
      ]
    );
  };

  const saveDoctor = async () => {
    if (!doctorDraft.trim()) return;
    setSavingDoctor(true);
    try {
      await apiClient.put(`/api/visits/${visitId}`, { doctorName: doctorDraft.trim() });
      await fetchVisit();
      setEditingDoctor(false);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to update doctor");
    } finally {
      setSavingDoctor(false);
    }
  };

  const generateShareLink = async () => {
    setShareLoading(true);
    try {
      const res = await apiClient.post("/api/share-links/visit", {
        visitId,
        expiresInMinutes: expiryMinutes,
      });
      setShareLink(res.data.shareUrl);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to create share link");
    } finally {
      setShareLoading(false);
    }
  };

  const formatExpiry = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    if (mins < 1440) return `${mins / 60}h`;
    return `${mins / 1440}d`;
  };

  const copyLink = () => {
    if (shareLink) {
      copyToClipboard(shareLink);
    }
  };

  const shareLinkNative = async () => {
    if (shareLink) {
      await shareContent(
        `View this health report: ${shareLink}\n\nThis link expires in ${formatExpiry(expiryMinutes)} and can only be viewed once.`
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!visit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Visit not found</Text>
      </View>
    );
  }

  const statusVariant = visit.status === "ready" ? "ready" : visit.status === "processing" ? "processing" : "error";
  const tagLabels: Record<string, string> = {
    consultation: "Consultation",
    lab_test: "Lab Test",
    prescription: "Prescription",
    vaccination: "Vaccination",
    surgery: "Surgery",
    other: "Other",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
          <Badge
            variant={statusVariant}
            label={visit.status === "ready" ? "Reviewed" : visit.status === "processing" ? "Processing" : "Failed"}
          />
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tagLabels[visit.tag] || visit.tag}</Text>
          </View>
        </View>

        {editingDoctor ? (
          <View style={styles.doctorEditRow}>
            <TextInput
              style={styles.doctorInput}
              value={doctorDraft}
              onChangeText={setDoctorDraft}
              placeholder="Doctor name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <TouchableOpacity style={styles.doctorSaveBtn} onPress={saveDoctor} disabled={savingDoctor}>
              {savingDoctor ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.doctorSaveText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.doctorCancelBtn} onPress={() => setEditingDoctor(false)}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.doctorRow}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.doctorText} numberOfLines={1}>
              {visit.doctorName || "Unknown Provider"}
            </Text>
            <TouchableOpacity
              style={styles.doctorEditBtn}
              onPress={() => {
                setDoctorDraft(visit.doctorName || "");
                setEditingDoctor(true);
              }}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {visit.extractedFields?.plainLanguageSummary && (
        <View style={[styles.section, styles.summaryCard]}>
          <Text style={styles.sectionTitle}>What this report means</Text>
          {renderSummary(visit.extractedFields.plainLanguageSummary)}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Attached Documents</Text>
            <Text style={styles.attachmentCount}>{visit.attachments.length} file{visit.attachments.length > 1 ? "s" : ""}</Text>
          </View>
          <View style={styles.attachmentList}>
            {visit.attachments.map((att, i) => {
              const isPDF = att.fileType?.includes("pdf");
              const attName = att.name || (isPDF ? `PDF ${i + 1}` : `Image ${i + 1}`);
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.attachmentRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("ReportViewer", {
                      attachments: visit.attachments,
                      initialIndex: i,
                      visitId,
                    })
                  }
                >
                  {isPDF ? (
                    <View style={styles.attIconWrap}>
                      <Ionicons name="document-text" size={24} color={colors.primary} />
                    </View>
                  ) : (
                    <Image source={{ uri: att.fileUrl }} style={styles.attThumb} resizeMode="cover" />
                  )}
                  <View style={styles.attInfo}>
                    <Text style={styles.attName} numberOfLines={1}>
                      {attName}
                    </Text>
                    <Text style={styles.attMeta} numberOfLines={1}>
                      {isPDF ? "PDF document" : "Image"} · {formatFileSize(att.size)} · {formatDate(att.createdAt)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.attDelete}
                    onPress={() => deleteAttachment(i)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.statusError} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
          {visit.attachments.length > 1 && (
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() =>
                navigation.navigate("ReportViewer", {
                  attachments: visit.attachments,
                  initialIndex: 0,
                  visitId,
                })
              }
            >
              <Ionicons name="expand-outline" size={16} color={colors.primary} />
              <Text style={styles.viewAllText}>
                View all {visit.attachments.length} files in full screen
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => {
          setShareLink(null);
          setShareModalVisible(true);
        }}
      >
        <Ionicons name="share-outline" size={20} color={colors.primary} />
        <Text style={styles.shareText}>Share this report</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteVisitBtn} onPress={deleteVisit}>
        <Ionicons name="trash-outline" size={20} color={colors.statusError} />
        <Text style={styles.deleteVisitText}>Delete visit</Text>
      </TouchableOpacity>

      <Modal visible={shareModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShareModalVisible(false)}>
          <Pressable style={[styles.modalContent, shadow.lg]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
              <Text style={styles.modalTitle}>Share Report</Text>
            </View>
            <Text style={styles.modalDesc}>
              Create a temporary QR code or shareable link. No lingering access.
            </Text>

            <Text style={styles.expiryLabel}>Expires in:</Text>
            <View style={styles.expiryOptions}>
              {[
                { mins: 15, label: "15m" },
                { mins: 30, label: "30m" },
                { mins: 60, label: "1h" },
                { mins: 360, label: "6h" },
                { mins: 720, label: "12h" },
                { mins: 1440, label: "24h" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.mins}
                  style={[styles.expiryBtn, expiryMinutes === opt.mins && styles.expiryBtnActive]}
                  onPress={() => { setExpiryMinutes(opt.mins); setShareLink(null); }}
                >
                  <Text style={[styles.expiryBtnText, expiryMinutes === opt.mins && styles.expiryBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {shareLink ? (
              <View style={styles.linkDisplay}>
                {/* QR Code */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrCard}>
                    <QRCode
                      value={shareLink}
                      size={180}
                      backgroundColor="#fff"
                      color="#000"
                    />
                  </View>
                  <Text style={styles.qrExpiry}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />{" "}
                    Expires in {formatExpiry(expiryMinutes)} · One-time use only
                  </Text>
                </View>

                {/* Link */}
                <View style={styles.linkBox}>
                  <Ionicons name="link-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.linkText} numberOfLines={1}>{shareLink}</Text>
                </View>

                {/* Actions */}
                <View style={styles.linkActions}>
                  <TouchableOpacity style={styles.linkActionBtn} onPress={copyLink}>
                    <Ionicons name="copy-outline" size={16} color={colors.primary} />
                    <Text style={styles.linkActionText}>Copy Link</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.linkActionBtn, styles.linkShareBtn]} onPress={shareLinkNative}>
                    <Ionicons name="share-outline" size={16} color={colors.textInverse} />
                    <Text style={[styles.linkActionText, { color: colors.textInverse }]}>Share</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.onetimeNotice}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={colors.statusError} />
                  <Text style={styles.onetimeText}>One-time use · Auto-expires · No lingering access</Text>
                </View>
              </View>
            ) : (
              <Button
                title="Generate QR Code & Link"
                onPress={generateShareLink}
                loading={shareLoading}
                style={styles.generateBtn}
              />
            )}

            <Button
              title="Done"
              onPress={() => { setShareModalVisible(false); setShareLink(null); }}
              variant="ghost"
            />
          </Pressable>
        </Pressable>
      </Modal>
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
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
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
  tagText: { ...typography.caption, fontWeight: "600", color: colors.primary, textTransform: "capitalize" },
  doctorRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm,
  },
  doctorText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  doctorEditBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  doctorEditRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm,
  },
  doctorInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: 15, color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  doctorSaveBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
  },
  doctorSaveText: { ...typography.button, color: colors.textInverse, fontSize: 13 },
  doctorCancelBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.divider,
    alignItems: "center", justifyContent: "center",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  attachmentCount: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
  attachmentList: {
    gap: spacing.sm,
  },
  attachmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + spacing.xs,
    ...shadow.sm,
  },
  attIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  attThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  attInfo: {
    flex: 1,
    gap: 2,
  },
  attName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  attMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  attDelete: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteVisitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.statusError,
  },
  deleteVisitText: {
    ...typography.button,
    color: colors.statusError,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  viewAllText: {
    ...typography.bodyMedium,
    color: colors.primary,
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
  summaryList: {
    gap: spacing.sm,
  },
  summaryBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  summaryBulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
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
  testInfo: { flex: 1 },
  testName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  testValue: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: spacing.md,
  },
  testRange: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  shareText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalTitle: { ...typography.heading, color: colors.textPrimary },
  modalDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  expiryLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm },
  expiryOptions: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.lg, flexWrap: "wrap" },
  expiryBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.border, alignItems: "center",
  },
  expiryBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  expiryBtnText: { ...typography.label, color: colors.textSecondary },
  expiryBtnTextActive: { color: colors.textInverse },
  linkDisplay: { marginBottom: spacing.lg, alignItems: "center" },
  qrContainer: { alignItems: "center", marginBottom: spacing.md },
  qrCard: {
    backgroundColor: "#fff", padding: spacing.md, borderRadius: radius.card,
    borderWidth: 2, borderColor: colors.border, marginBottom: spacing.sm,
  },
  qrExpiry: {
    ...typography.caption, color: colors.textSecondary, textAlign: "center",
  },
  linkBox: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    backgroundColor: colors.primaryLight, padding: spacing.sm,
    borderRadius: radius.sm, marginBottom: spacing.md, width: "100%",
  },
  linkText: {
    ...typography.caption, color: colors.primary, flex: 1, fontSize: 11,
  },
  linkActions: { flexDirection: "row", gap: spacing.sm, width: "100%" },
  linkActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.xs, padding: spacing.md, borderRadius: radius.card,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  linkShareBtn: { backgroundColor: colors.primary },
  linkActionText: { ...typography.button, color: colors.primary },
  onetimeNotice: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    marginTop: spacing.md, justifyContent: "center",
    backgroundColor: colors.statusErrorBg, padding: spacing.sm,
    borderRadius: radius.sm, width: "100%",
  },
  onetimeText: { ...typography.caption, color: colors.statusError, fontWeight: "600" },
  generateBtn: { marginBottom: spacing.sm },
});
