import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { router, Stack } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../../src/components/ui';
import { sceneById } from '../../../src/lib/scenes';
import { useDrift } from '../../../src/lib/store';
import { formatClock, formatMinutes, radius, semantic, space, type, usePalette } from '../../../src/lib/theme';
import { useNow } from '../../../src/lib/useNow';

const FADES = [10, 30, 60];

export default function Sleep() {
  const p = usePalette();
  const endsAt = useDrift((s) => s.timerEndsAt);
  const minutes = useDrift((s) => s.timerMinutes);
  const fade = useDrift((s) => s.fadeSeconds);
  const listened = useDrift((s) => s.listenedSeconds);
  const sessions = useDrift((s) => s.sessions);
  const counts = useDrift((s) => s.playCounts);
  const setFade = useDrift((s) => s.setFade);
  const now = useNow(!!endsAt);

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const left = endsAt ? (endsAt - now) / 1000 : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Sleep' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={[styles.card, { alignItems: 'center', paddingVertical: space(4) }]}>
          <Text style={[type.footnote, { color: semantic.secondaryLabel, letterSpacing: 1.2, fontWeight: '600' }]}>SLEEP TIMER</Text>
          <Text style={[styles.bigNumber, { color: left !== null ? p.accent : p.label }]}>
            {left !== null ? formatClock(left) : minutes ? `${minutes}:00` : 'Off'}
          </Text>
          <Text style={[type.subhead, { color: semantic.secondaryLabel, textAlign: 'center' }]}>
            {left !== null ? 'Sound fades out, then stops.' : minutes ? 'Starts when you press Play.' : 'Sound plays until you stop it.'}
          </Text>
          <Pressable onPress={() => router.push('/timer')} style={[styles.button, { backgroundColor: semantic.tile }]} accessibilityRole="button">
            <Text style={[type.headline, { color: semantic.label }]}>Set timer</Text>
          </Pressable>
        </View>

        <View style={{ gap: space(1) }}>
          <Text style={[type.footnote, styles.groupLabel]}>FADE OUT</Text>
          <View style={[styles.card, { padding: space(2) }]}>
            <SegmentedControl
              values={FADES.map((f) => `${f} sec`)}
              selectedIndex={Math.max(0, FADES.indexOf(fade))}
              onChange={(e) => setFade(FADES[e.nativeEvent.selectedSegmentIndex])}
            />
          </View>
        </View>

        <Pressable onPress={() => router.push('/breathe')} style={({ pressed }) => [styles.card, styles.row, pressed && { opacity: 0.7 }]} accessibilityRole="button">
          <Icon name="wind" size={22} color={p.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[type.body, { color: semantic.label }]}>Wind-down breathing</Text>
            <Text style={[type.footnote, { color: semantic.secondaryLabel }]}>A few slow breaths before lights out</Text>
          </View>
          <Icon name="chevron.right" size={14} color={p.secondary} />
        </Pressable>

        <View style={{ gap: space(1) }}>
          <Text style={[type.footnote, styles.groupLabel]}>YOUR LISTENING</Text>
          <View style={styles.stats}>
            <Stat value={formatMinutes(listened)} label="Listened" />
            <Stat value={String(sessions)} label="Sessions" />
            <Stat value={top ? sceneById(top[0]).name : '—'} label="Favourite" />
          </View>
          {sessions === 0 ? (
            <Text style={[type.footnote, { color: semantic.secondaryLabel, paddingHorizontal: space(2) }]}>
              Your listening builds up here once you play a soundscape.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={[styles.card, styles.stat]}>
      <Text style={[type.headline, { color: semantic.label, fontVariant: ['tabular-nums'] }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[type.footnote, { color: semantic.secondaryLabel }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space(2), gap: space(3), paddingBottom: space(6) },
  card: { borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, paddingHorizontal: space(2), gap: space(1) },
  bigNumber: { fontSize: 64, fontWeight: '300', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  button: { marginTop: space(1), height: 44, paddingHorizontal: space(3), borderRadius: radius.pill, justifyContent: 'center' },
  groupLabel: { color: semantic.secondaryLabel, paddingHorizontal: space(2), letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(2), paddingVertical: space(2) },
  stats: { flexDirection: 'row', gap: space(1) },
  stat: { flex: 1, paddingVertical: space(2), gap: space(0.5) },
});
