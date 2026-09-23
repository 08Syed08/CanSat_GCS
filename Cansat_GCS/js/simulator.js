/**
 * CanSat GCS — Simulator Module
 * India Space Lab · ISL-2024
 *
 * Generates simulated telemetry packets for testing and demonstration.
 */

'use strict';

const Simulator = {
  interval: null,

  init() {
    // Simulator is handled by App.js explicitly calling Simulator.start()
  },

  start(callback) {
    let alt = 0;
    let packetCount = 0;
    
    this.interval = setInterval(() => {
      packetCount++;
      alt += Math.random() * 5;
      
      // Generate CSV packet matching the field format
      // TEAM, TIME, PKT, MODE, STATE, ALT, TEMP, PRESS, VOLT, DESC, LAT, LON, GALT, SATS, ROLL, PITCH, YAW, ERR, PAYALT, PAYTEMP, PAYPRESS, PAYVOLT
      const packet = [
        Config.TEAM_ID,
        new Date().toLocaleTimeString(),
        packetCount,
        'S',
        'ASCENT',
        alt.toFixed(1),
        (25 + Math.random() * 5).toFixed(1),
        (101.3 - alt/1000).toFixed(2),
        (7.4 + Math.random() * 0.2).toFixed(2),
        '9.0',
        (28.6139 + Math.random() * 0.001).toFixed(6),
        (77.2090 + Math.random() * 0.001).toFixed(6),
        (alt + Math.random() * 10).toFixed(1),
        '8',
        (Math.sin(Date.now()/1000)*10).toFixed(1),
        (Math.cos(Date.now()/1000)*10).toFixed(1),
        '0.0',
        '0000',
        (alt - 5).toFixed(1),
        '20.0',
        '100.0',
        '7.4'
      ].join(',');

      callback(packet);
    }, 1000 / Config.PACKET_RATE_HZ);
    
    Logger.log('INFO', 'Simulator started.');
  },

  stop() {
    clearInterval(this.interval);
    Logger.log('INFO', 'Simulator stopped.');
  }
};
