import { useEffect, useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { semantic, type, usePalette } from '../lib/theme';
import { SceneArt } from './SceneArt';

export const INHALE = 4000;
export const HOLD = 1500;
export const EXHALE = 6000;
export const CYCLE = INHALE + HOLD + EXHALE;

type Phase = 'in' | 'hold' | 'out';
const LABEL: Record<Phase, string> = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out' };

/** Concentric rings that expand on the in-breath and settle on the out-breath. Runs `cycles` times (Infinity for open-ended). */
export function Breath({ cycles, onDone }: { cycles: number; onDone?: () => void }) {
  const p = usePalette();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(0.62);
  const [phase, setPhase] = useState<Phase>('in');
  const size = width * 0.86;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (n: number) => {
      if (cancelled) return;
      if (n >= cycles) return onDone?.();
      setPhase('in');
      if (!reduceMotion) {
        scale.set(
          withSequence(
            withTiming(1, { duration: INHALE, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: HOLD }),
            withTiming(0.62, { duration: EXHALE, easing: Easing.inOut(Easing.sin) }),
          ),
        );
      }
      timers.push(setTimeout(() => !cancelled && setPhase('hold'), INHALE));
      timers.push(setTimeout(() => !cancelled && setPhase('out'), INHALE + HOLD));
      timers.push(setTimeout(() => run(n + 1), CYCLE));
    };
    run(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [cycles, onDone, reduceMotion, scale]);

  const ring = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <View style={styles.root}>
      <Animated.View style={[{ width: size, height: size }, ring]}>
        <SceneArt kind="orbit" width={size} height={size} color="rgba(255,255,255,0.9)" faintColor="rgba(255,255,255,0.35)" animated strokeWidth={1.3} />
      </Animated.View>
      <View style={styles.labelSlot}>
        <Animated.Text key={phase} entering={FadeIn.duration(500)} exiting={FadeOut.duration(300)} style={[type.title, styles.label]}>
          {LABEL[phase]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: 24 },
  labelSlot: { height: 32, alignSelf: 'stretch', alignItems: 'center' },
  label: { position: 'absolute', color: '#FFFFFF', fontWeight: '500' },
});
