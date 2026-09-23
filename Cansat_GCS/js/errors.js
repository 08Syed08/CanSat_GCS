/**
 * CanSat GCS — Error Handling Module
 * India Space Lab · ISL-2024
 *
 * Manages the fault monitor system, updating the 4-digit error code
 * and corresponding UI status.
 */

'use strict';

const Errors = {
  
  init() {
    this.reset();
  },

  /**
   * Reset all error states to nominal.
   */
  reset() {
    // Reset digit displays
    for (let i = 1; i <= 4; i++) {
      this._setDigit(i, '0', false);
    }
    
    // Reset full code display
    Utils.setText('err-code-value', '0000');
    Utils.setClass('err-code-value', 'err-code-display');
    
    // Reset description panel to all OK
    for (let i = 1; i <= 4; i++) {
      this._updateDesc(i, false, false);
    }
    
    // Reset overall status
    const statusEl = document.getElementById('overall-status-bar');
    if (statusEl) {
      statusEl.className = 'ov-nominal';
      Utils.setText('ov-text', 'ALL SYSTEMS NOMINAL');
      Utils.setText('ov-icon', '■');
    }
  },

  /**
   * Process a packet to update fault indicators based on the 4-digit error code.
   * @param {object} packet - Parsed packet object with errorCode string.
   */
  update(packet) {
    const code = packet.errorCode || '0000';
    Utils.setText('err-code-value', code);
    
    let hasFault = false;
    let hasWarning = false;

    // Process each digit (1-4)
    for (let i = 0; i < 4; i++) {
      const digitIndex = i + 1;
      const val = code[i]; // '0' = OK, '1' = Fault/Active
      
      const isFaultOrActive = (val !== '0');
      
      // Update digit box, description, and status classes
      this._setDigit(digitIndex, val, isFaultOrActive);
      
      // Map to error description and overall status
      if (isFaultOrActive) {
        // D4 (Parachute) is usually 'Active', others are 'Fault'
        const isWarning = (digitIndex === 4); 
        if (isWarning) hasWarning = true;
        else hasFault = true;
        
        this._updateDesc(digitIndex, true, isWarning);
      } else {
        this._updateDesc(digitIndex, false, false);
      }
    }
    
    // Update main Fault Monitor status bar
    const statusEl = document.getElementById('overall-status-bar');
    if (statusEl) {
      if (hasFault) {
        statusEl.className = 'ov-fault';
        Utils.setText('ov-text', 'SYSTEM FAULT DETECTED');
        Utils.setText('ov-icon', '⚠');
        Utils.setClass('err-code-value', 'err-code-display has-fault');
      } else if (hasWarning) {
        statusEl.className = 'ov-warning';
        Utils.setText('ov-text', 'WARNING: SYSTEM ACTIVE');
        Utils.setText('ov-icon', '!');
        Utils.setClass('err-code-value', 'err-code-display');
      } else {
        statusEl.className = 'ov-nominal';
        Utils.setText('ov-text', 'ALL SYSTEMS NOMINAL');
        Utils.setText('ov-icon', '■');
        Utils.setClass('err-code-value', 'err-code-display');
      }
    }
  },

  _setDigit(idx, val, isSpecial) {
    Utils.setText(`err-digit-${idx}`, val);
    const box = document.getElementById(`err-d${idx}`);
    if (box) {
      box.className = `err-digit-box ${isSpecial ? (idx === 4 ? 'active' : 'fault') : ''}`;
      // Update bottom label text based on special state
      const lbl = box.querySelector('.err-label-bot');
      if (lbl) {
        if (idx === 1) lbl.textContent = isSpecial ? 'FAULT' : 'NOMINAL';
        if (idx === 2) lbl.textContent = isSpecial ? 'NO FIX' : 'AVAIL';
        if (idx === 3) lbl.textContent = isSpecial ? 'FAULT' : 'OK';
        if (idx === 4) lbl.textContent = isSpecial ? 'ACTIVE' : 'INACTIVE';
      }
    }
  },

  _updateDesc(idx, isSpecial, isWarning) {
    const desc = document.getElementById(`err-desc-${idx}`);
    if (desc) {
      desc.className = `err-desc-item ${isSpecial ? (isWarning ? 'active' : 'fault') : 'ok'}`;
      const icon = desc.querySelector('.err-desc-icon');
      if (icon) icon.textContent = isSpecial ? '✗' : '✓';
    }
  }
};
