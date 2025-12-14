import React from 'react';
import { Measurement, MeasurementB, LabMode } from '../types';

interface DataTableProps {
  measurements: Measurement[];
  measurementsB: MeasurementB[];
  labMode: LabMode;
  onClear: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ measurements, measurementsB, labMode, onClear }) => {
  if (labMode === 'currentToField') {
    // Mode B
    const displayMeasurements = measurementsB.length > 100 
      ? measurementsB.filter((_, i) => i % Math.floor(measurementsB.length / 100) === 0)
      : measurementsB;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ marginTop: 0 }}>Lab Notebook ({measurementsB.length} measurements)</h3>
          {measurementsB.length > 0 && (
            <button
              onClick={onClear}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Data
            </button>
          )}
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>t (s)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>V (V)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>R_total (Ω)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>I (A)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>L (m)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>N</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>n (turns/m)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>B (T)</th>
              </tr>
            </thead>
            <tbody>
              {displayMeasurements.map((m, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.timestamp.toFixed(2)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.voltage.toFixed(2)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.resistance.toFixed(2)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.current.toFixed(3)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.length.toFixed(3)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.turns}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.turnDensity.toFixed(1)}</td>
                  <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.magneticField.toFixed(6)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Mode A: Faraday's Law
  // Show only snapshots (or all if less than 100)
  const displayMeasurements = measurements.length > 100 
    ? measurements.filter((_, i) => i % Math.floor(measurements.length / 100) === 0)
    : measurements;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ marginTop: 0 }}>Lab Notebook ({measurements.length} measurements)</h3>
        {measurements.length > 0 && (
          <button
            onClick={onClear}
            style={{
              padding: '8px 16px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Data
          </button>
        )}
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>t (s)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>x (m)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>v (m/s)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>B (T)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Φ (Wb)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>dΦ/dt (Wb/s)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ε (V)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>I (A)</th>
              <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Dir</th>
            </tr>
          </thead>
          <tbody>
            {displayMeasurements.map((m, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.timestamp.toFixed(2)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.magnetX.toFixed(3)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.speed.toFixed(3)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.magneticFieldMag.toFixed(6)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.flux.toFixed(6)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.fluxRate.toFixed(6)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.emf.toFixed(6)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.current.toFixed(6)}</td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{m.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;

