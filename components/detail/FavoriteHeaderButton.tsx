import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useFavorites } from '../../hooks/useFavorites';

interface Props {
  symbol: string;
}

export function FavoriteHeaderButton({ symbol }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(symbol);

  return (
    <TouchableOpacity onPress={() => toggleFavorite(symbol)} hitSlop={8}>
      <MaterialIcons
        name={fav ? 'star' : 'star-outline'}
        size={24}
        color={fav ? '#F5A623' : '#9BA1A6'}
      />
    </TouchableOpacity>
  );
}
