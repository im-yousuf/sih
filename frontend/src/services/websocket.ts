import { Telemetry } from '../types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageHandler: ((data: Telemetry) => void) | null = null;
  private openHandler:    (() => void) | null = null;
  private closeHandler:   (() => void) | null = null;

  connect(url: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.openHandler?.();
    };

    this.ws.onmessage = (event) => {
      if (this.messageHandler) {
        try {
          const data = JSON.parse(event.data);
          this.messageHandler(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.closeHandler?.();
      this.scheduleReconnect(url);
    };
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect(url);
    }, this.reconnectInterval);
  }

  onMessage(handler: (data: Telemetry) => void) {
    this.messageHandler = handler;
  }

  onOpen(handler: () => void) {
    this.openHandler = handler;
  }

  onClose(handler: () => void) {
    this.closeHandler = handler;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
