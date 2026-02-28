import { useCallback, useState } from 'react';
import type { WsTradesData } from '../types/websocket';
import { useWebSocket } from './useWebSocket';


export interface ProcessedTrade {
  id: string;
  price: string;
  size: string;
  side: 'buy' | 'sell';
  timestamp: number;
  isNew: boolean;
}


const MAX_TRADES = 30;
const HIGHLIGHT_MS = 500;
let idCounter = 0;


export function useTrades(symbol: string) {
  const [trades, setTrades] = useState<ProcessedTrade[]>([]);

  const handleMessage = useCallback((data: Record<string, unknown>) => {
    const raw = data as Record<string, unknown>;
    let incoming: Record<string, unknown>[];

    if (Array.isArray(raw.trades)) {
      incoming = raw.trades;
    } else if (raw.price !== undefined) {
      incoming = [raw];
    } else {
      return;
    }

    const newItems: ProcessedTrade[] = incoming.map(t => {
      let side: 'buy' | 'sell' = 'buy';
      if (typeof t.side === 'string') {
        side = t.side === 'sell' ? 'sell' : 'buy';
      } else if (t.buyer_role === 'taker') {
        side = 'buy';
      } else if (t.seller_role === 'taker') {
        side = 'sell';
      }

      return {
        id: `t-${++idCounter}`,
        price: String(t.price ?? '0'),
        size: String(t.size ?? '0'),
        side,
        timestamp: Number(t.timestamp ?? Date.now()),
        isNew: true,
      };
    });

    setTrades(prev => [...newItems, ...prev].slice(0, MAX_TRADES));

    const ids = new Set(newItems.map(t => t.id));
    setTimeout(() => {
      setTrades(prev => prev.map(t => (ids.has(t.id) ? { ...t, isNew: false } : t)));
    }, HIGHLIGHT_MS);
  }, []);

  const { connectionState } = useWebSocket<WsTradesData>('all_trades', symbol, handleMessage as any);

  return { trades, connectionState };
}
