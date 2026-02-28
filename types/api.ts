
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
  contract_type: string;
  product_type: string;
  quoting_asset: Asset;
  settling_asset: Asset;
  underlying_asset?: Asset;
}


export interface Ticker {
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


export interface ProductWithTicker extends Product {
  ticker: Ticker | null;
  changePercent: number | null;
}
