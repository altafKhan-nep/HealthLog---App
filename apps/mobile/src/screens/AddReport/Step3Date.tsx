import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";

export default function Step3Date({ navigation, route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { visitData } = route.params;
  const [selectedDate, setSelectedDate] = useState(
    visitData?.visitDate ? new Date(visitData.visitDate) : new Date()
  );

  const today = new Date();
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const isToday = (day: number) =>
    day === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  const isSelected = (day: number) => day === selectedDate.getDate();

  const selectDay = (day: number) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
  };

  const goToToday = () => setSelectedDate(new Date());

  const handleNext = () => {
    navigation.navigate("Step4", {
      visitData: { ...visitData, visitDate: selectedDate.toISOString() },
    });
  };

  const monthName = selectedDate.toLocaleString("default", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  return (
    <View style={styles.container}>
      <ProgressBar current={3} total={5} />
      <Text style={styles.title}>When was the visit?</Text>

      <TouchableOpacity style={styles.todayChip} onPress={goToToday}>
        <Text style={styles.todayText}>Today</Text>
      </TouchableOpacity>

      <View style={styles.calendar}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.monthName}>{monthName}</Text>
          <TouchableOpacity onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekdays}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <Text key={i} style={styles.weekday}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {blanks.map((b) => (
            <View key={`blank-${b}`} style={styles.dayCell} />
          ))}
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected(day) && styles.daySelected,
                isToday(day) && !isSelected(day) && styles.dayToday,
              ]}
              onPress={() => selectDay(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected(day) && styles.dayTextSelected,
                  isToday(day) && !isSelected(day) && styles.dayTextToday,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.selectedDate}>
        {selectedDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </Text>

      <View style={styles.footer}>
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.md },
  todayChip: {
    alignSelf: "flex-start", backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  todayText: { ...typography.bodyMedium, color: colors.primary },
  calendar: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  monthName: { ...typography.bodyMedium, color: colors.textPrimary },
  weekdays: { flexDirection: "row", marginBottom: spacing.sm },
  weekday: { flex: 1, textAlign: "center", ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  daysGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  daySelected: { backgroundColor: colors.primary, borderRadius: 20 },
  dayToday: { borderWidth: 1, borderColor: colors.primary, borderRadius: 20 },
  dayText: { ...typography.body, color: colors.textPrimary },
  dayTextSelected: { color: colors.textInverse, fontWeight: "600" },
  dayTextToday: { color: colors.primary },
  selectedDate: { ...typography.bodyMedium, color: colors.primary, textAlign: "center", marginTop: spacing.md },
  footer: { marginTop: "auto", gap: spacing.sm },
});
