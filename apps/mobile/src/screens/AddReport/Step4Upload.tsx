import React, { useState } from "react";
import {
  View, Text, StyleSheet, Image, Alert, TouchableOpacity, ScrollView, FlatList, Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, shadow, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";

interface FileItem {
  id: string;
  uri: string;
  base64: string | null;
  name: string | null;
  type: "image" | "pdf";
  size: number;
}

let _fileId = 0;
function nextFileId() {
  return `file_${Date.now()}_${++_fileId}`;
}

export default function Step4Upload({ navigation, route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { visitData } = route.params;
  const [files, setFiles] = useState<FileItem[]>(visitData?.files || []);

  const pickImage = async (useCamera: boolean) => {
    const permMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permMethod();
    if (status !== "granted") {
      Alert.alert("Permission needed", `${useCamera ? "Camera" : "Gallery"} access is required`);
      return;
    }

    const method = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await method({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 = asset.base64 || null;
      const size = base64 ? Math.round((base64.length * 3) / 4) : 0;
      setFiles((prev) => [
        ...prev,
        {
          id: nextFileId(),
          uri: asset.uri,
          base64,
          name: null,
          type: "image",
          size,
        },
      ]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = () => {
          const base64data = (reader.result as string).split(",")[1];
          setFiles((prev) => [
            ...prev,
            {
              id: nextFileId(),
              uri: asset.uri,
              base64: base64data,
              name: asset.name,
              type: "pdf",
              size: typeof asset.size === "number" ? asset.size : base64data ? Math.round((base64data.length * 3) / 4) : 0,
            },
          ]);
        };
        reader.readAsDataURL(blob);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    setFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
      return arr;
    });
  };

  const handleNext = () => {
    navigation.navigate("Step5", {
      visitData: { ...visitData, files },
    });
  };

  return (
    <View style={styles.container}>
      <ProgressBar current={4} total={5} />
      <Text style={styles.title}>Add report files</Text>
      <Text style={styles.optional}>
        {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Optional — you can always add later"}
      </Text>

      {files.length > 0 ? (
        <ScrollView style={styles.thumbnailScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.thumbnailGrid}>
            {files.map((file, index) => (
              <View key={file.id} style={[styles.thumbnailCard, shadow.sm]}>
                <View style={styles.thumbnailHeader}>
                  <Text style={styles.thumbnailIndex}>{index + 1}</Text>
                  <TouchableOpacity onPress={() => removeFile(file.id)} style={styles.removeBtn}>
                    <Ionicons name="close-circle" size={22} color={colors.statusError} />
                  </TouchableOpacity>
                </View>
                {file.type === "pdf" ? (
                  <View style={styles.pdfThumb}>
                    <Ionicons name="document-text" size={32} color={colors.primary} />
                    <Text style={styles.pdfThumbName} numberOfLines={2}>{file.name || "PDF"}</Text>
                  </View>
                ) : (
                  <Image source={{ uri: file.uri }} style={styles.thumbnail} resizeMode="cover" />
                )}
                <View style={styles.reorderRow}>
                  <TouchableOpacity
                    onPress={() => moveFile(index, -1)}
                    disabled={index === 0}
                    style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}
                  >
                    <Ionicons name="chevron-back" size={16} color={index === 0 ? colors.border : colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.reorderLabel}>{file.type === "pdf" ? "PDF" : "Photo"}</Text>
                  <TouchableOpacity
                    onPress={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                    style={[styles.reorderBtn, index === files.length - 1 && styles.reorderBtnDisabled]}
                  >
                    <Ionicons name="chevron-forward" size={16} color={index === files.length - 1 ? colors.border : colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      <View style={styles.addSection}>
        <TouchableOpacity style={styles.addCamera} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={28} color={colors.primary} />
          <Text style={styles.addLabel}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCamera} onPress={() => pickImage(false)}>
          <Ionicons name="images-outline" size={28} color={colors.primary} />
          <Text style={styles.addLabel}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addCamera} onPress={pickDocument}>
          <Ionicons name="document-text-outline" size={28} color={colors.primary} />
          <Text style={styles.addLabel}>PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button title="Skip" onPress={handleNext} variant="ghost" />
        <Button title="Back" onPress={() => navigation.goBack()} variant="ghost" />
        <Button title="Next" onPress={handleNext} />
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { ...typography.heading, color: colors.textPrimary, marginBottom: spacing.xs },
  optional: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  thumbnailScroll: { flex: 1 },
  thumbnailGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.sm,
  },
  thumbnailCard: {
    width: 110, backgroundColor: colors.surface, borderRadius: radius.card,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  thumbnailHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.sm, paddingTop: spacing.xs,
  },
  thumbnailIndex: {
    ...typography.caption, fontWeight: "700", color: colors.primary,
    backgroundColor: colors.primaryLight, width: 20, height: 20, borderRadius: 10,
    textAlign: "center", lineHeight: 20, overflow: "hidden",
  },
  removeBtn: { padding: 0 },
  thumbnail: { width: "100%", height: 90 },
  pdfThumb: {
    width: "100%", height: 90, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  pdfThumbName: {
    ...typography.caption, color: colors.textPrimary, textAlign: "center",
    paddingHorizontal: spacing.xs, marginTop: 2,
  },
  reorderRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
  },
  reorderBtn: {
    width: 24, height: 24, alignItems: "center", justifyContent: "center",
    borderRadius: radius.sm, backgroundColor: colors.primaryLight,
  },
  reorderBtnDisabled: { backgroundColor: colors.divider },
  reorderLabel: { ...typography.caption, color: colors.textSecondary },
  addSection: {
    flexDirection: "row", justifyContent: "center", gap: spacing.md,
    paddingVertical: spacing.md,
  },
  addCamera: {
    width: 80, height: 80, borderRadius: radius.card, backgroundColor: colors.surface,
    borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary,
    alignItems: "center", justifyContent: "center", gap: spacing.xs,
  },
  addLabel: { ...typography.caption, color: colors.primary, fontWeight: "600" },
  footer: { gap: spacing.sm },
});
