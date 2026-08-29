import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput,
  Modal, Pressable, ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, shadow, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";
import { Avatar } from "../../components/Avatar";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { copyToClipboard, shareContent } from "../../utils/platform";

interface Member {
  _id: string;
  name: string;
  email: string;
  role?: string;
  profilePicture?: string;
}

interface PendingRequest {
  _id: string;
  requesterId: { name: string; email: string; profilePicture?: string };
  role: string;
  createdAt: string;
}

interface InviteCode {
  code: string;
  shareUrl: string;
  expiresAt: string;
  expiresInDays: number;
}

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  lab_test: { bg: "#E8F4F6", text: "#1B7A8C" },
  consultation: { bg: "#F0E8F6", text: "#7B3FA0" },
  prescription: { bg: "#E8F6ED", text: "#2E7D4F" },
  vaccination: { bg: "#FDF3E0", text: "#D89B2A" },
  surgery: { bg: "#FDECEB", text: "#C9483C" },
  other: { bg: "#EDF2F4", text: "#5B6E75" },
};

const tagLabels: Record<string, string> = {
  consultation: "Consultation",
  lab_test: "Lab Test",
  prescription: "Prescription",
  vaccination: "Vaccination",
  surgery: "Surgery",
  other: "Other",
};

export default function CareCircleScreen() {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberVisits, setMemberVisits] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [codeExpiry, setCodeExpiry] = useState(7);

  useFocusEffect(
    useCallback(() => {
      fetchMembers();
      fetchPendingRequests();
    }, [])
  );

  const fetchMembers = async () => {
    try {
      const res = await apiClient.get("/api/care-circle");
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await apiClient.get("/api/care-circle/requests");
      setPendingRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateCode = async () => {
    try {
      const res = await apiClient.post("/api/care-circle/generate-code", {
        expiresInDays: codeExpiry,
      });
      setInviteCode(res.data);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to generate code");
    }
  };

  const copyCode = () => {
    if (inviteCode) {
      copyToClipboard(inviteCode.code);
    }
  };

  const shareCode = async () => {
    if (inviteCode) {
      await shareContent(
        `Join my HealthLog care circle!\n\nUse code: ${inviteCode.code}\n\nOr tap this link: ${inviteCode.shareUrl}\n\nExpires in ${inviteCode.expiresInDays} days.`
      );
    }
  };

  const joinCircle = async () => {
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      const res = await apiClient.post("/api/care-circle/join", {
        code: joinCode.trim().toUpperCase(),
      });
      setShowJoinModal(false);
      setJoinCode("");
      Alert.alert("Request Sent!", `Your request to join ${res.data.ownerName}'s care circle has been sent. You'll be notified when they respond.`);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to join");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: "approve" | "decline") => {
    try {
      await apiClient.post(`/api/care-circle/requests/${requestId}/${action}`);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (action === "approve") fetchMembers();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to process request");
    }
  };

  const removeMember = async (memberId: string) => {
    Alert.alert("Remove Member", "Are you sure you want to remove this person from your care circle?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/api/care-circle/${memberId}`);
            setMembers((prev) => prev.filter((m) => m._id !== memberId));
          } catch (err: any) {
            Alert.alert("Error", err.response?.data?.error || "Failed to remove");
          }
        },
      },
    ]);
  };

  const selectMember = async (member: Member) => {
    setSelectedMember(member);
    try {
      const res = await apiClient.get(`/api/care-circle/${member._id}/timeline`);
      setMemberVisits(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedMember) {
    return (
      <View style={styles.container}>
        <View style={styles.viewingBanner}>
          <Ionicons name="eye-outline" size={18} color={colors.primary} />
          <Text style={styles.viewingText}>Viewing: {selectedMember.name}'s health record</Text>
          <TouchableOpacity onPress={() => { setSelectedMember(null); setMemberVisits([]); }}>
            <Ionicons name="close-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={() => { setSelectedMember(null); setMemberVisits([]); }}>
            <Avatar name={user?.name || "You"} size={48} isYou />
          </TouchableOpacity>
          <View style={styles.avatarSelected}>
            <Avatar name={selectedMember.name} size={48} imageUri={selectedMember.profilePicture} />
            <View style={styles.selectedDot} />
          </View>
          {members.filter((m) => m._id !== selectedMember._id).slice(0, 3).map((m) => (
            <TouchableOpacity key={m._id} onPress={() => selectMember(m)}>
              <Avatar name={m.name} size={48} imageUri={m.profilePicture} />
            </TouchableOpacity>
          ))}
        </View>

        {memberVisits.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No reports yet"
            message={`${selectedMember.name} hasn't added any reports yet`}
          />
        ) : (
          <FlatList
            data={memberVisits}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const tagStyle = TAG_COLORS[item.tag] || TAG_COLORS.other;
              return (
                <TouchableOpacity
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
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </Text>
                    </View>
                    <Text style={styles.visitHospital}>{item.hospitalId?.name || "Unknown"}</Text>
                    {item.extractedFields?.plainLanguageSummary && (
                      <Text style={styles.visitDescription} numberOfLines={2}>
                        {item.extractedFields.plainLanguageSummary}
                      </Text>
                    )}
                    <View style={styles.chipRow}>
                      <View style={[styles.chip, { backgroundColor: colors.statusReadyBg }]}>
                        <Ionicons name="checkmark-circle-outline" size={14} color={colors.statusReady} />
                        <Text style={[styles.chipText, { color: colors.statusReady }]}>Completed</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Care Circle" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pendingRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>PENDING REQUESTS</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            </View>
            {pendingRequests.map((req) => (
              <View key={req._id} style={[styles.requestCard, shadow.sm]}>
                <Avatar name={req.requesterId.name} size={44} imageUri={req.requesterId.profilePicture} />
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{req.requesterId.name}</Text>
                  <Text style={styles.requestRole}>{req.role}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleRequest(req._id, "approve")}
                  >
                    <Ionicons name="checkmark" size={18} color={colors.statusReady} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.declineBtn]}
                    onPress={() => handleRequest(req._id, "decline")}
                  >
                    <Ionicons name="close" size={18} color={colors.statusError} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.descriptionCard, shadow.sm]}>
          <View style={styles.descriptionIcon}>
            <Ionicons name="people-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.descriptionText}>
            Manage who has access to view and update your health records.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INVITE TO YOUR CIRCLE</Text>
          {inviteCode ? (
            <View style={[styles.codeCard, shadow.sm]}>
              <View style={styles.codeHeader}>
                <Ionicons name="key-outline" size={20} color={colors.primary} />
                <Text style={styles.codeHeaderText}>Share this code</Text>
              </View>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{inviteCode.code}</Text>
              </View>
              <Text style={styles.codeExpiry}>Expires in {inviteCode.expiresInDays} days</Text>
              <View style={styles.codeActions}>
                <TouchableOpacity style={styles.codeActionBtn} onPress={copyCode}>
                  <Ionicons name="copy-outline" size={18} color={colors.primary} />
                  <Text style={styles.codeActionText}>Copy Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.codeActionBtn, styles.shareActionBtn]} onPress={shareCode}>
                  <Ionicons name="share-outline" size={18} color={colors.textInverse} />
                  <Text style={[styles.codeActionText, { color: colors.textInverse }]}>Share Link</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={generateCode} style={styles.regenerateLink}>
                <Text style={styles.regenerateText}>Generate New Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.generateCard, shadow.sm]}>
              <Text style={styles.generateDesc}>
                Generate a code to invite family members or caregivers to your circle.
              </Text>
              <Button title="Generate Invite Code" onPress={generateCode} />
            </View>
          )}
        </View>

        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE MEMBERS</Text>
            {members.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={[styles.memberCard, shadow.sm]}
                onPress={() => selectMember(item)}
              >
                <Avatar name={item.name} size={48} imageUri={item.profilePicture} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberRole}>{item.role || "Family Member"}</Text>
                </View>
                <View style={styles.memberActions}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                  <TouchableOpacity onPress={() => removeMember(item._id)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.statusError} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {members.length === 0 && pendingRequests.length === 0 && (
          <EmptyState
            icon="people-outline"
            title="No members yet"
            message="Generate an invite code and share it with family members to get started"
          />
        )}

        <TouchableOpacity style={styles.joinLink} onPress={() => setShowJoinModal(true)}>
          <Ionicons name="enter-outline" size={20} color={colors.primary} />
          <Text style={styles.joinLinkText}>Join a Care Circle</Text>
        </TouchableOpacity>

        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.securityText}>Your data is secure and encrypted.</Text>
        </View>
      </ScrollView>

      <Modal visible={showJoinModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowJoinModal(false)}>
          <Pressable style={[styles.modalContent, shadow.lg]} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Join a Care Circle</Text>
            <Text style={styles.modalDesc}>
              Enter the invite code shared with you by the circle owner.
            </Text>
            <TextInput
              style={styles.codeInput}
              placeholder="e.g. HL-AB3F7K2X"
              placeholderTextColor={colors.textSecondary}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
            />
            <View style={styles.modalButtons}>
              <Button
                title="Join Circle"
                onPress={joinCircle}
                disabled={!joinCode.trim()}
                loading={joinLoading}
                style={styles.modalJoinBtn}
              />
              <Button
                title="Cancel"
                onPress={() => { setShowJoinModal(false); setJoinCode(""); }}
                variant="ghost"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: {
    ...typography.label, color: colors.textSecondary, letterSpacing: 0.5,
  },
  badgeCount: {
    backgroundColor: colors.statusError, borderRadius: radius.full,
    width: 20, height: 20, alignItems: "center", justifyContent: "center",
  },
  badgeText: { color: colors.textInverse, fontSize: 11, fontWeight: "700" },
  requestCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  requestInfo: { flex: 1, marginLeft: spacing.sm },
  requestName: { ...typography.bodyMedium, color: colors.textPrimary },
  requestRole: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  requestActions: { flexDirection: "row", gap: spacing.xs },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  approveBtn: { backgroundColor: colors.statusReadyBg, borderColor: colors.statusReady },
  declineBtn: { backgroundColor: colors.statusErrorBg, borderColor: colors.statusError },
  descriptionCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg,
    marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  descriptionIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body, color: colors.textSecondary, textAlign: "center", lineHeight: 22,
  },
  generateCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  generateDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md, textAlign: "center" },
  codeCard: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.primary,
  },
  codeHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  codeHeaderText: { ...typography.bodyMedium, color: colors.primary },
  codeDisplay: {
    backgroundColor: colors.primaryLight, borderRadius: radius.sm, padding: spacing.md,
    alignItems: "center", marginBottom: spacing.sm,
  },
  codeText: { fontSize: 24, fontWeight: "700", color: colors.primary, letterSpacing: 2, fontFamily: "Courier" },
  codeExpiry: { ...typography.caption, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.md },
  codeActions: { flexDirection: "row", gap: spacing.sm },
  codeActionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs,
    padding: spacing.md, borderRadius: radius.card, borderWidth: 1, borderColor: colors.primary,
  },
  shareActionBtn: { backgroundColor: colors.primary },
  codeActionText: { ...typography.button, color: colors.primary },
  regenerateLink: { alignItems: "center", marginTop: spacing.md },
  regenerateText: { ...typography.caption, color: colors.textSecondary, textDecorationLine: "underline" },
  memberCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.surface,
    borderRadius: radius.card, padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  memberInfo: { flex: 1, marginLeft: spacing.sm },
  memberName: { ...typography.bodyMedium, color: colors.textPrimary },
  memberRole: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  memberActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  removeBtn: { padding: spacing.xs },
  joinLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    padding: spacing.md, marginTop: spacing.sm,
  },
  joinLinkText: { ...typography.bodyMedium, color: colors.primary },
  securityNotice: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, marginTop: spacing.lg, paddingVertical: spacing.sm,
  },
  securityText: { ...typography.caption, color: colors.textSecondary },
  list: { paddingBottom: spacing.xl },
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
  chipText: { ...typography.caption, fontWeight: "500" },
  visitHospital: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  viewingBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.primaryLight,
    padding: spacing.md, borderRadius: radius.card, marginBottom: spacing.md, marginHorizontal: spacing.md,
  },
  viewingText: { ...typography.bodyMedium, color: colors.primary, fontWeight: "500", flex: 1 },
  avatarRow: {
    flexDirection: "row", alignItems: "flex-start", gap: spacing.md,
    paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider,
    marginBottom: spacing.md, marginHorizontal: spacing.md,
  },
  avatarSelected: { position: "relative" },
  selectedDot: {
    position: "absolute", bottom: -2, left: "50%", marginLeft: -4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1, backgroundColor: colors.overlay, justifyContent: "center", alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl,
    width: "85%",
  },
  modalTitle: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.sm },
  modalDesc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  codeInput: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.sm, padding: 16,
    fontSize: 20, color: colors.textPrimary, textAlign: "center", letterSpacing: 2,
    fontFamily: "Courier", marginBottom: spacing.lg,
  },
  modalButtons: { gap: spacing.sm },
  modalJoinBtn: { marginBottom: spacing.sm },
});
