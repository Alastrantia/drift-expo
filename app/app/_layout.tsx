import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AudioSync } from '../src/components/AudioSync';
import { useDrift } from '../src/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useDrift((s) => s.hydrated);
  const onboarded = useDrift((s) => s.onboarded);

  // Hold the splash until persisted state is known, so there's never a flash of the intro.
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <>
      <StatusBar style="auto" />
      <AudioSync />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="player" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="timer"
            options={{ presentation: 'formSheet', sheetAllowedDetents: [0.62], sheetGrabberVisible: true, sheetCornerRadius: 28 }}
          />
          <Stack.Screen
            name="mixer"
            options={{ presentation: 'formSheet', sheetAllowedDetents: [0.5, 0.9], sheetGrabberVisible: true }}
          />
          <Stack.Screen name="breathe" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        </Stack.Protected>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}
