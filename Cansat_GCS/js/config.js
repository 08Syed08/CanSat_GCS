/**
 * CanSat GCS — Configuration Module
 * India Space Lab · ISL-2024
 *
 * All system-wide constants and configurable parameters.
 * Modify this file to adapt GCS for different missions.
 */

'use strict';

const Config = {
  // ── Mission Identity ─────────────────────────────────────────────
  TEAM_ID:        'ISL2024',
  MISSION_NAME:   'CANSAT-2024',
  VERSION:        '1.0.0',

  // ── Serial Communication ────────────────────────────────────────
  BAUD_RATE:      9600,
  DATA_BITS:      8,
  STOP_BITS:      1,
  PARITY:         'none',
  FLOW_CONTROL:   'none',

  // ── WebSocket Simulator ─────────────────────────────────────────
  WS_URL:         'ws://localhost:8765',

  // ── Telemetry ───────────────────────────────────────────────────
  PACKET_RATE_HZ: 1,
  MAX_HISTORY:    120,       // keep 120 s of chart data

  // ── Telemetry Packet Field Order ────────────────────────────────
  // Format: TEAM_ID,TIME,PKT,MODE,STATE,ALT,TEMP,PRESS,VOLT,DESC,
  //         LAT,LON,GPS_ALT,SATS,ROLL,PITCH,YAW,ERR,
  //         PAY_ALT,PAY_TEMP,PAY_PRESS,PAY_VOLT
  FIELD_COUNT:    22,

  // ── Sensor Thresholds (for fault logic) ────────────────────────
  DESCENT_RATE_MIN:   8.0,  // m/s — safe descent window
  DESCENT_RATE_MAX:   10.0, // m/s
  GPS_MIN_SATS:       4,    // minimum satellites for valid fix
  VOLTAGE_LOW_WARN:   6.9,  // V  — low battery warning
  VOLTAGE_CRITICAL:   6.5,  // V  — critical low battery

  // ── Mission States ──────────────────────────────────────────────
  STATES: [
    'PRE_LAUNCH', 'LAUNCH_WAIT', 'ASCENT',
    'APOGEE', 'DESCENT', 'PAYLOAD_SEP',
    'PC_RELEASE', 'LANDED'
  ],

  // ── Launch Site (New Delhi — India Space Lab) ───────────────────
  BASE_LAT: 28.6139,
  BASE_LON: 77.2090,

  // ── Chart Axis Ranges ───────────────────────────────────────────
  CHART: {
    altitude:    { min: 0,    max: 800   },
    pressure:    { min: 60,   max: 104   },
    temperature: { min: -15,  max: 40    },
    descent:     { min: -25,  max: 20    },
    voltage:     { min: 6.0,  max: 8.0   }
  },

  // ── Error Code Definitions ──────────────────────────────────────
  ERROR_DEFS: [
    {
      digit: 1,
      condition: 'Descent Rate',
      ok:   'Descent rate within 8–10 m/s',
      fault:'Descent rate outside safe range'
    },
    {
      digit: 2,
      condition: 'GPS Availability',
      ok:   'GPS data available',
      fault:'GPS data unavailable'
    },
    {
      digit: 3,
      condition: 'Payload Separation',
      ok:   'Payload separated successfully',
      fault:'Payload separation failure'
    },
    {
      digit: 4,
      condition: 'Emergency Parachute',
      ok:   'Parachute inactive (nominal)',
      fault:'Emergency parachute ACTIVATED'
    }
  ]
};