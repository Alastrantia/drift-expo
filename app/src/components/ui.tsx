import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { GlassView } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { radius, semantic, space, type, usePalette } from '../lib/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const OUT = Easing.bezier(0.23, 1, 0.32, 1);

/** Press feedback on press-in: scale 0.97, 120 ms, strong ease-out. */
export function PressableScale({ style, children, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        scale.set(withTiming(0.97, { duration: 120, easing: OUT }));
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: 200, easing: OUT }));
        rest.onPressOut?.(e);
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function Icon({ name, size = 20, color, weight = 'semibold' }: { name: SymbolViewProps['name']; size?: number; color: string; weight?: SymbolViewProps['weight'] }) {
  return <SymbolView name={name} size={size} tintColor={color} weight={weight} resizeMode="scaleAspectFit" style={{ width: size, height: size }} />;
}

/** The primary action: an accent-tinted Liquid Glass pill. Label is always "Play" / "Pause". */
export function PlayPill({ playing, onPress, compact = false }: { playing: boolean; onPress: () => void; compact?: boolean }) {
  const p = usePalette();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Pause' : 'Play'}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <GlassView isInteractive tintColor={p.accent} style={[styles.pill, compact && { height: 44, paddingHorizontal: space(2) }]}>
        <Icon name={playing ? 'pause.fill' : 'play.fill'} size={compact ? 15 : 17} color={p.onAccent} />
        <Text style={[type.headline, { color: p.onAccent }]}>{playing ? 'Pause' : 'Play'}</Text>
      </GlassView>
    </PressableScale>
  );
}

/** Round Liquid Glass icon button (44pt). */
export function GlassIconButton({ name, onPress, label, size = 48, tint }: { name: SymbolViewProps['name']; onPress: () => void; label: string; size?: number; tint?: string }) {
  const p = usePalette();
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}>
      <GlassView isInteractive tintColor={tint} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={name} size={size * 0.4} color={tint ? p.onAccent : p.label} />
      </GlassView>
    </PressableScale>
  );
}

export function SectionHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[type.title, { color: semantic.label }]}>{title}</Text>
      {detail ? <Text style={[type.subhead, { color: semantic.secondaryLabel }]}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 52,
    paddingHorizontal: space(3),
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(1),
  },
  sectionHeader: { paddingHorizontal: space(2.5), gap: 2 },
});
