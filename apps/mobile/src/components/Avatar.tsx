import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, radius, typography } from "../theme/tokens";

interface AvatarProps {
  name: string;
  size?: number;
  isYou?: boolean;
  imageUri?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const bgColors = ["#1B7A8C", "#7C5CBF", "#C9483C", "#2E9E5B", "#D89B2A"];

export function Avatar({ name, size = 48, isYou = false, imageUri }: AvatarProps) {
  const bgColor = bgColors[name.length % bgColors.length];

  return (
    <View style={styles.wrapper}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={[
            styles.avatar,
            styles.imageAvatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bgColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
        </View>
      )}
      <Text style={styles.label} numberOfLines={1}>
        {isYou ? "You" : name.split(" ")[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  imageAvatar: {
    overflow: "hidden",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    maxWidth: 56,
  },
});
