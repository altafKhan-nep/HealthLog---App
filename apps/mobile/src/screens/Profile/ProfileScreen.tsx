import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, typography, radius, shadow, ThemeColors } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/Button";

interface UserProfile {
  name: string;
  email: string;
  profilePicture: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut, updateUser } = useAuth();
  const { colors } = useTheme();
  const { mode, setMode } = useTheme();
  const styles = makeStyles(colors);
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    profilePicture: user?.profilePicture || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    emergencyContact: { name: "", phone: "", relationship: "" },
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBloodType, setShowBloodType] = useState(false);
  const [showGender, setShowGender] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/api/user/profile");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await apiClient.put("/api/user/profile", {
        name: profile.name,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth || null,
        gender: profile.gender,
        bloodType: profile.bloodType,
        emergencyContact: profile.emergencyContact,
      });
      setProfile(res.data);
      updateUser({ name: res.data.name, profilePicture: res.data.profilePicture });
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadPicture(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your camera");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      uploadPicture(result.assets[0].uri);
    }
  };

  const uploadPicture = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const mimeType = uri.endsWith(".png") ? "image/png" : "image/jpeg";
        const res = await apiClient.post("/api/user/profile/picture", {
          imageBase64: base64,
          mimeType,
        });
        setProfile((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
        updateUser({ profilePicture: res.data.profilePicture });
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      Alert.alert("Error", "Failed to upload picture");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text style={styles.editButton}>{editing ? "Cancel" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={editing ? pickImage : undefined} style={styles.avatarContainer}>
          {profile.profilePicture ? (
            <Image source={{ uri: profile.profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {profile.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </Text>
            </View>
          )}
          {editing && (
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color={colors.textInverse} />
            </View>
          )}
        </TouchableOpacity>
        {editing && (
          <View style={styles.photoOptions}>
            <TouchableOpacity onPress={pickImage} style={styles.photoOption}>
              <Ionicons name="images-outline" size={20} color={colors.primary} />
              <Text style={styles.photoOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto} style={styles.photoOption}>
              <Ionicons name="camera-outline" size={20} color={colors.primary} />
              <Text style={styles.photoOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, shadow.sm]}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.name || "Not set"}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{profile.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Phone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.phone || "Not set"}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.dateOfBirth}
              onChangeText={(t) => setProfile((p) => ({ ...p, dateOfBirth: t }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.fieldValue}>
              {profile.dateOfBirth
                ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })
                : "Not set"}
            </Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Gender</Text>
          {editing ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowGender(!showGender)}
            >
              <Text style={profile.gender ? styles.inputText : styles.placeholderText}>
                {profile.gender || "Select gender"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.fieldValue}>{profile.gender || "Not set"}</Text>
          )}
          {showGender && editing && (
            <View style={styles.optionsList}>
              {GENDERS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.option, profile.gender === g && styles.optionSelected]}
                  onPress={() => { setProfile((p) => ({ ...p, gender: g })); setShowGender(false); }}
                >
                  <Text style={[styles.optionText, profile.gender === g && styles.optionTextSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Blood Type</Text>
          {editing ? (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowBloodType(!showBloodType)}
            >
              <Text style={profile.bloodType ? styles.inputText : styles.placeholderText}>
                {profile.bloodType || "Select blood type"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.fieldValue}>{profile.bloodType || "Not set"}</Text>
          )}
          {showBloodType && editing && (
            <View style={styles.optionsGrid}>
              {BLOOD_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt}
                  style={[styles.option, profile.bloodType === bt && styles.optionSelected]}
                  onPress={() => { setProfile((p) => ({ ...p, bloodType: bt })); setShowBloodType(false); }}
                >
                  <Text style={[styles.optionText, profile.bloodType === bt && styles.optionTextSelected]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, shadow.sm]}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Contact Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.emergencyContact.name}
              onChangeText={(t) => setProfile((p) => ({
                ...p, emergencyContact: { ...p.emergencyContact, name: t },
              }))}
              placeholder="Emergency contact name"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.emergencyContact.name || "Not set"}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Contact Phone</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.emergencyContact.phone}
              onChangeText={(t) => setProfile((p) => ({
                ...p, emergencyContact: { ...p.emergencyContact, phone: t },
              }))}
              keyboardType="phone-pad"
              placeholder="Emergency contact phone"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.emergencyContact.phone || "Not set"}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Relationship</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={profile.emergencyContact.relationship}
              onChangeText={(t) => setProfile((p) => ({
                ...p, emergencyContact: { ...p.emergencyContact, relationship: t },
              }))}
              placeholder="e.g. Spouse, Parent, Child"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={styles.fieldValue}>{profile.emergencyContact.relationship || "Not set"}</Text>
          )}
        </View>
      </View>

      <View style={[styles.section, shadow.sm]}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Text style={styles.appearanceSub}>Choose how HealthLog looks</Text>
        <View style={styles.themeOptions}>
          {[
            { key: "light", label: "Light", icon: "sunny-outline" },
            { key: "dark", label: "Dark", icon: "moon-outline" },
            { key: "system", label: "Follow Device", icon: "phone-portrait-outline" },
            { key: "auto", label: "Auto by Time", icon: "time-outline" },
          ].map((opt) => {
            const active = mode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.themeOption, active && styles.themeOptionActive]}
                onPress={() => setMode(opt.key as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon as any}
                  size={20}
                  color={active ? colors.textInverse : colors.textSecondary}
                />
                <Text style={[styles.themeOptionText, active && styles.themeOptionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {mode === "system" && (
          <Text style={styles.appearanceHint}>Follows your device's light / dark setting</Text>
        )}
        {mode === "auto" && (
          <Text style={styles.appearanceHint}>Light after sunrise (6 AM), dark after sunset (8 PM)</Text>
        )}
      </View>

      {editing && (
        <Button
          title={saving ? "Saving..." : "Save Profile"}
          onPress={saveProfile}
          disabled={saving}
          style={styles.saveButton}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.statusError} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>HealthLog v1.0.0</Text>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: spacing.lg, paddingTop: Platform.OS === "ios" ? spacing.xxl : spacing.md,
  },
  headerTitle: { ...typography.heading, color: colors.textPrimary },
  editButton: { ...typography.bodyMedium, color: colors.primary },
  avatarSection: { alignItems: "center", marginBottom: spacing.lg },
  avatarContainer: { position: "relative" },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.primaryDark,
  },
  avatarInitials: { fontSize: 36, fontWeight: "700", color: colors.textInverse },
  cameraIcon: {
    position: "absolute", bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.surface,
  },
  photoOptions: {
    flexDirection: "row", gap: spacing.lg, marginTop: spacing.md,
  },
  photoOption: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight, borderRadius: radius.sm,
  },
  photoOptionText: { ...typography.bodyMedium, color: colors.primary },
  section: {
    backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.label, color: colors.textSecondary, marginBottom: spacing.md,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  field: {
    marginBottom: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  fieldLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  fieldValue: { ...typography.bodyMedium, color: colors.textPrimary },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    padding: 12, fontSize: 16, color: colors.textPrimary, backgroundColor: colors.background,
  },
  inputText: { fontSize: 16, color: colors.textPrimary },
  placeholderText: { fontSize: 16, color: colors.textSecondary },
  optionsList: { marginTop: spacing.sm, gap: spacing.xs },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  option: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { ...typography.bodyMedium, color: colors.textPrimary },
  optionTextSelected: { color: colors.textInverse },
  saveButton: { marginTop: spacing.md },
  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, padding: spacing.md, marginTop: spacing.lg,
    backgroundColor: colors.statusErrorBg, borderRadius: radius.card,
    borderWidth: 1, borderColor: colors.statusError,
  },
  logoutText: { ...typography.bodyMedium, color: colors.statusError, fontWeight: "600" },
  version: {
    ...typography.caption, color: colors.textSecondary, textAlign: "center",
    marginTop: spacing.xl,
  },
  appearanceSub: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  themeOptions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  themeOption: {
    flexGrow: 1, flexBasis: "45%", alignItems: "center", gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.card, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.background,
  },
  themeOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  themeOptionText: { ...typography.label, color: colors.textSecondary },
  themeOptionTextActive: { color: colors.textInverse },
  appearanceHint: {
    ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm, textAlign: "center",
  },
});
