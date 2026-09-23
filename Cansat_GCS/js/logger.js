/**
 * CanSat GCS — Logger Module
 * India Space Lab · ISL-2024
 *
 * Manages the mission event log display in the GCS dashboard.
 */

'use strict';

const Logger = {
  /**
   * Log an event to the mission log display.
   * @param {string} level - 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
   * @param {string} msg - The message to log
   */
  log(level, msg) {
    const logContainer = document.getElementById('mission-log');
    
    // Log to console regardless of DOM state
    console.log(`[${level}] ${msg}`);

    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    // Timestamp
    const now = new Date();
    const tsStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}.${String(now.getUTCMilliseconds()).padStart(3, '0')}`;

    const tsSpan = document.createElement('span');
    tsSpan.className = 'log-ts';
    tsSpan.textContent = `[${tsStr}]`;

    // Level Tag
    const tagSpan = document.createElement('span');
    tagSpan.className = 'log-tag';
    tagSpan.textContent = ` ${level}:`;

    // Color based on level
    if (level === 'SUCCESS') {
      tagSpan.style.color = 'var(--green)';
    } else if (level === 'WARNING') {
      tagSpan.style.color = 'var(--amber)';
    } else if (level === 'ERROR') {
      tagSpan.style.color = 'var(--red)';
    } else {
      tagSpan.style.color = 'var(--cyan)';
    }

    // Message
    const msgSpan = document.createElement('span');
    msgSpan.className = 'log-msg';
    msgSpan.textContent = ` ${msg}`;

    entry.appendChild(tsSpan);
    entry.appendChild(tagSpan);
    entry.appendChild(msgSpan);

    logContainer.appendChild(entry);
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
  }
};
