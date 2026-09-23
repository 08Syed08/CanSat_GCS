console.log("APP.JS LOADED SUCCESSFULLY");
/**
 * =========================================================================
 *  CanSat GCS — app.js  |  Master Application Orchestrator
 *  India Space Lab · ISL-2024
 *  ISRO-style Ground Control Software
 * =========================================================================
 *
 *  Responsibilities
 *  ─────────────────
 *  1.  Initialise all 11 sub-modules in dependency order
 *  2.  Bind every control-bar and mission-control button
 *  3.  Manage global application state (running, connectionType, counts)
 *  4.  Run the telemetry pipeline: raw string → parse → validate → distribute
 *  5.  Drive all telemetry-display DOM updates with colour-coded thresholds
 *  6.  Manage Serial (Web Serial API) and WebSocket connections
 *  7.  Keep PC-time clock and packet-rate indicator live
 *  8.  Provide a clean reset path that wipes state across all modules
 *
 *  Sub-modules consumed (must load before app.js)
 *  ─────────────────────────────────────────────────
 *  config.js · commands.js · charts.js · map.js · simulator.js
 *  serial.js · logger.js · orientation.js · export.js · errors.js · utils.js
 *
 *  Telemetry Packet — 22 CSV fields
 *  ──────────────────────────────────
 *  [0]  TEAM_ID        [1]  MISSION_TIME  [2]  PACKET_COUNT
 *  [3]  MODE           [4]  STATE         [5]  ALTITUDE (m)
 *  [6]  TEMPERATURE    [7]  PRESSURE(kPa) [8]  VOLTAGE (V)
 *  [9]  DESCENT_RATE   [10] GPS_LAT       [11] GPS_LON
 *  [12] GPS_ALTITUDE   [13] GPS_SATS      [14] ROLL (°)
 *  [15] PITCH (°)      [16] YAW (°)       [17] ERR_CODE
 *  [18] PAY_ALTITUDE   [19] PAY_TEMP      [20] PAY_PRESSURE
 *  [21] PAY_VOLTAGE
 * =========================================================================
 */

'use strict';

/* =========================================================================
   APPLICATION STATE OBJECT
   ========================================================================= */

