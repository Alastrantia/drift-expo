import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Breath } from '../src/components/Breath';
import { GlassIconButton } from '../src/components/ui';
import { semantic, space, type } from '../src/lib/theme';

export default function BreatheModal() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top + space(1), paddingBottom: insets.bottom + space(4) }]}>
      <View style={styles.top}>
        <Text style={[type.headline, { color: semantic.label }]}>Wind down</Text>
        <GlassIconButton name="xmark" label="Close" size={44} onPress={() => router.back()} />
      </View>
      <View style={styles.center}>
        <Breath cycles={Infinity} />
      </View>
      <Text style={[type.footnote, { color: semantic.secondaryLabel, textAlign: 'center' }]}>
        In for four, hold, out for six. Stay as long as you like.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: semantic.background, paddingHorizontal: space(2) },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: space(1) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
