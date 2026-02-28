import { WS_URL } from '../constants/api';
import type {
  WsChannelName,
  WsConnectionState,
  WsListener,
  WsSubscribeMessage,
  WsUnsubscribeMessage,
} from '../types/websocket';

/**
 * Singleton WebSocket manager.
 *
 * - One connection to Delta Exchange, shared across all hooks.
 * - Subscription ref‑counting: only sends subscribe/unsubscribe over the wire
 *   when the first listener registers / last listener unregisters for a channel+symbol.
 * - Exponential‑backoff reconnection with automatic re‑subscription.
 * - Heartbeat to keep the connection alive.
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private state: WsConnectionState = 'disconnected';

  private listeners = new Map<string, Set<WsListener>>();
  private subscriptions = new Map<string, number>();

  private stateListeners = new Set<WsListener<WsConnectionState>>();

  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;



  /** Idempotent — only opens a connection if one isn't already active. */
  connect(): void {
    if (this.ws && (this.state === 'connected' || this.state === 'connecting')) return;

    this.setState('connecting');

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setState('connected');
      this.startHeartbeat();
      this.resubscribeAll();
    };

    ws.onmessage = (event: MessageEvent) => this.handleMessage(event);

    ws.onerror = () => {
      // onerror is always followed by onclose in RN; reconnect happens there
    };

    ws.onclose = () => {
      this.stopHeartbeat();
      this.ws = null;
      if (this.state !== 'disconnected') {
        this.scheduleReconnect();
      }
    };

    this.ws = ws;
  }

  /** Graceful shutdown — stops reconnection and closes the socket. */
  disconnect(): void {
    this.setState('disconnected');
    this.clearReconnectTimer();
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect on intentional close
      this.ws.close();
      this.ws = null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Subscribe / Unsubscribe
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe a listener to a channel+symbol.
   * Returns an unsubscribe function (call in useEffect cleanup).
   */
  subscribe(channel: WsChannelName, symbol: string, listener: WsListener): () => void {
    const key = this.key(channel, symbol);

    // Register listener
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(listener);

    // Ref-count and send wire subscribe only on first listener
    const prev = this.subscriptions.get(key) ?? 0;
    this.subscriptions.set(key, prev + 1);
    if (prev === 0) this.sendSubscribe(channel, symbol);

    // Return cleanup
    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(listener);
        if (set.size === 0) this.listeners.delete(key);
      }

      const count = (this.subscriptions.get(key) ?? 1) - 1;
      if (count <= 0) {
        this.subscriptions.delete(key);
        this.sendUnsubscribe(channel, symbol);
      } else {
        this.subscriptions.set(key, count);
      }
    };
  }

  /** Register a listener for connection state changes. Returns cleanup fn. */
  onStateChange(listener: WsListener<WsConnectionState>): () => void {
    this.stateListeners.add(listener);
    // Immediately notify with current state
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  getState(): WsConnectionState {
    return this.state;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Internals
  // ────────────────────────────────────────────────────────────────────────────

  private key(channel: string, symbol: string): string {
    return `${channel}:${symbol}`;
  }

  private setState(next: WsConnectionState): void {
    this.state = next;
    this.stateListeners.forEach(fn => fn(next));
  }

  private send(data: WsSubscribeMessage | WsUnsubscribeMessage | object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private sendSubscribe(channel: WsChannelName, symbol: string): void {
    this.send({
      type: 'subscribe',
      payload: { channels: [{ name: channel, symbols: [symbol] }] },
    });
  }

  private sendUnsubscribe(channel: WsChannelName, symbol: string): void {
    this.send({
      type: 'unsubscribe',
      payload: { channels: [{ name: channel, symbols: [symbol] }] },
    });
  }

  /** Re-sends subscribe for every active channel after (re)connect. */
  private resubscribeAll(): void {
    for (const key of this.subscriptions.keys()) {
      const [channel, symbol] = key.split(':') as [WsChannelName, string];
      this.sendSubscribe(channel, symbol);
    }
  }

  // ── Message handling ──────────────────────────────────────────────────────

  private handleMessage(event: MessageEvent): void {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(typeof event.data === 'string' ? event.data : '{}');
    } catch {
      return; // Malformed JSON — ignore
    }

    const type = parsed.type as string | undefined;
    if (!type) return;

    // Heartbeat response — nothing to route
    if (type === 'heartbeat') return;

    const symbol = (parsed.symbol as string) ?? '';

    const key = this.key(type, symbol);
    const set = this.listeners.get(key);
    if (set) {
      set.forEach(fn => fn(parsed));
    }
  }

  // ── Reconnection ─────────────────────────────────────────────────────────

  private scheduleReconnect(): void {
    this.setState('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30_000);
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ── Heartbeat ─────────────────────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    // Send enable_heartbeat right after connecting
    this.send({ type: 'enable_heartbeat' });
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'enable_heartbeat' });
    }, 25_000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// ─── Singleton accessor ───────────────────────────────────────────────────────

let instance: WebSocketManager | null = null;

export function getWebSocketManager(): WebSocketManager {
  if (!instance) instance = new WebSocketManager();
  return instance;
}
