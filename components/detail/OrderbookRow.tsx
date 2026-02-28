import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ProcessedLevel } from '../../hooks/useOrderbook';

const COLORS = {
  light: { text: '#11181C', sub: '#687076' },
  dark:  { text: '#ECEDEE', sub: '#9BA1A6' },
};

interface Props {
  level: ProcessedLevel;
  side: 'bid' | 'ask';
  isDark: boolean;
}

export const OrderbookRow = memo(
  function OrderbookRow({ level, side, isDark }: Props) {
    const c = isDark ? COLORS.dark : COLORS.light;
    const priceColor = side === 'bid' ? '#16A34A' : '#DC2626';
    const barColor = side === 'bid' ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)';

    return (
      <View style={styles.row}>
        <View
          style={[
            styles.depthBar,
            {
              width: `${Math.round(level.percentage * 100)}%`,
              backgroundColor: barColor,
              [side === 'bid' ? 'right' : 'left']: 0,
            },
          ]}
        />
        <Text style={[styles.price, { color: priceColor }]}>{fmtNum(level.price)}</Text>
        <Text style={[styles.size, { color: c.text }]}>{fmtNum(level.size)}</Text>
        <Text style={[styles.total, { color: c.sub }]}>{level.total.toFixed(3)}</Text>
      </View>
    );
  },
  (prev, next) =>
    prev.level.price === next.level.price &&
    prev.level.size === next.level.size &&
    prev.level.percentage === next.level.percentage &&
    prev.isDark === next.isDark,
);

function fmtNum(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  depthBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  price: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  size: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  total: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
  },
});
