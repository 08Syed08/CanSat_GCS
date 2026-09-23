/**
 * CanSat GCS — Commands Module
 * India Space Lab · ISL-2024
 *
 * Manages mission-critical command dispatching and the confirmation modal.
 */

'use strict';

const Commands = {
  app: null,
  pendingCommand: null,

  init(appRef) {
    this.app = appRef;
  },

  reset() {
    this.pendingCommand = null;
    Utils.setText('cmd-last', '--');
    Utils.setText('cmd-ack', 'AWAITING');
    Utils.setClass('cmd-ack', 'mono-val ack-pending');
    
    // Hide modal if open
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
  },

  /**
   * Request a mission-critical command.
   * Triggers the confirmation modal.
   */
  request(cmd) {
    this.pendingCommand = cmd;
    
    const modal = document.getElementById('modal-overlay');
    if (modal) {
      Utils.setText('modal-message', `Confirm command: ${cmd}?`);
      modal.classList.remove('hidden');
    }
  },

  confirmPending() {
    if (!this.pendingCommand) return;
    
    const cmd = this.pendingCommand;
    Logger.log('INFO', `Dispatching command: ${cmd}`);
    
    // In a real system, send this via WebSocket/Serial
    // Here, we just acknowledge locally
    this._acknowledge(cmd);
    
    this.pendingCommand = null;
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
  },

  cancelPending() {
    this.pendingCommand = null;
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.add('hidden');
    Logger.log('WARNING', 'Command cancelled.');
  },

  _acknowledge(cmd) {
    Utils.setText('cmd-last', cmd);
    Utils.setText('cmd-timestamp', new Date().toLocaleTimeString());
    Utils.setText('cmd-ack', 'SENT');
    Utils.setClass('cmd-ack', 'mono-val ack-sent');
    
    // Log to mission log
    Logger.log('SUCCESS', `Command ${cmd} transmitted.`);
  }
};
