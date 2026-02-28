import { useCallback, useEffect, useRef, useState } from 'react';
import type { WsOrderbookData } from '../types/websocket';
import { useWebSocket } from './useWebSocket';


export interface ProcessedLevel {
  price: string;
  size: string;
  total: number;
  percentage: number;
}

export interface OrderbookData {
  bids: ProcessedLevel[];
  asks: ProcessedLevel[];
  spread: string;
  spreadPercent: string;
}


const DEPTH = 10;
const THROTTLE_MS = 150;


function getPrice(level: Record<string, unknown>): number {
  return parseFloat(String(level.limit_price ?? level.price ?? '0'));
}

function processLevels(raw: Record<string, unknown>[], depth: number): ProcessedLevel[] {
  const sliced = raw.slice(0, depth);
  let cumulative = 0;
  const levels: ProcessedLevel[] = sliced.map(l => {
    const price = String(l.limit_price ?? l.price ?? '0');
    const size = String(l.size ?? '0');
    cumulative += parseFloat(size);
    return { price, size, total: cumulative, percentage: 0 };
  });
  if (cumulative > 0) {
    levels.forEach(l => {
      l.percentage = l.total / cumulative;
    });
  }
  return levels;
}


export function useOrderbook(symbol: string) {
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null);

  const latestRef = useRef<WsOrderbookData | null>(null);
  const throttledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processAndSet = useCallback(() => {
    const data = latestRef.current;
    if (!data) return;

    const rawBuy = (data.buy ?? []) as any;
    const rawSell = (data.sell ?? []) as any;

    // Sort bids highest-first, asks lowest-first so index 0 = best price
    const sortedBids = [...rawBuy].sort((a, b) => getPrice(b) - getPrice(a));
    const sortedAsks = [...rawSell].sort((a, b) => getPrice(a) - getPrice(b));

    const bids = processLevels(sortedBids, DEPTH);
    const asks = processLevels(sortedAsks, DEPTH);

    const bestBid = bids[0] ? parseFloat(bids[0].price) : 0;
    const bestAsk = asks[0] ? parseFloat(asks[0].price) : 0;
    const spreadVal = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;
    const spreadPct = bestAsk > 0 ? (spreadVal / bestAsk) * 100 : 0;

    setOrderbook({
      bids,
      asks,
      spread: spreadVal.toFixed(2),
      spreadPercent: spreadPct.toFixed(3),
    });
  }, []);

  const handleMessage = useCallback(
    (data: WsOrderbookData) => {
      latestRef.current = data;

      if (!throttledRef.current) {
        processAndSet();
        throttledRef.current = true;
        timerRef.current = setTimeout(() => {
          throttledRef.current = false;
          processAndSet(); // flush whatever arrived during the window
        }, THROTTLE_MS);
      }
    },
    [processAndSet],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const { connectionState } = useWebSocket<WsOrderbookData>('l2_orderbook', symbol, handleMessage);

  return { orderbook, connectionState };
}
