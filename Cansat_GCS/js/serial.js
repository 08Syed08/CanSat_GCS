/**
 * CanSat GCS — Serial Module
 * India Space Lab · ISL-2024
 *
 * Manages connection to CanSat hardware via Web Serial API.
 */

'use strict';

const Serial = {
  port: null,
  reader: null,

  async connect(onData, onOpen, onClose) {
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: Config.BAUD_RATE });
      
      onOpen();
      this._readLoop(onData, onClose);
    } catch (e) {
      console.error('[Serial] Connection failed:', e);
      Logger.log('ERROR', 'Serial connection failed.');
    }
  },

  async _readLoop(onData, onClose) {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        // Assume packet per line
        onData(value);
      }
    } catch (e) {
      console.error('[Serial] Read error:', e);
    } finally {
      reader.releaseLock();
      onClose();
    }
  }
};
