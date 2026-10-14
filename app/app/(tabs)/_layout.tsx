import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { MiniPlayer } from '../../src/components/MiniPlayer';
import { usePalette } from '../../src/lib/theme';

export default function TabsLayout() {
  const p = usePalette();
  return (
    <NativeTabs minimizeBehavior="onScrollDown" tintColor={p.accent}>
      <NativeTabs.BottomAccessory>
        <MiniPlayer />
      </NativeTabs.BottomAccessory>
      <NativeTabs.Trigger name="listen">
        <NativeTabs.Trigger.Icon sf={{ default: 'waveform', selected: 'waveform' }} />
        <NativeTabs.Trigger.Label>Listen</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="sleep">
        <NativeTabs.Trigger.Icon sf={{ default: 'moon', selected: 'moon.fill' }} />
        <NativeTabs.Trigger.Label>Sleep</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
