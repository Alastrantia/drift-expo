import Slider from '@react-native-community/slider';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ArtTile } from '../../../src/components/ArtTile';
import { GlassIconButton, Icon, PlayPill } from '../../../src/components/ui';
import { sceneById } from '../../../src/lib/scenes';
import { levelsFor, useDrift } from '../../../src/lib/store';
import { radius, space, type, usePalette } from '../../../src/lib/theme';

const WHITE = '#FFFFFF';
const WHITE_2 = 'rgba(255,255,255,0.75)';

export default function SceneDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scene = sceneById(id);
  const p = usePalette();
  const { height } = useWindowDimensions();
  const playing = useDrift((s) => s.playing && s.currentId === scene.id);
  const levels = useDrift(useShallow((s) => levelsFor(s.levels, scene.id)));
  const favorite = useDrift((s) => s.favorites.includes(scene.id));
  const { play, pause, setLevel, saveMix, toggleFavorite } = useDrift.getState();

  const onSave = () =>
    Alert.prompt(
      'Save mix',
      'Name this blend of layers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (name?: string) => {
            if (useDrift.getState().currentId !== scene.id) useDrift.setState({ currentId: scene.id });
            saveMix(name?.trim() || `${scene.name} mix`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
      'plain-text',
      `My ${scene.name}`,
    );

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          title: '',
          headerLargeTitle: false,
          headerRight: () => (
            <Pressable onPress={() => toggleFavorite(scene.id)} hitSlop={8} accessibilityLabel={favorite ? 'Remove favorite' : 'Add favorite'} style={styles.headerButton}>
              <Icon name={favorite ? 'heart.fill' : 'heart'} size={20} color={favorite ? p.accent : WHITE} />
            </Pressable>
          ),
        }}
      />
      <ArtTile scene={scene} animated rounded={0} style={StyleSheet.absoluteFill} />
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingBottom: space(16) }}>
        <View style={{ height: height * 0.5 }} />
        <View style={styles.titleBlock}>
          <Text style={[type.display, styles.shadowed, { color: WHITE }]}>{scene.name}</Text>
          <Text style={[type.body, styles.shadowed, { color: WHITE_2 }]}>{scene.subtitle}</Text>
          <GlassContainer spacing={12} style={styles.controls}>
            <PlayPill playing={playing} onPress={() => (playing ? pause() : play(scene.id))} />
            <GlassIconButton name="timer" label="Sleep timer" size={52} onPress={() => router.push('/timer')} />
            <GlassIconButton name="square.and.arrow.down" label="Save mix" size={52} onPress={onSave} />
          </GlassContainer>
        </View>

        <GlassView style={styles.panel}>
          <Text style={[type.footnote, styles.panelLabel]}>LAYERS</Text>
          {scene.layers.map((layer, i) => (
            <View key={layer.layer + i} style={styles.layerRow}>
              <View style={styles.layerHeader}>
                <Text style={[type.body, { color: WHITE }]}>{layer.label}</Text>
                <Text style={[type.subhead, { color: WHITE_2, fontVariant: ['tabular-nums'] }]}>{Math.round((levels[i] ?? 0) * 100)}%</Text>
              </View>
              <Slider
                value={levels[i] ?? 0}
                onValueChange={(v) => setLevel(scene.id, i, v)}
                minimumTrackTintColor={p.accent}
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                accessibilityLabel={`${layer.label} level`}
              />
            </View>
          ))}
        </GlassView>

        <GlassView style={styles.panel}>
          <Text style={[type.footnote, styles.panelLabel]}>ABOUT</Text>
          <Text style={[type.body, { color: WHITE, lineHeight: 24 }]} selectable>
            {scene.description}
          </Text>
        </GlassView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  titleBlock: { paddingHorizontal: space(2.5), gap: space(0.5), marginBottom: space(3) },
  shadowed: { textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 12, textShadowOffset: { width: 0, height: 1 } },
  controls: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), marginTop: space(2) },
  headerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  panel: { marginHorizontal: space(2), marginBottom: space(2), padding: space(2), gap: space(1.5), borderRadius: radius.card },
  panelLabel: { color: WHITE_2, letterSpacing: 0.6, fontWeight: '600' },
  layerRow: { gap: space(0.5) },
  layerHeader: { flexDirection: 'row', justifyContent: 'space-between' },
});