const App = {

  /* ── Telemetry ─────────────────────────────────────────────────────── */
  isRunning:       false,
  connectionType:  null,     // 'serial' | 'websocket' | 'simulator' | null
  packets:         [],       // full raw archive (for CSV export)
  currentPacket:   null,     // latest parsed packet
  packetCount:     0,        // running total since last reset

  /* ── Timing ────────────────────────────────────────────────────────── */
  sessionStart:    null,     // Date object — when telemetry was started
  lastPacketTime:  null,     // Date.now() of last received packet

  /* ── History arrays (rolling, trimmed to Config.MAX_HISTORY) ───────── */
  history: {
    labels:      [],
    altitude:    [],
    pressure:    [],
    temperature: [],
    descentRate: [],
    voltage:     []
  },

  /* ── Interval handles ──────────────────────────────────────────────── */
  _pcClockInterval:     null,
  _packetRateInterval:  null,
  _missionTimerInterval:null,

  /* ── Network ───────────────────────────────────────────────────────── */
  ws: null,   // active WebSocket instance (Python WS simulator)

  /* ── Mission tracking ──────────────────────────────────────────────── */
  missionState:     'PRE_LAUNCH',
  missionElapsed:   0,   // seconds since telemetry start


  /* =========================================================================
     INITIALISATION
     ========================================================================= */

  /**
   * Entry point — called once DOM is ready (bottom of this file).
   * Boots sub-modules, binds UI, starts background intervals.
   */
  init() {
    Logger.log('INFO', `CanSat GCS v${Config.VERSION} starting…`);
    Logger.log('INFO', `Team: ${Config.TEAM_ID} | Mission: ${Config.MISSION_NAME}`);

    this._initSubModules();   // boot all 10 sub-modules
    this._bindControlBar();   // top button row
    this._bindMissionPanel(); // mission-critical command buttons
    this._bindModal();        // confirmation dialog
    this._startPCClock();     // live UTC clock in header
    this._startPacketRateUpdater();  // pkt/s indicator
    this._resetTelemetryDisplay();   // clear all "-- m" placeholders

    Logger.log('SUCCESS', 'GCS ready. Press START or connect hardware.');
    this._setMissionStatus('STANDBY', false);
  },

  /**
   * Initialise each sub-module if it is loaded (graceful if missing).
   * Order matters: Config → Logger → then everything else.
   */
  _initSubModules() {
    const safe = (name, fn) => {
      try { fn(); }
      catch (e) { console.warn(`[App] ${name}.init() failed:`, e); }
    };

    safe('Charts',      () => Charts.init());
    safe('Map',         () => Map.init());
    safe('Orientation', () => Orientation.init());
    safe('Errors',      () => Errors.init());
    safe('Commands',    () => Commands.init(this));    // Commands needs App ref
    safe('Export',      () => Export.init());
    safe('Simulator',   () => Simulator.init());
    safe('Serial',      () => Serial.init());
  },


  /* =========================================================================
     EVENT BINDING
     ========================================================================= */

  /** Wire all top control-bar buttons. */
  _bindControlBar() {
    this._on('btn-start',         () => this.startTelemetry());
    this._on('btn-stop',          () => this.stopTelemetry());
    this._on('btn-connect-serial',() => this.connectSerial());
    this._on('btn-connect-ws',    () => this.connectWebSocket());
    this._on('btn-export-csv',    () => Export.exportCSV(this.packets));
    this._on('btn-export-graph',  () => Export.exportGraphs());
    this._on('btn-sync-time',     () => this._syncPCTime());
    this._on('btn-reset-packet',  () => this.resetAll());
  },

  /** Wire mission-critical command buttons (all go through Commands module). */
  _bindMissionPanel() {
    this._on('btn-manual-sep',  () => Commands.request('MANUAL_SEP'));
    this._on('btn-parachute',   () => Commands.request('EMERGENCY_PARACHUTE'));
    this._on('btn-redundant',   () => Commands.request('REDUNDANT_ACTIVATE'));
  },

  /** Wire confirmation modal confirm / cancel. */
  _bindModal() {
    this._on('modal-confirm', () => Commands.confirmPending());
    this._on('modal-cancel',  () => Commands.cancelPending());
  },


  /* =========================================================================
     TELEMETRY CONTROL  (START / STOP / RESET)
     ========================================================================= */

  /**
   * Start telemetry reception.
   * If no external link is active, falls back to the in-browser simulator.
   */
  startTelemetry() {
    if (this.isRunning) return;

    this.isRunning    = true;
    this.sessionStart = new Date();
    this.packetCount  = 0;
    this.missionElapsed = 0;

    /* Button state */
    this._setButtonState('btn-start', true);
    this._setButtonState('btn-stop',  false);

    /* If no real connection is present, activate in-browser simulator */
    if (!this.connectionType) {
      this.connectionType = 'simulator';
      Simulator.start(raw => this.handleRawPacket(raw));
      this._setModeIndicator('SIM', 'mode-sim');
    }

    /* Mission elapsed-time counter */
    this._missionTimerInterval = setInterval(() => {
      this.missionElapsed++;
    }, 1000);

    this._setMissionStatus('RECEIVING', true);
    Logger.log('SUCCESS',
      `Telemetry started [${this.connectionType.toUpperCase()}] — ` +
      `${new Date().toUTCString()}`
    );
  },

  /** Pause telemetry reception without clearing data. */
  stopTelemetry() {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.connectionType === 'simulator') Simulator.stop();

    clearInterval(this._missionTimerInterval);
    this._setButtonState('btn-start', false);
    this._setButtonState('btn-stop',  true);
    this._setMissionStatus('STANDBY', false);

    Logger.log('WARNING',
      `Telemetry stopped — ${this.packetCount} packets received.`
    );
  },

  /**
   * Full hard reset: stop telemetry, wipe all buffers,
   * clear every chart, map, and display field.
   */
  resetAll() {
    this.stopTelemetry();

    /* Clear state */
    this.packets        = [];
    this.currentPacket  = null;
    this.packetCount    = 0;
    this.missionElapsed = 0;
    this.missionState   = 'PRE_LAUNCH';
    this.connectionType = null;

    /* Clear history arrays */
    Object.keys(this.history).forEach(k => (this.history[k] = []));

    /* Reset sub-modules */
    Charts.reset();
    Map.reset();
    Errors.reset();
    Commands.reset();

    /* Reset all display elements to placeholder */
    this._resetTelemetryDisplay();

    /* Reset header counters */
    Utils.setText('header-packet-count', '0000');
    Utils.setText('tel-packet-no',       '0000');
    Utils.setText('hdr-mission-time',    '00:00:00');
    Utils.setText('ind-total-pkts',      '0');
    Utils.setText('ind-pkt-rate',        '0.0');
    Utils.setText('map-points',          '0');

    /* Reset link indicator */
    const linkEl = document.getElementById('header-link-indicator');
    if (linkEl) linkEl.className = 'link-dot offline';

    const badge = document.getElementById('serial-status-badge');
    if (badge) { badge.textContent = 'OFFLINE'; badge.className = 'status-badge offline'; }

    Logger.log('INFO', 'Full reset complete — all buffers cleared.');
  },


  /* =========================================================================
     TELEMETRY PIPELINE
     ========================================================================= */

  /**
   * Central entry point for ALL incoming data (serial / WebSocket / simulator).
   * @param {string} rawStr  - One CSV line from the CanSat / simulator.
   */
  handleRawPacket(rawStr) {
    if (!rawStr || typeof rawStr !== 'string') return;
    const raw = rawStr.trim();
    if (!raw.length) return;

    /* 1 — Parse */
    const packet = this._parsePacket(raw);
    if (!packet) {
      Logger.log('WARNING', `Malformed packet (${raw.length} chars): ${raw.substring(0, 50)}…`);
      return;
    }

    /* 2 — Validate sensor ranges */
    if (!this._validatePacket(packet)) {
      Logger.log('WARNING',
        `Out-of-range values in PKT#${packet.packetCount}: ` +
        `ALT=${packet.altitude} TEMP=${packet.temperature}`
      );
      return;
    }

    /* 3 — Store */
    this.packets.push(packet);
    this.currentPacket = packet;
    this.packetCount++;
    this.lastPacketTime = Date.now();
    this.missionState = packet.state;

    /* 4 — Push rolling history for charts */
    this._pushHistory(packet);

    /* 5 — Distribute to all sub-modules */
    this._updateTelemetryDisplay(packet);     // DOM text / colour updates
    Charts.update(this.history);              // all 5 live charts
    Map.update(packet);                       // GPS tracking map
    Orientation.update(packet.roll, packet.pitch, packet.yaw);  // 3D model + horizon
    Errors.update(packet);                    // 4-digit error code system
    Export.buffer(packet);                    // internal CSV buffer

    /* 6 — Header / indicator updates */
    Utils.setText('header-packet-count', String(this.packetCount).padStart(4, '0'));
    Utils.setText('tel-packet-no',       String(packet.packetCount).padStart(4, '0'));
    Utils.setText('hdr-mission-time',    packet.missionTime);
    Utils.setText('ind-total-pkts',      this.packetCount);
    Utils.setText('map-lat',  packet.gpsLat.toFixed(6));
    Utils.setText('map-lon',  packet.gpsLon.toFixed(6));
    Utils.setText('map-alt',  packet.altitude.toFixed(0) + ' m');

    /* 7 — Mission state badge */
    const stateBadge = document.getElementById('mission-state');
    if (stateBadge) stateBadge.textContent = packet.state;
  },


  /* =========================================================================
     PACKET PARSER
     ========================================================================= */

  /**
   * Parse a raw CSV string into a typed packet object.
   * Returns null if the string has fewer fields than expected.
   * @param  {string} raw
   * @returns {object|null}
   */
  _parsePacket(raw) {
    const f = raw.split(',');
    if (f.length < Config.FIELD_COUNT) return null;

    try {
      const fl = (i) => parseFloat(f[i]) || 0;
      const il = (i) => parseInt(f[i])   || 0;
      const sl = (i) => (f[i] || '').trim();

      return {
        /* Metadata */
        raw:            raw,
        timestamp:      new Date(),

        /* Header fields */
        teamId:         sl(0),
        missionTime:    sl(1),
        packetCount:    il(2),
        mode:           sl(3),    // 'F' = Flight, 'S' = Simulation
        state:          sl(4),

        /* Container sensors */
        altitude:       fl(5),    // m (barometric)
        temperature:    fl(6),    // °C
        pressure:       fl(7),    // kPa
        voltage:        fl(8),    // V (bus voltage)
        descentRate:    fl(9),    // m/s  (+ve = falling)

        /* GPS */
        gpsLat:         fl(10),   // decimal degrees N
        gpsLon:         fl(11),   // decimal degrees E
        gpsAltitude:    fl(12),   // m
        gpsSats:        il(13),   // satellite count

        /* IMU */
        roll:           fl(14),   // °
        pitch:          fl(15),   // °
        yaw:            fl(16),   // °

        /* Fault system */
        errorCode:      sl(17),   // 4-digit: d.rate|gps|pay|chute

        /* Payload telemetry */
        payAltitude:    fl(18),   // m
        payTemperature: fl(19),   // °C
        payPressure:    fl(20),   // kPa
        payVoltage:     fl(21),   // V
      };

    } catch (e) {
      console.error('[App._parsePacket] Error:', e, '| raw:', raw);
      return null;
    }
  },

  /**
   * Sanity-check a parsed packet against physical limits.
   * Returns false if any primary sensor is obviously wrong.
   * @param  {object} p  Parsed packet
   * @returns {boolean}
   */
  _validatePacket(p) {
    if (p.altitude    < -500 || p.altitude    > 50000) return false;
    if (p.temperature < -100 || p.temperature > 200)   return false;
    if (p.pressure    <    0 || p.pressure    > 120)   return false;
    if (p.voltage     <    0 || p.voltage     > 30)    return false;
    if (p.roll        < -360 || p.roll        > 360)   return false;
    if (p.pitch       < -360 || p.pitch       > 360)   return false;
    return true;
  },

  /**
   * Append one packet's values to rolling history arrays.
   * Trims oldest entry once the buffer reaches Config.MAX_HISTORY.
   * @param {object} p  Parsed packet
   */
  _pushHistory(p) {
    const MAX  = Config.MAX_HISTORY;
    const push = (arr, val) => {
      arr.push(val);
      if (arr.length > MAX) arr.shift();
    };
    push(this.history.labels,       p.missionTime);
    push(this.history.altitude,     p.altitude);
    push(this.history.pressure,     p.pressure);
    push(this.history.temperature,  p.temperature);
    push(this.history.descentRate,  p.descentRate);
    push(this.history.voltage,      p.voltage);
  },


  /* =========================================================================
     TELEMETRY DISPLAY — DOM UPDATES
     ========================================================================= */

  /**
   * Write all packet values into the telemetry panel DOM.
   * Applies colour classes for out-of-threshold readings.
   * @param {object} p  Parsed packet
   */
  _updateTelemetryDisplay(p) {

    /* ── Container module ─────────────────────────────────────────── */
    Utils.setText('tel-time',        p.missionTime);
    Utils.setText('tel-mode',        p.mode === 'F' ? 'FLIGHT' : 'SIMULATION');
    Utils.setText('tel-state',       p.state);
    Utils.setText('tel-altitude',    p.altitude.toFixed(1)    + ' m');
    Utils.setText('tel-temperature', p.temperature.toFixed(1) + ' °C');
    Utils.setText('tel-pressure',    p.pressure.toFixed(2)    + ' kPa');
    Utils.setText('tel-voltage',     p.voltage.toFixed(3)     + ' V');
    Utils.setText('tel-descent',     p.descentRate.toFixed(2) + ' m/s');
    Utils.setText('tel-gps-lat',     p.gpsLat.toFixed(6)      + ' °N');
    Utils.setText('tel-gps-lon',     p.gpsLon.toFixed(6)      + ' °E');
    Utils.setText('tel-gps-alt',     p.gpsAltitude.toFixed(1) + ' m');
    Utils.setText('tel-gps-sats',    p.gpsSats                + ' sat');
    Utils.setText('tel-team-id',     p.teamId);
    Utils.setText('tel-pkt-count',   p.packetCount);
    Utils.setText('tel-raw',         p.raw);

    /* ── Payload module ───────────────────────────────────────────── */
    Utils.setText('pay-altitude',    p.payAltitude.toFixed(1)    + ' m');
    Utils.setText('pay-temperature', p.payTemperature.toFixed(1) + ' °C');
    Utils.setText('pay-pressure',    p.payPressure.toFixed(2)    + ' kPa');
    Utils.setText('pay-voltage',     p.payVoltage.toFixed(3)     + ' V');
    Utils.setText('tel-roll',        p.roll.toFixed(1)           + ' °');
    Utils.setText('tel-pitch',       p.pitch.toFixed(1)          + ' °');
    Utils.setText('tel-yaw',         p.yaw.toFixed(1)            + ' °');

    /* ── Chart live-value displays ────────────────────────────────── */
    Utils.setText('chart-cur-altitude',    p.altitude.toFixed(0)    + ' m');
    Utils.setText('chart-cur-pressure',    p.pressure.toFixed(1)    + ' kPa');
    Utils.setText('chart-cur-temperature', p.temperature.toFixed(1) + ' °C');
    Utils.setText('chart-cur-descent',     p.descentRate.toFixed(1) + ' m/s');
    Utils.setText('chart-cur-voltage',     p.voltage.toFixed(2)     + ' V');

    /* ── Orientation readout panel ────────────────────────────────── */
    Utils.setText('disp-roll',  p.roll.toFixed(1)  + '°');
    Utils.setText('disp-pitch', p.pitch.toFixed(1) + '°');
    Utils.setText('disp-yaw',   p.yaw.toFixed(1)   + '°');

    /* ── Colour-threshold application ─────────────────────────────── */
    this._colourVoltage(p.voltage);
    this._colourDescentRate(p.descentRate, p.state);
    this._colourGPS(p.gpsSats);
    this._colourPayVoltage(p.payVoltage);
  },

  /**
   * Apply voltage threshold colour classes to the container voltage cell.
   * GREEN  → voltage OK
   * AMBER  → low-battery warning (≤ VOLTAGE_LOW_WARN)
   * RED    → critical low (≤ VOLTAGE_CRITICAL)
   */
  _colourVoltage(v) {
    const el = document.getElementById('tel-voltage');
    if (!el) return;
    el.className = 'tel-value';
    if      (v <= Config.VOLTAGE_CRITICAL) el.classList.add('val-crit');
    else if (v <= Config.VOLTAGE_LOW_WARN) el.classList.add('val-warn');
    else                                   el.classList.add('val-ok');
  },

  /**
   * Colour descent rate only during active descent phases.
   * SAFE (8–10 m/s) → GREEN · OUTSIDE → AMBER
   */
  _colourDescentRate(rate, state) {
    const el = document.getElementById('tel-descent');
    if (!el) return;
    el.className = 'tel-value';
    const activeStates = ['DESCENT', 'PAYLOAD_SEP', 'PC_RELEASE'];
    if (!activeStates.includes(state)) return;
    const inSafe = rate >= Config.DESCENT_RATE_MIN && rate <= Config.DESCENT_RATE_MAX;
    el.classList.add(inSafe ? 'val-ok' : 'val-warn');
  },

  /**
   * Colour satellite count.
   * ≥ 6 → GREEN · 4–5 → AMBER · < 4 → RED (no fix)
   */
  _colourGPS(sats) {
    const el = document.getElementById('tel-gps-sats');
    if (!el) return;
    el.className = 'tel-value';
    if      (sats < 4)  el.classList.add('val-crit');
    else if (sats < 6)  el.classList.add('val-warn');
    else                el.classList.add('val-ok');
  },

  /** Colour payload module voltage with same thresholds. */
  _colourPayVoltage(v) {
    const el = document.getElementById('pay-voltage');
    if (!el) return;
    el.className = 'tel-value';
    if      (v <= Config.VOLTAGE_CRITICAL) el.classList.add('val-crit');
    else if (v <= Config.VOLTAGE_LOW_WARN) el.classList.add('val-warn');
    else                                   el.classList.add('val-ok');
  },

  /**
   * Reset every telemetry field to the '-- unit' placeholder.
 * Called on init() and after resetAll(). Also strips any
 * colour-threshold classes so all cells return to neutral.
 */
