import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export default function ProductDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.symbol, { color: colors.text }]}>{symbol}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 32,
    fontWeight: '700',
  },
});
