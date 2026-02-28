import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionStatus } from '@/components/detail/ConnectionStatus';
import { OrderbookView } from '@/components/detail/OrderbookView';
import { TickerCard } from '@/components/detail/TickerCard';
import { TradesFeed } from '@/components/detail/TradesFeed';
import { Colors } from '@/constants/theme';
import { useOrderbook } from '@/hooks/useOrderbook';
import { useTicker } from '@/hooks/useTicker';
import { useTrades } from '@/hooks/useTrades';
import type { WsConnectionState } from '@/types/websocket';

/** Return the "worst" connection state across multiple hooks. */
function worstState(...states: WsConnectionState[]): WsConnectionState {
  if (states.includes('disconnected')) return 'disconnected';
  if (states.includes('reconnecting')) return 'reconnecting';
  if (states.includes('connecting')) return 'connecting';
  return 'connected';
}

export default function ProductDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const colors = Colors[scheme];

  const { ticker, connectionState: tickerState } = useTicker(symbol!);
  const { orderbook, connectionState: obState } = useOrderbook(symbol!);
  const { trades, connectionState: tradeState } = useTrades(symbol!);

  const connState = worstState(tickerState, obState, tradeState);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ConnectionStatus state={connState} isDark={isDark} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TickerCard ticker={ticker} isDark={isDark} />
        <OrderbookView orderbook={orderbook} isDark={isDark} />
        <TradesFeed trades={trades} isDark={isDark} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
