import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isDark: boolean;
}

const COLORS = {
  light: { bg: '#F9FAFB', border: '#E5E7EB', text: '#11181C', placeholder: '#9BA1A6', icon: '#9BA1A6' },
  dark:  { bg: '#1F2937', border: '#374151', text: '#ECEDEE', placeholder: '#6B7280', icon: '#6B7280' },
};

export const SearchBar = React.memo(function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search by name or symbol...',
  isDark,
}: SearchBarProps) {
  const c = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <MaterialIcons name="search" size={18} color={c.icon} style={styles.icon} />
      <TextInput
        style={[styles.input, { color: c.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
