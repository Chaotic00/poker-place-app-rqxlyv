
import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme, Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    // Don't do anything while navigation is not ready or auth is loading
    if (!navigationState?.key || loading) {
      console.log('Navigation guard: Waiting...', { 
        navigationReady: !!navigationState?.key, 
        authLoading: loading 
      });
      return;
    }

    const currentPath = segments.join('/');
    const inAuthGroup = segments[0] === '(tabs)';
    const onAuthScreen = segments[0] === 'welcome' || segments[0] === 'login' || segments[0] === 'request-access';
    const onAdminScreen = segments[0] === 'admin';
    const onTournamentDetails = segments[0] === 'tournament-details';
    
    console.log('=== NAVIGATION GUARD CHECK ===');
    console.log('Current path:', currentPath);
    console.log('User authenticated:', !!user);
    console.log('In auth group (tabs):', inAuthGroup);
    console.log('On auth screen:', onAuthScreen);
    console.log('On admin screen:', onAdminScreen);
    console.log('On tournament details:', onTournamentDetails);

    // If user is not authenticated and trying to access protected routes
    if (!user && (inAuthGroup || onAdminScreen || onTournamentDetails)) {
      console.log('❌ Redirecting to welcome - user not authenticated');
      router.replace('/welcome');
      return;
    }

    // If user is authenticated and on auth screens, redirect to home
    if (user && onAuthScreen) {
      console.log('✅ Redirecting to home - user authenticated on auth screen');
      router.replace('/(tabs)/(home)');
      return;
    }

    console.log('✓ Navigation guard passed');
  }, [user, segments, navigationState, loading]);

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="request-access" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="tournament-details"
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="admin/user-approvals"
        options={{
          presentation: "modal",
          title: "User Approvals",
        }}
      />
      <Stack.Screen
        name="admin/tournament-management"
        options={{
          presentation: "modal",
          title: "Tournament Management",
        }}
      />
      <Stack.Screen
        name="admin/create-tournament"
        options={{
          presentation: "modal",
          title: "Create Tournament",
        }}
      />
      <Stack.Screen
        name="admin/edit-tournament"
        options={{
          presentation: "modal",
          title: "Edit Tournament",
        }}
      />
      <Stack.Screen
        name="admin/rsvp-viewer"
        options={{
          presentation: "modal",
          title: "RSVP Viewer",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "🔌 You are offline",
        "You can keep using the app! Your changes will be saved locally and synced when you are back online."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!loaded) {
    return null;
  }

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: "rgb(33, 150, 243)",
      background: "rgb(245, 245, 245)",
      card: "rgb(255, 255, 255)",
      text: "rgb(51, 51, 51)",
      border: "rgb(224, 224, 224)",
      notification: "rgb(255, 59, 48)",
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: "rgb(33, 150, 243)",
      background: "rgb(18, 18, 18)",
      card: "rgb(28, 28, 30)",
      text: "rgb(255, 255, 255)",
      border: "rgb(44, 44, 46)",
      notification: "rgb(255, 69, 58)",
    },
  };

  return (
    <>
      <StatusBar style="auto" animated />
      <ThemeProvider
        value={colorScheme === "dark" ? CustomDarkTheme : CustomDefaultTheme}
      >
        <AuthProvider>
          <WidgetProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
              <SystemBars style={"auto"} />
            </GestureHandlerRootView>
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
