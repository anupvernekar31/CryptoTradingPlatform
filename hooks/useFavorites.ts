import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = '@cryptoTrade/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(data => {
        if (data) {
          setFavorites(new Set(JSON.parse(data) as string[]));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoaded(true));
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next])).catch(console.error);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (symbol: string) => favorites.has(symbol),
    [favorites],
  );

  return { favorites, isFavorite, toggleFavorite, isLoaded };
}
