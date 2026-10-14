import Slider from '@react-native-community/slider';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { GlassContainer } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ArtTile } from '../../../src/components/ArtTile';
import { GlassIconButton, Icon, PlayPill } from '../../../src/components/ui';
import { sceneById } from '../../../src/lib/scenes';
import { useShallow } from 'zustand/react/shallow';
import { levelsFor, useDrift } from '../../../src/lib/store';
import { radius, semantic, space, type, usePalette } from '../../../src/lib/theme';

export default function SceneDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = sceneById(id);
  const p = usePalette();
  const { width } = useWindowDimensions();
  const playing = useDrift((s) => s.playing && s.currentId === scene.id);
  const levels = useDrift(useShallow((s) => levelsFor(s.levels, scene.id)));
  const favorite = useDrift((s) => s.favorites.includes(scene.id));
  const { play, pause, setLevel, saveMix, toggleFavorite } = useDrift.getState();

  const onSave = () =>
    Alert.prompt('Save mix', 'Name this blend of layers.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save',
        onPress: (name?: string) => {
          if (useDrift.getState().currentId !== scene.id) useDrift.setState({ currentId: scene.id });
          saveMix(name?.trim() || `${scene.name} mix`);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ], 'plain-text', `My ${scene.name}`);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerLargeTitle: false,
          headerRight: () => (
            <Pressable onPress={() => toggleFavorite(scene.id)} hitSlop={8} accessibilityLabel={favorite ? 'Remove favorite' : 'Add favorite'} style={styles.headerButton}>
              <Icon name={favorite ? 'heart.fill' : 'heart'} size={20} color={favorite ? p.accent : p.label} />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: space(8) }}>
        <View style={{ height: width * 1.15 }}>
          <ArtTile scene={scene} animated={playing} rounded={0} style={StyleSheet.absoluteFill} strokeWidth={1.6} />
          <View style={styles.heroBody}>
            <Text style={[type.display, { color: semantic.label }]}>{scene.name}</Text>
            <Text style={[type.subhead, { color: semantic.secondaryLabel }]}>{scene.subtitle}</Text>
            <GlassContainer spacing={12} style={styles.controls}>
              <PlayPill playing={playing} onPress={() => (playing ? pause() : play(scene.id))} />
              <GlassIconButton name="timer" label="Sleep timer" size={52} onPress={() => router.push('/timer')} />
              <GlassIconButton name="square.and.arrow.down" label="Save mix" size={52} onPress={onSave} />
            </GlassContainer>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[type.footnote, styles.groupLabel]}>LAYERS</Text>
          <View style={styles.group}>
            {scene.layers.map((layer, i) => (
              <View key={layer.layer + i} style={[styles.layerRow, i > 0 && styles.separator]}>
                <View style={styles.layerHeader}>
                  <Text style={[type.body, { color: semantic.label }]}>{layer.label}</Text>
                  <Text style={[type.subhead, { color: semantic.secondaryLabel, fontVariant: ['tabular-nums'] }]}>
                    {Math.round((levels[i] ?? 0) * 100)}%
                  </Text>
                </View>
                <Slider
                  value={levels[i] ?? 0}
                  onValueChange={(v) => setLevel(scene.id, i, v)}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor={p.accent}
                  accessibilityLabel={`${layer.label} level`}
                />
              </View>
            ))}
          </View>
          <Text style={[type.footnote, { color: semantic.secondaryLabel, paddingHorizontal: space(2) }]}>
            Changes apply instantly while playing.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[type.footnote, styles.groupLabel]}>ABOUT</Text>
          <View style={[styles.group, { padding: space(2) }]}>
            <Text style={[type.body, { color: semantic.label, lineHeight: 24 }]} selectable>
              {scene.description}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  heroBody: { flex: 1, justifyContent: 'flex-end', padding: space(2.5), gap: space(0.5) },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), marginTop: space(2) },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: space(3), gap: space(1) },
  groupLabel: { color: semantic.secondaryLabel, paddingHorizontal: space(4), letterSpacing: 0.4 },
  group: { marginHorizontal: space(2), borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, overflow: 'hidden' },
  layerRow: { paddingHorizontal: space(2), paddingVertical: space(1.5), gap: space(0.5) },
  layerHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semantic.separator },
});
