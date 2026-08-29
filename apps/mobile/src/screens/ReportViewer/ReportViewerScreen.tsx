import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Animated,
  Linking, StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radius } from "../../theme/tokens";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Attachment {
  fileUrl: string;
  fileType: string;
}

export default function ReportViewerScreen({ navigation, route }: any) {
  const { attachments, initialIndex = 0 } = route.params;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const openPDF = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: Attachment }) => {
    const isPDF = item.fileType?.includes("pdf");

    if (isPDF) {
      return (
        <View style={styles.page}>
          <View style={styles.pdfContainer}>
            <View style={styles.pdfCard}>
              <Ionicons name="document-text" size={64} color={colors.primary} />
              <Text style={styles.pdfTitle}>PDF Document</Text>
              <Text style={styles.pdfSubtitle}>Tap to open in browser</Text>
              <TouchableOpacity style={styles.pdfOpenBtn} onPress={() => openPDF(item.fileUrl)}>
                <Ionicons name="open-outline" size={20} color={colors.textInverse} />
                <Text style={styles.pdfOpenText}>Open PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.page}>
        <ZoomableImage uri={item.fileUrl} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentIndex + 1} / {attachments.length}
        </Text>
        <View style={styles.closeBtn} />
      </View>

      {/* Swiper */}
      <FlatList
        ref={flatListRef}
        data={attachments}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
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
      {attachments.length > 1 && (
        <View style={styles.dots}>
          {attachments.map((_: any, i: number) => (
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
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleDoubleTap}
      style={styles.zoomContainer}
    >
      <Animated.Image
        source={{ uri }}
        style={[styles.zoomImage, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.md, paddingTop: spacing.xxl + spacing.sm, paddingBottom: spacing.sm,
  },
  closeBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { ...typography.bodyMedium, color: "#fff", fontWeight: "600" },
  page: { width: SCREEN_W, height: SCREEN_H, alignItems: "center", justifyContent: "center" },
  zoomContainer: { flex: 1, width: SCREEN_W, alignItems: "center", justifyContent: "center" },
  zoomImage: { width: SCREEN_W, height: SCREEN_H * 0.75 },
  pdfContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  pdfCard: {
    backgroundColor: "#1a1a1a", borderRadius: radius.lg, padding: spacing.xl,
    alignItems: "center", gap: spacing.md, width: 260,
  },
  pdfTitle: { ...typography.subheading, color: "#fff", textAlign: "center" },
  pdfSubtitle: { ...typography.caption, color: "#999", textAlign: "center" },
  pdfOpenBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: radius.full, marginTop: spacing.sm,
  },
  pdfOpenText: { ...typography.button, color: colors.textInverse },
  dots: {
    flexDirection: "row", justifyContent: "center", gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#555" },
  dotActive: { backgroundColor: "#fff", width: 24 },
});
