import Slider from '@react-native-community/slider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { sceneById } from '../src/lib/scenes';
import { levelsFor, useDrift } from '../src/lib/store';
import { radius, semantic, space, type, usePalette } from '../src/lib/theme';

export default function MixerSheet() {
  const p = usePalette();
  const scene = sceneById(useDrift((s) => s.currentId));
  const levels = useDrift(useShallow((s) => levelsFor(s.levels, s.currentId)));
  const setLevel = useDrift((s) => s.setLevel);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={[type.title, { color: semantic.label, textAlign: 'center' }]}>{scene.name} mix</Text>
      <View style={styles.group}>
        {scene.layers.map((layer, i) => (
          <View key={layer.layer + i} style={[styles.row, i > 0 && styles.separator]}>
            <View style={styles.header}>
              <Text style={[type.body, { color: semantic.label }]}>{layer.label}</Text>
              <Text style={[type.subhead, { color: semantic.secondaryLabel, fontVariant: ['tabular-nums'] }]}>
                {Math.round((levels[i] ?? 0) * 100)}%
              </Text>
            </View>
            <Slider value={levels[i] ?? 0} onValueChange={(v) => setLevel(scene.id, i, v)} minimumTrackTintColor={p.accent} accessibilityLabel={`${layer.label} level`} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: space(3), paddingHorizontal: space(2), gap: space(2) },
  group: { borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, overflow: 'hidden' },
  row: { paddingHorizontal: space(2), paddingVertical: space(1.5), gap: space(0.5) },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semantic.separator },
});
