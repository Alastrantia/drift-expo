import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { Appearance } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AudioSync } from '../src/components/AudioSync';
import { useDrift } from '../src/lib/store';

SplashScreen.preventAutoHideAsync();

// Drift is a night app: always dark, whatever the phone is set to.
// (app.json's userInterfaceStyle is ignored by Expo Go, so force it at runtime.)
Appearance.setColorScheme('dark');

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: '#000000', card: '#000000' } };

export default function RootLayout() {
  const hydrated = useDrift((s) => s.hydrated);
  const onboarded = useDrift((s) => s.onboarded);

  // Hold the splash until persisted state is known, so there's never a flash of the intro.
  useEffect(() => {
    console.log('Drift: root layout, hydrated =', hydrated, 'onboarded =', onboarded);
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated, onboarded]);

  // Never hang on a blank screen if storage is slow or unavailable.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!useDrift.getState().hydrated) {
        console.warn('Drift: storage restore timed out, continuing with defaults');
        useDrift.setState({ hydrated: true });
      }
    }, 2000);
    return () => clearTimeout(id);
  }, []);

  if (!hydrated) return null;

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <AudioSync />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
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
    </ThemeProvider>
  );
}
