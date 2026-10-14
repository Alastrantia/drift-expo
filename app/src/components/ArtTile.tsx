import { Canvas, Fill, LinearGradient, Rect, Shader, Skia, useClock, vec, type SkRuntimeEffect } from '@shopify/react-native-skia';
import { useState } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useDerivedValue, useReducedMotion } from 'react-native-reanimated';
import type { ArtKind, Scene } from '../lib/scenes';
import { SCENE_SHADERS } from '../shaders/scenes';
import { radius } from '../lib/theme';

const cache: Partial<Record<ArtKind, SkRuntimeEffect>> = {};
function effectFor(kind: ArtKind) {
  if (!cache[kind]) {
    const e = Skia.RuntimeEffect.Make(SCENE_SHADERS[kind]);
    if (!e) throw new Error(`Drift: shader for ${kind} failed to compile`);
    cache[kind] = e;
  }
  return cache[kind]!;
}

/** Still frame chosen per scene so tiles look composed, not random. */
const STILL: Record<ArtKind, number> = { waves: 12, rain: 12, fire: 12, wind: 30, orbit: 12, storm: 3 };

type Props = {
  scene: Scene;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  rounded?: number;
  /** Darken the lower part so text laid over the art stays readable. */
  scrim?: number;
};

function Animated({ kind, w, h, scrim }: { kind: ArtKind; w: number; h: number; scrim: number }) {
  const clock = useClock();
  const uniforms = useDerivedValue(() => ({ iResolution: [w, h], iTime: STILL[kind] + clock.value / 1000 }));
  return (
    <Canvas style={{ width: w, height: h }}>
      <Fill>
        <Shader source={effectFor(kind)} uniforms={uniforms} />
      </Fill>
      {scrim > 0 ? <Scrim w={w} h={h} amount={scrim} /> : null}
    </Canvas>
  );
}

function Still({ kind, w, h, scrim }: { kind: ArtKind; w: number; h: number; scrim: number }) {
  return (
    <Canvas style={{ width: w, height: h }}>
      <Fill>
        <Shader source={effectFor(kind)} uniforms={{ iResolution: [w, h], iTime: STILL[kind] }} />
      </Fill>
      {scrim > 0 ? <Scrim w={w} h={h} amount={scrim} /> : null}
    </Canvas>
  );
}

function Scrim({ w, h, amount }: { w: number; h: number; amount: number }) {
  return (
    <Rect x={0} y={0} width={w} height={h}>
      <LinearGradient
        start={vec(0, h * 0.35)}
        end={vec(0, h)}
        colors={['rgba(0,0,0,0)', `rgba(0,0,0,${0.55 * amount})`, `rgba(0,0,0,${0.85 * amount})`]}
        positions={[0, 0.6, 1]}
      />
    </Rect>
  );
}

/** A soundscape's painted scene. Animates only when asked (and never with Reduce Motion on). */
export function ArtTile({ scene, style, animated = false, rounded = radius.card, scrim = 0 }: Props) {
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 0.5 || Math.abs(size.h - height) > 0.5) setSize({ w: width, h: height });
  };
  const live = animated && !reduceMotion;
  return (
    <View onLayout={onLayout} style={[{ backgroundColor: '#0A0A0B', borderRadius: rounded, borderCurve: 'continuous', overflow: 'hidden' }, style]}>
      {size ? (
        live ? (
          <Animated kind={scene.art} w={size.w} h={size.h} scrim={scrim} />
        ) : (
          <Still kind={scene.art} w={size.w} h={size.h} scrim={scrim} />
        )
      ) : null}
    </View>
  );
}