_resetTelemetryDisplay() {
  const placeholders = {
    'tel-time':        '--:--:--',
    'tel-mode':        '--',
    'tel-state':       'OFFLINE',
    'tel-altitude':    '-- m',
    'tel-temperature': '-- °C',
    'tel-pressure':    '-- kPa',
    'tel-voltage':     '-- V',
    'tel-descent':     '-- m/s',
    'tel-gps-lat':     '-- °N',
    'tel-gps-lon':     '-- °E',
    'tel-gps-alt':     '-- m',
    'tel-gps-sats':    '--',
    'tel-team-id':     '--',
    'tel-pkt-count':   '0',
    'tel-raw':         'Awaiting telemetry...',

    'pay-altitude':    '-- m',
    'pay-temperature': '-- °C',
    'pay-pressure':    '-- kPa',
    'pay-voltage':     '-- V',
    'tel-roll':        '-- °',
    'tel-pitch':       '-- °',
    'tel-yaw':         '-- °',

    'chart-cur-altitude':    '-- m',
    'chart-cur-pressure':    '-- kPa',
    'chart-cur-temperature': '-- °C',
    'chart-cur-descent':     '-- m/s',
    'chart-cur-voltage':     '-- V',

    'disp-roll':  '0.0°',
    'disp-pitch': '0.0°',
    'disp-yaw':   '0.0°',

    'map-lat': '--',
    'map-lon': '--',
    'map-alt': '-- m'
  };

  Object.keys(placeholders).forEach(id => Utils.setText(id, placeholders[id]));

  /* Strip colour-threshold classes back to neutral */
  ['tel-voltage', 'tel-descent', 'tel-gps-sats', 'pay-voltage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'tel-value';
  });

  const stateBadge = document.getElementById('mission-state');
  if (stateBadge) stateBadge.textContent = 'PRE_LAUNCH';
},


