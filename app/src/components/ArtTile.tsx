import { useState } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import type { Scene } from '../lib/scenes';
import { radius, semantic, usePalette } from '../lib/theme';
import { SceneArt } from './SceneArt';

/** A scene's line art on a quiet tile. Sizes itself to its container. */
export function ArtTile({ scene, style, animated = false, rounded = radius.card, strokeWidth }: { scene: Scene; style?: StyleProp<ViewStyle>; animated?: boolean; rounded?: number; strokeWidth?: number }) {
  const p = usePalette();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.w !== width || size.h !== height) setSize({ w: width, h: height });
  };
  return (
    <View onLayout={onLayout} style={[{ backgroundColor: semantic.tile, borderRadius: rounded, borderCurve: 'continuous', overflow: 'hidden' }, style]}>
      {size ? (
        <SceneArt kind={scene.art} width={size.w} height={size.h} color={p.line} faintColor={p.lineFaint} animated={animated} strokeWidth={strokeWidth} />
      ) : null}
    </View>
  );
}
