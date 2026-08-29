import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../../theme/tokens";
import { apiClient } from "../../api/client";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";

export default function Step2Doctor({ navigation, route }: any) {
  const { visitData } = route.params;
  const [doctors, setDoctors] = useState<string[]>([]);
  const [selected, setSelected] = useState(visitData?.doctorName || "");
  const [customDoctor, setCustomDoctor] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/api/hospitals/${visitData.hospitalId}/doctors`);
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [visitData.hospitalId]);

  const filtered = doctors.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  const displayDoctor = selected || customDoctor;

  const handleNext = () => {
    navigation.navigate("Step3", {
      visitData: { ...visitData, doctorName: displayDoctor },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressBar current={2} total={5} />
      <Text style={styles.title}>Which doctor did you see?</Text>
      <Text style={styles.optional}>(optional)</Text>

      <View style={styles.searchRow}>
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Type doctor name..."
          placeholderTextColor={colors.textSecondary}
          value={selected ? selected : customDoctor}
          onChangeText={(text) => {
            setSelected("");
            setCustomDoctor(text);
            setSearch(text);
          }}
        />
        {(selected || customDoctor) ? (
          <TouchableOpacity onPress={() => { setSelected(""); setCustomDoctor(""); setSearch(""); }}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {filtered.length > 0 && (
        <Text style={styles.sectionTitle}>Previously visited doctors:</Text>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, selected === item && styles.chipSelected]}
            onPress={() => {
              if (selected === item) {
                setSelected("");
              } else {
                setSelected(item);
                setCustomDoctor("");
              }
            }}
          >
            <Ionicons
              name={selected === item ? "checkmark-circle" : "person-outline"}
              size={18}
              color={selected === item ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.chipText, selected === item && styles.chipTextSelected]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Button title="Skip" onPress={handleNext} variant="ghost" />
        <Button title="Next" onPress={handleNext} disabled={!displayDoctor.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.xs },
  optional: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  list: { paddingBottom: spacing.md },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipText: { ...typography.body, color: colors.textPrimary },
  chipTextSelected: { color: colors.primary, fontWeight: "600" },
  footer: { marginTop: "auto", gap: spacing.sm },
});
