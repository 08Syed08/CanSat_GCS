/**
 * CanSat GCS — Utility Module
 * India Space Lab · ISL-2024
 *
 * Provides common DOM manipulation and helper functions for all sub-modules.
 */

'use strict';

const Utils = {
  /**
   * Safely update the textContent of a DOM element by ID.
   * Gracefully handles cases where the element might be missing.
   */
  setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  },

  /**
   * Helper to set class on an element.
   */
  setClass(id, className) {
    const el = document.getElementById(id);
    if (el) {
      el.className = className;
    }
  }
};
