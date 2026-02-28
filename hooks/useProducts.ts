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

      const perps = products.filter(p => p.contract_type === 'perpetual_futures');

      setAllProducts(perps.map(p => ({ ...p, ticker: null, changePercent: null })));

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