/* =========================================================================
   DOM / UI HELPERS
   ========================================================================= */

/**
 * Safe click-listener binder — no-ops if the element isn't present
 * in the DOM (keeps init() resilient to partial markup).
 * @param {string}   id       Element ID
 * @param {Function} handler  Click handler
 */
_on(id, handler) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`[App._on] Element not found: #${id}`);
    return;
  }
  el.addEventListener('click', handler);
},

/**
 * Enable/disable a button by ID.
 * @param {string}  id        Element ID
 * @param {boolean} disabled  True = disabled
 */
_setButtonState(id, disabled) {
  const el = document.getElementById(id);
  if (el) el.disabled = disabled;
},

/**
 * Update the header mission-status text/colour and the
 * link indicator dot together, since they always track each other.
 * @param {string}  text      Status label, e.g. 'RECEIVING', 'STANDBY'
 * @param {boolean} isOnline  True = green/online styling
 */
_setMissionStatus(text, isOnline) {
  const statusEl = document.getElementById('mission-status');
  if (statusEl) {
    statusEl.textContent = text;
    statusEl.className = isOnline ? 'status-text status-online' : 'status-text status-offline';
  }

  const linkEl = document.getElementById('header-link-indicator');
  if (linkEl) linkEl.className = isOnline ? 'link-dot online' : 'link-dot offline';

  const footerLink = document.getElementById('footer-link-state');
  if (footerLink) footerLink.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
},

