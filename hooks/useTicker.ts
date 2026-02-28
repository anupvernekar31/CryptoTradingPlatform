import { useCallback, useState } from 'react';
import type { Ticker } from '../types/api';
import type { WsTickerData } from '../types/websocket';
import { useWebSocket } from './useWebSocket';

export function useTicker(symbol: string) {
  const [ticker, setTicker] = useState<Ticker | null>(null);

  const handleMessage = useCallback(
    (data: WsTickerData) => {
      setTicker({
        symbol: data.symbol ?? symbol,
        close: data.close,
        open: data.open,
        high: data.high,
        low: data.low,
        mark_price: data.mark_price,
        volume: data.volume,
        turnover_usd: data.turnover_usd,
        product_id: data.product_id,
        timestamp: data.timestamp,
        funding_rate: data.funding_rate,
        oi: data.oi,
      });
    },
    [symbol],
  );

  const { connectionState } = useWebSocket<WsTickerData>('v2/ticker', symbol, handleMessage);

  return { ticker, connectionState };
}
