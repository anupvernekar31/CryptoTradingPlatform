import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WsConnectionState } from '../../types/websocket';

const STATUS_CONFIG: Record<WsConnectionState, { color: string; label: string }> = {
  connected:    { color: '#16A34A', label: 'Live updates active' },
  connecting:   { color: '#EAB308', label: 'Connecting...' },
  reconnecting: { color: '#EAB308', label: 'Reconnecting...' },
  disconnected: { color: '#DC2626', label: 'Disconnected' },
};

interface Props {
  state: WsConnectionState;
  isDark: boolean;
}

export const ConnectionStatus = memo(function ConnectionStatus({ state, isDark }: Props) {
  const { color, label } = STATUS_CONFIG[state];

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color: isDark ? '#9BA1A6' : '#687076' }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