/**
 * Update the LIVE mode indicator chip (SIM / SERIAL / WS).
 * @param {string} text     Display text, e.g. 'SIM'
 * @param {string} cssClass Modifier class, e.g. 'mode-sim'
 */
_setModeIndicator(text, cssClass) {
  const el = document.getElementById('ind-mode');
  if (!el) return;
  el.textContent = text;
  el.className = 'ind-val ' + cssClass;
},


/* =========================================================================
   CLOCKS / RATE TIMERS
   ========================================================================= */

/**
 * Start the always-on PC clock in the header (UTC, HH:MM:SS).
 * Runs regardless of telemetry state.
 */
_startPCClock() {
  const tick = () => {
    const now = new Date();
    const hh = String(now.getUTCHours()).padStart(2, '0');
    const mm = String(now.getUTCMinutes()).padStart(2, '0');
    const ss = String(now.getUTCSeconds()).padStart(2, '0');
    Utils.setText('hdr-pc-time', `${hh}:${mm}:${ss}`);
  };
  tick();
  this._pcClockInterval = setInterval(tick, 1000);
},

/**
 * Start the packet-rate indicator (pkt/s), recomputed every second
 * from the delta in packetCount since the previous tick.
 */
_startPacketRateUpdater() {
  let lastCount = 0;
  this._packetRateInterval = setInterval(() => {
    const rate = this.packetCount - lastCount;
    lastCount = this.packetCount;
    Utils.setText('ind-pkt-rate', rate.toFixed(1));
  }, 1000);
},

