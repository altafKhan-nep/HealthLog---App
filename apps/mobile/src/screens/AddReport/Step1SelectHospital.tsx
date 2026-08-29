import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Input } from "../../components/Input";

interface Hospital {
  _id: string;
  name: string;
  location: string;
  type: string;
}

export default function Step1SelectHospital({ navigation, route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { visitData } = route.params || {};
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedId, setSelectedId] = useState(visitData?.hospitalId || null);
  const [search, setSearch] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await apiClient.get("/api/hospitals");
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addNewHospital = async () => {
    if (!newName.trim()) return;
    try {
      const res = await apiClient.post("/api/hospitals", {
        name: newName.trim(),
        location: newLocation.trim(),
      });
      setHospitals([res.data, ...hospitals]);
      setSelectedId(res.data._id);
      setShowAddNew(false);
      setNewName("");
      setNewLocation("");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to add hospital");
    }
  };

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  const selectedHospital = hospitals.find((h) => h._id === selectedId);

  const handleNext = () => {
    if (!selectedId) return;
    navigation.navigate("Step2", {
      visitData: { ...visitData, hospitalId: selectedId, hospitalName: selectedHospital?.name },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressBar current={1} total={5} />
      <Text style={styles.title}>Which hospital or clinic?</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hospitals..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.hospitalRow,
              selectedId === item._id && styles.hospitalRowSelected,
            ]}
            onPress={() => setSelectedId(item._id)}
            activeOpacity={0.7}
          >
            <View style={styles.hospitalIcon}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.hospitalInfo}>
              <Text style={styles.hospitalName}>{item.name}</Text>
              {item.location ? (
                <Text style={styles.hospitalLocation}>{item.location}</Text>
              ) : null}
            </View>
            {selectedId === item._id && (
              <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          showAddNew ? (
            <View style={styles.addNewForm}>
              <Input
                label="Hospital Name"
                placeholder="Enter name"
                value={newName}
                onChangeText={setNewName}
              />
              <Input
                label="Location (optional)"
                placeholder="City or address"
                value={newLocation}
                onChangeText={setNewLocation}
              />
              <View style={styles.addNewButtons}>
                <Button title="Add" onPress={addNewHospital} style={styles.addBtn} />
                <Button
                  title="Cancel"
                  onPress={() => setShowAddNew(false)}
                  variant="ghost"
                  style={styles.cancelBtn}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addRow}
              onPress={() => setShowAddNew(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              <Text style={styles.addText}>Add a new hospital or clinic</Text>
            </TouchableOpacity>
          )
        }
      />

      <Button
        title="Next"
        onPress={handleNext}
        disabled={!selectedId}
        style={styles.nextButton}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
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
  list: {
    paddingBottom: spacing.md,
  },
  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hospitalRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  hospitalLocation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  addText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  addNewForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  addNewButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  addBtn: {
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
  },
  nextButton: {
    marginTop: "auto",
  },
});
