// ─── Shared ─────────────────────────────────────────────────────────────────

export interface ApiListResponse<T> {
  result: T[];
  success: boolean;
  meta?: {
    total_count?: number;
    after?: string;
    before?: string;
  };
}

export interface ApiDetailResponse<T> {
  result: T;
  success: boolean;
}

// ─── Product (from GET /v2/products) ────────────────────────────────────────

export interface Asset {
  id: number;
  symbol: string;
  precision: number;
  deposit_status?: string;
  withdrawal_status?: string;
}

export interface Product {
  id: number;
  symbol: string;
  description: string;
  /** e.g. 'perpetual_futures' | 'call_options' | 'put_options' | 'futures' | 'spot' */
  contract_type: string;
  product_type: string;
  quoting_asset: Asset;
  settling_asset: Asset;
  underlying_asset?: Asset;
}

// ─── Ticker (from GET /v2/tickers/{symbol}) ──────────────────────────────────

export interface Ticker {
  symbol: string;
  /** Last traded price */
  close: string;
  /** 24h open price — used to compute % change */
  open: string;
  high: string;
  low: string;
  mark_price: string;
  /** 24h contract volume */
  volume: string;
  /** 24h notional turnover in USD */
  turnover_usd: string;
  product_id: number;
  timestamp: number;
  /** Only present for perpetual futures */
  funding_rate?: string;
  oi?: string;
}

// ─── Derived ─────────────────────────────────────────────────────────────────

export interface ProductWithTicker extends Product {
  /** null while loading or if the ticker fetch failed */
  ticker: Ticker | null;
  /** Pre-computed ((close - open) / open) * 100, null if unavailable */
  changePercent: number | null;
}