/**
 * Manual "SYNC TIME" button handler — forces an immediate clock
 * refresh and logs the action to the mission log.
 */
_syncPCTime() {
  const now = new Date();
  Utils.setText('hdr-pc-time',
    `${String(now.getUTCHours()).padStart(2, '0')}:` +
    `${String(now.getUTCMinutes()).padStart(2, '0')}:` +
    `${String(now.getUTCSeconds()).padStart(2, '0')}`
  );
  Logger.log('INFO', `PC time synced — ${now.toUTCString()}`);
},


/* =========================================================================
   CONNECTIONS  (Serial / WebSocket)
   ========================================================================= */

/**
 * Connect via the Web Serial API (hardware CanSat link).
 * Delegates the actual port handling to serial.js; app.js only
 * supplies the packet callback and manages resulting UI state.
 */
connectSerial() {
  if (this.connectionType && this.connectionType !== 'serial') {
    Logger.log('WARNING', `Already connected via ${this.connectionType.toUpperCase()}. Reset first.`);
    return;
  }

  Serial.connect(
    raw => this.handleRawPacket(raw),
    () => this._onConnectionOpen('serial'),
    () => this._onConnectionClose('serial')
  );
},

/**
 * Connect to the Python WebSocket simulator/bridge (Config.WS_URL).
 */
