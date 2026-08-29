import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Animated,
  Linking, StatusBar, Alert, ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, radius, ThemeColors } from "../../theme/tokens";
import { useTheme } from "../../context/ThemeContext";
import { apiClient } from "../../api/client";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Attachment {
  _id?: string;
  fileUrl: string;
  fileType: string;
  name?: string;
  size?: number;
  createdAt?: string;
  cloudinaryPublicId?: string;
  index?: number;
  _index?: number;
}

export default function ReportViewerScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const { attachments, initialIndex = 0, visitId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [localAttachments, setLocalAttachments] = useState<Attachment[]>(attachments);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleDelete = useCallback(
    (item: Attachment) => {
      if (!visitId || typeof item.index !== "number") return;
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
                await apiClient.delete(`/api/visits/${visitId}/attachments/${item.index}`);
                const next = localAttachments.filter((a) => a._index !== item._index);
                setLocalAttachments(next);
                if (next.length === 0) {
                  navigation.goBack();
                } else if (currentIndex >= next.length) {
                  setCurrentIndex(Math.max(0, next.length - 1));
                }
              } catch (err: any) {
                Alert.alert("Error", err.response?.data?.error || "Failed to delete document");
              }
            },
          },
        ]
      );
    },
    [visitId, localAttachments, currentIndex, navigation]
  );

  const filename = (item: Attachment) =>
    item.name || (item.fileType?.includes("pdf") ? "PDF Document" : "Report Image");

  const formatFileSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const renderItem = ({ item, index }: { item: Attachment; index: number }) => {
    const isPDF = item.fileType?.includes("pdf");

    // Embed PDF via Google Docs viewer (public URL, works without native build)
    const pdfSrc = encodeURIComponent(item.fileUrl);
    const HTML = `<!DOCTYPE html><html><head>
      <style>html,body{margin:0;padding:0;height:100%;width:100%;overflow:hidden;background:#fff;}
      iframe{width:100%;height:100%;border:0;}</style></head>
      <body><iframe src="https://docs.google.com/viewer?url=${pdfSrc}&embedded=true"></iframe></body></html>`;

    return (
      <View style={styles.page}>
        {isPDF ? (
          <View style={styles.pdfContainer}>
            <View style={styles.reportCard}>
              <View style={styles.reportCardHeader}>
                <View style={styles.reportIconWrap}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                </View>
                <View style={styles.reportTitleWrap}>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {filename(item)}
                  </Text>
                  <Text style={styles.reportSubtitle}>{isPDF ? "PDF document" : "Image"}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDelete({ ...item, index })}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={22} color={colors.statusError} />
                </TouchableOpacity>
              </View>
              <View style={styles.reportMetaRow}>
                <View style={styles.reportMetaItem}>
                  <Ionicons name="document-outline" size={14} color={colors.textInverse} />
                  <Text style={styles.reportMetaText}>{formatFileSize(item.size)}</Text>
                </View>
                <View style={styles.reportMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textInverse} />
                  <Text style={styles.reportMetaText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </View>
            <WebView
              source={{ html: HTML }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              style={styles.webview}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.pdfLoading}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.pdfLoadingText}>Loading PDF…</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.pdfOpenBrowser}
              onPress={() => Linking.openURL(item.fileUrl)}
            >
              <Ionicons name="open-outline" size={16} color={colors.primary} />
              <Text style={styles.pdfOpenBrowserText}>Open PDF in browser</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ZoomableImage uri={item.fileUrl} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentIndex + 1} / {localAttachments.length}
        </Text>
        <View style={styles.closeBtn} />
      </View>

      {/* Swiper */}
      <FlatList
        ref={flatListRef}
        data={localAttachments.map((a, i) => ({ ...a, _index: i }))}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item._index}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
      />

      {/* Dots */}
      {localAttachments.length > 1 && (
        <View style={styles.dots}>
          {localAttachments.map((_: any, i: number) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ZoomableImage({ uri }: { uri: string }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const scale = useRef(new Animated.Value(1)).current;
  const lastTap = useRef(0);
  const isZoomed = useRef(false);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const target = isZoomed.current ? 1 : 2.5;
      isZoomed.current = !isZoomed.current;
      Animated.spring(scale, { toValue: target, useNativeDriver: true }).start();
    }
    lastTap.current = now;
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={styles.zoomContainer}>
      <Animated.Image
        source={{ uri }}
        style={[styles.zoomImage, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBackground },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, paddingTop: spacing.xxl + spacing.sm, paddingBottom: spacing.sm,
  },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...typography.bodyMedium, color: colors.darkText, fontWeight: "600" },
  page: { width: SCREEN_W, height: SCREEN_H, alignItems: "center", justifyContent: "center" },
  zoomContainer: { flex: 1, width: SCREEN_W, alignItems: "center", justifyContent: "center" },
  zoomImage: { width: SCREEN_W, height: SCREEN_H * 0.75 },
  pdfContainer: { flex: 1, width: SCREEN_W, padding: spacing.sm, gap: spacing.sm },
  reportCard: {
    backgroundColor: colors.darkSurface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.darkBorder,
    padding: spacing.md,
    gap: spacing.md,
  },
  reportCardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  reportIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: colors.darkSurfaceAlt,
    alignItems: "center", justifyContent: "center",
  },
  reportTitleWrap: { flex: 1 },
  reportTitle: { ...typography.bodyMedium, color: colors.darkText, fontWeight: "600" },
  reportSubtitle: { ...typography.caption, color: colors.darkTextSecondary },
  reportMetaRow: { flexDirection: "row", gap: spacing.lg },
  reportMetaItem: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  reportMetaText: { ...typography.caption, color: colors.darkText },
  deleteBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  webview: { flex: 1, backgroundColor: colors.darkSurfaceAlt, borderRadius: radius.card },
  pdfLoading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  pdfLoadingText: { ...typography.caption, color: colors.darkTextSecondary },
  pdfOpenBrowser: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pdfOpenBrowserText: { ...typography.button, color: colors.primary },
  dots: {
    flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.lg,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.darkTextMuted },
  dotActive: { backgroundColor: colors.darkText, width: 24 },
});
