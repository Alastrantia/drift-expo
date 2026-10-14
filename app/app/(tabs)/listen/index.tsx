import { router, Stack } from 'expo-router';
import { ActionSheetIOS, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ArtTile } from '../../../src/components/ArtTile';
import { GlassView } from 'expo-glass-effect';
import { Icon, PlayPill, PressableScale, SectionHeader } from '../../../src/components/ui';
import { SCENES, sceneById, type Scene } from '../../../src/lib/scenes';
import { useDrift, type Mix } from '../../../src/lib/store';
import { radius, semantic, space, type } from '../../../src/lib/theme';

const WHITE = '#FFFFFF';
const WHITE_2 = 'rgba(255,255,255,0.78)';

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Listen() {
  const { width } = useWindowDimensions();
  const featured = SCENES[1];
  const tile = (width - space(2) * 2 - space(1.5)) / 2;

  return (
    <>
      <Stack.Screen options={{ title: greeting() }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Hero scene={featured} />

        <View style={{ gap: space(1.5) }}>
          <SectionHeader title="Soundscapes" detail="Every sound is mixable" />
          <View style={styles.grid}>
            {SCENES.map((s) => (
              <SceneCard key={s.id} scene={s} size={tile} />
            ))}
          </View>
        </View>

        <Mixes />
      </ScrollView>
    </>
  );
}

function Hero({ scene }: { scene: Scene }) {
  const playing = useDrift((s) => s.playing && s.currentId === scene.id);
  const play = useDrift((s) => s.play);
  const pause = useDrift((s) => s.pause);
  return (
    <PressableScale onPress={() => router.push(`/listen/${scene.id}`)} style={styles.hero} accessibilityLabel={`${scene.name}, tonight's pick`}>
      <ArtTile scene={scene} style={StyleSheet.absoluteFill} animated scrim={1} />
      <View style={styles.heroBody}>
        <GlassView style={styles.chip}>
          <Icon name="moon.fill" size={12} color={WHITE} />
          <Text style={[type.footnote, { color: WHITE, fontWeight: '600' }]}>Tonight</Text>
        </GlassView>
        <View style={{ flex: 1 }} />
        <Text style={[type.display, { color: WHITE }]}>{scene.name}</Text>
        <Text style={[type.subhead, { color: WHITE_2 }]}>{scene.subtitle}</Text>
        <View style={{ marginTop: space(2), flexDirection: 'row', gap: space(1), alignItems: 'center' }}>
          <PlayPill playing={playing} onPress={() => (playing ? pause() : play(scene.id))} />
          <GlassView style={[styles.chip, { height: 52, paddingHorizontal: space(2) }]}>
            <Text style={[type.subhead, { color: WHITE, fontWeight: '600' }]}>{scene.tags.join(' · ')}</Text>
          </GlassView>
        </View>
      </View>
    </PressableScale>
  );
}

function SceneCard({ scene, size }: { scene: Scene; size: number }) {
  const active = useDrift((s) => s.playing && s.currentId === scene.id);
  return (
    <PressableScale onPress={() => router.push(`/listen/${scene.id}`)} style={{ width: size }} accessibilityLabel={scene.name}>
      <ArtTile scene={scene} style={{ width: size, height: size * 1.25 }} animated={active} scrim={0.9} />
      <View style={styles.cardText}>
        {active ? <Icon name="waveform" size={14} color={WHITE} /> : null}
        <Text style={[type.headline, { color: WHITE }]}>{scene.name}</Text>
        <Text style={[type.footnote, { color: WHITE_2 }]} numberOfLines={2}>
          {scene.subtitle}
        </Text>
      </View>
    </PressableScale>
  );
}

function Mixes() {
  const mixes = useDrift((s) => s.mixes);
  const playMix = useDrift((s) => s.playMix);
  const deleteMix = useDrift((s) => s.deleteMix);

  const options = (mix: Mix) =>
    ActionSheetIOS.showActionSheetWithOptions(
      { title: mix.name, options: ['Play', 'Delete mix', 'Cancel'], destructiveButtonIndex: 1, cancelButtonIndex: 2 },
      (i) => (i === 0 ? playMix(mix) : i === 1 ? deleteMix(mix.id) : undefined),
    );

  return (
    <View style={{ gap: space(1.5) }}>
      <SectionHeader title="Your mixes" />
      {mixes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[type.headline, { color: semantic.label }]}>No mixes yet</Text>
          <Text style={[type.subhead, { color: semantic.secondaryLabel, textAlign: 'center' }]}>
            Open any soundscape, adjust its layers, then tap Save mix. Your blends live here.
          </Text>
        </View>
      ) : (
        <View style={styles.group}>
          {mixes.map((m, i) => {
            const scene = sceneById(m.sceneId);
            return (
              <PressableScale key={m.id} onPress={() => playMix(m)} onLongPress={() => options(m)} style={[styles.mixRow, i > 0 && styles.separator]}>
                <ArtTile scene={scene} rounded={radius.tile} style={{ width: 44, height: 44 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[type.body, { color: semantic.label }]} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Text style={[type.footnote, { color: semantic.secondaryLabel }]}>Based on {scene.name}</Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: space(1), paddingBottom: space(6), gap: space(4) },
  hero: { marginHorizontal: space(2), height: 500, borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  heroBody: { flex: 1, padding: space(2.5), gap: space(0.5) },
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space(0.75), height: 32, paddingHorizontal: space(1.5), borderRadius: radius.pill },
  cardText: { position: 'absolute', left: space(1.5), right: space(1.5), bottom: space(1.5), gap: 2 },
  eyebrow: { color: semantic.secondaryLabel, fontWeight: '600', letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(1.5), paddingHorizontal: space(2), rowGap: space(2.5) },
  empty: {
    marginHorizontal: space(2),
    padding: space(3),
    gap: space(1),
    alignItems: 'center',
    borderRadius: radius.card,
    borderCurve: 'continuous',
    backgroundColor: semantic.card,
  },
  group: { marginHorizontal: space(2), borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, overflow: 'hidden' },
  mixRow: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), paddingHorizontal: space(2), paddingVertical: space(1.25) },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semantic.separator },
});
