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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { colors, spacing, typography, shadow, radius } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { Button } from "../../components/Button";
import { copyToClipboard, shareContent } from "../../utils/platform";

interface VisitDetail {
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

export default function VisitDetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { visitId } = route.params;
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(1440); // 24h default

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/api/visits/${visitId}`);
        setVisit(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [visitId]);

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
          <View style={[styles.statusBadge, statusVariant === "ready" && styles.statusReady]}>
            <View style={[styles.statusDot, statusVariant === "ready" && styles.dotReady]} />
            <Text style={[styles.statusText, statusVariant === "ready" && styles.textReady]}>
              {visit.status === "ready" ? "Reviewed" : "Processing"}
            </Text>
          </View>
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>{tagLabels[visit.tag] || visit.tag}</Text>
          </View>
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
              if (test.value < refParts[0]) valueColor = "#D89B2A";
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
          <TouchableOpacity
            style={styles.attachmentGrid}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ReportViewer", { attachments: visit.attachments, initialIndex: 0 })}
          >
            {visit.attachments.slice(0, 3).map((att, i) => (
              <View key={i} style={styles.thumbWrap}>
                {att.fileType?.includes("pdf") ? (
                  <View style={styles.pdfThumb}>
                    <Ionicons name="document-text" size={24} color={colors.primary} />
                    <Text style={styles.pdfThumbLabel}>PDF</Text>
                  </View>
                ) : (
                  <Image source={{ uri: att.fileUrl }} style={styles.thumb} resizeMode="cover" />
                )}
                {i === 2 && visit.attachments.length > 3 && (
                  <View style={styles.thumbOverlay}>
                    <Text style={styles.thumbOverlayText}>+{visit.attachments.length - 3}</Text>
                  </View>
                )}
              </View>
            ))}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate("ReportViewer", { attachments: visit.attachments, initialIndex: 0 })}
          >
            <Ionicons name="expand-outline" size={16} color={colors.primary} />
            <Text style={styles.viewAllText}>View all in full screen</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
  },
  statusReady: { backgroundColor: colors.statusReadyBg },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textSecondary },
  dotReady: { backgroundColor: colors.statusReady },
  statusText: { ...typography.caption, fontWeight: "600", color: colors.textSecondary },
  textReady: { color: colors.statusReady },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
  },
  tagText: { ...typography.caption, fontWeight: "600", color: colors.primary, textTransform: "capitalize" },
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
  attachmentGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: radius.sm,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  pdfThumb: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
    gap: spacing.xs,
  },
  pdfThumbLabel: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "700",
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbOverlayText: {
    ...typography.heading,
    color: "#fff",
    fontSize: 20,
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
