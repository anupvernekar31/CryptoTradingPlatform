import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ProductWithTicker } from '../types/api';


function formatPrice(price: string | undefined): string {
  if (!price) return '—';
  const num = parseFloat(price);
  if (isNaN(num)) return '—';
  return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(usd: string | undefined): string {
  if (!usd) return '—';
  const num = parseFloat(usd);
  if (isNaN(num) || num === 0) return '—';
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
  return num.toFixed(0);
}


const COLORS = {
  light: { bg: '#FFFFFF', border: '#F3F4F6', text: '#11181C', sub: '#687076' },
  dark:  { bg: '#1C1C1E', border: '#2C2C2E', text: '#ECEDEE', sub: '#9BA1A6' },
};


interface Props {
  product: ProductWithTicker;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onPress: (symbol: string) => void;
  isDark: boolean;
}

export const ProductListItem = memo(function ProductListItem({
  product,
  isFavorite,
  onToggleFavorite,
  onPress,
  isDark,
}: Props) {
  const { ticker, changePercent, symbol, description } = product;
  const c = isDark ? COLORS.dark : COLORS.light;

  const handleFavorite = useCallback(() => onToggleFavorite(symbol), [symbol, onToggleFavorite]);
  const handlePress = useCallback(() => onPress(symbol), [symbol, onPress]);

  const changeColor =
    changePercent === null ? c.sub
    : changePercent >= 0  ? '#16A34A'
    : '#DC2626';

  const changeText =
    changePercent === null
      ? '—'
      : `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: c.bg, borderBottomColor: c.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Star */}
      <TouchableOpacity style={styles.starBtn} onPress={handleFavorite} hitSlop={8}>
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-outline'}
          size={20}
          color={isFavorite ? '#F5A623' : c.sub}
        />
      </TouchableOpacity>

      {/* Symbol + name */}
      <View style={styles.symbolCell}>
        <Text style={[styles.symbol, { color: c.text }]}>{symbol}</Text>
        <Text style={[styles.description, { color: c.sub }]} numberOfLines={1}>
          {description}
        </Text>
      </View>

      {/* Last price */}
      <Text style={[styles.price, { color: c.text }]}>{formatPrice(ticker?.close)}</Text>

      {/* 24h change */}
      <Text style={[styles.change, { color: changeColor }]}>{changeText}</Text>

      {/* Volume */}
      <Text style={[styles.volume, { color: c.sub }]}>{formatVolume(ticker?.turnover_usd)}</Text>
    </TouchableOpacity>
  );
});


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  starBtn: {
    width: 28,
    alignItems: 'center',
  },
  symbolCell: {
    flex: 1,
    paddingLeft: 6,
  },
  symbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 1,
  },
  price: {
    width: 100,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  change: {
    width: 72,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '500',
  },
  volume: {
    width: 56,
    textAlign: 'right',
    fontSize: 13,
  },
});
