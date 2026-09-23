/**
 * CanSat GCS — Charts Module
 * India Space Lab · ISL-2024
 *
 * Manages all 5 real-time telemetry charts.
 */

'use strict';

const Charts = {
  dashboard: null,

  init() {
    this.dashboard = new GCSDashboard();
  },

  update(history) {
    if (this.dashboard) {
      this.dashboard.updateCharts(history);
    }
  },

  reset() {
    if (this.dashboard) {
      this.dashboard.resetCharts();
    }
  }
};

/**
 * GCS Real-Time Charting System
 */
class GCSDashboard {
  constructor() {
    this.maxDataPoints = 50; 
    this.charts = {};

    this._initChart('altitude',    'Altitude',    'm',    '#00e5ff');
    this._initChart('pressure',    'Pressure',    'kPa',  '#76ff03');
    this._initChart('temperature', 'Temperature', '°C',   '#ff9500');
    this._initChart('descent',     'Descent',     'm/s',  '#ff4081');
    this._initChart('voltage',     'Voltage',     'V',    '#aa44ff');
  }

  _initChart(id, label, unit, color) {
    const ctx = document.getElementById(`chart-${id}`).getContext('2d');
    this.charts[id] = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: label, borderColor: color, data: [], tension: 0.3 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { display: false },
          y: { min: Config.CHART[id].min, max: Config.CHART[id].max }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  updateCharts(history) {
    const labels = history.labels;
    const keys = ['altitude', 'pressure', 'temperature', 'descent', 'voltage'];
    
    keys.forEach(key => {
      const chart = this.charts[key];
      chart.data.labels = labels;
      chart.data.datasets[0].data = history[key];
      chart.update('none');
    });
  }

  resetCharts() {
    Object.values(this.charts).forEach(chart => {
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.update('none');
    });
  }
}
