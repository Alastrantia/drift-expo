import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../src/components/ui';
import { useDrift } from '../src/lib/store';
import { radius, semantic, space, type, usePalette } from '../src/lib/theme';

const OPTIONS: (number | null)[] = [null, 15, 30, 45, 60, 90];

export default function TimerSheet() {
  const p = usePalette();
  const selected = useDrift((s) => s.timerMinutes);
  const fade = useDrift((s) => s.fadeSeconds);
  const setTimer = useDrift((s) => s.setTimer);

  return (
    <View style={styles.root}>
      <Text style={[type.title, { color: semantic.label, textAlign: 'center' }]}>Sleep timer</Text>
      <Text style={[type.footnote, { color: semantic.secondaryLabel, textAlign: 'center' }]}>
        Fades out over the last {fade} seconds.
      </Text>
      <View style={styles.group}>
        {OPTIONS.map((m, i) => {
          const on = selected === m;
          return (
            <Pressable
              key={String(m)}
              onPress={() => {
                Haptics.selectionAsync();
                setTimer(m);
                router.back();
              }}
              style={({ pressed }) => [styles.row, i > 0 && styles.separator, pressed && { backgroundColor: semantic.separator }]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
            >
              <Text style={[type.body, { color: semantic.label, flex: 1 }]}>{m ? `${m} minutes` : 'Off'}</Text>
              {on ? <Icon name="checkmark" size={17} color={p.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: space(3), paddingHorizontal: space(2), gap: space(1) },
  group: { marginTop: space(2), borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, overflow: 'hidden' },
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space(2) },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semantic.separator },
});
