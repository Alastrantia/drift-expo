import { Stack } from 'expo-router';

export default function TabStack() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
      }}
    />
  );
}
