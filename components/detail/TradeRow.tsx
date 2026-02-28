import React, { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import type { ProcessedTrade } from '../../hooks/useTrades';

const COLORS = {
  light: { text: '#11181C', sub: '#687076' },
  dark:  { text: '#ECEDEE', sub: '#9BA1A6' },
};

interface Props {
  trade: ProcessedTrade;
  isDark: boolean;
}

export const TradeRow = memo(function TradeRow({ trade, isDark }: Props) {
  const c = isDark ? COLORS.dark : COLORS.light;
  const side = trade.side ?? (trade as any).buyer_role === 'taker' ? 'buy' : 'sell';
  const sideColor = side === 'buy' ? '#16A34A' : '#DC2626';
  const highlightColor = side === 'buy' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)';

  const opacity = useSharedValue(trade.isNew ? 1 : 0);

  useEffect(() => {
    if (trade.isNew) {
      opacity.value = 1;
      opacity.value = withTiming(0, { duration: 500 });
    }
  }, [trade.isNew, opacity]);

  const animatedBg = useAnimatedStyle(() => ({
    backgroundColor: opacity.value > 0 ? highlightColor : 'transparent',
  }));

  const time = new Date(trade.timestamp / 1000 > 1e12 ? trade.timestamp : trade.timestamp * 1000);
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });

  return (
    <Animated.View style={[styles.row, animatedBg]}>
      <Text style={[styles.price, { color: sideColor }]}>{fmtNum(trade.price)}</Text>
      <Text style={[styles.size, { color: c.text }]}>{fmtNum(trade.size)}</Text>
      <Text style={[styles.side, { color: sideColor }]}>{(side ?? '—').toUpperCase()}</Text>
      <Text style={[styles.time, { color: c.sub }]}>{timeStr}</Text>
    </Animated.View>
  );
});

function fmtNum(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n)) return val;
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  price: {
    flex: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  size: {
    flex: 1.5,
    textAlign: 'center',
    fontSize: 12,
  },
  side: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    flex: 1.5,
    textAlign: 'right',
    fontSize: 11,
  },
});
