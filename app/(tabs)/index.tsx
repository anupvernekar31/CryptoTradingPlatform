import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductListItem } from '@/components/ProductListItem';
import { SearchBar } from '@/components/SearchBar';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/hooks/useFavorites';
import { useProducts } from '@/hooks/useProducts';
import type { ProductWithTicker } from '@/types/api';

const COL = { price: 100, change: 72, volume: 56 };

type ActiveTab = 'all' | 'favorites';

export default function MarketsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const colors = Colors[scheme];

  const { products, isLoading, error, refetch, searchQuery, setSearchQuery } = useProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  const displayedProducts =
    activeTab === 'favorites' ? products.filter(p => isFavorite(p.symbol)) : products;

  const handlePress = useCallback(
    (symbol: string) => {
      router.push({ pathname: '/product/[symbol]', params: { symbol } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: ProductWithTicker }) => (
      <ProductListItem
        product={item}
        isFavorite={isFavorite(item.symbol)}
        onToggleFavorite={toggleFavorite}
        onPress={handlePress}
        isDark={isDark}
      />
    ),
    [isFavorite, toggleFavorite, handlePress, isDark],
  );

  const activeTabBg = isDark ? '#ECEDEE' : '#11181C';
  const activeTabText = isDark ? '#11181C' : '#FFFFFF';
  const toggleContainerBg = isDark ? '#1F2937' : '#F3F4F6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Markets</Text>

        <View style={[styles.toggleRow, { backgroundColor: toggleContainerBg }]}>
          {(['all', 'favorites'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.toggleBtn, isActive && { backgroundColor: activeTabBg }]}
                onPress={() => setActiveTab(tab)}
              >
                {tab === 'favorites' && (
                  <MaterialIcons
                    name="star"
                    size={13}
                    color={isActive ? activeTabText : colors.text}
                    style={styles.tabStar}
                  />
                )}
                <Text style={[styles.toggleText, { color: isActive ? activeTabText : colors.text }]}>
                  {tab === 'all' ? 'All' : 'Favorites'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} isDark={isDark} />

      <View style={[styles.colHeaders, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB' }]}>
        <View style={styles.starSpacer} />
        <Text style={[styles.colText, styles.symbolCol]}>SYMBOL</Text>
        <Text style={[styles.colText, { width: COL.price, textAlign: 'right' }]}>LAST PRICE</Text>
        <Text style={[styles.colText, { width: COL.change, textAlign: 'center' }]}>24H CHANGE</Text>
        <Text style={[styles.colText, { width: COL.volume, textAlign: 'right' }]}>VOLUME</Text>
      </View>

      {isLoading && products.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.tint} size="large" />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={[styles.retryBtn, { borderColor: colors.tint }]}>
            <Text style={{ color: colors.tint, fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderItem}
          keyExtractor={item => item.symbol}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {activeTab === 'favorites'
                ? 'No favorites yet. Tap ★ to add one.'
                : 'No products found.'}
            </Text>
          }

        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  tabStar: {
    marginRight: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  colHeaders: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  starSpacer: {
    width: 28,
  },
  colText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA1A6',
    letterSpacing: 0.4,
  },
  symbolCol: {
    flex: 1,
    paddingLeft: 6,
  },
  loader: {
    marginTop: 80,
  },
  errorBox: {
    alignItems: 'center',
    marginTop: 80,
    gap: 14,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
  },
  retryBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 18,
  },
});
