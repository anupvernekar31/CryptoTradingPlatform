import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchProducts, fetchTicker } from '../services/deltaApi';
import type { ProductWithTicker } from '../types/api';

export function useProducts() {
  const [allProducts, setAllProducts] = useState<ProductWithTicker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const products = await fetchProducts();

      // Focus on perpetual futures — the most relevant contract type for a price tracker
      const perps = products.filter(p => p.contract_type === 'perpetual_futures');

      // Paint the list immediately with empty ticker slots for fast first render
      setAllProducts(perps.map(p => ({ ...p, ticker: null, changePercent: null })));

      // Fetch all tickers in parallel; settled so one failure doesn't block the rest
      const results = await Promise.allSettled(perps.map(p => fetchTicker(p.symbol)));

      setAllProducts(
        perps.map((p, i) => {
          const result = results[i];
          const ticker = result.status === 'fulfilled' ? result.value : null;

          const changePercent =
            ticker && ticker.close && ticker.open
              ? ((parseFloat(ticker.close) - parseFloat(ticker.open)) /
                  parseFloat(ticker.open)) *
                100
              : null;

          return { ...p, ticker, changePercent };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side search — filter by symbol or description
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      p =>
        p.symbol.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [allProducts, searchQuery]);

  return {
    products: filteredProducts,
    isLoading,
    error,
    refetch: loadData,
    searchQuery,
    setSearchQuery,
  };
}
