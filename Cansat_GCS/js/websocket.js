/**
 * CanSat GCS — WebSocket Module
 * India Space Lab · ISL-2024
 *
 * Manages WebSocket connections to the telemetry backend.
 */

'use strict';

const WebSocketBridge = {
  socket: null,

  connect(url, onMessage, onOpen, onClose) {
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = onOpen;
      this.socket.onmessage = (event) => onMessage(event.data);
      this.socket.onclose = onClose;
      this.socket.onerror = (err) => console.error('[WebSocket] Error:', err);
      
    } catch (e) {
      console.error('[WebSocket] Failed to connect:', e);
    }
  },

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }
};
