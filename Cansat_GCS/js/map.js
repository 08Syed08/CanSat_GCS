/**
 * CanSat GCS — Map Module
 * India Space Lab · ISL-2024
 *
 * Manages the GPS tracking map using Leaflet.js.
 */

'use strict';

const Map = {
  map: null,
  marker: null,
  path: [],
  polyline: null,

  init() {
    this.map = L.map('tracking-map').setView([Config.BASE_LAT, Config.BASE_LON], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([Config.BASE_LAT, Config.BASE_LON]).addTo(this.map);
    this.polyline = L.polyline([], { color: '#00e5ff' }).addTo(this.map);
  },

  update(packet) {
    if (!packet.gpsLat || !packet.gpsLon) return;

    const latlng = [packet.gpsLat, packet.gpsLon];
    
    // Update marker
    this.marker.setLatLng(latlng);
    this.map.panTo(latlng);

    // Update path
    this.path.push(latlng);
    this.polyline.setLatLngs(this.path);

    Utils.setText('map-points', this.path.length);
  },

  reset() {
    this.path = [];
    this.polyline.setLatLngs([]);
    Utils.setText('map-points', '0');
    this.map.setView([Config.BASE_LAT, Config.BASE_LON], 15);
  }
};
