import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Ticker } from '../../types/api';

const COLORS = {
  light: { bg: '#FFFFFF', text: '#11181C', sub: '#687076', border: '#F3F4F6' },
  dark:  { bg: '#1C1C1E', text: '#ECEDEE', sub: '#9BA1A6', border: '#2C2C2E' },
};

function fmt(val: string | undefined, fallback = '—'): string {
  if (!val) return fallback;
  const n = parseFloat(val);
  if (isNaN(n)) return fallback;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtVolume(val: string | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n) || n === 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtRate(val: string | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return `${(n * 100).toFixed(4)}%`;
}

interface Props {
  ticker: Ticker | null;
  isDark: boolean;
}

export const TickerCard = memo(function TickerCard({ ticker, isDark }: Props) {
  const c = isDark ? COLORS.dark : COLORS.light;

  const close = ticker ? parseFloat(ticker.close) : 0;
  const open = ticker ? parseFloat(ticker.open) : 0;
  const changePercent = open > 0 ? ((close - open) / open) * 100 : 0;
  const changeColor = changePercent >= 0 ? '#16A34A' : '#DC2626';
  const changeText = ticker
    ? `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`
    : '—';

  return (
    <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={styles.priceRow}>
        <Text style={[styles.lastPrice, { color: c.text }]}>
          {ticker ? fmt(ticker.close) : '—'}
        </Text>
        <Text style={[styles.changeBadge, { color: changeColor }]}>{changeText}</Text>
      </View>

      <View style={styles.grid}>
        <Stat label="MARK PRICE" value={fmt(ticker?.mark_price)} c={c} />
        <Stat label="24H HIGH" value={fmt(ticker?.high)} c={c} />
        <Stat label="24H LOW" value={fmt(ticker?.low)} c={c} />
        <Stat label="24H VOLUME" value={fmtVolume(ticker?.turnover_usd)} c={c} />
        <Stat label="FUNDING RATE" value={fmtRate(ticker?.funding_rate)} c={c} />
      </View>
    </View>
  );
});

function Stat({ label, value, c }: { label: string; value: string; c: typeof COLORS.light }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statLabel, { color: c.sub }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  lastPrice: {
    fontSize: 28,
    fontWeight: '700',
  },
  changeBadge: {
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statBox: {
    width: '30%',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
