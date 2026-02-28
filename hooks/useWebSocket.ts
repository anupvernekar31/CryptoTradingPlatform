import { useEffect, useRef, useState } from 'react';
import { getWebSocketManager } from '../services/WebSocketManager';
import type { WsChannelName, WsConnectionState, WsListener } from '../types/websocket';

/**
 * Low-level hook that subscribes to a single WebSocket channel+symbol.
 *
 * - Connects the manager on mount (idempotent).
 * - Subscribes on mount, unsubscribes on unmount.
 * - Uses a ref for the callback so parent re-renders don't cause re-subscription.
 */
export function useWebSocket<T>(
  channel: WsChannelName,
  symbol: string,
  onMessage: WsListener<T>,
): { connectionState: WsConnectionState } {
  const [connectionState, setConnectionState] = useState<WsConnectionState>('disconnected');
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage; // always latest without re-subscribing

  useEffect(() => {
    const manager = getWebSocketManager();
    manager.connect();

    const stableListener: WsListener<T> = data => callbackRef.current(data);

    const unsubData = manager.subscribe(channel, symbol, stableListener as WsListener);
    const unsubState = manager.onStateChange(setConnectionState);

    return () => {
      unsubData();
      unsubState();
    };
  }, [channel, symbol]);

  return { connectionState };
}
