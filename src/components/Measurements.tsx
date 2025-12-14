import React from 'react';
import { Measurement, MeasurementB, LabMode } from '../types';

interface MeasurementsProps {
  measurement: Measurement | null;
  measurementB: MeasurementB | null;
  labMode: LabMode;
  showAnswers?: boolean;
}

const Measurements: React.FC<MeasurementsProps> = ({ measurement, measurementB, labMode, showAnswers = false }) => {
  if (labMode === 'currentToField') {
    // Mode B: Current → Magnetic Field (Solenoid)
    if (!measurementB) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No measurements available. Adjust parameters to see data.
        </div>
      );
    }

    const MU_0 = 4 * Math.PI * 1e-7;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Voltage (V)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.voltage.toFixed(2)} V</div>
        </div>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Resistance (R_total)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.resistance.toFixed(2)} Ω</div>
        </div>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Length (L)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.length.toFixed(3)} m</div>
        </div>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Turns (N)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.turns}</div>
        </div>
        <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Turn Density (n = N/L)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.turnDensity.toFixed(1)} turns/m</div>
        </div>
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Radius (R)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.radius.toFixed(3)} m</div>
        </div>
        {showAnswers ? (
          <>
            <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Calculated Current (I)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.current.toFixed(3)} A</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>
                I = V / R_total = {measurementB.voltage.toFixed(2)} / {measurementB.resistance.toFixed(2)}
              </div>
            </div>
            <div style={{ padding: '10px', background: '#4CAF50', borderRadius: '4px', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '12px', color: '#fff', marginBottom: '5px' }}>Magnetic Field (B)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{Math.abs(measurementB.magneticField).toFixed(6)} T</div>
              <div style={{ fontSize: '11px', color: '#fff', marginTop: '5px', opacity: 0.9 }}>
                B = μ₀ × n × I = {MU_0.toFixed(6)} × {measurementB.turnDensity.toFixed(1)} × {measurementB.current.toFixed(3)} = {Math.abs(measurementB.magneticField).toFixed(6)} T
              </div>
              <div style={{ fontSize: '11px', color: '#fff', marginTop: '3px', opacity: 0.9 }}>
                Direction: {measurementB.polarity > 0 ? '→ (right along axis)' : '← (left along axis)'}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Calculated Current (I)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#999', letterSpacing: '3px' }}>•••••</div>
            </div>
            <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Magnetic Field (B)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#999', letterSpacing: '3px' }}>Hidden</div>
            </div>
          </>
        )}
        <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Time</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurementB.timestamp.toFixed(2)} s</div>
        </div>
      </div>
    );
  }

  // Mode A: Faraday's Law
  if (!measurement) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No measurements available. Move the magnet to see data.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Magnet Position (x)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.magnetX.toFixed(3)} m</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Magnet Velocity</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.speed.toFixed(3)} m/s</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Magnetic Field (B)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.magneticFieldMag.toFixed(6)} T</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Magnetic Flux (Φ)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.flux.toFixed(6)} Wb</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>dΦ/dt</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.fluxRate.toFixed(6)} Wb/s</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Induced EMF (ε)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: measurement.emf > 0 ? '#4CAF50' : '#F44336' }}>
          {measurement.emf.toFixed(6)} V
        </div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Induced Current (I)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: measurement.current > 0 ? '#4CAF50' : '#F44336' }}>
          {measurement.current.toFixed(6)} A
        </div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Current Direction</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {measurement.direction}
        </div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Resistance</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.totalResistance.toFixed(2)} Ω</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Time</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{measurement.timestamp.toFixed(2)} s</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Time Step (Δt)</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{(measurement.deltaT * 1000).toFixed(2)} ms</div>
      </div>
      <div style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px', gridColumn: 'span 2' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Flux Change</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '8px' }}>
          {measurement.fluxChange}
        </div>
      </div>
      <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px', gridColumn: 'span 2', border: '1px solid #2196F3' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: 'bold' }}>Lenz's Law Explanation</div>
        <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
          {measurement.lenzExplanation}
        </div>
      </div>
    </div>
  );
};

export default Measurements;

