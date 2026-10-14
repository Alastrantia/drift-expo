import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArtTile } from '../../../src/components/ArtTile';
import { SCENES, TAGS } from '../../../src/lib/scenes';
import { radius, semantic, space, type, usePalette } from '../../../src/lib/theme';

export default function Search() {
  const p = usePalette();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCENES.filter(
      (s) =>
        (!tag || s.tags.includes(tag)) &&
        (!q || s.name.toLowerCase().includes(q) || s.subtitle.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))),
    );
  }, [query, tag]);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Search',
          headerSearchBarOptions: { placeholder: 'Rain, ocean, fire…', onChangeText: (e) => setQuery(e.nativeEvent.text) },
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="on-drag" contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tags}>
          {TAGS.map((t) => {
            const on = tag === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTag(on ? null : t)}
                style={[styles.tag, { backgroundColor: on ? p.accent : semantic.tile }]}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[type.subhead, { fontWeight: '600', color: on ? p.onAccent : semantic.label }]}>{t}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {results.length === 0 ? (
          <View style={styles.empty}>
            <Text style={[type.headline, { color: semantic.label }]}>Nothing matches “{query}”</Text>
            <Text style={[type.subhead, { color: semantic.secondaryLabel, textAlign: 'center' }]}>
              Try a sound like rain or wind, or a mood like Sleep.
            </Text>
          </View>
        ) : (
          <View style={styles.group}>
            {results.map((s, i) => (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/listen/${s.id}`)}
                style={({ pressed }) => [styles.row, i > 0 && styles.separator, pressed && { backgroundColor: semantic.separator }]}
              >
                <ArtTile scene={s} rounded={radius.tile} style={{ width: 52, height: 52 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[type.body, { color: semantic.label }]}>{s.name}</Text>
                  <Text style={[type.footnote, { color: semantic.secondaryLabel }]} numberOfLines={1}>
                    {s.tags.join(' · ')}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space(6), gap: space(2) },
  tags: { paddingHorizontal: space(2), gap: space(1) },
  tag: { height: 36, paddingHorizontal: space(2), borderRadius: radius.pill, justifyContent: 'center' },
  group: { marginHorizontal: space(2), borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space(1.5), paddingHorizontal: space(2), paddingVertical: space(1.25) },
  separator: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: semantic.separator },
  empty: { marginHorizontal: space(2), padding: space(3), gap: space(1), alignItems: 'center', borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: semantic.card },
});
