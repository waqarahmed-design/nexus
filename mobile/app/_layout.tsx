import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useFonts, JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { AppProvider } from '@/contexts/AppContext';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ JetBrainsMono_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>

        {/*
         * Auth screens — fade reveal instead of a push slide.
         * Going from login → dashboard feels like an unveiling, not navigation.
         */}
        <Stack.Screen
          name="(auth)"
          options={{
            animation: 'fade',
            animationDuration: 300,
          }}
        />

        {/*
         * Tab shell — same fade so the dashboard appears as a reveal
         * when auth completes, matching the (auth) exit.
         */}
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
            animationDuration: 300,
          }}
        />

        {/*
         * Asset detail — transparentModal keeps the dashboard rendered
         * underneath. The detail screen's own entrance animation (fade+scale
         * from 0.97) makes the card appear to expand out of the list.
         * gestureEnabled is left at its default (true) so swipe-back works.
         */}
        <Stack.Screen
          name="asset/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            animationDuration: 200,
          }}
        />

        {/*
         * Exchange detail — same treatment as asset detail.
         * Source exchange card stays visible underneath while the detail
         * fades+scales in over it.
         */}
        <Stack.Screen
          name="exchange/[id]"
          options={{
            presentation: 'transparentModal',
            animation: 'fade',
            animationDuration: 200,
          }}
        />

        {/*
         * Add exchange — pushed as a standard screen from the tab navigator.
         * Treated as a destination, not a task overlay.
         */}
        <Stack.Screen
          name="add-exchange"
          options={{
            animation: 'slide_from_right',
          }}
        />

      </Stack>
    </AppProvider>
  );
}
