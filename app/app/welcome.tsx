import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArtTile } from '../src/components/ArtTile';
import { Breath } from '../src/components/Breath';
import { SCENES } from '../src/lib/scenes';
import { useDrift } from '../src/lib/store';
import { semantic, space, type } from '../src/lib/theme';

/**
 * First open: one slow breath before anything else. A one-way door — once
 * finished (or skipped) the guard swaps it out of the stack for good.
 */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const finish = useDrift((s) => s.finishOnboarding);
  const [stage, setStage] = useState<'breath' | 'hello'>('breath');

  const afterBreath = useCallback(() => {
    setStage('hello');
    setTimeout(finish, 2200);
  }, [finish]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + space(2) }]}>
      <ArtTile scene={SCENES[4]} animated rounded={0} style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        {stage === 'breath' ? (
          <Animated.View exiting={FadeOut.duration(500)}>
            <Breath cycles={1} onDone={afterBreath} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(700)} style={{ alignItems: 'center', gap: space(1) }}>
            <Text style={[type.display, { color: semantic.label }]}>Drift</Text>
            <Text style={[type.body, { color: semantic.secondaryLabel }]}>Sound for quieter nights.</Text>
          </Animated.View>
        )}
      </View>
      <Pressable onPress={finish} hitSlop={12} style={styles.skip} accessibilityRole="button">
        <Text style={[type.body, { color: semantic.secondaryLabel }]}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  skip: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: space(2) },
});
