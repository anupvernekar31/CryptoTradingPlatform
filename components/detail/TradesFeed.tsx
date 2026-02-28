import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ProcessedTrade } from '../../hooks/useTrades';
import { TradeRow } from './TradeRow';

const COLORS = {
  light: { bg: '#FFFFFF', text: '#11181C', sub: '#687076', border: '#F3F4F6' },
  dark:  { bg: '#1C1C1E', text: '#ECEDEE', sub: '#9BA1A6', border: '#2C2C2E' },
};

const ROW_HEIGHT = 32;

interface Props {
  trades: ProcessedTrade[];
  isDark: boolean;
}

export const TradesFeed = memo(function TradesFeed({ trades, isDark }: Props) {
  const c = isDark ? COLORS.dark : COLORS.light;

  const renderItem = useCallback(
    ({ item }: { item: ProcessedTrade }) => <TradeRow trade={item} isDark={isDark} />,
    [isDark],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.title, { color: c.text }]}>Recent Trades</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: c.sub, flex: 2 }]}>PRICE</Text>
        <Text style={[styles.headerText, { color: c.sub, flex: 1.5, textAlign: 'center' }]}>SIZE</Text>
        <Text style={[styles.headerText, { color: c.sub, flex: 1, textAlign: 'center' }]}>SIDE</Text>
        <Text style={[styles.headerText, { color: c.sub, flex: 1.5, textAlign: 'right' }]}>TIME</Text>
      </View>

      {trades.length === 0 ? (
        <Text style={[styles.placeholder, { color: c.sub }]}>Waiting for trades...</Text>
      ) : (
        <FlatList
          data={trades}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          getItemLayout={getItemLayout}
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 200,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  headerText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  placeholder: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 14,
  },
});
