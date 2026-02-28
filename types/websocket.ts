// ─── Connection State ────────────────────────────────────────────────────────

export type WsConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

// ─── Outgoing Messages ──────────────────────────────────────────────────────

export type WsChannelName = 'v2/ticker' | 'l2_orderbook' | 'all_trades';

export interface WsChannel {
  name: WsChannelName;
  symbols: string[];
}

export interface WsSubscribeMessage {
  type: 'subscribe';
  payload: { channels: WsChannel[] };
}

export interface WsUnsubscribeMessage {
  type: 'unsubscribe';
  payload: { channels: WsChannel[] };
}

// ─── Incoming: Ticker ───────────────────────────────────────────────────────

export interface WsTickerData {
  symbol: string;
  close: string;
  open: string;
  high: string;
  low: string;
  mark_price: string;
  volume: string;
  turnover_usd: string;
  product_id: number;
  timestamp: number;
  funding_rate?: string;
  oi?: string;
}

// ─── Incoming: Orderbook ────────────────────────────────────────────────────

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface WsOrderbookData {
  symbol: string;
  buy: OrderbookLevel[];
  sell: OrderbookLevel[];
}

// ─── Incoming: Trades ───────────────────────────────────────────────────────

export interface WsTradeData {
  price: string;
  size: string;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface WsTradesData {
  symbol: string;
  trades: WsTradeData[];
}

// ─── Listener ───────────────────────────────────────────────────────────────

export type WsListener<T = unknown> = (data: T) => void;
