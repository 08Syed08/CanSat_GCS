/**
 * CanSat GCS — Export Module
 * India Space Lab · ISL-2024
 *
 * Handles exporting mission data to CSV and charts to image.
 */

'use strict';

const Export = {
  
  init() {
    // Initialization if needed
  },

  buffer(packet) {
    // Internal CSV buffer if needed
  },

  exportCSV(packets) {
    if (!packets || packets.length === 0) {
      Logger.log('WARNING', 'No data to export.');
      return;
    }

    // Convert packets to CSV string
    const csvRows = packets.map(p => p.raw);
    const csvString = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CanSat_Telemetry_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    Logger.log('SUCCESS', 'Telemetry CSV exported.');
  },

  exportGraphs() {
    Logger.log('INFO', 'Graph export triggered (feature placeholder).');
    // Implementation would require capturing canvas context
  }
};
