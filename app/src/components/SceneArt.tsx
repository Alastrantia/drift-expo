import { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { ArtKind } from '../lib/scenes';

const APath = Animated.createAnimatedComponent(Path);
const TAU = Math.PI * 2;

const PERIOD: Record<ArtKind, number> = {
  rain: 4000,
  storm: 2600,
  waves: 9000,
  fire: 6000,
  wind: 12000,
  orbit: 10000,
};

function fract(x: number) {
  'worklet';
  return x - Math.floor(x);
}
function hash(i: number) {
  'worklet';
  return fract(Math.sin(i * 12.9898) * 43758.5453);
}
function n(v: number) {
  'worklet';
  return v.toFixed(1);
}

function waves(t: number, w: number, h: number, back: boolean) {
  'worklet';
  let d = '';
  for (let k = 0; k < 7; k++) {
    if ((k % 2 === 1) !== back) continue;
    const y0 = h * (0.26 + k * 0.085);
    const amp = 5 + k * 2.2;
    for (let x = 0; x <= w + 6; x += 6) {
      const y =
        y0 +
        amp * Math.sin((x / w) * TAU * 1.2 + t * TAU + k * 0.7) +
        amp * 0.35 * Math.sin((x / w) * TAU * 2.7 - t * TAU * 2 + k);
      d += (x === 0 ? 'M' : 'L') + n(x) + ' ' + n(y);
    }
  }
  return d;
}

function rain(t: number, w: number, h: number, back: boolean, slant: number) {
  'worklet';
  let d = '';
  const count = back ? 34 : 22;
  const len = back ? 9 : 18;
  for (let i = 0; i < count; i++) {
    const seed = i + (back ? 200 : 0);
    const speed = 1 + (i % 3);
    const y = fract(hash(seed * 3.1 + 7) + t * speed) * (h + len * 3) - len * 1.5;
    const x = hash(seed) * (w + h * slant) - h * slant + y * slant;
    d += 'M' + n(x) + ' ' + n(y) + 'L' + n(x + len * slant) + ' ' + n(y + len);
  }
  return d;
}

function fire(t: number, w: number, h: number, back: boolean) {
  'worklet';
  let d = '';
  const cx = w / 2;
  const base = h * 0.84;
  for (let k = 0; k < 5; k++) {
    if ((k % 2 === 1) !== back) continue;
    const s = h * (0.1 + k * 0.065);
    const breathe = 1 + 0.05 * Math.sin(t * TAU * 2 + k);
    for (let i = 0; i <= 48; i++) {
      const th = (i / 48) * TAU;
      const tip = Math.pow((1 + Math.cos(th)) / 2, 2);
      const x = cx + s * 0.62 * Math.sin(th) * Math.sin(th / 2) * breathe + s * 0.16 * Math.sin(t * TAU + k * 0.8) * tip;
      const y = base - s * (1 + Math.cos(th)) * breathe;
      d += (i === 0 ? 'M' : 'L') + n(x) + ' ' + n(y);
    }
  }
  return d;
}

function wind(t: number, w: number, h: number, back: boolean) {
  'worklet';
  let d = '';
  for (let k = 0; k < 9; k++) {
    if ((k % 2 === 1) !== back) continue;
    const start = (fract(t + hash(k + 3)) * 1.7 - 0.6) * w;
    const y0 = h * (0.16 + k * 0.085);
    let first = true;
    for (let x = start; x <= start + w * 0.55; x += 6) {
      const y = y0 + 10 * Math.sin((x / w) * TAU * 1.1 + k) + 5 * Math.sin((x / w) * TAU * 2.3 + t * TAU * 2 + k);
      d += (first ? 'M' : 'L') + n(x) + ' ' + n(y);
      first = false;
    }
  }
  return d;
}

function orbit(t: number, w: number, h: number, back: boolean) {
  'worklet';
  let d = '';
  const cx = w / 2;
  const cy = h / 2;
  const m = Math.min(w, h);
  for (let k = 0; k < 8; k++) {
    if ((k % 2 === 1) !== back) continue;
    const r = m * (0.07 + k * 0.058) + 3 * Math.sin(t * TAU + k * 0.6);
    d += 'M' + n(cx + r) + ' ' + n(cy) + 'A' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(cx - r) + ' ' + n(cy);
    d += 'A' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(cx + r) + ' ' + n(cy);
  }
  if (!back) {
    const r = m * (0.07 + 4 * 0.058);
    const px = cx + r * Math.cos(t * TAU);
    const py = cy + r * Math.sin(t * TAU);
    d += 'M' + n(px + 3) + ' ' + n(py) + 'A3 3 0 1 0 ' + n(px - 3) + ' ' + n(py) + 'A3 3 0 1 0 ' + n(px + 3) + ' ' + n(py);
  }
  return d;
}

export function buildArt(kind: ArtKind, t: number, w: number, h: number, back: boolean) {
  'worklet';
  switch (kind) {
    case 'waves':
      return waves(t, w, h, back);
    case 'rain':
      return rain(t, w, h, back, 0.08);
    case 'storm':
      return rain(t, w, h, back, 0.45);
    case 'fire':
      return fire(t, w, h, back);
    case 'wind':
      return wind(t, w, h, back);
    default:
      return orbit(t, w, h, back);
  }
}

type Props = {
  kind: ArtKind;
  width: number;
  height: number;
  color: string;
  faintColor: string;
  animated?: boolean;
  strokeWidth?: number;
  /** Phase for the still frame shown when not animating. */
  phase?: number;
};

/** Generative line art: one thin stroke family per scene, animated on the UI thread. */
export function SceneArt({ kind, width, height, color, faintColor, animated = false, strokeWidth = 1.4, phase = 0.3 }: Props) {
  const t = useSharedValue(phase);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (animated && !reduceMotion) {
      t.set(0);
      t.set(withRepeat(withTiming(1, { duration: PERIOD[kind], easing: Easing.linear }), -1, false));
    } else {
      cancelAnimation(t);
      t.set(phase);
    }
    return () => cancelAnimation(t);
  }, [animated, reduceMotion, kind, phase, t]);

  const front = useAnimatedProps(() => ({ d: buildArt(kind, t.get(), width, height, false) }));
  const back = useAnimatedProps(() => ({ d: buildArt(kind, t.get(), width, height, true) }));

  return (
    <Svg width={width} height={height} pointerEvents="none">
      <APath animatedProps={back} stroke={faintColor} strokeWidth={strokeWidth * 0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <APath animatedProps={front} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
