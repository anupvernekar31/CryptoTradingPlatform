import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { OrderbookData } from '../../hooks/useOrderbook';
import { OrderbookRow } from './OrderbookRow';

const COLORS = {
  light: { bg: '#FFFFFF', text: '#11181C', sub: '#687076', border: '#F3F4F6', spreadBg: '#F9FAFB' },
  dark:  { bg: '#1C1C1E', text: '#ECEDEE', sub: '#9BA1A6', border: '#2C2C2E', spreadBg: '#2C2C2E' },
};

interface Props {
  orderbook: OrderbookData | null;
  isDark: boolean;
}

export const OrderbookView = memo(function OrderbookView({ orderbook, isDark }: Props) {
  const c = isDark ? COLORS.dark : COLORS.light;

  if (!orderbook) {
    return (
      <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Orderbook</Text>
        <Text style={[styles.placeholder, { color: c.sub }]}>Waiting for data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.title, { color: c.text }]}>Orderbook</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.headerText, { color: c.sub }]}>PRICE</Text>
        <Text style={[styles.headerText, { color: c.sub, textAlign: 'center' }]}>SIZE</Text>
        <Text style={[styles.headerText, { color: c.sub, textAlign: 'right' }]}>TOTAL</Text>
      </View>

      {[...orderbook.asks].reverse().map((level, i) => (
        <OrderbookRow key={`ask-${i}`} level={level} side="ask" isDark={isDark} />
      ))}

      <View style={[styles.spreadRow, { backgroundColor: c.spreadBg }]}>
        <Text style={[styles.spreadText, { color: c.sub }]}>
          Spread: ${orderbook.spread} ({orderbook.spreadPercent}%)
        </Text>
      </View>

      {orderbook.bids.map((level, i) => (
        <OrderbookRow key={`bid-${i}`} level={level} side="bid" isDark={isDark} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
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
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  spreadRow: {
    paddingVertical: 6,
    alignItems: 'center',
    marginVertical: 2,
  },
  spreadText: {
    fontSize: 11,
    fontWeight: '500',
  },
  placeholder: {
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 14,
  },
});
