import { Platform, Alert } from "react-native";

export async function copyToClipboard(text: string) {
  if (Platform.OS === "web") {
    try {
      await navigator.clipboard.writeText(text);
      Alert.alert("Copied", "Copied to clipboard");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      Alert.alert("Copied", "Copied to clipboard");
    }
  } else {
    const { Clipboard } = require("react-native");
    Clipboard.setString(text);
    Alert.alert("Copied", "Copied to clipboard");
  }
}

export async function shareContent(message: string) {
  if (Platform.OS === "web") {
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: show the message in an alert
      Alert.alert("Share", message);
    }
  } else {
    const { Share } = require("react-native");
    await Share.share({ message });
  }
}
