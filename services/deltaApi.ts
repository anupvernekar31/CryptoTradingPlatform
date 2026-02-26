import { API_BASE_URL } from '../constants/api';
import type { ApiDetailResponse, ApiListResponse, Product, Ticker } from '../types/api';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/v2/products`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products (HTTP ${response.status})`);
  }

  const data: ApiListResponse<Product> = await response.json();

  if (!data.success) {
    throw new Error('API returned an unsuccessful response for /v2/products');
  }

  return data.result;
}

export async function fetchTicker(symbol: string): Promise<Ticker> {
  const response = await fetch(`${API_BASE_URL}/v2/tickers/${symbol}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ticker for ${symbol} (HTTP ${response.status})`);
  }

  const data: ApiDetailResponse<Ticker> = await response.json();

  if (!data.success) {
    throw new Error(`API returned an unsuccessful response for /v2/tickers/${symbol}`);
  }

  return data.result;
}
