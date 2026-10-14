import { PlatformColor, useColorScheme } from 'react-native';

/**
 * Design rules (locked):
 * - One accent: lamp amber. Spent only on play / active / progress.
 * - Neutrals are the iOS system greys (semantic, so both themes work).
 * - Radii: artwork & cards 24, actions are pills, small art tiles 12.
 * - Spacing on an 8pt grid (4 allowed inside controls).
 */
export const radius = { card: 24, tile: 12, pill: 999 } as const;
export const space = (n: number) => n * 8;

export const semantic = {
  label: PlatformColor('label'),
  secondaryLabel: PlatformColor('secondaryLabel'),
  tertiaryLabel: PlatformColor('tertiaryLabel'),
  background: PlatformColor('systemBackground'),
  groupedBackground: PlatformColor('systemGroupedBackground'),
  card: PlatformColor('secondarySystemGroupedBackground'),
  tile: PlatformColor('secondarySystemBackground'),
  separator: PlatformColor('separator'),
};

/** Plain string colours, for SVG strokes and Reanimated (which cannot take PlatformColor). */
export function usePalette() {
  const dark = useColorScheme() !== 'light';
  return {
    dark,
    accent: dark ? '#F2A65A' : '#B5651D',
    onAccent: dark ? '#1A1006' : '#FFFFFF',
    line: dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.82)',
    lineFaint: dark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.28)',
    label: dark ? '#FFFFFF' : '#000000',
    secondary: dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)',
  };
}

export const type = {
  display: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.4 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.26 },
  headline: { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.43 },
  body: { fontSize: 17, letterSpacing: -0.43 },
  subhead: { fontSize: 15, letterSpacing: -0.23 },
  footnote: { fontSize: 13, letterSpacing: -0.08 },
  caption: { fontSize: 12 },
};

export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatMinutes(seconds: number) {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = m / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}
