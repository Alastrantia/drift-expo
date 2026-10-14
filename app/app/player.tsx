import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { GlassContainer } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { SceneArt } from '../src/components/SceneArt';
import { GlassIconButton, Icon, PressableScale } from '../src/components/ui';
import { SCENES, sceneById } from '../src/lib/scenes';
import { useDrift } from '../src/lib/store';
import { formatClock, semantic, space, type, usePalette } from '../src/lib/theme';
import { useNow } from '../src/lib/useNow';
import { GlassView } from 'expo-glass-effect';

export default function Player() {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scene = sceneById(useDrift((s) => s.currentId));
  const playing = useDrift((s) => s.playing);
  const volume = useDrift((s) => s.volume);
  const endsAt = useDrift((s) => s.timerEndsAt);
  const timerMinutes = useDrift((s) => s.timerMinutes);
  const now = useNow(!!endsAt);
  const { toggle, play, setVolume } = useDrift.getState();
  const params = useLocalSearchParams<{ scene?: string; timer?: string }>();

  // Deep links (drift:///player?scene=tide&timer=30) start playback directly.
  useEffect(() => {
    if (params.timer) useDrift.getState().setTimer(Number(params.timer));
    if (params.scene) play(params.scene);
  }, [params.scene, params.timer, play]);

  const step = (d: number) => {
    const i = SCENES.findIndex((s) => s.id === scene.id);
    const next = SCENES[(i + d + SCENES.length) % SCENES.length];
    Haptics.selectionAsync();
    if (playing) play(next.id);
    else useDrift.setState({ currentId: next.id });
  };

  const left = endsAt ? Math.max(0, (endsAt - now) / 1000) : null;
  const progress = endsAt && timerMinutes ? 1 - (left ?? 0) / (timerMinutes * 60) : 0;
  const artH = height * 0.5;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + space(2) }]}>
      <Animated.View key={scene.id} entering={FadeIn.duration(400)} exiting={FadeOut.duration(250)} style={{ height: artH, marginTop: space(3) }}>
        <SceneArt kind={scene.art} width={width} height={artH} color={p.line} faintColor={p.lineFaint} animated={playing} strokeWidth={1.7} />
      </Animated.View>

      <View style={styles.meta}>
        <Animated.Text key={scene.id + 't'} entering={FadeIn.duration(300)} style={[type.display, { color: semantic.label }]}>
          {scene.name}
        </Animated.Text>
        <Text style={[type.subhead, { color: semantic.secondaryLabel }]}>{scene.subtitle}</Text>
      </View>

      <View style={styles.timer}>
        <View style={[styles.track, { backgroundColor: p.lineFaint }]}>
          <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%`, backgroundColor: p.accent }]} />
        </View>
        <View style={styles.timerLabels}>
          <Text style={[type.footnote, styles.num]}>{left !== null ? 'Sleep timer' : 'No sleep timer'}</Text>
          <Text style={[type.footnote, styles.num]}>{left !== null ? `−${formatClock(left)}` : '∞'}</Text>
        </View>
      </View>

      <GlassContainer spacing={18} style={styles.transport}>
        <GlassIconButton name="backward.fill" label="Previous soundscape" size={60} onPress={() => step(-1)} />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggle();
          }}
        >
          <GlassView isInteractive tintColor={p.accent} style={styles.bigPlay}>
            <Icon name={playing ? 'pause.fill' : 'play.fill'} size={34} color={p.onAccent} />
          </GlassView>
        </PressableScale>
        <GlassIconButton name="forward.fill" label="Next soundscape" size={60} onPress={() => step(1)} />
      </GlassContainer>

      <View style={styles.volume}>
        <Icon name="speaker.fill" size={14} color={p.secondary} />
        <Slider style={{ flex: 1 }} value={volume} onValueChange={setVolume} minimumTrackTintColor={p.label} accessibilityLabel="Volume" />
        <Icon name="speaker.wave.3.fill" size={16} color={p.secondary} />
      </View>

      <GlassContainer spacing={10} style={styles.bottomRow}>
        <GlassIconButton name="timer" label="Sleep timer" size={48} onPress={() => router.push('/timer')} />
        <GlassIconButton name="slider.horizontal.3" label="Mixer" size={48} onPress={() => router.push('/mixer')} />
        <GlassIconButton name="wind" label="Breathe" size={48} onPress={() => router.push('/breathe')} />
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: semantic.background },
  meta: { paddingHorizontal: space(3), gap: space(0.5) },
  timer: { paddingHorizontal: space(3), marginTop: space(3), gap: space(1) },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  timerLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  num: { color: semantic.secondaryLabel, fontVariant: ['tabular-nums'] },
  transport: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space(3), marginTop: space(3) },
  bigPlay: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  volume: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), paddingHorizontal: space(3), marginTop: space(3) },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', gap: space(2), marginTop: 'auto' },
});
