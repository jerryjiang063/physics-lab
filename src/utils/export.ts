import { Measurement, MeasurementB } from '../types';

/**
 * Export measurements to CSV format
 */
export function exportToCSV(measurements: Measurement[]): string {
  if (measurements.length === 0) return '';

  // CSV header
  const headers = [
    't (s)',
    'Δt (s)',
    'x (m)',
    'y (m)',
    'v_x (m/s)',
    'v_y (m/s)',
    'speed (m/s)',
    'N',
    'R (m)',
    'θ (rad)',
    'R_coil (Ω)',
    'R_load (Ω)',
    'R_total (Ω)',
    'B_x (T)',
    'B_y (T)',
    'B (T)',
    'Φ (Wb)',
    'dΦ/dt (Wb/s)',
    'ε (V)',
    'I (A)',
    'direction',
    'flux_change',
    'lenz_explanation',
  ];

  // CSV rows
  const rows = measurements.map(m => [
    m.timestamp.toFixed(6),
    m.deltaT.toFixed(6),
    m.magnetX.toFixed(6),
    m.magnetY.toFixed(6),
    m.velocityX.toFixed(6),
    m.velocityY.toFixed(6),
    m.speed.toFixed(6),
    m.turns.toString(),
    m.radius.toFixed(6),
    m.angle.toFixed(6),
    m.coilResistance.toFixed(6),
    m.loadResistance.toFixed(6),
    m.totalResistance.toFixed(6),
    m.magneticFieldX.toFixed(6),
    m.magneticFieldY.toFixed(6),
    m.magneticFieldMag.toFixed(6),
    m.flux.toFixed(6),
    m.fluxRate.toFixed(6),
    m.emf.toFixed(6),
    m.current.toFixed(6),
    m.direction,
    m.fluxChange,
    `"${m.lenzExplanation.replace(/"/g, '""')}"`, // Escape quotes in CSV
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export measurements to JSON format
 */
export function exportToJSON(measurements: Measurement[]): string {
  return JSON.stringify(measurements, null, 2);
}

/**
 * Export Mode B measurements to CSV format
 */
export function exportToCSVB(measurements: MeasurementB[]): string {
  if (measurements.length === 0) return '';

  // CSV header
  // Note: Δt is not applicable for steady-state DC measurements in Mode B
  const headers = [
    't (s)',
    'V (V)',
    'R_total (Ω)',
    'I (A)',
    'L (m)',
    'N',
    'n (turns/m)',
    'R (m)',
    'B (T)',
    'polarity',
  ];

  // CSV rows
  // Note: deltaT is excluded from export (not applicable for steady-state DC)
  const rows = measurements.map(m => [
    m.timestamp.toFixed(6),
    m.voltage.toFixed(6),
    m.resistance.toFixed(6),
    m.current.toFixed(6),
    m.length.toFixed(6),
    m.turns.toString(),
    m.turnDensity.toFixed(6),
    m.radius.toFixed(6),
    m.magneticField.toFixed(6),
    m.polarity > 0 ? '+1' : '-1',
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Export Mode B measurements to JSON format
 */
export function exportToJSONB(measurements: MeasurementB[]): string {
  return JSON.stringify(measurements, null, 2);
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