connectWebSocket() {
  if (this.connectionType && this.connectionType !== 'websocket') {
    Logger.log('WARNING', `Already connected via ${this.connectionType.toUpperCase()}. Reset first.`);
    return;
  }

  try {
    this.ws = new WebSocket(Config.WS_URL);

    this.ws.onopen = () => this._onConnectionOpen('websocket');

    this.ws.onmessage = (event) => this.handleRawPacket(event.data);

    this.ws.onerror = (err) => {
      console.error('[App] WebSocket error:', err);
      Logger.log('ERROR', 'WebSocket connection error.');
    };

    this.ws.onclose = () => this._onConnectionClose('websocket');

  } catch (e) {
    console.error('[App.connectWebSocket] Failed:', e);
    Logger.log('ERROR', `Could not open WebSocket to ${Config.WS_URL}`);
  }
},

/**
 * Shared "connection established" handler for serial + websocket.
 * @param {string} type  'serial' | 'websocket'
 */
_onConnectionOpen(type) {
  this.connectionType = type;
  this._setModeIndicator(type === 'serial' ? 'SERIAL' : 'WS', type === 'serial' ? 'mode-serial' : 'mode-ws');
  this._setMissionStatus('LINK ESTABLISHED', true);

  const badge = document.getElementById('serial-status-badge');
  if (badge) { badge.textContent = 'ONLINE'; badge.className = 'status-badge online'; }

  Logger.log('SUCCESS', `${type.toUpperCase()} connection established.`);

  if (!this.isRunning) this.startTelemetry();
},

/**
 * Shared "connection lost/closed" handler for serial + websocket.
 * @param {string} type  'serial' | 'websocket'
 */
_onConnectionClose(type) {
  Logger.log('WARNING', `${type.toUpperCase()} connection closed.`);

  const badge = document.getElementById('serial-status-badge');
  if (badge) { badge.textContent = 'OFFLINE'; badge.className = 'status-badge offline'; }

  if (this.connectionType === type) {
    this.connectionType = null;
    this._setMissionStatus('STANDBY', false);
  }
}

};


/* =========================================================================
   BOOTSTRAP
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => App.init());