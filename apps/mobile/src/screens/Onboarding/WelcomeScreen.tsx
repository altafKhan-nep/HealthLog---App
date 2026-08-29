import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../../theme/tokens";
import { Button } from "../../components/Button";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="heart-outline" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>HealthLog</Text>
        <Text style={styles.tagline}>Your health history, organized</Text>

        <View style={styles.hints}>
          <View style={styles.hintRow}>
            <Ionicons name="scan-outline" size={20} color={colors.primary} />
            <Text style={styles.hintText}>Scan and store medical reports</Text>
          </View>
          <View style={styles.hintRow}>
            <Ionicons name="bulb-outline" size={20} color={colors.primary} />
            <Text style={styles.hintText}>AI-powered plain language summaries</Text>
          </View>
          <View style={styles.hintRow}>
            <Ionicons name="analytics-outline" size={20} color={colors.primary} />
            <Text style={styles.hintText}>Track health trends over time</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate("Login")}
          style={styles.primaryButton}
        />
        <Button
          title="Create Account"
          onPress={() => navigation.navigate("SignUp")}
          variant="outline"
          style={styles.secondaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  hints: {
    gap: spacing.md,
    marginTop: spacing.lg,
    width: "100%",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  hintText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
