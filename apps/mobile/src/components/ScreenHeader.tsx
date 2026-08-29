import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";

interface ScreenHeaderProps {
  title: string;
  showBell?: boolean;
}

export function ScreenHeader({ title, showBell = true }: ScreenHeaderProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.avatarButton}
        >
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
      {showBell && (
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: spacing.md, paddingHorizontal: spacing.md,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  avatarButton: {},
  avatarImage: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitials: { fontSize: 16, fontWeight: "600", color: colors.textInverse },
  title: { ...typography.heading, color: colors.textPrimary },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border,
  },
});
