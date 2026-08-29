import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View, TouchableOpacity, Text, Image, Linking } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import WelcomeScreen from "../screens/Onboarding/WelcomeScreen";
import LoginScreen from "../screens/Onboarding/LoginScreen";
import SignUpScreen from "../screens/Onboarding/SignUpScreen";
import TimelineScreen from "../screens/Home/TimelineScreen";
import HospitalsScreen from "../screens/Hospitals/HospitalsScreen";
import TrendsScreen from "../screens/Trends/TrendsScreen";
import CareCircleScreen from "../screens/CareCircle/CareCircleScreen";
import Step1SelectHospital from "../screens/AddReport/Step1SelectHospital";
import Step2Doctor from "../screens/AddReport/Step2Doctor";
import Step3Date from "../screens/AddReport/Step3Date";
import Step4Upload from "../screens/AddReport/Step4Upload";
import Step5Confirm from "../screens/AddReport/Step5Confirm";
import VisitDetailScreen from "../screens/VisitDetail/VisitDetailScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import SharedReportScreen from "../screens/SharedReport/SharedReportScreen";
import ReportViewerScreen from "../screens/ReportViewer/ReportViewerScreen";

const OnboardingStack = createNativeStackNavigator();
const AddReportStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.3,
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Hospitals":
              iconName = focused ? "business" : "business-outline";
              break;
            case "Trends":
              iconName = focused ? "analytics" : "analytics-outline";
              break;
            case "CareCircle":
              iconName = focused ? "people" : "people-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={TimelineScreen} />
      <Tabs.Screen name="Hospitals" component={HospitalsScreen} />
      <Tabs.Screen name="Trends" component={TrendsScreen} />
      <Tabs.Screen name="CareCircle" component={CareCircleScreen} options={{ title: "Care Circle" }} />
    </Tabs.Navigator>
  );
}

function AddReportFlow() {
  const { colors } = useTheme();
  return (
    <AddReportStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <AddReportStack.Screen name="Step1" component={Step1SelectHospital} options={{ title: "Select Hospital" }} />
      <AddReportStack.Screen name="Step2" component={Step2Doctor} options={{ title: "Doctor" }} />
      <AddReportStack.Screen name="Step3" component={Step3Date} options={{ title: "Date" }} />
      <AddReportStack.Screen name="Step4" component={Step4Upload} options={{ title: "Upload" }} />
      <AddReportStack.Screen name="Step5" component={Step5Confirm} options={{ title: "Confirm" }} />
    </AddReportStack.Navigator>
  );
}

function OnboardingFlow() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="Login" component={LoginScreen} />
      <OnboardingStack.Screen name="SignUp" component={SignUpScreen} />
    </OnboardingStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const { colors } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const prevToken = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(token);
  tokenRef.current = token;

  // Parse incoming URLs: healthlog://share/... or https://<host>/share/...
  const handleDeepLink = useRef((url: string) => {
    const nav = navigationRef.current;
    if (!nav) return;
    let path = url;
    const scheme = url.split("://")[0]?.toLowerCase();
    if (scheme !== "healthlog" && scheme !== "http" && scheme !== "https") return;
    // For http(s), extract path after the host
    if (scheme === "http" || scheme === "https") {
      try {
        const u = new URL(url);
        path = u.pathname + (u.pathname.endsWith("/") ? "" : "");
      } catch {
        return;
      }
    } else {
      path = url.slice("healthlog://".length);
    }

    if (path.startsWith("/")) path = path.slice(1);

    const reportMatch = path.match(/^share\/report\/([^/?#]+)/);
    if (reportMatch) {
      nav.navigate("SharedReport", { token: reportMatch[1] });
      return;
    }
    const circleMatch = path.match(/^share\/circle\/([^/?#]+)/);
    if (circleMatch) {
      // Joining still requires auth — open app if logged in, else go to onboarding
      nav.navigate(tokenRef.current ? "Main" : "Onboarding");
    }
  }).current;

  useEffect(() => {
    const sub = Linking.addEventListener("url", ({ url }) => handleDeepLink(url));
    return () => sub.remove();
  }, [handleDeepLink]);

  useEffect(() => {
    if (isLoading) return;
    try {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink(url);
      });
    } catch {}
  }, [isLoading, handleDeepLink]);

  useEffect(() => {
    if (isLoading) return;
    const nav = navigationRef.current;
    if (!nav) return;

    if (prevToken.current === null && token) {
      nav.reset({ index: 0, routes: [{ name: "Main" }] });
    } else if (prevToken.current && !token) {
      nav.reset({ index: 0, routes: [{ name: "Onboarding" }] });
    }
    prevToken.current = token;
  }, [token, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={token ? "Main" : "Onboarding"}
      >
        <RootStack.Screen name="Onboarding" component={OnboardingFlow} />
        <RootStack.Screen name="Main" component={MainTabs} />
        <RootStack.Screen
          name="AddReport"
          component={AddReportFlow}
          options={{ presentation: "modal" }}
        />
        <RootStack.Screen
          name="VisitDetail"
          component={VisitDetailScreen}
          options={{
            headerShown: true,
            title: "Visit Detail",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
          }}
        />
        <RootStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="SharedReport"
          component={SharedReportScreen}
          options={{
            headerShown: true,
            title: "Shared Report",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
          }}
        />
        <RootStack.Screen
          name="ReportViewer"
          component={ReportViewerScreen}
          options={{
            headerShown: false,
            presentation: "fullScreenModal",
            animation: "fade",
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
