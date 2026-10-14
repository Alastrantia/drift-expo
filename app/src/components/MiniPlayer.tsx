import { router } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { sceneById } from '../lib/scenes';
import { useDrift } from '../lib/store';
import { formatClock, radius, semantic, space, type, usePalette } from '../lib/theme';
import { useNow } from '../lib/useNow';
import { ArtTile } from './ArtTile';
import { Icon } from './ui';

export function MiniPlayer() {
  const placement = NativeTabs.BottomAccessory.usePlacement();
  const p = usePalette();
  const scene = sceneById(useDrift((s) => s.currentId));
  const playing = useDrift((s) => s.playing);
  const toggle = useDrift((s) => s.toggle);
  const endsAt = useDrift((s) => s.timerEndsAt);
  const now = useNow(playing && !!endsAt);
  const inline = placement === 'inline';

  const status = !playing ? 'Paused' : endsAt ? `Sleep in ${formatClock((endsAt - now) / 1000)}` : scene.subtitle;

  return (
    <Pressable style={styles.row} onPress={() => router.push('/player')} accessibilityLabel={`Open player, ${scene.name}`}>
      <ArtTile scene={scene} rounded={radius.tile * 0.75} style={styles.art} strokeWidth={1} />
      <View style={{ flex: 1 }}>
        <Text style={[type.subhead, { fontWeight: '600', color: semantic.label }]} numberOfLines={1}>
          {scene.name}
        </Text>
        {!inline ? (
          <Text style={[type.footnote, { color: semantic.secondaryLabel, fontVariant: ['tabular-nums'] }]} numberOfLines={1}>
            {status}
          </Text>
        ) : null}
      </View>
      <Pressable
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Pause' : 'Play'}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggle();
        }}
        style={styles.button}
      >
        <Icon name={playing ? 'pause.fill' : 'play.fill'} size={20} color={playing ? p.label : p.accent} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space(1.5), paddingHorizontal: space(1.5) },
  art: { width: 32, height: 32 },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
